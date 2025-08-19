import dotenv from 'dotenv'
import fs from 'fs'

dotenv.config({ path: '.env.local' })

async function main() {
  const base = process.env.VITE_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE || process.env.VITE_SUPABASE_ANON_KEY
  if (!base || !key) throw new Error('Missing env')
  
  const sql = fs.readFileSync('supabase/migrations/004_fix_rls_policies.sql', 'utf8')
  const statements = sql.split(';').filter(s => s.trim() && !s.trim().startsWith('--'))
  
  console.log('Deploying RLS policy fixes...')
  
  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i].trim()
    if (!stmt) continue
    
    try {
      const res = await fetch(`${base}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: { apikey: key, authorization: `Bearer ${key}`, 'content-type': 'application/json' },
        body: JSON.stringify({ query: stmt })
      })
      
      if (res.ok) {
        console.log(`✓ Statement ${i + 1}/${statements.length} executed`)
      } else {
        console.log(`✗ Statement ${i + 1} failed: ${res.status}`)
        console.log(stmt.substring(0, 100) + '...')
      }
    } catch (e) {
      console.log(`✗ Error on statement ${i + 1}:`, e.message)
    }
  }
  
  console.log('\nRLS policies deployment completed!')
  console.log('Try your file upload again now.')
}

main().catch(e => { console.error(e); process.exit(1) })
