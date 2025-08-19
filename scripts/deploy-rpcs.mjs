import dotenv from 'dotenv'
import fs from 'fs'

dotenv.config({ path: '.env.local' })

async function main() {
  const base = process.env.VITE_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE || process.env.VITE_SUPABASE_ANON_KEY
  if (!base || !key) throw new Error('Missing env')
  
  const sql = fs.readFileSync('supabase/migrations/002_add_chat_rpcs.sql', 'utf8')
  const statements = sql.split(';').filter(s => s.trim())
  
  for (const stmt of statements) {
    if (!stmt.trim()) continue
    try {
      const res = await fetch(`${base}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: { apikey: key, authorization: `Bearer ${key}`, 'content-type': 'application/json' },
        body: JSON.stringify({ query: stmt.trim() })
      })
      if (!res.ok) {
        console.log(`Failed to execute statement: ${res.status}`)
        console.log(stmt.substring(0, 100) + '...')
      }
    } catch (e) {
      console.log('Error executing:', stmt.substring(0, 50) + '...')
    }
  }
  
  console.log('Migration deployment attempted')
}

main().catch(e => { console.error(e); process.exit(1) })
