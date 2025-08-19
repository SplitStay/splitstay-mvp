export const config = { runtime: 'edge' }

export default async function handler(req: Request) {
  const base = process.env.VITE_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE
  if (!base || !key) return new Response('missing env', { status: 500 })
  const url = new URL('/rest/v1/rpc/process_pending_emails', base)
  const r = await fetch(url.toString(), {
    method: 'POST',
    headers: { apikey: key, authorization: `Bearer ${key}`, 'content-type': 'application/json' },
    body: JSON.stringify({})
  })
  if (!r.ok) return new Response('error', { status: 500 })
  return new Response('ok')
}
