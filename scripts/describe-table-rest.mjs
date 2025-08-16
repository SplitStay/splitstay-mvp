import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

async function main() {
  const base = process.env.VITE_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE || process.env.VITE_SUPABASE_ANON_KEY
  if (!base || !key) throw new Error('Missing VITE_SUPABASE_URL or API key')
  const url = new URL('/rest/v1/', base)
  const res = await fetch(url.toString(), { headers: { apikey: key, authorization: `Bearer ${key}`, accept: 'application/openapi+json' } })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const spec = await res.json()
  const comp = spec.components && spec.components.schemas ? spec.components.schemas : {}
  const tables = process.argv.slice(2)
  for (const t of tables) {
    const s = comp[t]
    console.log(`\n${t}`)
    if (!s) { console.log('not found'); continue }
    const props = s.properties || {}
    const order = Object.keys(props)
    for (const k of order) {
      const p = props[k]
      let typ = p.type || (p.allOf && p.allOf[0] && p.allOf[0].type) || ''
      if (!typ && p.format) typ = p.format
      console.log(`${k}:${typ}`)
    }
  }
}

main().catch(e => { console.error(e); process.exit(1) })
