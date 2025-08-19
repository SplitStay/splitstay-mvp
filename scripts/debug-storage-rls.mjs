import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

async function debugStorageRLS() {
  console.log('=== DEBUGGING STORAGE RLS ===')
  
  // Test auth
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  console.log('Auth user:', user?.id || 'NOT AUTHENTICATED')
  
  if (!user) {
    console.log('❌ NOT AUTHENTICATED - This is the problem!')
    return
  }
  
  // Test storage bucket access
  console.log('\n=== TESTING STORAGE BUCKET ===')
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets()
    console.log('Buckets:', buckets?.map(b => ({ name: b.name, public: b.public })))
    if (error) console.log('Bucket error:', error)
  } catch (e) {
    console.log('Bucket exception:', e.message)
  }
  
  // Test file upload
  console.log('\n=== TESTING FILE UPLOAD ===')
  const testFile = new Blob(['test content'], { type: 'text/plain' })
  const fileName = `test-${Date.now()}.txt`
  const filePath = `conversation1/${user.id}/${fileName}`
  
  try {
    const { data, error } = await supabase.storage
      .from('chat-attachments')
      .upload(filePath, testFile)
    
    if (error) {
      console.log('❌ UPLOAD ERROR:', error)
      console.log('Error details:', JSON.stringify(error, null, 2))
    } else {
      console.log('✅ UPLOAD SUCCESS:', data.path)
      
      // Clean up test file
      await supabase.storage.from('chat-attachments').remove([data.path])
      console.log('🗑️  Test file cleaned up')
    }
  } catch (e) {
    console.log('❌ UPLOAD EXCEPTION:', e.message)
  }
  
  // Check storage policies
  console.log('\n=== CHECKING STORAGE POLICIES ===')
  try {
    const { data, error } = await supabase
      .from('pg_policies')
      .select('*')
      .eq('tablename', 'objects')
      .eq('schemaname', 'storage')
    
    if (data) {
      console.log('Storage policies:', data.map(p => ({
        name: p.policyname,
        cmd: p.cmd,
        qual: p.qual
      })))
    }
  } catch (e) {
    console.log('Could not check policies:', e.message)
  }
}

debugStorageRLS().catch(console.error)
