import { supabase } from './supabase'

export class EmailService {
  // Send email via edge function
  static async sendEmail(to: string, subject: string, body: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to,
          subject,
          body
        }
      })

      if (error) {
        console.error('Email error:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Failed to send email:', error)
      return false
    }
  }

  // Check if user is online
  static async isUserOnline(userId: string): Promise<boolean> {
    try {
      const { data } = await supabase
        .from('user_presence')
        .select('is_online, last_seen_at')
        .eq('user_id', userId)
        .single()

      if (!data) return false

      const tenSecondsAgo = new Date(Date.now() - 10 * 1000)
      const lastSeen = new Date(data.last_seen_at)

      return data.is_online && lastSeen > tenSecondsAgo
    } catch (error) {
      return false
    }
  }

  // Send offline message notification
  static async notifyOfflineMessage(
    senderId: string,
    recipientId: string,
    messageContent: string,
    conversationId: string
  ): Promise<void> {
    try {
      // Check if recipient is online
      const isOnline = await this.isUserOnline(recipientId)
      if (isOnline) return // Don't send email if user is online

      // Get user details
      const { data: recipient } = await supabase
        .from('user')
        .select('email, name')
        .eq('id', recipientId)
        .single()

      const { data: sender } = await supabase
        .from('user')
        .select('name')
        .eq('id', senderId)
        .single()

      if (!recipient?.email) return

      const senderName = sender?.name || 'a user'
      const subject = `New message from ${senderName} on SplitStay`
      const body = `You have a new message from ${senderName} on SplitStay:

${messageContent.length > 200 ? messageContent.substring(0, 200) + '...' : messageContent}

View the conversation at: https://splitstay.travel/messages?chat=${conversationId}`

      await this.sendEmail(recipient.email, subject, body)
    } catch (error) {
      console.error('Failed to send offline message notification:', error)
    }
  }

  // Send trip request notification
  static async notifyTripRequest(
    requesterId: string,
    tripId: string,
    message?: string
  ): Promise<void> {
    try {
      // Get trip and host details
      const { data: trip } = await supabase
        .from('trip')
        .select(`
          name,
          location,
          hostId,
          host:user!trip_hostId_fkey(email, name)
        `)
        .eq('id', tripId)
        .single()

      const { data: requester } = await supabase
        .from('user')
        .select('name')
        .eq('id', requesterId)
        .single()

      if (!trip?.host?.email) return

      const requesterName = requester?.name || 'Someone'
      const hostName = trip.host.name || 'there'
      
      const subject = `${requesterName} wants to join your trip to ${trip.location}`
      const body = `Hi ${hostName},

${requesterName} has requested to join your trip "${trip.name}" in ${trip.location}.

${message ? `Their message: ${message}

` : ''}View and respond to this request at: https://splitstay.com/messages

Happy travels!
The SplitStay Team`

      await this.sendEmail(trip.host.email, subject, body)
    } catch (error) {
      console.error('Failed to send trip request notification:', error)
    }
  }
}
