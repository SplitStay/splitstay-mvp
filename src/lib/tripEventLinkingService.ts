import { supabase } from './supabase';

export const findOverlappingTrips = async (
  _eventId: string,
  eventStartDate: string,
  eventEndDate: string,
) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('User must be authenticated');

  const { data, error } = await supabase
    .from('trip')
    .select('id, name, startDate, endDate, event_id')
    .eq('hostId', user.id)
    .is('event_id', null)
    .lte('startDate', eventEndDate)
    .gte('endDate', eventStartDate);

  if (error) throw error;
  return data ?? [];
};

export const findOverlappingEvents = async (
  tripStartDate: string,
  tripEndDate: string,
) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('User must be authenticated');

  const { data, error } = await supabase
    .from('event_registration')
    .select('event_id, event(id, name, start_date, end_date, location)')
    .eq('user_id', user.id);

  if (error) throw error;

  const registrations = data ?? [];
  return registrations.filter((reg) => {
    const event = reg.event as {
      start_date: string;
      end_date: string;
    } | null;
    if (!event) return false;
    return event.start_date <= tripEndDate && event.end_date >= tripStartDate;
  });
};

export const linkTripToEvent = async (tripId: string, eventId: string) => {
  const { data, error } = await supabase
    .from('trip')
    .update({ event_id: eventId })
    .eq('id', tripId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const unlinkTripFromEvent = async (tripId: string) => {
  const { data, error } = await supabase
    .from('trip')
    .update({ event_id: null })
    .eq('id', tripId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};
