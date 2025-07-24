'use client'

import { useState, useCallback, useRef, useMemo } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useOptimizedMessaging } from './use-optimized-messaging'
import type { Message, Conversation } from '@/types/messaging'

interface ConversationCache {
  [conversationId: string]: {
    messages: Message[]
    hasMore: boolean
    nextCursor: string | null
    lastFetched: Date
    isLoading: boolean
  }
}

interface SendMessageData {
  conversationId: string
  content: string
  messageType?: 'text' | 'image' | 'file' | 'system'
  replyToMessageId?: string
  attachmentUrl?: string
  attachmentFilename?: string
  attachmentSize?: number
}

const MESSAGE_CACHE_DURATION = 2 * 60 * 1000 // 2 minutes
const MESSAGES_PER_PAGE = 50

export function useOptimizedConversations() {
  const { user } = useAuth()
  const { conversations, markConversationAsRead } = useOptimizedMessaging()
  const [conversationCache, setConversationCache] = useState<ConversationCache>({})
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const abortControllersRef = useRef<Map<string, AbortController>>(new Map())

  // Get active conversation data
  const activeConversation = useMemo(() => {
    if (!activeConversationId) return null
    return conversations.find(c => c.id === activeConversationId) || null
  }, [activeConversationId, conversations])

  // Get cached messages for active conversation
  const activeMessages = useMemo(() => {
    if (!activeConversationId || !conversationCache[activeConversationId]) {
      return []
    }
    return conversationCache[activeConversationId].messages
  }, [activeConversationId, conversationCache])

  // Check if cache is fresh for a conversation
  const isCacheFresh = useCallback((conversationId: string) => {
    const cache = conversationCache[conversationId]
    if (!cache) return false
    return Date.now() - cache.lastFetched.getTime() < MESSAGE_CACHE_DURATION
  }, [conversationCache])

  // Cancel pending requests for a conversation
  const cancelRequest = useCallback((conversationId: string) => {
    const controller = abortControllersRef.current.get(conversationId)
    if (controller) {
      controller.abort()
      abortControllersRef.current.delete(conversationId)
    }
  }, [])

  // Load messages for a conversation with caching
  const loadMessages = useCallback(async (conversationId: string, loadMore = false) => {
    if (!user) return

    // Cancel any existing request for this conversation
    cancelRequest(conversationId)

    // Check cache first (only for initial load, not load more)
    if (!loadMore && isCacheFresh(conversationId)) {
      return
    }

    // Create new abort controller
    const controller = new AbortController()
    abortControllersRef.current.set(conversationId, controller)

    // Update loading state
    setConversationCache(prev => ({
      ...prev,
      [conversationId]: {
        ...prev[conversationId],
        isLoading: true,
        messages: prev[conversationId]?.messages || [],
        hasMore: prev[conversationId]?.hasMore ?? true,
        nextCursor: prev[conversationId]?.nextCursor || null,
        lastFetched: prev[conversationId]?.lastFetched || new Date()
      }
    }))

    try {
      const currentCache = conversationCache[conversationId]
      const cursor = loadMore ? currentCache?.nextCursor : null
      
      const params = new URLSearchParams({
        limit: MESSAGES_PER_PAGE.toString()
      })
      
      if (cursor) {
        params.append('cursor', cursor)
      }

      const response = await fetch(`/api/conversations/${conversationId}/messages?${params}`, {
        signal: controller.signal,
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error(`Failed to load messages: ${response.status}`)
      }

      const { messages, pagination } = await response.json()
      
      // Update cache
      setConversationCache(prev => {
        const existingMessages = loadMore ? (prev[conversationId]?.messages || []) : []
        const newMessages = loadMore ? [...existingMessages, ...messages] : messages

        return {
          ...prev,
          [conversationId]: {
            messages: newMessages,
            hasMore: pagination.hasMore,
            nextCursor: pagination.nextCursor,
            lastFetched: new Date(),
            isLoading: false
          }
        }
      })

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return
      }

      console.error('Error loading messages:', error)
      
      // Update error state
      setConversationCache(prev => ({
        ...prev,
        [conversationId]: {
          ...prev[conversationId],
          isLoading: false,
          messages: prev[conversationId]?.messages || [],
          hasMore: prev[conversationId]?.hasMore ?? true,
          nextCursor: prev[conversationId]?.nextCursor || null,
          lastFetched: prev[conversationId]?.lastFetched || new Date()
        }
      }))
    } finally {
      abortControllersRef.current.delete(conversationId)
    }
  }, [user, isCacheFresh, cancelRequest, conversationCache])

  // Send message with optimistic updates
  const sendMessage = useCallback(async (data: SendMessageData) => {
    if (!user) throw new Error('User not authenticated')

    const tempId = `temp-${Date.now()}-${Math.random()}`
    const tempMessage: Message = {
      id: tempId,
      conversationId: data.conversationId,
      senderId: user.id,
      content: data.content,
      messageType: data.messageType || 'text',
      createdAt: new Date().toISOString(),
      sender: {
        id: user.id,
        name: user.name || 'You',
        avatarUrl: undefined, // TODO: Add avatar support to AuthUser
        role: user.role
      }
    }

    // Optimistic update - add message immediately
    setConversationCache(prev => ({
      ...prev,
      [data.conversationId]: {
        ...prev[data.conversationId],
        messages: [...(prev[data.conversationId]?.messages || []), tempMessage],
        lastFetched: prev[data.conversationId]?.lastFetched || new Date(),
        hasMore: prev[data.conversationId]?.hasMore ?? true,
        nextCursor: prev[data.conversationId]?.nextCursor || null,
        isLoading: false
      }
    }))

    try {
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.status}`)
      }

      const responseData = await response.json()
      
      if (!responseData.success) {
        throw new Error(responseData.error || 'Failed to send message')
      }

      const sentMessage = responseData.data

      // Replace temp message with real message
      setConversationCache(prev => ({
        ...prev,
        [data.conversationId]: {
          ...prev[data.conversationId],
          messages: prev[data.conversationId]?.messages.map(msg => 
            msg.id === tempId ? sentMessage : msg
          ) || [sentMessage]
        }
      }))

      return sentMessage

    } catch (error) {
      console.error('Error sending message:', error)
      
      // Remove optimistic message on error
      setConversationCache(prev => ({
        ...prev,
        [data.conversationId]: {
          ...prev[data.conversationId],
          messages: prev[data.conversationId]?.messages.filter(msg => msg.id !== tempId) || []
        }
      }))

      throw error
    }
  }, [user])

  // Set active conversation and load messages
  const setActiveConversation = useCallback((conversation: Conversation | null) => {
    const newConversationId = conversation?.id || null
    
    // Cancel any pending requests for the previous conversation
    if (activeConversationId && activeConversationId !== newConversationId) {
      cancelRequest(activeConversationId)
    }

    setActiveConversationId(newConversationId)

    // Load messages for new conversation
    if (newConversationId) {
      loadMessages(newConversationId)
      
      // Mark conversation as read
      markConversationAsRead(newConversationId)
    }
  }, [activeConversationId, cancelRequest, loadMessages, markConversationAsRead])

  // Load more messages for active conversation
  const loadMoreMessages = useCallback(() => {
    if (!activeConversationId) return
    
    const cache = conversationCache[activeConversationId]
    if (!cache?.hasMore || cache.isLoading) return

    loadMessages(activeConversationId, true)
  }, [activeConversationId, conversationCache, loadMessages])

  // Add real-time message to cache
  const addRealtimeMessage = useCallback((message: Message) => {
    setConversationCache(prev => {
      const conversationId = message.conversationId
      const existingMessages = prev[conversationId]?.messages || []
      
      // Check if message already exists (avoid duplicates)
      if (existingMessages.some(m => m.id === message.id)) {
        return prev
      }

      return {
        ...prev,
        [conversationId]: {
          ...prev[conversationId],
          messages: [...existingMessages, message],
          lastFetched: prev[conversationId]?.lastFetched || new Date(),
          hasMore: prev[conversationId]?.hasMore ?? true,
          nextCursor: prev[conversationId]?.nextCursor || null,
          isLoading: false
        }
      }
    })
  }, [])

  // Get loading state for active conversation
  const isLoadingMessages = useMemo(() => {
    if (!activeConversationId) return false
    return conversationCache[activeConversationId]?.isLoading || false
  }, [activeConversationId, conversationCache])

  // Check if can load more messages
  const canLoadMore = useMemo(() => {
    if (!activeConversationId) return false
    const cache = conversationCache[activeConversationId]
    return cache?.hasMore && !cache.isLoading
  }, [activeConversationId, conversationCache])

  // Create conversation with optimistic updates
  const createConversation = useCallback(async (data: {
    type: 'direct' | 'group'
    title?: string
    description?: string
    participants: string[]
    isPrivate?: boolean
    jobId?: string
  }) => {
    if (!user) throw new Error('User not authenticated')

    try {
      const response = await fetch('/api/conversations/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        throw new Error(`Failed to create conversation: ${response.status}`)
      }

      const { conversation } = await response.json()
      
      // Initialize cache for new conversation
      setConversationCache(prev => ({
        ...prev,
        [conversation.id]: {
          messages: [],
          hasMore: false,
          nextCursor: null,
          lastFetched: new Date(),
          isLoading: false
        }
      }))

      return conversation

    } catch (error) {
      console.error('Error creating conversation:', error)
      throw error
    }
  }, [user])

  // Create direct conversation with a user
  const createDirectConversation = useCallback(async (otherUserId: string, jobId?: string) => {
    return createConversation({
      type: 'direct',
      participants: [otherUserId],
      isPrivate: true,
      jobId
    })
  }, [createConversation])

  // Edit message with optimistic updates
  const editMessage = useCallback(async (messageId: string, newContent: string) => {
    if (!user || !activeConversationId) throw new Error('User not authenticated or no active conversation')

    // Store original message for rollback
    let originalMessage: Message | null = null
    
    // Optimistic update
    setConversationCache(prev => {
      const cache = prev[activeConversationId]
      if (!cache) return prev

      const updatedMessages = cache.messages.map(msg => {
        if (msg.id === messageId) {
          originalMessage = msg
          return {
            ...msg,
            content: newContent,
            editedAt: new Date().toISOString()
          }
        }
        return msg
      })

      return {
        ...prev,
        [activeConversationId]: {
          ...cache,
          messages: updatedMessages
        }
      }
    })

    try {
      const response = await fetch(`/api/messages/${messageId}/edit`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ content: newContent })
      })

      if (!response.ok) {
        throw new Error(`Failed to edit message: ${response.status}`)
      }

      const { message: editedMessage } = await response.json()

      // Update with server response
      setConversationCache(prev => {
        const cache = prev[activeConversationId]
        if (!cache) return prev

        const updatedMessages = cache.messages.map(msg => 
          msg.id === messageId ? editedMessage : msg
        )

        return {
          ...prev,
          [activeConversationId]: {
            ...cache,
            messages: updatedMessages
          }
        }
      })

      return editedMessage

    } catch (error) {
      console.error('Error editing message:', error)
      
      // Rollback optimistic update
      if (originalMessage) {
        setConversationCache(prev => {
          const cache = prev[activeConversationId]
          if (!cache) return prev

          const revertedMessages = cache.messages.map(msg => 
            msg.id === messageId ? originalMessage! : msg
          )

          return {
            ...prev,
            [activeConversationId]: {
              ...cache,
              messages: revertedMessages
            }
          }
        })
      }

      throw error
    }
  }, [user, activeConversationId])

  // Delete message with optimistic updates
  const deleteMessage = useCallback(async (messageId: string) => {
    if (!user || !activeConversationId) throw new Error('User not authenticated or no active conversation')

    // Store original message for rollback
    let originalMessage: Message | null = null
    
    // Optimistic update - mark as deleted
    setConversationCache(prev => {
      const cache = prev[activeConversationId]
      if (!cache) return prev

      const updatedMessages = cache.messages.map(msg => {
        if (msg.id === messageId) {
          originalMessage = msg
          return {
            ...msg,
            content: undefined,
            deletedAt: new Date().toISOString()
          }
        }
        return msg
      })

      return {
        ...prev,
        [activeConversationId]: {
          ...cache,
          messages: updatedMessages
        }
      }
    })

    try {
      const response = await fetch(`/api/messages/${messageId}/delete`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error(`Failed to delete message: ${response.status}`)
      }

      const { message: deletedMessage } = await response.json()

      // Update with server response
      setConversationCache(prev => {
        const cache = prev[activeConversationId]
        if (!cache) return prev

        const updatedMessages = cache.messages.map(msg => 
          msg.id === messageId ? deletedMessage : msg
        )

        return {
          ...prev,
          [activeConversationId]: {
            ...cache,
            messages: updatedMessages
          }
        }
      })

      return deletedMessage

    } catch (error) {
      console.error('Error deleting message:', error)
      
      // Rollback optimistic update
      if (originalMessage) {
        setConversationCache(prev => {
          const cache = prev[activeConversationId]
          if (!cache) return prev

          const revertedMessages = cache.messages.map(msg => 
            msg.id === messageId ? originalMessage! : msg
          )

          return {
            ...prev,
            [activeConversationId]: {
              ...cache,
              messages: revertedMessages
            }
          }
        })
      }

      throw error
    }
  }, [user, activeConversationId])

  return {
    // Conversation management
    activeConversation,
    setActiveConversation,
    
    // Message operations
    messages: activeMessages,
    isLoadingMessages,
    canLoadMore,
    loadMoreMessages,
    sendMessage,
    editMessage,
    deleteMessage,
    
    // Conversation creation
    createConversation,
    createDirectConversation,
    
    // Real-time integration
    addRealtimeMessage,
    
    // Cache management
    isCacheFresh: activeConversationId ? isCacheFresh(activeConversationId) : false
  }
}
