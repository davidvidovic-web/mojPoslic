import { supabase } from './supabase'
import type { Message, TypingUser, UserPresence } from '../../types/messaging'
import { RealtimeChannel } from '@supabase/supabase-js'

// Types for presence data
type TypingPresenceData = {
  presence_ref: string
  is_typing?: boolean
}

type UserPresenceData = {
  presence_ref: string
  status?: 'online' | 'offline' | 'away'
  last_seen?: string
}

export class RealtimeService {
  private static channels: Map<string, RealtimeChannel> = new Map()

  /**
   * Subscribe to new messages in a conversation
   */
  static subscribeToMessages(
    conversationId: string,
    onNewMessage: (message: Message) => void,
    onMessageUpdate: (message: Message) => void
  ): () => void {
    const channelName = `conversation:${conversationId}`
    
    // Remove existing channel if it exists
    this.unsubscribeFromChannel(channelName)

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        async (payload) => {
          // Fetch complete message data with sender info
          const { data: message, error } = await supabase
            .from('messages')
            .select(`
              *,
              sender:sender_id (
                id,
                name,
                avatar_url,
                role
              )
            `)
            .eq('id', payload.new.id)
            .single()

          if (!error && message) {
            const formattedMessage: Message = {
              id: message.id,
              conversation_id: message.conversation_id,
              sender_id: message.sender_id,
              content: message.content || undefined,
              message_type: message.message_type as 'text' | 'image' | 'file' | 'system',
              attachment_url: message.attachment_url || undefined,
              attachment_filename: message.attachment_filename || undefined,
              attachment_size: message.attachment_size || undefined,
              reply_to_message_id: message.reply_to_message_id || undefined,
              edited_at: message.edited_at || undefined,
              deleted_at: message.deleted_at || undefined,
              created_at: message.created_at,
              sender: {
                id: message.sender.id,
                name: message.sender.name,
                avatar_url: message.sender.avatar_url || undefined,
                role: message.sender.role
              }
            }
            onNewMessage(formattedMessage)
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        async (payload) => {
          // Fetch updated message data
          const { data: message, error } = await supabase
            .from('messages')
            .select(`
              *,
              sender:sender_id (
                id,
                name,
                avatar_url,
                role
              )
            `)
            .eq('id', payload.new.id)
            .single()

          if (!error && message) {
            const formattedMessage: Message = {
              id: message.id,
              conversation_id: message.conversation_id,
              sender_id: message.sender_id,
              content: message.content || undefined,
              message_type: message.message_type as 'text' | 'image' | 'file' | 'system',
              attachment_url: message.attachment_url || undefined,
              attachment_filename: message.attachment_filename || undefined,
              attachment_size: message.attachment_size || undefined,
              reply_to_message_id: message.reply_to_message_id || undefined,
              edited_at: message.edited_at || undefined,
              deleted_at: message.deleted_at || undefined,
              created_at: message.created_at,
              sender: {
                id: message.sender.id,
                name: message.sender.name,
                avatar_url: message.sender.avatar_url || undefined,
                role: message.sender.role
              }
            }
            onMessageUpdate(formattedMessage)
          }
        }
      )
      .subscribe()

    this.channels.set(channelName, channel)

    // Return unsubscribe function
    return () => this.unsubscribeFromChannel(channelName)
  }

  /**
   * Subscribe to typing indicators in a conversation
   */
  static subscribeToTyping(
    conversationId: string,
    onTypingUpdate: (typingUsers: TypingUser[]) => void
  ): () => void {
    const channelName = `typing:${conversationId}`
    
    // Remove existing channel if it exists
    this.unsubscribeFromChannel(channelName)

    const channel = supabase
      .channel(channelName)
      .on('presence', { event: 'sync' }, () => {
        const newState = channel.presenceState()
        const typingUsers: TypingUser[] = []

        Object.keys(newState).forEach((userId) => {
          const presence = newState[userId][0] as TypingPresenceData // Get latest presence
          if (presence?.is_typing) {
            typingUsers.push({
              user_id: userId,
              conversation_id: conversationId,
              is_typing: true,
              timestamp: new Date().toISOString()
            })
          }
        })

        onTypingUpdate(typingUsers)
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        // Handle user starting to type
        console.log('User joined typing:', key, newPresences)
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        // Handle user stopping typing
        console.log('User left typing:', key, leftPresences)
      })
      .subscribe()

    this.channels.set(channelName, channel)

    return () => this.unsubscribeFromChannel(channelName)
  }

  /**
   * Subscribe to user presence updates
   */
  static subscribeToPresence(
    onPresenceUpdate: (presence: UserPresence[]) => void
  ): () => void {
    const channelName = 'global:presence'
    
    this.unsubscribeFromChannel(channelName)

    const channel = supabase
      .channel(channelName)
      .on('presence', { event: 'sync' }, () => {
        const newState = channel.presenceState()
        const presenceList: UserPresence[] = []

        Object.keys(newState).forEach((userId) => {
          const presence = newState[userId][0] as UserPresenceData // Get latest presence
          presenceList.push({
            user_id: userId,
            status: presence?.status || 'offline',
            last_seen: presence?.last_seen || new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
        })

        onPresenceUpdate(presenceList)
      })
      .subscribe()

    this.channels.set(channelName, channel)

    return () => this.unsubscribeFromChannel(channelName)
  }

  /**
   * Send typing indicator
   */
  static async sendTypingIndicator(conversationId: string, userId: string, isTyping: boolean): Promise<void> {
    const channelName = `typing:${conversationId}`
    const channel = this.channels.get(channelName)

    if (channel) {
      if (isTyping) {
        await channel.track({
          user_id: userId,
          is_typing: true,
          timestamp: new Date().toISOString()
        })
      } else {
        await channel.untrack()
      }
    }
  }

  /**
   * Update user presence status
   */
  static async updatePresence(userId: string, status: 'online' | 'away' | 'busy' | 'offline'): Promise<void> {
    const channelName = 'global:presence'
    const channel = this.channels.get(channelName)

    if (channel) {
      await channel.track({
        user_id: userId,
        status,
        last_seen: new Date().toISOString()
      })
    }
  }

  /**
   * Subscribe to conversation updates (participants, title changes, etc.)
   */
  static subscribeToConversationUpdates(
    conversationId: string,
    onConversationUpdate: (conversation: Record<string, unknown>) => void
  ): () => void {
    const channelName = `conversation_meta:${conversationId}`
    
    this.unsubscribeFromChannel(channelName)

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'conversations',
          filter: `id=eq.${conversationId}`
        },
        (payload) => {
          onConversationUpdate(payload.new)
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversation_participants',
          filter: `conversation_id=eq.${conversationId}`
        },
        () => {
          // Participant changes - could refetch conversation data
          onConversationUpdate({ type: 'participants_changed' })
        }
      )
      .subscribe()

    this.channels.set(channelName, channel)

    return () => this.unsubscribeFromChannel(channelName)
  }

  /**
   * Subscribe to message status updates (read receipts)
   */
  static subscribeToMessageStatus(
    conversationId: string,
    onStatusUpdate: (messageId: string, status: Record<string, unknown>) => void
  ): () => void {
    const channelName = `status:${conversationId}`
    
    this.unsubscribeFromChannel(channelName)

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'message_status'
        },
        async (payload) => {
          // Check if this status update is for a message in this conversation
          const { data: message } = await supabase
            .from('messages')
            .select('conversation_id')
            .eq('id', payload.new.message_id)
            .single()

          if (message?.conversation_id === conversationId) {
            onStatusUpdate(payload.new.message_id, payload.new)
          }
        }
      )
      .subscribe()

    this.channels.set(channelName, channel)

    return () => this.unsubscribeFromChannel(channelName)
  }

  /**
   * Unsubscribe from a specific channel
   */
  private static unsubscribeFromChannel(channelName: string): void {
    const channel = this.channels.get(channelName)
    if (channel) {
      supabase.removeChannel(channel)
      this.channels.delete(channelName)
    }
  }

  /**
   * Unsubscribe from all channels
   */
  static unsubscribeFromAll(): void {
    this.channels.forEach((channel) => {
      supabase.removeChannel(channel)
    })
    this.channels.clear()
  }

  /**
   * Get current subscription count
   */
  static getActiveSubscriptions(): number {
    return this.channels.size
  }

  /**
   * Check if connected to realtime
   */
  static isConnected(): boolean {
    return supabase.realtime.isConnected()
  }
}
