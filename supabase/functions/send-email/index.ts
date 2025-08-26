export const config = { runtime: 'edge' }

interface EmailPayload {
  to: string
  subject: string
  body: string
  from?: string
}

export default async function handler(req: Request) {
  try {
    const payload: EmailPayload = await req.json()
    
    // Use Postmark (you already have this set up)
    const postmarkToken = Deno.env.get('POSTMARK_SERVER_TOKEN')
    
    if (postmarkToken) {
      const response = await fetch('https://api.postmarkapp.com/email', {
        method: 'POST',
        headers: {
          'X-Postmark-Server-Token': postmarkToken,
          'Content-Type': 'application/json',
        },
              body: JSON.stringify({
        From: payload.from || 'hello@splitstay.travel',
        To: payload.to,
        Subject: payload.subject,
        TextBody: payload.body,
      }),
      })
      
      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(`Postmark error: ${response.statusText} - ${errorData}`)
      }
      
      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }
    
    // Fallback: Log email in development
    console.log('Email would be sent:', payload)
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Email logged (no service configured)' 
    }), {
      headers: { 'Content-Type': 'application/json' },
    })
    
  } catch (error) {
    console.error('Email error:', error)
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
