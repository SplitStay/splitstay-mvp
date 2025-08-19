import dotenv from 'dotenv'
import fs from 'fs'

dotenv.config({ path: '.env.local' })

async function main() {
  const base = process.env.VITE_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE || process.env.VITE_SUPABASE_ANON_KEY
  if (!base || !key) throw new Error('Missing env')
  
  const sql = fs.readFileSync('supabase/migrations/003_instant_email_send.sql', 'utf8')
  
  console.log('Deploying instant email function...')
  const res = await fetch(`${base}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: { apikey: key, authorization: `Bearer ${key}`, 'content-type': 'application/json' },
    body: JSON.stringify({ query: sql })
  })
  
  if (res.ok) {
    console.log('✓ Instant email function deployed')
  } else {
    console.log('✗ Failed to deploy:', res.status)
  }
  
  console.log('\nNow set these secrets in Supabase Dashboard → Settings → Vault:')
  console.log('- POSTMARK_SERVER_TOKEN: your_postmark_token')
  console.log('- APP_BASE_URL: https://your-app.com')
}

main().catch(e => { console.error(e); process.exit(1) })
