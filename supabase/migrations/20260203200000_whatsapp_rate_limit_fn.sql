-- Atomic rate limit check: increments count within window or resets if expired.
-- Returns allowed (boolean) and retry_after_minutes (integer).
create or replace function public.check_rate_limit(
  p_phone text,
  p_max_messages int,
  p_window_ms bigint
)
returns table(allowed boolean, retry_after_minutes int)
language plpgsql
security definer
as $$
declare
  v_now timestamptz := now();
  v_window_start timestamptz := v_now - (p_window_ms || ' milliseconds')::interval;
  v_count int;
  v_stored_window_start timestamptz;
  v_ms_remaining bigint;
begin
  -- Upsert: insert if not exists, do nothing on conflict (we'll update below)
  insert into public.whatsapp_rate_limit (phone_number, message_count, window_start)
  values (p_phone, 0, v_now)
  on conflict (phone_number) do nothing;

  -- Lock the row and get current values
  select rl.message_count, rl.window_start
  into v_count, v_stored_window_start
  from public.whatsapp_rate_limit rl
  where rl.phone_number = p_phone
  for update;

  -- If window expired, reset
  if v_stored_window_start < v_window_start then
    update public.whatsapp_rate_limit rl
    set message_count = 1, window_start = v_now
    where rl.phone_number = p_phone;

    return query select true, 0;
    return;
  end if;

  -- Increment count
  v_count := v_count + 1;
  update public.whatsapp_rate_limit rl
  set message_count = v_count
  where rl.phone_number = p_phone;

  -- Check if over limit
  if v_count > p_max_messages then
    v_ms_remaining := extract(epoch from (v_stored_window_start + (p_window_ms || ' milliseconds')::interval - v_now)) * 1000;
    return query select false, ceil(v_ms_remaining / 60000.0)::int;
    return;
  end if;

  return query select true, 0;
end;
$$;
