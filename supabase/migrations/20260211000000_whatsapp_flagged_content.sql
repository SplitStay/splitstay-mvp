-- Audit table for LLM responses flagged by the output validator.
-- Stores flagged content separately from conversation history to prevent
-- context poisoning on subsequent requests.
create table public.whatsapp_flagged_content (
  id uuid primary key default gen_random_uuid(),
  phone_number text not null,
  content text not null,
  flag_reason text not null,
  created_at timestamptz not null default now()
);

create index idx_whatsapp_flagged_phone_created
  on public.whatsapp_flagged_content (phone_number, created_at desc);

-- Service-role-only access (matching existing RLS pattern for whatsapp tables)
alter table public.whatsapp_flagged_content enable row level security;
