-- Enable RLS on WhatsApp tables so only the service role key can access them.
-- No policies are defined, which means the anon/authenticated roles have no access.
alter table public.whatsapp_conversation enable row level security;
alter table public.whatsapp_rate_limit enable row level security;
alter table public.whatsapp_seen_sid enable row level security;
