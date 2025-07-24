'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { authenticatedSupabase } from '@/lib/messaging/supabase'
import { useSupabaseAuth } from '@/hooks/use-supabase-auth'
import type { Message } from '@/types/messaging'
import type { RealtimeChannel } from '@supabase/supabase-js'

interface PostgresChangesPayload {
  new: {
    id: string
    conversation_id: string
    sender_id: string
    content?: string
    message_type?: 'text' | 'image' | 'file' | 'system'
    attachment_url?: string
    attachment_filename?: string
    attachment_size?: number
    reply_to_message_id?: string
    edited_at?: string
    deleted_at?: string
    created_at: string
  }
}

interface OptimizedRealtimeConfig {
  onNewMessage?: (message: Message) => void
  onTypingIndicator?: (conversationId: string, userId: string, isTyping: boolean, userName?: string) => void
  activeConversationId?: string | null
  isMessagingActive?: boolean
}

interface RetryState {
  count: number
  lastAttempt: number
  maxRetries: number
}

/**
 * Optimized real-time service hook that manages WebSocket subscriptions efficiently
 * - Only subscribes to active conversation messages
 * - Batches conversation updates
 * - Automatically manages connection lifecycle
 * - Includes robust retry logic for connection failures
 * - Integrated with NextAuth JWT authentication
 */
export function useOptimizedRealtime({
  onNewMessage,
  activeConversationId,
  isMessagingActive = true
}: OptimizedRealtimeConfig) {
  const { user } = useAuth()
  const { isAuthenticated } = useSupabaseAuth() // Sync NextAuth with Supabase
  const channelRef = useRef<RealtimeChannel | null>(null)
  const lastActiveConversationRef = useRef<string | null>(null)
  const isSubscribingRef = useRef(false)
  const retryStateRef = useRef<RetryState>({
    count: 0,
    lastAttempt: 0,
    maxRetries: 5
  })
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Cleanup function for all subscriptions
  const cleanupSubscriptions = useCallback(() => {
    // Clear any pending retries
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current)
      retryTimeoutRef.current = null
    }
    
    if (channelRef.current) {
      authenticatedSupabase.removeChannel(channelRef.current)
      channelRef.current = null
    }
    
    lastActiveConversationRef.current = null
    isSubscribingRef.current = false
    
    // Reset retry state
    retryStateRef.current = {
      count: 0,
      lastAttempt: 0,
      maxRetries: 5
    }
  }, [])

  // Setup active conversation message subscription
  const setupActiveConversationSubscription = useCallback(async () => {
    if (!user || !activeConversationId || !isMessagingActive || !onNewMessage || !isAuthenticated) {
      return
    }

    // Prevent duplicate subscriptions
    if (
      lastActiveConversationRef.current === activeConversationId && 
      channelRef.current && 
      !isSubscribingRef.current
    ) {
      return
    }

    if (isSubscribingRef.current) {
      return
    }

    isSubscribingRef.current = true

    // Clean up previous subscription
    if (channelRef.current) {
      authenticatedSupabase.removeChannel(channelRef.current)
      channelRef.current = null
    }

    try {
      // Create a simpler channel name
      const channelName = `conversation-${activeConversationId}`
      
      // Subscribe to new messages directly with authenticated Supabase
      const channel = authenticatedSupabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `conversation_id=eq.${activeConversationId}`
          },
          (payload: PostgresChangesPayload) => {
            try {
              // Create a basic message from the payload
              const basicMessage: Message = {
                id: payload.new.id,
                conversationId: payload.new.conversation_id,
                senderId: payload.new.sender_id,
                content: payload.new.content || undefined,
                messageType: payload.new.message_type || 'text',
                attachmentUrl: payload.new.attachment_url || undefined,
                attachmentFilename: payload.new.attachment_filename || undefined,
                attachmentSize: payload.new.attachment_size || undefined,
                replyToMessageId: payload.new.reply_to_message_id || undefined,
                editedAt: payload.new.edited_at || undefined,
                deletedAt: payload.new.deleted_at || undefined,
                createdAt: payload.new.created_at,
                sender: undefined // Will be missing but at least message shows
              }
              
              if (onNewMessage) {
                onNewMessage(basicMessage)
              }
            } catch (error) {
              console.error('Error processing real-time message:', error)
            }
          }
        )
        .subscribe((status: string, error?: Error) => {
          if (error) {
            isSubscribingRef.current = false
          }
          if (status === 'SUBSCRIBED') {
            isSubscribingRef.current = false
            // Reset retry count on successful connection
            retryStateRef.current.count = 0
          }
          if (status === 'CHANNEL_ERROR') {
            isSubscribingRef.current = false
            
            // Clean up the failed channel
            if (channelRef.current) {
              authenticatedSupabase.removeChannel(channelRef.current)
              channelRef.current = null
            }
            
            // Attempt retry with backoff if we haven't exceeded max retries
            const retry = retryStateRef.current
            if (retry.count < retry.maxRetries) {
              const delay = Math.min(1000 * Math.pow(2, retry.count), 16000)
              
              retryTimeoutRef.current = setTimeout(() => {
                retry.count++
                retry.lastAttempt = Date.now()
                
                // Reset subscription state and try again
                lastActiveConversationRef.current = null
                setupActiveConversationSubscription()
              }, delay)
            }
          }
          if (status === 'CLOSED') {
            isSubscribingRef.current = false
          }
        })

      channelRef.current = channel
      lastActiveConversationRef.current = activeConversationId
    } catch {
      isSubscribingRef.current = false
    }
  }, [user, activeConversationId, isMessagingActive, onNewMessage, isAuthenticated])

  // Effect to manage active conversation subscriptions with debouncing
  useEffect(() => {
    // Add a longer delay to prevent rapid re-subscriptions
    const timeout = setTimeout(() => {
      if (activeConversationId && isMessagingActive && user && onNewMessage && isAuthenticated) {
        setupActiveConversationSubscription()
      } else {
        cleanupSubscriptions()
      }
    }, 500) // 500ms delay

    return () => clearTimeout(timeout)
  }, [setupActiveConversationSubscription, activeConversationId, isMessagingActive, user, onNewMessage, isAuthenticated, cleanupSubscriptions])

  // Effect to handle user changes
  useEffect(() => {
    if (!user || !isAuthenticated) {
      cleanupSubscriptions()
    }
  }, [user, isAuthenticated, cleanupSubscriptions])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupSubscriptions()
    }
  }, [cleanupSubscriptions])

  return {
    isConnected: Boolean(channelRef.current),
    hasActiveSubscription: Boolean(channelRef.current),
    cleanup: cleanupSubscriptions
  }
}
