-- Function to get unread message count for a conversation
DROP FUNCTION IF EXISTS get_unread_message_count(UUID, UUID);
CREATE OR REPLACE FUNCTION get_unread_message_count(
  p_conversation_id UUID,
  p_user_id UUID
) RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
  v_other_user_id UUID;
BEGIN
  -- Get the other user in the conversation
  SELECT CASE 
    WHEN user1_id = p_user_id THEN user2_id
    ELSE user1_id
  END INTO v_other_user_id
  FROM conversations
  WHERE id = p_conversation_id;

  -- Count unread messages (messages from other user that haven't been read by current user)
  SELECT COUNT(*)
  INTO v_count
  FROM messages m
  WHERE m.conversation_id = p_conversation_id
    AND m.sender_id = v_other_user_id
    AND NOT EXISTS (
      SELECT 1 
      FROM message_read_status mrs
      WHERE mrs.message_id = m.id 
        AND mrs.user_id = p_user_id
    );

  RETURN COALESCE(v_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark messages as read
DROP FUNCTION IF EXISTS mark_messages_as_read CASCADE;
CREATE OR REPLACE FUNCTION mark_messages_as_read(p_conversation_id UUID) RETURNS void AS $$
DECLARE
  v_user_id UUID;
  v_other_user_id UUID;
BEGIN
  -- Get current user from auth context
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN;
  END IF;

  -- Get the other user in the conversation
  SELECT CASE 
    WHEN user1_id = v_user_id THEN user2_id
    ELSE user1_id
  END INTO v_other_user_id
  FROM conversations
  WHERE id = p_conversation_id;

  -- Insert read status for all unread messages from the other user
  INSERT INTO message_read_status (message_id, user_id, read_at)
  SELECT m.id, v_user_id, NOW()
  FROM messages m
  WHERE m.conversation_id = p_conversation_id
    AND m.sender_id = v_other_user_id
    AND NOT EXISTS (
      SELECT 1 
      FROM message_read_status mrs
      WHERE mrs.message_id = m.id 
        AND mrs.user_id = v_user_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is online
DROP FUNCTION IF EXISTS is_user_online(UUID);
CREATE OR REPLACE FUNCTION is_user_online(p_user_id UUID) RETURNS BOOLEAN AS $$
DECLARE
  v_is_online BOOLEAN;
  v_last_seen TIMESTAMP WITH TIME ZONE;
BEGIN
  SELECT is_online, last_seen_at
  INTO v_is_online, v_last_seen
  FROM user_presence
  WHERE user_id = p_user_id;

  -- Consider user online if marked as online and seen within last 5 minutes
  IF v_is_online AND v_last_seen > NOW() - INTERVAL '5 minutes' THEN
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to send email notification for offline message
-- COMMENTED OUT: Using webhook approach in fix_triggers_webhook.sql instead
/*
CREATE OR REPLACE FUNCTION notify_offline_message() RETURNS TRIGGER AS $$
DECLARE
  v_recipient_id UUID;
  v_recipient_email TEXT;
  v_recipient_name TEXT;
  v_sender_name TEXT;
  v_is_online BOOLEAN;
  v_email_payload JSON;
  v_response TEXT;
BEGIN
  -- Get the recipient (other user in conversation)
  SELECT CASE 
    WHEN c.user1_id = NEW.sender_id THEN c.user2_id
    ELSE c.user1_id
  END INTO v_recipient_id
  FROM conversations c
  WHERE c.id = NEW.conversation_id;

  -- Check if recipient is online
  v_is_online := is_user_online(v_recipient_id);

  -- Only send email if recipient is offline
  IF NOT v_is_online THEN
    -- Get recipient details
    SELECT email, name
    INTO v_recipient_email, v_recipient_name
    FROM public.user
    WHERE id = v_recipient_id;

    -- Get sender name
    SELECT name
    INTO v_sender_name
    FROM public.user
    WHERE id = NEW.sender_id;

    -- Prepare email payload
    v_email_payload := json_build_object(
      'to', v_recipient_email,
      'subject', 'New message from ' || COALESCE(v_sender_name, 'a user') || ' on SplitStay',
      'body', 'You have a new message from ' || COALESCE(v_sender_name, 'a user') || ' on SplitStay:' || chr(10) || chr(10) || 
              LEFT(NEW.content, 200) || 
              CASE WHEN LENGTH(NEW.content) > 200 THEN '...' ELSE '' END || chr(10) || chr(10) ||
              'View the conversation at: https://splitstay.com/messages?chat=' || NEW.conversation_id
    );

    -- Send email via Supabase Edge Function
    PERFORM net.http_post(
      url := 'https://dhqvohruecmttgfkfdeb.supabase.co/functions/v1/send-email',
      headers := jsonb_build_object(
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRocXZvaHJ1ZWNtdHRnZmtmZGViIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjQ4NDMxNSwiZXhwIjoyMDY4MDYwMzE1fQ.0YTSmt3qSUilrtopQVM8izu_5xy6fq1nylGWPpOsHbU',
        'Content-Type', 'application/json'
      ),
      body := v_email_payload
    );

  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the message insert
    RAISE WARNING 'Failed to send email notification: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
*/

-- Create trigger for offline message notifications
-- COMMENTED OUT: Using webhook approach in fix_triggers_webhook.sql instead
/*
DROP TRIGGER IF EXISTS trigger_notify_offline_message ON messages;
CREATE TRIGGER trigger_notify_offline_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION notify_offline_message();
*/

-- Function to send email notification for trip join request
CREATE OR REPLACE FUNCTION notify_trip_join_request() RETURNS TRIGGER AS $$
DECLARE
  v_host_email TEXT;
  v_host_name TEXT;
  v_requester_name TEXT;
  v_trip_name TEXT;
  v_trip_location TEXT;
  v_email_payload JSON;
  v_response TEXT;
BEGIN
  -- Get host details
  SELECT u.email, u.name
  INTO v_host_email, v_host_name
  FROM public.user u
  INNER JOIN trip t ON t.hostId = u.id
  WHERE t.id = NEW.tripId;

  -- Get requester name
  SELECT name
  INTO v_requester_name
  FROM public.user
  WHERE id = NEW.userId;

  -- Get trip details
  SELECT name, location
  INTO v_trip_name, v_trip_location
  FROM trip
  WHERE id = NEW.tripId;

  -- Prepare email payload
  v_email_payload := json_build_object(
    'to', v_host_email,
    'subject', COALESCE(v_requester_name, 'Someone') || ' wants to join your trip to ' || v_trip_location,
    'body', 'Hi ' || COALESCE(v_host_name, 'there') || ',' || chr(10) || chr(10) ||
            COALESCE(v_requester_name, 'A user') || ' has requested to join your trip "' || v_trip_name || '" in ' || v_trip_location || '.' || chr(10) || chr(10) ||
            CASE WHEN NEW.message IS NOT NULL THEN 'Their message: ' || NEW.message || chr(10) || chr(10) ELSE '' END ||
            'View and respond to this request at: https://splitstay.com/messages' || chr(10) || chr(10) ||
            'Happy travels!' || chr(10) ||
            'The SplitStay Team'
  );

  -- Send email via Supabase Edge Function
  PERFORM net.http_post(
    url := 'https://dhqvohruecmttgfkfdeb.supabase.co/functions/v1/send-email',
    headers := jsonb_build_object(
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRocXZvaHJ1ZWNtdHRnZmtmZGViIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjQ4NDMxNSwiZXhwIjoyMDY4MDYwMzE1fQ.0YTSmt3qSUilrtopQVM8izu_5xy6fq1nylGWPpOsHbU',
      'Content-Type', 'application/json'
    ),
    body := v_email_payload
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the request insert
    RAISE WARNING 'Failed to send email notification: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for trip join request notifications
DROP TRIGGER IF EXISTS trigger_notify_trip_join_request ON request;
CREATE TRIGGER trigger_notify_trip_join_request
  AFTER INSERT ON request
  FOR EACH ROW
  EXECUTE FUNCTION notify_trip_join_request();

-- Enable net extension for API calls (pg_net is available in Supabase)
-- Note: Replace 'your-project-id' and 'your-service-role-key' with actual values before running

-- Tables already exist in ref.sql, just add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_presence_is_online ON user_presence(is_online, last_seen_at);
CREATE INDEX IF NOT EXISTS idx_message_read_status_lookup ON message_read_status(message_id, user_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_sender ON messages(conversation_id, sender_id);
CREATE INDEX IF NOT EXISTS idx_email_notifications_status ON email_notifications(status, created_at);

-- IMPORTANT: Before running this migration, replace the placeholders in the functions above:
-- 1. Replace 'your-project-id' with your actual Supabase project ID
-- 2. Replace 'your-service-role-key' with your actual service role key from Supabase dashboard

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON user_presence TO authenticated;
GRANT SELECT, INSERT ON message_read_status TO authenticated;
GRANT EXECUTE ON FUNCTION get_unread_message_count TO authenticated;
GRANT EXECUTE ON FUNCTION mark_messages_as_read TO authenticated;
