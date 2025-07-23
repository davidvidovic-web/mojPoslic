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
  private static subscriptionPromises: Map<string, Promise<void>> = new Map()
  private static messageBatch: Map<string, Message[]> = new Map()
  private static batchTimeouts: Map<string, NodeJS.Timeout> = new Map()
  private static readonly BATCH_DELAY = 100 // 100ms batching delay
  private static readonly MAX_BATCH_SIZE = 10 // Maximum messages per batch
  private static connectionPool: Map<string, number> = new Map() // Track connection usage
  private static readonly MAX_CONNECTIONS = 5 // Maximum simultaneous connections
  private static cleanupInterval: NodeJS.Timeout | null = null

  /**
   * Initialize connection pool cleanup
   */
  static initializeConnectionPool(): void {
    if (this.cleanupInterval) return
    
    // Clean up unused connections every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanupUnusedConnections()
    }, 5 * 60 * 1000)
  }

  /**
   * Clean up unused connections to optimize performance
   */
  private static cleanupUnusedConnections(): void {
    const now = Date.now()
    const unusedThreshold = 10 * 60 * 1000 // 10 minutes
    
    for (const [channelName, lastUsed] of this.connectionPool.entries()) {
      if (now - lastUsed > unusedThreshold) {
        console.log(`Cleaning up unused connection: ${channelName}`)
        this.unsubscribeFromChannel(channelName)
        this.connectionPool.delete(channelName)
      }
    }
  }

  /**
   * Check if we can create a new connection
   */
  private static canCreateConnection(): boolean {
    return this.channels.size < this.MAX_CONNECTIONS
  }

  /**
   * Batch messages to reduce UI update frequency
   */
  private static batchMessage(
    conversationId: string,
    message: Message,
    onMessagesBatch: (messages: Message[]) => void
  ): void {
    const batchKey = `batch:${conversationId}`
    
    // Initialize batch if it doesn't exist
    if (!this.messageBatch.has(batchKey)) {
      this.messageBatch.set(batchKey, [])
    }
    
    const batch = this.messageBatch.get(batchKey)!
    batch.push(message)
    
    // Optimize memory usage periodically
    this.optimizeMemoryUsage()
    
    // Clear existing timeout
    if (this.batchTimeouts.has(batchKey)) {
      clearTimeout(this.batchTimeouts.get(batchKey)!)
    }
    
    // If batch is full, flush immediately
    if (batch.length >= this.MAX_BATCH_SIZE) {
      this.flushBatch(batchKey, onMessagesBatch)
      return
    }
    
    // Set timeout to flush batch
    const timeout = setTimeout(() => {
      this.flushBatch(batchKey, onMessagesBatch)
    }, this.BATCH_DELAY)
    
    this.batchTimeouts.set(batchKey, timeout)
  }

  /**
   * Get memory usage of message batches
   */
  private static getMemoryUsage(): number {
    let totalMessages = 0
    for (const batch of this.messageBatch.values()) {
      totalMessages += batch.length
    }
    return totalMessages
  }

  /**
   * Clear old batches if memory usage is too high
   */
  private static optimizeMemoryUsage(): void {
    const MAX_TOTAL_MESSAGES = 100 // Maximum total messages in all batches
    
    if (this.getMemoryUsage() > MAX_TOTAL_MESSAGES) {
      console.log('Optimizing memory usage: clearing old message batches')
      // Clear oldest batches first
      const sortedBatches = Array.from(this.messageBatch.entries())
        .sort(([, a], [, b]) => a.length - b.length) // Sort by batch size (smallest first)
      
      for (const [batchKey] of sortedBatches.slice(0, 3)) { // Clear up to 3 smallest batches
        this.messageBatch.delete(batchKey)
        if (this.batchTimeouts.has(batchKey)) {
          clearTimeout(this.batchTimeouts.get(batchKey)!)
          this.batchTimeouts.delete(batchKey)
        }
      }
    }
  }

  /**
   * Flush a message batch
   */
  private static flushBatch(
    batchKey: string,
    onMessagesBatch: (messages: Message[]) => void
  ): void {
    const batch = this.messageBatch.get(batchKey)
    if (batch && batch.length > 0) {
      onMessagesBatch([...batch])
      this.messageBatch.set(batchKey, [])
    }
    
    if (this.batchTimeouts.has(batchKey)) {
      clearTimeout(this.batchTimeouts.get(batchKey)!)
      this.batchTimeouts.delete(batchKey)
    }
  }

  /**
   * Subscribe to new messages in a conversation with improved reliability
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
          console.log('Real-time new message:', payload)
          try {
            // Fetch enriched message data from our API endpoint
            const response = await fetch(`/api/messages/${payload.new.id}`, {
              method: 'GET',
              credentials: 'include',
            })

            if (response.ok) {
              const data = await response.json()
              if (data.message) {
                onNewMessage(data.message)
              }
            } else {
              console.error('Failed to fetch enriched message data:', response.status)
              // Fallback to basic message data without sender info
              const basicMessage: Message = {
                id: payload.new.id,
                conversationId: payload.new.conversation_id,
                senderId: payload.new.sender_id,
                content: payload.new.content || undefined,
                messageType: payload.new.message_type as 'text' | 'image' | 'file' | 'system',
                attachmentUrl: payload.new.attachment_url || undefined,
                attachmentFilename: payload.new.attachment_filename || undefined,
                attachmentSize: payload.new.attachment_size || undefined,
                replyToMessageId: payload.new.reply_to_message_id || undefined,
                editedAt: payload.new.edited_at || undefined,
                deletedAt: payload.new.deleted_at || undefined,
                createdAt: payload.new.created_at,
                sender: undefined // Will be missing but at least message shows
              }
              onNewMessage(basicMessage)
            }
          } catch (error) {
            console.error('Error processing real-time message:', error)
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
          console.log('Real-time message update:', payload)
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
              conversationId: message.conversation_id,
              senderId: message.sender_id,
              content: message.content || undefined,
              messageType: message.message_type as 'text' | 'image' | 'file' | 'system',
              attachmentUrl: message.attachment_url || undefined,
              attachmentFilename: message.attachment_filename || undefined,
              attachmentSize: message.attachment_size || undefined,
              replyToMessageId: message.reply_to_message_id || undefined,
              editedAt: message.edited_at || undefined,
              deletedAt: message.deleted_at || undefined,
              createdAt: message.created_at,
              sender: {
                id: message.sender.id,
                name: message.sender.name,
                avatarUrl: message.sender.avatar_url || undefined,
                role: message.sender.role
              }
            }
            onMessageUpdate(formattedMessage)
          }
        }
      )

    // Subscribe with error handling
    const subscribePromise = new Promise<void>((resolve, reject) => {
      channel.subscribe((status) => {
        console.log(`Message subscription status for ${conversationId}:`, status)
        if (status === 'SUBSCRIBED') {
          console.log(`Successfully subscribed to messages for conversation ${conversationId}`)
          resolve()
        } else if (status === 'CLOSED') {
          console.log(`Message subscription closed for conversation ${conversationId}`)
        } else if (status === 'CHANNEL_ERROR') {
          console.error(`Message subscription error for conversation ${conversationId}`)
          reject(new Error('Channel subscription error'))
        }
      })
    })

    this.channels.set(channelName, channel)
    this.subscriptionPromises.set(channelName, subscribePromise)
    this.connectionPool.set(channelName, Date.now()) // Track connection usage

    // Return unsubscribe function
    return () => this.unsubscribeFromChannel(channelName)
  }

  /**
   * Subscribe to new messages in a conversation with message batching for performance
   */
  static subscribeToMessagesBatched(
    conversationId: string,
    onMessagesBatch: (messages: Message[]) => void,
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
          console.log('Real-time new message (batched):', payload)
          try {
            // Fetch enriched message data from our API endpoint
            const response = await fetch(`/api/messages/${payload.new.id}`, {
              method: 'GET',
              credentials: 'include',
            })

            if (response.ok) {
              const data = await response.json()
              if (data.message) {
                // Use batching for new messages
                this.batchMessage(conversationId, data.message, onMessagesBatch)
              }
            } else {
              console.error('Failed to fetch enriched message data:', response.status)
              // Fallback to basic message data
              const basicMessage: Message = {
                id: payload.new.id,
                conversationId: payload.new.conversation_id,
                senderId: payload.new.sender_id,
                content: payload.new.content || undefined,
                messageType: payload.new.message_type as 'text' | 'image' | 'file' | 'system',
                attachmentUrl: payload.new.attachment_url || undefined,
                attachmentFilename: payload.new.attachment_filename || undefined,
                attachmentSize: payload.new.attachment_size || undefined,
                replyToMessageId: payload.new.reply_to_message_id || undefined,
                editedAt: payload.new.edited_at || undefined,
                deletedAt: payload.new.deleted_at || undefined,
                createdAt: payload.new.created_at,
                sender: undefined
              }
              this.batchMessage(conversationId, basicMessage, onMessagesBatch)
            }
          } catch (error) {
            console.error('Error processing real-time message:', error)
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
          console.log('Real-time message update (batched):', payload)
          // Updates are not batched as they are usually single events
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

          if (error) {
            console.error('Error fetching updated message:', error)
            return
          }

          if (message && message.sender) {
            const formattedMessage: Message = {
              id: message.id,
              conversationId: message.conversation_id,
              senderId: message.sender_id,
              content: message.content || undefined,
              messageType: message.message_type as 'text' | 'image' | 'file' | 'system',
              attachmentUrl: message.attachment_url || undefined,
              attachmentFilename: message.attachment_filename || undefined,
              attachmentSize: message.attachment_size || undefined,
              replyToMessageId: message.reply_to_message_id || undefined,
              editedAt: message.edited_at || undefined,
              deletedAt: message.deleted_at || undefined,
              createdAt: message.created_at,
              sender: {
                id: message.sender.id,
                name: message.sender.name,
                avatarUrl: message.sender.avatar_url || undefined,
                role: message.sender.role
              }
            }
            onMessageUpdate(formattedMessage)
          }
        }
      )

    // Subscribe with error handling
    const subscribePromise = new Promise<void>((resolve, reject) => {
      channel.subscribe((status) => {
        console.log(`Batched message subscription status for ${conversationId}:`, status)
        if (status === 'SUBSCRIBED') {
          console.log(`Successfully subscribed to batched messages for conversation ${conversationId}`)
          resolve()
        } else if (status === 'CLOSED') {
          console.log(`Batched message subscription closed for conversation ${conversationId}`)
        } else if (status === 'CHANNEL_ERROR') {
          console.error(`Batched message subscription error for conversation ${conversationId}`)
          reject(new Error('Channel subscription error'))
        }
      })
    })

    this.channels.set(channelName, channel)
    this.subscriptionPromises.set(channelName, subscribePromise)

    // Return unsubscribe function
    return () => {
      this.unsubscribeFromChannel(channelName)
      // Clean up any pending batches
      const batchKey = `batch:${conversationId}`
      if (this.batchTimeouts.has(batchKey)) {
        clearTimeout(this.batchTimeouts.get(batchKey)!)
        this.batchTimeouts.delete(batchKey)
      }
      this.messageBatch.delete(batchKey)
    }
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
      this.subscriptionPromises.delete(channelName)
      this.connectionPool.delete(channelName) // Clean up connection pool tracking
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
    this.subscriptionPromises.clear()
    this.connectionPool.clear() // Clear connection pool
    this.messageBatch.clear() // Clear message batches
    this.batchTimeouts.forEach(timeout => clearTimeout(timeout)) // Clear timeouts
    this.batchTimeouts.clear()
    
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
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
