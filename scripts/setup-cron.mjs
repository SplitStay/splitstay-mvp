import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

async function main() {
  const base = process.env.VITE_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE || process.env.VITE_SUPABASE_ANON_KEY
  if (!base || !key) throw new Error('Missing VITE_SUPABASE_URL or service role key')
  
  const projectRef = new URL(base).hostname.split('.')[0]
  const functionUrl = `https://${projectRef}.supabase.co/functions/v1/process-pending-emails`
  
  const payload = {
    name: 'process-pending-emails',
    cron: '* * * * *',
    http_request: {
      url: functionUrl,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}'
    }
  }
  
  const res = await fetch(`${base}/rest/v1/rpc/create_cron_job`, {
    method: 'POST',
    headers: {
      apikey: key,
      authorization: `Bearer ${key}`,
      'content-type': 'application/json'
    },
    body: JSON.stringify(payload)
  })
  
  if (!res.ok) {
    console.log('Failed to create cron job via RPC, trying pg_cron extension directly...')
    const fallbackPayload = {
      jobname: 'process-pending-emails',
      schedule: '* * * * *',
      command: `SELECT net.http_post(url:='${functionUrl}', body:='{}', headers:='{"Content-Type": "application/json"}'::jsonb);`
    }
    
    const fallbackRes = await fetch(`${base}/rest/v1/rpc/cron_schedule`, {
      method: 'POST',
      headers: {
        apikey: key,
        authorization: `Bearer ${key}`,
        'content-type': 'application/json'
      },
      body: JSON.stringify(fallbackPayload)
    })
    
    if (!fallbackRes.ok) {
      throw new Error(`Failed to schedule: ${fallbackRes.status}`)
    }
  }
  
  console.log('Scheduled process-pending-emails to run every minute')
}

main().catch(e => { console.error(e); process.exit(1) })
