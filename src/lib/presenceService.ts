import { supabase } from './supabase';

// biome-ignore lint/complexity/noStaticOnlyClass: Service pattern
export class PresenceService {
  private static presenceInterval: NodeJS.Timeout | null = null;
  // biome-ignore lint/suspicious/noExplicitAny: Supabase channel type
  private static presenceChannel: any = null;

  // Start tracking user presence
  static async startPresenceTracking(userId: string) {
    if (!userId) return;

    // Update presence immediately
    await PresenceService.updatePresence(userId, true);

    // Update presence every 30 seconds
    PresenceService.presenceInterval = setInterval(async () => {
      await PresenceService.updatePresence(userId, true);
    }, 30000);

    // Subscribe to presence channel for real-time updates
    PresenceService.presenceChannel = supabase
      .channel(`presence-${userId}`)
      .on('presence', { event: 'sync' }, () => {
        // Handle presence sync
      })
      .subscribe();

    // Handle page visibility changes
    document.addEventListener('visibilitychange', async () => {
      if (document.visibilityState === 'visible') {
        await PresenceService.updatePresence(userId, true);
      } else {
        await PresenceService.updatePresence(userId, false);
      }
    });

    // Handle page unload
    window.addEventListener('beforeunload', () => {
      PresenceService.updatePresence(userId, false);
    });
  }

  // Stop tracking user presence
  static async stopPresenceTracking(userId: string) {
    if (PresenceService.presenceInterval) {
      clearInterval(PresenceService.presenceInterval);
      PresenceService.presenceInterval = null;
    }

    if (PresenceService.presenceChannel) {
      await supabase.removeChannel(PresenceService.presenceChannel);
      PresenceService.presenceChannel = null;
    }

    // Mark user as offline
    await PresenceService.updatePresence(userId, false);
  }

  // Update user presence in database
  static async updatePresence(userId: string, isOnline: boolean) {
    try {
      const { error } = await supabase.from('user_presence').upsert(
        {
          user_id: userId,
          is_online: isOnline,
          last_seen_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id',
        },
      );

      if (error) {
        console.error('Error updating presence:', error);
      }
    } catch (error) {
      console.error('Error updating presence:', error);
    }
  }

  // Get online status for multiple users
  static async getOnlineStatus(
    userIds: string[],
  ): Promise<Record<string, boolean>> {
    if (!userIds.length) return {};

    try {
      const { data, error } = await supabase
        .from('user_presence')
        .select('user_id, is_online, last_seen_at')
        .in('user_id', userIds);

      if (error) throw error;

      const statusMap: Record<string, boolean> = {};
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

      for (const presence of data || []) {
        const lastSeen = new Date(presence.last_seen_at);
        // Consider user online if marked as online and seen within last 5 minutes
        statusMap[presence.user_id] =
          presence.is_online && lastSeen > fiveMinutesAgo;
      }

      // Default to offline for users not in the presence table
      for (const userId of userIds) {
        if (!(userId in statusMap)) {
          statusMap[userId] = false;
        }
      }

      return statusMap;
    } catch (error) {
      console.error('Error getting online status:', error);
      return {};
    }
  }

  // Check if a specific user is online
  static async isUserOnline(userId: string): Promise<boolean> {
    const statusMap = await PresenceService.getOnlineStatus([userId]);
    return statusMap[userId] || false;
  }
}
