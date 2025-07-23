'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { RealtimeService } from '@/lib/messaging/realtime-service'
import { PerformanceMonitor } from '@/lib/messaging/performance-monitor'
import type { Conversation, Message, TypingUser } from '@/types/messaging'

interface OptimizedMessagingState {
  conversations: Conversation[]
  totalUnreadCount: number
  isLoading: boolean
  lastSyncAt: Date | null
  error: string | null
}

interface MessagingNotification {
  type: 'new_message' | 'new_conversation' | 'conversation_updated'
  conversationId: string
  message?: Message
  timestamp: Date
}

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
const BACKGROUND_SYNC_INTERVAL = 30 * 1000 // 30 seconds when tab is hidden
const FOREGROUND_QUICK_SYNC = 10 * 1000 // 10 seconds when active

export function useOptimizedMessaging() {
  const { user } = useAuth()
  
  // Initialize performance monitoring
  useEffect(() => {
    PerformanceMonitor.initialize()
    return () => PerformanceMonitor.stop()
  }, [])
  
  const [state, setState] = useState<OptimizedMessagingState>({
    conversations: [],
    totalUnreadCount: 0,
    isLoading: false,
    lastSyncAt: null,
    error: null
  })
  
  const backgroundSyncRef = useRef<NodeJS.Timeout | null>(null)
  const realtimeUnsubscribeRef = useRef<(() => void) | null>(null)
  const notificationQueueRef = useRef<MessagingNotification[]>([])
  const isMessagingActiveRef = useRef(false)
  const lastFullSyncRef = useRef<Date | null>(null)
  const typingTimeoutRef = useRef<Record<string, NodeJS.Timeout>>({})
  
  // Typing state management  
  const [typingUsers, setTypingUsers] = useState<Record<string, TypingUser[]>>({})

  // Check if we need a full sync based on cache duration
  const needsFullSync = useCallback(() => {
    if (!lastFullSyncRef.current) return true
    return Date.now() - lastFullSyncRef.current.getTime() > CACHE_DURATION
  }, [])

  // Efficient conversation fetching with caching
  const fetchConversations = useCallback(async (force = false) => {
    if (!user || (!force && !needsFullSync())) {
      PerformanceMonitor.trackCacheHit()
      return
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }))
    PerformanceMonitor.trackApiCall()
    PerformanceMonitor.trackCacheMiss()

    try {
      const response = await fetch('/api/conversations/summary', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add cache headers for better performance
          'Cache-Control': force ? 'no-cache' : 'max-age=60'
        },
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch conversations: ${response.status}`)
      }

      const { conversations, totalUnreadCount } = await response.json()
      
      setState(prev => ({
        ...prev,
        conversations,
        totalUnreadCount,
        isLoading: false,
        lastSyncAt: new Date()
      }))

      lastFullSyncRef.current = new Date()
    } catch (error) {
      console.error('Error fetching conversations:', error)
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }))
    }
  }, [user, needsFullSync])

  // Update single conversation efficiently
  const updateSingleConversation = useCallback(async (conversationId: string) => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}/summary`, {
        method: 'GET',
        credentials: 'include'
      })

      if (response.ok) {
        const { conversation } = await response.json()
        setState(prev => ({
          ...prev,
          conversations: prev.conversations.map(c => 
            c.id === conversationId ? conversation : c
          )
        }))
      }
    } catch (error) {
      console.error('Error updating single conversation:', error)
    }
  }, [])

  // Process queued notifications efficiently
  const processNotificationQueue = useCallback(() => {
    if (notificationQueueRef.current.length === 0) return

    const notifications = [...notificationQueueRef.current]
    notificationQueueRef.current = []

    setState(prev => {
      const newConversations = [...prev.conversations]
      let newUnreadCount = prev.totalUnreadCount

      notifications.forEach(notification => {
        switch (notification.type) {
          case 'new_message':
            // Update conversation's last message and unread count
            const convIndex = newConversations.findIndex(c => c.id === notification.conversationId)
            if (convIndex !== -1 && notification.message) {
              newConversations[convIndex] = {
                ...newConversations[convIndex],
                last_message: notification.message,
                last_message_at: notification.message.createdAt,
                unread_count: newConversations[convIndex].unread_count + 1
              }
              newUnreadCount++
            }
            break

          case 'new_conversation':
            // Only trigger full refresh for new conversations
            if (!newConversations.find(c => c.id === notification.conversationId)) {
              // Queue a full refresh instead of partial update
              setTimeout(() => fetchConversations(true), 100)
            }
            break

          case 'conversation_updated':
            // Mark for selective refresh
            const targetConv = newConversations.find(c => c.id === notification.conversationId)
            if (targetConv) {
              // Could implement partial updates here
              setTimeout(() => updateSingleConversation(notification.conversationId), 100)
            }
            break
        }
      })

      return {
        ...prev,
        conversations: newConversations,
        totalUnreadCount: newUnreadCount
      }
    })
  }, [fetchConversations, updateSingleConversation])

  // Set up real-time subscriptions only for unread count and new conversations
  const setupRealtimeSubscriptions = useCallback(() => {
    if (!user || realtimeUnsubscribeRef.current) return

    // Subscribe to conversation updates for this user
    const unsubscribe = RealtimeService.subscribeToConversationUpdates(
      'global', // Listen globally for user's conversations
      () => {
        // Queue a notification for processing
        notificationQueueRef.current.push({
          type: 'conversation_updated',
          conversationId: 'global',
          timestamp: new Date()
        })
        
        // Process immediately if messaging is active, otherwise queue for later
        if (isMessagingActiveRef.current) {
          processNotificationQueue()
        }
      }
    )

    realtimeUnsubscribeRef.current = unsubscribe
  }, [user, processNotificationQueue])

  // Intelligent background sync based on page visibility
  const setupBackgroundSync = useCallback(() => {
    if (backgroundSyncRef.current) {
      clearInterval(backgroundSyncRef.current)
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is hidden - use longer intervals
        backgroundSyncRef.current = setInterval(() => {
          if (!isMessagingActiveRef.current) {
            // Only do light sync when messaging is not active
            processNotificationQueue()
          }
        }, BACKGROUND_SYNC_INTERVAL)
      } else {
        // Page is visible - shorter intervals and immediate sync
        if (backgroundSyncRef.current) {
          clearInterval(backgroundSyncRef.current)
        }
        
        // Immediate sync when page becomes visible
        if (needsFullSync()) {
          fetchConversations(true)
        } else {
          processNotificationQueue()
        }
        
        // Set up foreground sync
        backgroundSyncRef.current = setInterval(() => {
          processNotificationQueue()
        }, FOREGROUND_QUICK_SYNC)
      }
    }

    // Initial setup
    handleVisibilityChange()
    
    // Listen for visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      if (backgroundSyncRef.current) {
        clearInterval(backgroundSyncRef.current)
      }
    }
  }, [fetchConversations, processNotificationQueue, needsFullSync])

  // Public API for components
  const setMessagingActive = useCallback((active: boolean) => {
    isMessagingActiveRef.current = active
    
    if (active) {
      // When messaging becomes active, process any queued notifications
      processNotificationQueue()
      
      // Do a full refresh if data is stale
      if (needsFullSync()) {
        fetchConversations(true)
      }
    }
  }, [processNotificationQueue, fetchConversations, needsFullSync])

  const markConversationAsRead = useCallback(async (conversationId: string) => {
    try {
      await fetch(`/api/conversations/${conversationId}/mark-read`, {
        method: 'POST',
        credentials: 'include'
      })

      // Optimistically update local state
      setState(prev => ({
        ...prev,
        conversations: prev.conversations.map(c => 
          c.id === conversationId 
            ? { ...c, unreadCount: 0 }
            : c
        ),
        totalUnreadCount: prev.totalUnreadCount - 
          (prev.conversations.find(c => c.id === conversationId)?.unread_count || 0)
      }))
    } catch (error) {
      console.error('Error marking conversation as read:', error)
    }
  }, [])

  const refreshConversations = useCallback(() => {
    fetchConversations(true)
  }, [fetchConversations])

  // Archive conversation with optimistic updates
  const archiveConversation = useCallback(async (conversationId: string) => {
    try {
      // Optimistically remove from conversation list
      setState(prev => ({
        ...prev,
        conversations: prev.conversations.filter(c => c.id !== conversationId),
        totalUnreadCount: prev.totalUnreadCount - 
          (prev.conversations.find(c => c.id === conversationId)?.unread_count || 0)
      }))

      const response = await fetch(`/api/conversations/${conversationId}/archive`, {
        method: 'POST',
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error(`Failed to archive conversation: ${response.status}`)
      }

      // Success - optimistic update was correct
      return true

    } catch (error) {
      console.error('Error archiving conversation:', error)
      
      // Rollback optimistic update by refreshing conversations
      fetchConversations(true)
      
      throw error
    }
  }, [fetchConversations])

  // Typing indicator functionality
  const sendTypingIndicator = useCallback(async (conversationId: string, isTyping: boolean) => {
    if (!user) return

    try {
      // Clear existing timeout for this conversation
      if (typingTimeoutRef.current[conversationId]) {
        clearTimeout(typingTimeoutRef.current[conversationId])
        delete typingTimeoutRef.current[conversationId]
      }

      // Send typing indicator to server/real-time system
      if (isTyping) {
        // Set timeout to automatically stop typing after 3 seconds
        typingTimeoutRef.current[conversationId] = setTimeout(() => {
          sendTypingIndicator(conversationId, false)
        }, 3000)
      }

      // Update local typing state for other users
      setTypingUsers(prev => {
        const currentTyping = prev[conversationId] || []
        
        if (isTyping) {
          // Add current user to typing list if not already there
          const existingIndex = currentTyping.findIndex(tu => tu.user_id === user.id)
          if (existingIndex === -1) {
            const newTypingUser: TypingUser = {
              user_id: user.id,
              conversation_id: conversationId,
              is_typing: true,
              timestamp: new Date().toISOString(),
              user: {
                id: user.id,
                name: user.name || 'You',
                avatarUrl: undefined
              }
            }
            return {
              ...prev,
              [conversationId]: [...currentTyping, newTypingUser]
            }
          }
        } else {
          // Remove current user from typing list
          return {
            ...prev,
            [conversationId]: currentTyping.filter(tu => tu.user_id !== user.id)
          }
        }
        
        return prev
      })

      // Send to real-time service (this would integrate with RealtimeService)
      RealtimeService.sendTypingIndicator(conversationId, user.id, isTyping)

    } catch (error) {
      console.error('Error sending typing indicator:', error)
    }
  }, [user])

  // Handle incoming typing indicators from real-time subscriptions
  const handleIncomingTyping = useCallback((conversationId: string, userId: string, isTyping: boolean, userName?: string) => {
    if (userId === user?.id) return // Don't show own typing indicator

    setTypingUsers(prev => {
      const currentTyping = prev[conversationId] || []
      
      if (isTyping) {
        // Add user to typing list if not already there
        const existingIndex = currentTyping.findIndex(tu => tu.user_id === userId)
        if (existingIndex === -1) {
          const newTypingUser: TypingUser = {
            user_id: userId,
            conversation_id: conversationId,
            is_typing: true,
            timestamp: new Date().toISOString(),
            user: {
              id: userId,
              name: userName || 'Unknown User',
              avatarUrl: undefined
            }
          }
          return {
            ...prev,
            [conversationId]: [...currentTyping, newTypingUser]
          }
        }
      } else {
        // Remove user from typing list
        return {
          ...prev,
          [conversationId]: currentTyping.filter(tu => tu.user_id !== userId)
        }
      }
      
      return prev
    })
  }, [user?.id])

  // Get typing users for a specific conversation
  const getTypingUsers = useCallback((conversationId: string) => {
    return typingUsers[conversationId] || []
  }, [typingUsers])

  // Initialize on user change
  useEffect(() => {
    if (user) {
      fetchConversations(true)
      setupRealtimeSubscriptions()
      const cleanupBackgroundSync = setupBackgroundSync()
      
      return () => {
        cleanupBackgroundSync()
        if (realtimeUnsubscribeRef.current) {
          realtimeUnsubscribeRef.current()
          realtimeUnsubscribeRef.current = null
        }
        
        // Clear all typing timeouts
        Object.values(typingTimeoutRef.current).forEach(timeout => clearTimeout(timeout))
        typingTimeoutRef.current = {}
      }
    }
  }, [user, fetchConversations, setupRealtimeSubscriptions, setupBackgroundSync])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (backgroundSyncRef.current) {
        clearInterval(backgroundSyncRef.current)
      }
      if (realtimeUnsubscribeRef.current) {
        realtimeUnsubscribeRef.current()
      }
      
      // Clear all typing timeouts
      Object.values(typingTimeoutRef.current).forEach(timeout => clearTimeout(timeout))
    }
  }, [])

  return {
    ...state,
    typingUsers,
    setMessagingActive,
    markConversationAsRead,
    archiveConversation,
    refreshConversations,
    sendTypingIndicator,
    getTypingUsers,
    handleIncomingTyping,
    hasNotifications: notificationQueueRef.current.length > 0
  }
}
