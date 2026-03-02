import { supabase } from './supabase';

export const getUpcomingEvents = async () => {
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('event')
    .select('*')
    .gte('end_date', today)
    .order('start_date', { ascending: true });

  if (error) throw error;
  return data ?? [];
};

export const registerForEvent = async (eventId: string) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('User must be authenticated');

  const { data, error } = await supabase
    .from('event_registration')
    .insert({ user_id: user.id, event_id: eventId })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getUserRegistrations = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('User must be authenticated');

  const { data, error } = await supabase
    .from('event_registration')
    .select('*, event(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
};
