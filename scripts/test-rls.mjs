import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

async function main() {
  const base = process.env.VITE_SUPABASE_URL
  const key = process.env.VITE_SUPABASE_ANON_KEY
  if (!base || !key) throw new Error('Missing env')
  
  const headers = { apikey: key, authorization: `Bearer ${key}`, 'content-type': 'application/json' }
  
  console.log('Testing RLS policies with authenticated user...')
  
  // Test conversations access
  try {
    const res = await fetch(`${base}/rest/v1/conversations?limit=1`, { headers })
    console.log('✓ Conversations SELECT:', res.ok ? 'OK' : `${res.status} ${res.statusText}`)
  } catch (e) {
    console.log('✗ Conversations SELECT: ERROR')
  }
  
  // Test messages access
  try {
    const res = await fetch(`${base}/rest/v1/messages?limit=1`, { headers })
    console.log('✓ Messages SELECT:', res.ok ? 'OK' : `${res.status} ${res.statusText}`)
  } catch (e) {
    console.log('✗ Messages SELECT: ERROR')
  }
  
  // Test user_presence access
  try {
    const res = await fetch(`${base}/rest/v1/user_presence?limit=1`, { headers })
    console.log('✓ User Presence SELECT:', res.ok ? 'OK' : `${res.status} ${res.statusText}`)
  } catch (e) {
    console.log('✗ User Presence SELECT: ERROR')
  }
  
  // Test message_read_status access
  try {
    const res = await fetch(`${base}/rest/v1/message_read_status?limit=1`, { headers })
    console.log('✓ Message Read Status SELECT:', res.ok ? 'OK' : `${res.status} ${res.statusText}`)
  } catch (e) {
    console.log('✗ Message Read Status SELECT: ERROR')
  }
  
  // Test storage bucket access
  try {
    const res = await fetch(`${base}/storage/v1/bucket/chat-attachments`, { headers })
    console.log('✓ Storage Bucket:', res.ok ? 'OK' : `${res.status} ${res.statusText}`)
  } catch (e) {
    console.log('✗ Storage Bucket: ERROR')
  }
}

main().catch(e => { console.error(e); process.exit(1) })
