import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

async function main() {
  const base = process.env.VITE_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE || process.env.VITE_SUPABASE_ANON_KEY
  if (!base || !key) throw new Error('Missing VITE_SUPABASE_URL or API key')
  const url = new URL('/rest/v1/', base)
  const res = await fetch(url.toString(), {
    headers: {
      apikey: key,
      authorization: `Bearer ${key}`,
      accept: 'application/openapi+json'
    }
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const spec = await res.json()
  const tables = Object.keys(spec.paths || {})
    .map(p => p.replace(/^\//, ''))
    .filter(p => !p.startsWith('_') && !p.includes('{'))
    .sort()
  for (const t of tables) console.log(t)
}

main().catch(e => { console.error(e); process.exit(1) })
