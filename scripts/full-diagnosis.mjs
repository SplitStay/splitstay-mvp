import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

async function main() {
  const base = process.env.VITE_SUPABASE_URL
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE
  
  if (!base || !anonKey) throw new Error('Missing env vars')
  
  console.log('=== FULL CHAT SYSTEM DIAGNOSIS ===\n')
  
  // Test with service role (bypasses RLS)
  const serviceHeaders = { 
    apikey: serviceKey || anonKey, 
    authorization: `Bearer ${serviceKey || anonKey}`,
    'content-type': 'application/json'
  }
  
  // Test with anon key (subject to RLS)
  const anonHeaders = { 
    apikey: anonKey, 
    authorization: `Bearer ${anonKey}`,
    'content-type': 'application/json'
  }
  
  console.log('1. CHECKING TABLES EXIST...')
  try {
    const tables = ['conversations', 'messages', 'message_read_status', 'user_presence']
    for (const table of tables) {
      const res = await fetch(`${base}/rest/v1/${table}?limit=1`, { headers: serviceHeaders })
      console.log(`   ${table}: ${res.ok ? '✓ EXISTS' : `✗ ${res.status} ${res.statusText}`}`)
    }
  } catch (e) {
    console.log('   ✗ ERROR:', e.message)
  }
  
  console.log('\n2. CHECKING STORAGE BUCKETS...')
  try {
    const res = await fetch(`${base}/storage/v1/bucket`, { headers: serviceHeaders })
    if (res.ok) {
      const buckets = await res.json()
      console.log('   Available buckets:', buckets.map(b => b.name).join(', '))
      console.log('   chat-attachments exists:', buckets.some(b => b.name === 'chat-attachments') ? '✓ YES' : '✗ NO')
    } else {
      console.log(`   ✗ Storage API error: ${res.status} ${res.statusText}`)
    }
  } catch (e) {
    console.log('   ✗ Storage ERROR:', e.message)
  }
  
  console.log('\n3. CHECKING RLS STATUS...')
  try {
    const query = `
      SELECT schemaname, tablename, rowsecurity 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename IN ('conversations', 'messages', 'message_read_status', 'user_presence')
    `
    const res = await fetch(`${base}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: serviceHeaders,
      body: JSON.stringify({ query })
    })
    
    if (res.ok) {
      const result = await res.json()
      console.log('   RLS Status:', result)
    } else {
      console.log(`   ✗ RLS check failed: ${res.status}`)
    }
  } catch (e) {
    console.log('   ✗ RLS ERROR:', e.message)
  }
  
  console.log('\n4. CHECKING POLICIES...')
  try {
    const query = `
      SELECT schemaname, tablename, policyname, cmd, roles 
      FROM pg_policies 
      WHERE schemaname = 'public' 
      AND tablename IN ('conversations', 'messages', 'message_read_status', 'user_presence')
    `
    const res = await fetch(`${base}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: serviceHeaders,
      body: JSON.stringify({ query })
    })
    
    if (res.ok) {
      const result = await res.json()
      console.log('   Policies:', result.length ? result : 'NO POLICIES FOUND')
    } else {
      console.log(`   ✗ Policies check failed: ${res.status}`)
    }
  } catch (e) {
    console.log('   ✗ Policies ERROR:', e.message)
  }
  
  console.log('\n5. TESTING ANON ACCESS (RLS Applied)...')
  try {
    const tables = ['conversations', 'messages', 'user_presence']
    for (const table of tables) {
      const res = await fetch(`${base}/rest/v1/${table}?limit=1`, { headers: anonHeaders })
      console.log(`   ${table} SELECT: ${res.ok ? '✓ OK' : `✗ ${res.status} ${res.statusText}`}`)
    }
  } catch (e) {
    console.log('   ✗ Anon access ERROR:', e.message)
  }
  
  console.log('\n6. TESTING INSERT (Where RLS violation likely occurs)...')
  try {
    // Try to insert a test message
    const testPayload = {
      conversation_id: '00000000-0000-0000-0000-000000000000',
      sender_id: '00000000-0000-0000-0000-000000000000', 
      content: 'test',
      message_type: 'text'
    }
    
    const res = await fetch(`${base}/rest/v1/messages`, {
      method: 'POST',
      headers: anonHeaders,
      body: JSON.stringify(testPayload)
    })
    
    console.log(`   Test message INSERT: ${res.ok ? '✓ OK' : `✗ ${res.status} ${res.statusText}`}`)
    
    if (!res.ok) {
      const error = await res.text()
      console.log(`   Error details: ${error}`)
    }
  } catch (e) {
    console.log('   ✗ Insert test ERROR:', e.message)
  }
  
  console.log('\n=== DIAGNOSIS COMPLETE ===')
}

main().catch(e => { console.error('DIAGNOSIS FAILED:', e); process.exit(1) })
