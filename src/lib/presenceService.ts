import { supabase } from './supabase'

export class PresenceService {
  private static presenceInterval: NodeJS.Timeout | null = null
  private static presenceChannel: any = null
  
  // Start tracking user presence
  static async startPresenceTracking(userId: string) {
    if (!userId) return
    
    // Update presence immediately
    await this.updatePresence(userId, true)
    
    // Update presence every 30 seconds
    this.presenceInterval = setInterval(async () => {
      await this.updatePresence(userId, true)
    }, 30000)
    
    // Subscribe to presence channel for real-time updates
    this.presenceChannel = supabase.channel('presence-' + userId)
      .on('presence', { event: 'sync' }, () => {
        // Handle presence sync
      })
      .subscribe()
    
    // Handle page visibility changes
    document.addEventListener('visibilitychange', async () => {
      if (document.visibilityState === 'visible') {
        await this.updatePresence(userId, true)
      } else {
        await this.updatePresence(userId, false)
      }
    })
    
    // Handle page unload
    window.addEventListener('beforeunload', () => {
      this.updatePresence(userId, false)
    })
  }
  
  // Stop tracking user presence
  static async stopPresenceTracking(userId: string) {
    if (this.presenceInterval) {
      clearInterval(this.presenceInterval)
      this.presenceInterval = null
    }
    
    if (this.presenceChannel) {
      await supabase.removeChannel(this.presenceChannel)
      this.presenceChannel = null
    }
    
    // Mark user as offline
    await this.updatePresence(userId, false)
  }
  
  // Update user presence in database
  static async updatePresence(userId: string, isOnline: boolean) {
    try {
      const { error } = await supabase
        .from('user_presence')
        .upsert({
          user_id: userId,
          is_online: isOnline,
          last_seen_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })
      
      if (error) {
        console.error('Error updating presence:', error)
      }
    } catch (error) {
      console.error('Error updating presence:', error)
    }
  }
  
  // Get online status for multiple users
  static async getOnlineStatus(userIds: string[]): Promise<Record<string, boolean>> {
    if (!userIds.length) return {}
    
    try {
      const { data, error } = await supabase
        .from('user_presence')
        .select('user_id, is_online, last_seen_at')
        .in('user_id', userIds)
      
      if (error) throw error
      
      const statusMap: Record<string, boolean> = {}
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
      
      for (const presence of data || []) {
        const lastSeen = new Date(presence.last_seen_at)
        // Consider user online if marked as online and seen within last 5 minutes
        statusMap[presence.user_id] = presence.is_online && lastSeen > fiveMinutesAgo
      }
      
      // Default to offline for users not in the presence table
      for (const userId of userIds) {
        if (!(userId in statusMap)) {
          statusMap[userId] = false
        }
      }
      
      return statusMap
    } catch (error) {
      console.error('Error getting online status:', error)
      return {}
    }
  }
  
  // Check if a specific user is online
  static async isUserOnline(userId: string): Promise<boolean> {
    const statusMap = await this.getOnlineStatus([userId])
    return statusMap[userId] || false
  }
}
