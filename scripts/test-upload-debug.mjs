import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

async function debugUpload() {
  console.log('=== UPLOAD DEBUG ===')
  
  // Check auth
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  console.log('1. Auth check:', user ? `✅ User ID: ${user.id}` : '❌ NOT AUTHENTICATED')
  
  if (authError) {
    console.log('Auth error:', authError)
  }
  
  // Check bucket
  console.log('\n2. Checking bucket...')
  const { data: buckets, error: bucketError } = await supabase.storage.listBuckets()
  const chatBucket = buckets?.find(b => b.name === 'chat-attachments')
  console.log('Bucket:', chatBucket ? `✅ Public: ${chatBucket.public}` : '❌ NOT FOUND')
  
  if (bucketError) {
    console.log('Bucket error:', bucketError)
  }
  
  // Test upload
  console.log('\n3. Testing upload...')
  const testFile = new Blob(['test content'], { type: 'text/plain' })
  const fileName = `debug-test-${Date.now()}.txt`
  const filePath = `debug/${fileName}`
  
  try {
    const { data, error } = await supabase.storage
      .from('chat-attachments')
      .upload(filePath, testFile, {
        cacheControl: '3600',
        upsert: false
      })
    
    if (error) {
      console.log('❌ UPLOAD FAILED')
      console.log('Error code:', error.error)
      console.log('Error message:', error.message)
      console.log('Full error:', JSON.stringify(error, null, 2))
    } else {
      console.log('✅ UPLOAD SUCCESS:', data.path)
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('chat-attachments')
        .getPublicUrl(data.path)
      console.log('Public URL:', urlData.publicUrl)
      
      // Clean up
      await supabase.storage.from('chat-attachments').remove([data.path])
      console.log('🗑️ Cleaned up test file')
    }
  } catch (e) {
    console.log('❌ UPLOAD EXCEPTION:', e.message)
    console.log('Stack:', e.stack)
  }
}

debugUpload().catch(console.error)
