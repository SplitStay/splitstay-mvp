-- Drop the broken triggers first
DROP TRIGGER IF EXISTS trigger_notify_offline_message ON messages;
DROP TRIGGER IF EXISTS trigger_notify_trip_join_request ON request;

-- Drop the broken functions
DROP FUNCTION IF EXISTS notify_offline_message CASCADE;
DROP FUNCTION IF EXISTS notify_trip_join_request CASCADE;

-- Create new webhook-based functions that work with Supabase webhooks
CREATE OR REPLACE FUNCTION notify_offline_message_webhook() RETURNS TRIGGER AS $$
DECLARE
  v_recipient_id UUID;
  v_recipient_email TEXT;
  v_recipient_name TEXT;
  v_sender_name TEXT;
  v_is_online BOOLEAN;
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

    -- Insert into email_notifications table (this will trigger webhook)
    INSERT INTO email_notifications (
      recipient_email,
      recipient_name,
      subject,
      body,
      status,
      created_at
    ) VALUES (
      v_recipient_email,
      v_recipient_name,
      'New message from ' || COALESCE(v_sender_name, 'a user') || ' on SplitStay',
      'You have a new message from ' || COALESCE(v_sender_name, 'a user') || ' on SplitStay:' || chr(10) || chr(10) || 
      LEFT(NEW.content, 200) || 
      CASE WHEN LENGTH(NEW.content) > 200 THEN '...' ELSE '' END || chr(10) || chr(10) ||
      'View the conversation at: https://splitstay.travel/messages?chat=' || NEW.conversation_id,
      'pending',
      NOW()
    );
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the message insert
    RAISE WARNING 'Failed to queue email notification: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trip request notification function
CREATE OR REPLACE FUNCTION notify_trip_join_request_webhook() RETURNS TRIGGER AS $$
DECLARE
  v_host_email TEXT;
  v_host_name TEXT;
  v_requester_name TEXT;
  v_trip_name TEXT;
  v_trip_location TEXT;
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

  -- Insert into email_notifications table (this will trigger webhook)
  INSERT INTO email_notifications (
    recipient_email,
    recipient_name,
    subject,
    body,
    status,
    created_at
  ) VALUES (
    v_host_email,
    v_host_name,
    COALESCE(v_requester_name, 'Someone') || ' wants to join your trip to ' || v_trip_location,
    'Hi ' || COALESCE(v_host_name, 'there') || ',' || chr(10) || chr(10) ||
    COALESCE(v_requester_name, 'A user') || ' has requested to join your trip "' || v_trip_name || '" in ' || v_trip_location || '.' || chr(10) || chr(10) ||
    CASE WHEN NEW.message IS NOT NULL THEN 'Their message: ' || NEW.message || chr(10) || chr(10) ELSE '' END ||
    'View and respond to this request at: https://splitstay.travel/messages' || chr(10) || chr(10) ||
    'Happy travels!' || chr(10) ||
    'The SplitStay Team',
    'pending',
    NOW()
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the request insert
    RAISE WARNING 'Failed to queue email notification: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create new triggers
CREATE TRIGGER trigger_notify_offline_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION notify_offline_message_webhook();

CREATE TRIGGER trigger_notify_trip_join_request
  AFTER INSERT ON request
  FOR EACH ROW
  EXECUTE FUNCTION notify_trip_join_request_webhook();
