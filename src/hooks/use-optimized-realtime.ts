'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { RealtimeService } from '@/lib/messaging/realtime-service'
import type { Message } from '@/types/messaging'

interface OptimizedRealtimeConfig {
  onNewMessage?: (message: Message) => void
  onMessageUpdate?: (message: Message) => void
  onTypingIndicator?: (conversationId: string, userId: string, isTyping: boolean, userName?: string) => void
  onConversationUpdate?: (conversationId: string) => void
  activeConversationId?: string | null
  isMessagingActive?: boolean
}

/**
 * Optimized real-time service hook that manages WebSocket subscriptions efficiently
 * - Only subscribes to active conversation messages
 * - Batches conversation updates
 * - Automatically manages connection lifecycle
 */
export function useOptimizedRealtime({
  onNewMessage,
  onMessageUpdate,
  onTypingIndicator,
  onConversationUpdate,
  activeConversationId,
  isMessagingActive = true
}: OptimizedRealtimeConfig) {
  const { user } = useAuth()
  const activeSubscriptionRef = useRef<(() => void) | null>(null)
  const globalSubscriptionRef = useRef<(() => void) | null>(null)
  const typingSubscriptionRef = useRef<(() => void) | null>(null)
  const lastActiveConversationRef = useRef<string | null>(null)

  // Cleanup function for all subscriptions
  const cleanupSubscriptions = useCallback(() => {
    if (activeSubscriptionRef.current) {
      activeSubscriptionRef.current()
      activeSubscriptionRef.current = null
    }
    if (globalSubscriptionRef.current) {
      globalSubscriptionRef.current()
      globalSubscriptionRef.current = null
    }
    if (typingSubscriptionRef.current) {
      typingSubscriptionRef.current()
      typingSubscriptionRef.current = null
    }
  }, [])

  // Setup global conversation updates subscription (lightweight)
  const setupGlobalSubscription = useCallback(() => {
    if (!user || !isMessagingActive || globalSubscriptionRef.current) return

    console.log('Setting up global conversation subscription')
    const unsubscribe = RealtimeService.subscribeToConversationUpdates(
      'global',
      (conversation: Record<string, unknown>) => {
        // Extract conversation ID from the updated conversation object
        const conversationId = conversation.id as string
        if (conversationId && onConversationUpdate) {
          onConversationUpdate(conversationId)
        }
      }
    )

    globalSubscriptionRef.current = unsubscribe
  }, [user, isMessagingActive, onConversationUpdate])

  // Setup active conversation message subscription
  const setupActiveConversationSubscription = useCallback(() => {
    if (!user || !activeConversationId || !isMessagingActive) return

    // Don't re-subscribe to the same conversation
    if (lastActiveConversationRef.current === activeConversationId) return

    console.log(`Setting up message subscription for conversation: ${activeConversationId}`)

    // Clean up previous active subscription
    if (activeSubscriptionRef.current) {
      activeSubscriptionRef.current()
      activeSubscriptionRef.current = null
    }

    // Subscribe to new messages and updates for active conversation only
    const unsubscribe = RealtimeService.subscribeToMessages(
      activeConversationId,
      (message: Message) => {
        console.log('Real-time new message received:', message)
        if (onNewMessage) {
          onNewMessage(message)
        }
      },
      (message: Message) => {
        console.log('Real-time message update received:', message)
        if (onMessageUpdate) {
          onMessageUpdate(message)
        }
      }
    )

    activeSubscriptionRef.current = unsubscribe
    lastActiveConversationRef.current = activeConversationId
  }, [user, activeConversationId, isMessagingActive, onNewMessage, onMessageUpdate])

  // Setup typing indicators subscription for active conversation
  const setupTypingSubscription = useCallback(() => {
    if (!user || !activeConversationId || !isMessagingActive || !onTypingIndicator) return

    console.log(`Setting up typing subscription for conversation: ${activeConversationId}`)

    // Clean up previous typing subscription
    if (typingSubscriptionRef.current) {
      typingSubscriptionRef.current()
      typingSubscriptionRef.current = null
    }

    // Subscribe to typing indicators for active conversation
    const unsubscribe = RealtimeService.subscribeToTyping(
      activeConversationId,
      (typingUsers) => {
        // Process each typing user in the array
        typingUsers.forEach(typingData => {
          const userId = typingData.user_id
          const isTyping = typingData.is_typing
          const userName = typingData.user?.name || 'Unknown User'
          
          if (userId && userId !== user.id) {
            onTypingIndicator(activeConversationId, userId, isTyping, userName)
          }
        })
      }
    )

    typingSubscriptionRef.current = unsubscribe
  }, [user, activeConversationId, isMessagingActive, onTypingIndicator])

  // Effect to manage global subscription
  useEffect(() => {
    if (isMessagingActive) {
      setupGlobalSubscription()
    } else {
      if (globalSubscriptionRef.current) {
        globalSubscriptionRef.current()
        globalSubscriptionRef.current = null
      }
    }

    return () => {
      if (globalSubscriptionRef.current) {
        globalSubscriptionRef.current()
        globalSubscriptionRef.current = null
      }
    }
  }, [isMessagingActive, setupGlobalSubscription])

  // Effect to manage active conversation subscriptions
  useEffect(() => {
    if (activeConversationId && isMessagingActive) {
      setupActiveConversationSubscription()
      setupTypingSubscription()
    } else {
      // Clean up active conversation subscriptions when no active conversation
      if (activeSubscriptionRef.current) {
        activeSubscriptionRef.current()
        activeSubscriptionRef.current = null
      }
      if (typingSubscriptionRef.current) {
        typingSubscriptionRef.current()
        typingSubscriptionRef.current = null
      }
      lastActiveConversationRef.current = null
    }
  }, [activeConversationId, isMessagingActive, setupActiveConversationSubscription, setupTypingSubscription])

  // Effect to handle user changes
  useEffect(() => {
    if (!user) {
      cleanupSubscriptions()
    }
  }, [user, cleanupSubscriptions])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupSubscriptions()
    }
  }, [cleanupSubscriptions])

  return {
    isConnected: Boolean(globalSubscriptionRef.current),
    hasActiveSubscription: Boolean(activeSubscriptionRef.current),
    hasTypingSubscription: Boolean(typingSubscriptionRef.current),
    cleanup: cleanupSubscriptions
  }
}
