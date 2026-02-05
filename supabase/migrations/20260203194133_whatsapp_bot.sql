-- WhatsApp bot conversation history
create table public.whatsapp_conversation (
  id uuid primary key default gen_random_uuid(),
  phone_number text not null,
  user_id uuid references public."user"(id),
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  created_at timestamptz not null default now()
);

create index idx_whatsapp_conversation_phone_created
  on public.whatsapp_conversation (phone_number, created_at desc);

-- WhatsApp bot rate limiting (atomic upsert per phone number per hour)
create table public.whatsapp_rate_limit (
  phone_number text primary key,
  message_count int not null default 1,
  window_start timestamptz not null default now()
);

-- WhatsApp bot message deduplication (prevents replay attacks and Twilio retries)
create table public.whatsapp_seen_sid (
  message_sid text primary key,
  processed_at timestamptz not null default now()
);
