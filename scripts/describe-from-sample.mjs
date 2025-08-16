import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

async function fetchJson(url, headers) {
  const r = await fetch(url, { headers })
  if (!r.ok) throw new Error(`HTTP ${r.status}`)
  return r.json()
}

async function main() {
  const base = process.env.VITE_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE || process.env.VITE_SUPABASE_ANON_KEY
  if (!base || !key) throw new Error('Missing VITE_SUPABASE_URL or API key')
  const headers = { apikey: key, authorization: `Bearer ${key}` }
  const tables = process.argv.slice(2)
  for (const t of tables) {
    try {
      const url = new URL(`/rest/v1/${t}`, base)
      url.searchParams.set('select', '*')
      url.searchParams.set('limit', '1')
      const rows = await fetchJson(url.toString(), headers)
      const keys = rows[0] ? Object.keys(rows[0]) : []
      console.log(`\n${t}`)
      if (keys.length === 0) console.log('empty')
      else for (const k of keys) console.log(k)
    } catch (e) {
      console.log(`\n${t}`)
      console.log('error')
    }
  }
}

main().catch(e => { console.error(e); process.exit(1) })
