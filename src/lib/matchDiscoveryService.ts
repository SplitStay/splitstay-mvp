import { supabase } from './supabase';

export const getEventMatches = async (eventId: string) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('User must be authenticated');

  const { data, error } = await supabase.rpc('get_event_matches', {
    p_event_id: eventId,
  });

  if (error) throw new Error(error.message);
  return data ?? [];
};

export const expressInterest = async (
  eventId: string,
  targetUserId: string,
) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('User must be authenticated');

  const { data, error } = await supabase.rpc('express_interest', {
    p_event_id: eventId,
    p_target_user_id: targetUserId,
  });

  if (error) throw new Error(error.message);
  return data;
};

export const undoInterest = async (eventId: string, targetUserId: string) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('User must be authenticated');

  const { error } = await supabase
    .from('match_interest')
    .delete()
    .eq('event_id', eventId)
    .eq('from_user_id', user.id)
    .eq('to_user_id', targetUserId);

  if (error) throw new Error(error.message);
};
