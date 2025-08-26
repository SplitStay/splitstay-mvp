import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

interface WebhookPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE'
  table: string
  schema: string
  record: {
    id: string
    recipient_email: string
    recipient_name?: string
    subject: string
    body: string
    status: string
    created_at: string
    updated_at: string
    sent_at?: string
    error_message?: string
  }
  old_record?: any
}

serve(async (req: Request) => {
  try {
    console.log('Webhook received')
    
    // Parse the webhook payload
    const payload: WebhookPayload = await req.json()
    console.log('Payload:', JSON.stringify(payload))
    
    // Only process INSERT events for pending emails
    if (payload.type !== 'INSERT' || payload.record.status !== 'pending') {
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Skipping non-insert or non-pending email' 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    
    // Get Postmark token
    const postmarkToken = Deno.env.get('POSTMARK_SERVER_TOKEN')
    
    if (!postmarkToken) {
      console.error('POSTMARK_SERVER_TOKEN not set')
      throw new Error('POSTMARK_SERVER_TOKEN not set')
    }

    console.log('Sending email to:', payload.record.recipient_email)
    
    // Send email via Postmark
    const response = await fetch('https://api.postmarkapp.com/email', {
      method: 'POST',
      headers: {
        'X-Postmark-Server-Token': postmarkToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        From: 'hello@splitstay.travel',
        To: payload.record.recipient_email,
        Subject: payload.record.subject,
        TextBody: payload.record.body,
      }),
    })
    
    if (!response.ok) {
      const errorData = await response.text()
      console.error('Postmark error:', errorData)
      throw new Error(`Postmark error: ${response.statusText} - ${errorData}`)
    }
    
    console.log('Email sent successfully')
    
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
    
  } catch (error) {
    console.error('Webhook email error:', error)
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
