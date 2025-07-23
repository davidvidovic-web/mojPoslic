'use client'

import React, { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { ConversationService } from '@/lib/messaging/conversation-service'
import { RealtimeService } from '@/lib/messaging/realtime-service'
import type { 
  Conversation, 
  Message, 
  SendMessageData, 
  CreateConversationData,
  TypingUser,
  UserPresence 
} from '@/types/messaging'

// State interface
interface MessagingState {
  conversations: Conversation[]
  activeConversation: Conversation | null
  messages: Message[]
  typingUsers: TypingUser[]
  userPresence: UserPresence[]
  isLoading: boolean
  isLoadingMessages: boolean
  hasMoreMessages: boolean
  error: string | null
  unreadCount: number
}

// Action types
type MessagingAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_LOADING_MESSAGES'; payload: boolean }
  | { type: 'SET_HAS_MORE_MESSAGES'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CONVERSATIONS'; payload: Conversation[] }
  | { type: 'ADD_CONVERSATION'; payload: Conversation }
  | { type: 'UPDATE_CONVERSATION'; payload: Conversation }
  | { type: 'UPDATE_CONVERSATION_UNREAD'; payload: { conversationId: string; unreadCount: number } }
  | { type: 'SET_ACTIVE_CONVERSATION'; payload: Conversation | null }
  | { type: 'SET_MESSAGES'; payload: Message[] }
  | { type: 'PREPEND_MESSAGES'; payload: Message[] }
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'UPDATE_MESSAGE'; payload: Message }
  | { type: 'REMOVE_MESSAGE'; payload: string }
  | { type: 'SET_TYPING_USERS'; payload: TypingUser[] }
  | { type: 'SET_USER_PRESENCE'; payload: UserPresence[] }
  | { type: 'UPDATE_UNREAD_COUNT' }

// Context interface
interface MessagingContextType {
  state: MessagingState
  
  // Conversation actions
  loadConversations: () => Promise<void>
  createConversation: (data: CreateConversationData) => Promise<Conversation>
  createDirectConversation: (userId: string) => Promise<Conversation>
  createJobConversation: (jobId: string, otherUserId: string, jobTitle: string) => Promise<Conversation>
  setActiveConversation: (conversation: Conversation | null) => void
  markConversationAsRead: (conversationId: string) => Promise<void>
  archiveConversation: (conversationId: string) => Promise<void>
  
  // Message actions
  loadMessages: (conversationId: string, cursor?: string) => Promise<void>
  sendMessage: (data: SendMessageData) => Promise<void>
  editMessage: (messageId: string, newContent: string) => Promise<void>
  deleteMessage: (messageId: string) => Promise<void>
  searchMessages: (conversationId: string, query: string) => Promise<Message[]>
  
  // Real-time actions
  sendTypingIndicator: (isTyping: boolean) => void
  updatePresence: (status: 'online' | 'away' | 'busy' | 'offline') => void
  
  // Utility
  clearError: () => void
}

// Initial state
const initialState: MessagingState = {
  conversations: [],
  activeConversation: null,
  messages: [],
  typingUsers: [],
  userPresence: [],
  isLoading: false,
  isLoadingMessages: false,
  hasMoreMessages: true,
  error: null,
  unreadCount: 0
}

// Reducer
function messagingReducer(state: MessagingState, action: MessagingAction): MessagingState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    
    case 'SET_LOADING_MESSAGES':
      return { ...state, isLoadingMessages: action.payload }
    
    case 'SET_HAS_MORE_MESSAGES':
      return { ...state, hasMoreMessages: action.payload }
    
    case 'SET_ERROR':
      return { ...state, error: action.payload }
    
    case 'SET_CONVERSATIONS':
      return { 
        ...state, 
        conversations: action.payload,
        unreadCount: action.payload.reduce((total, conv) => total + conv.unread_count, 0)
      }
    
    case 'ADD_CONVERSATION':
      // Check if conversation already exists to prevent duplicates
      const existingConversation = state.conversations.find(conv => conv.id === action.payload.id)
      if (existingConversation) {
        return state // Don't add if it already exists
      }
      return { 
        ...state, 
        conversations: [action.payload, ...state.conversations] 
      }
    
    case 'UPDATE_CONVERSATION':
      console.log('UPDATE_CONVERSATION action:', action.payload)
      console.log('UPDATE_CONVERSATION payload keys:', Object.keys(action.payload))
      return {
        ...state,
        conversations: state.conversations.map(conv =>
          conv.id === action.payload.id ? action.payload : conv
        ),
        activeConversation: state.activeConversation?.id === action.payload.id 
          ? action.payload 
          : state.activeConversation
      }
    
    case 'UPDATE_CONVERSATION_UNREAD':
      return {
        ...state,
        conversations: state.conversations.map(conv =>
          conv.id === action.payload.conversationId 
            ? { ...conv, unread_count: action.payload.unreadCount }
            : conv
        ),
        activeConversation: state.activeConversation?.id === action.payload.conversationId 
          ? { ...state.activeConversation, unread_count: action.payload.unreadCount }
          : state.activeConversation
      }
    
    case 'SET_ACTIVE_CONVERSATION':
      return { ...state, activeConversation: action.payload, messages: [] }
    
    case 'SET_MESSAGES':
      return { ...state, messages: action.payload }
    
    case 'PREPEND_MESSAGES':
      // Prepend messages for pagination, avoiding duplicates
      const existingIds = new Set(state.messages.map(msg => msg.id))
      const newMessages = action.payload.filter(msg => !existingIds.has(msg.id))
      return { ...state, messages: [...newMessages, ...state.messages] }
    
    case 'ADD_MESSAGE':
      // Avoid duplicates
      if (state.messages.some(msg => msg.id === action.payload.id)) {
        return state
      }
      return { 
        ...state, 
        messages: [...state.messages, action.payload] 
      }
    
    case 'UPDATE_MESSAGE':
      return {
        ...state,
        messages: state.messages.map(msg =>
          msg.id === action.payload.id ? action.payload : msg
        )
      }
    
    case 'REMOVE_MESSAGE':
      return {
        ...state,
        messages: state.messages.filter(msg => msg.id !== action.payload)
      }
    
    case 'SET_TYPING_USERS':
      return { ...state, typingUsers: action.payload }
    
    case 'SET_USER_PRESENCE':
      return { ...state, userPresence: action.payload }
    
    case 'UPDATE_UNREAD_COUNT':
      return {
        ...state,
        unreadCount: state.conversations.reduce((total, conv) => total + conv.unread_count, 0)
      }
    
    default:
      return state
  }
}

// Create context
const MessagingContext = createContext<MessagingContextType | null>(null)

// Provider component
export function MessagingProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(messagingReducer, initialState)
  const { user } = useAuth()

  // Load conversations on mount and user change
  const loadConversations = useCallback(async () => {
    if (!user) return

    try {
      console.log('Loading conversations for user:', user.id)
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'SET_ERROR', payload: null })

      const response = await fetch('/api/conversations')
      const result = await response.json()
      
      console.log('Conversations API response:', result)
      
      if (!result.success) {
        throw new Error(result.error)
      }
      
      const conversations = result.data
      console.log('Loaded conversations:', conversations)
      
      // Debug logging for conversation structure
      if (conversations && conversations.length > 0) {
        console.log('First conversation structure:', conversations[0])
        console.log('First conversation keys:', Object.keys(conversations[0]))
        console.log('First conversation type:', conversations[0].type)
        console.log('First conversation title:', conversations[0].title)
        console.log('First conversation jobTitle:', conversations[0].jobTitle)
        console.log('First conversation participants:', conversations[0].participants)
      }
      
      dispatch({ type: 'SET_CONVERSATIONS', payload: conversations })
    } catch (error) {
      console.error('Error loading conversations:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load conversations' })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [user])

  // Create new conversation
  const createConversation = useCallback(async (data: CreateConversationData): Promise<Conversation> => {
    if (!user) throw new Error('User not authenticated')

    try {
      const conversation = await ConversationService.createConversation(data, user.id)
      dispatch({ type: 'ADD_CONVERSATION', payload: conversation })
      return conversation
    } catch (error) {
      console.error('Error creating conversation:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create conversation' })
      throw error
    }
  }, [user])

  // Create direct conversation
  const createDirectConversation = useCallback(async (userId: string): Promise<Conversation> => {
    if (!user) throw new Error('User not authenticated')

    try {
      const conversation = await ConversationService.createDirectConversation(user.id, userId)
      
      // Add to conversations if it's new - let the reducer handle the logic
      dispatch({ type: 'ADD_CONVERSATION', payload: conversation })
      
      return conversation
    } catch (error) {
      console.error('Error creating direct conversation:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create conversation' })
      throw error
    }
  }, [user])

  // Create job-related conversation
  const createJobConversation = useCallback(async (jobId: string, otherUserId: string, jobTitle: string): Promise<Conversation> => {
    if (!user) throw new Error('User not authenticated')

    try {
      // Use API endpoint for server-side conversation creation
      const response = await fetch('/api/conversations/create-job', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobId,
          otherUserId,
          jobTitle,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create conversation')
      }

      const { conversation } = await response.json()
      
      console.log('Job conversation created:', conversation)
      
      // Add to conversations if it's new
      dispatch({ type: 'ADD_CONVERSATION', payload: conversation })
      
      return conversation
    } catch (error) {
      console.error('Error creating job conversation:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create job conversation' })
      throw error
    }
  }, [user])

  // Set active conversation
  const setActiveConversation = useCallback((conversation: Conversation | null) => {
    console.log('Setting active conversation:', conversation)
    if (conversation) {
      console.log('Active conversation keys:', Object.keys(conversation))
      console.log('Active conversation type:', conversation.type)
      console.log('Active conversation title:', conversation.title)
      console.log('Active conversation jobTitle:', conversation.jobTitle)
      console.log('Active conversation participants:', conversation.participants)
    }
    dispatch({ type: 'SET_ACTIVE_CONVERSATION', payload: conversation })
  }, [])

  // Load messages for conversation
  const loadMessages = useCallback(async (conversationId: string, cursor?: string) => {
    try {
      dispatch({ type: 'SET_LOADING_MESSAGES', payload: true })
      
      const params = new URLSearchParams({
        conversationId,
        limit: '50'
      })
      
      if (cursor) {
        params.append('cursor', cursor)
      }
      
      const response = await fetch(`/api/messages?${params}`)
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error)
      }
      
      const messages = result.data
      
      // Check if there are more messages to load
      const hasMore = messages.length === 50 // If we got a full page, there might be more
      dispatch({ type: 'SET_HAS_MORE_MESSAGES', payload: hasMore })
      
      if (cursor) {
        // Prepend older messages using the new action
        dispatch({ type: 'PREPEND_MESSAGES', payload: messages })
      } else {
        // Replace all messages and reset hasMore to true for new conversation
        dispatch({ type: 'SET_MESSAGES', payload: messages })
        dispatch({ type: 'SET_HAS_MORE_MESSAGES', payload: messages.length === 50 })
      }
    } catch (error) {
      console.error('Error loading messages:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load messages' })
    } finally {
      dispatch({ type: 'SET_LOADING_MESSAGES', payload: false })
    }
  }, [])

  // Send message
  const sendMessage = useCallback(async (data: SendMessageData) => {
    if (!user) throw new Error('User not authenticated')

    try {
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error)
      }
      
      const message = result.data
      dispatch({ type: 'ADD_MESSAGE', payload: message })
    } catch (error) {
      console.error('Error sending message:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to send message' })
      throw error
    }
  }, [user])

  // Edit message (temporarily disabled - needs API implementation)
  const editMessage = useCallback(async (messageId: string, newContent: string) => {
    if (!user) return

    try {
      // TODO: Implement /api/messages/edit endpoint
      console.log('Edit message not yet implemented in API', { messageId, newContent })
      dispatch({ type: 'SET_ERROR', payload: 'Edit message feature coming soon' })
    } catch (error) {
      console.error('Error editing message:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to edit message' })
    }
  }, [user])

  // Delete message (temporarily disabled - needs API implementation)
  const deleteMessage = useCallback(async (messageId: string) => {
    if (!user) return

    try {
      // TODO: Implement /api/messages/delete endpoint
      console.log('Delete message not yet implemented in API', { messageId })
      dispatch({ type: 'SET_ERROR', payload: 'Delete message feature coming soon' })
    } catch (error) {
      console.error('Error deleting message:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete message' })
    }
  }, [user])

  // Search messages (temporarily disabled - needs API implementation)
  const searchMessages = useCallback(async (conversationId: string, query: string): Promise<Message[]> => {
    try {
      // TODO: Implement /api/messages/search endpoint
      console.log('Search messages not yet implemented in API', { conversationId, query })
      return []
    } catch (error) {
      console.error('Error searching messages:', error)
      throw error
    }
  }, [])

  // Mark conversation as read
  const markConversationAsRead = useCallback(async (conversationId: string) => {
    if (!user) return

    try {
      await ConversationService.markAsRead(conversationId, user.id)
      
      // Update local unread count by finding and updating the specific conversation
      dispatch({ 
        type: 'UPDATE_CONVERSATION_UNREAD', 
        payload: { 
          conversationId, 
          unreadCount: 0 
        }
      })
    } catch (error) {
      console.error('Error marking conversation as read:', error)
    }
  }, [user])

  // Archive conversation
  const archiveConversation = useCallback(async (conversationId: string) => {
    try {
      await ConversationService.archiveConversation(conversationId)
      
      // Remove from local state by updating conversations
      dispatch({ 
        type: 'SET_CONVERSATIONS', 
        payload: [] // This will be updated by the reducer to filter out the archived conversation
      })
      
      // Trigger a reload of conversations to get the updated list
      loadConversations()
    } catch (error) {
      console.error('Error archiving conversation:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to archive conversation' })
    }
  }, [loadConversations])

  // Send typing indicator
  const sendTypingIndicator = useCallback((isTyping: boolean) => {
    if (!user || !state.activeConversation) return

    RealtimeService.sendTypingIndicator(state.activeConversation.id, user.id, isTyping)
  }, [user, state.activeConversation])

  // Update presence
  const updatePresence = useCallback((status: 'online' | 'away' | 'busy' | 'offline') => {
    if (!user) return

    RealtimeService.updatePresence(user.id, status)
  }, [user])

  // Clear error
  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null })
  }, [])

  // Set up real-time subscriptions for active conversation
  useEffect(() => {
    if (!user || !state.activeConversation) return

    const conversationId = state.activeConversation.id

    // Subscribe to new messages in active conversation
    const unsubscribeMessages = RealtimeService.subscribeToMessages(
      conversationId,
      (message) => {
        dispatch({ type: 'ADD_MESSAGE', payload: message })
      },
      (message) => dispatch({ type: 'UPDATE_MESSAGE', payload: message })
    )

    // Subscribe to typing indicators for active conversation
    const unsubscribeTyping = RealtimeService.subscribeToTyping(
      conversationId,
      (typingUsers) => dispatch({ type: 'SET_TYPING_USERS', payload: typingUsers })
    )

    return () => {
      unsubscribeMessages()
      unsubscribeTyping()
    }
  }, [user, state.activeConversation])

  // Set up global real-time subscriptions for all user conversations
  useEffect(() => {
    if (!user || state.conversations.length === 0) return

    const conversationIds = state.conversations.map(conv => conv.id)
    const globalUnsubscribeFunctions: (() => void)[] = []

    // Subscribe to messages in ALL user conversations for conversation list updates
    conversationIds.forEach(conversationId => {
      const unsubscribe = RealtimeService.subscribeToMessages(
        conversationId,
        (message) => {
          // If this message is for a conversation that's not currently active,
          // refresh the conversation list to update last message
          if (message.conversationId !== state.activeConversation?.id) {
            console.log(`New message in conversation ${conversationId}, refreshing conversation list...`)
            loadConversations()
          }
        },
        () => {
          // Message updates also trigger conversation list refresh
          loadConversations()
        }
      )
      globalUnsubscribeFunctions.push(unsubscribe)
    })

    return () => {
      globalUnsubscribeFunctions.forEach(unsub => unsub())
    }
  }, [user, state.conversations, state.activeConversation?.id, loadConversations])

  // Subscribe to global presence and conversation list updates
  useEffect(() => {
    if (!user) return

    const unsubscribePresence = RealtimeService.subscribeToPresence(
      (presence) => dispatch({ type: 'SET_USER_PRESENCE', payload: presence })
    )

    // Set user as online
    RealtimeService.updatePresence(user.id, 'online')

    // Subscribe to general conversation list updates for real-time refresh
    const unsubscribeConversationUpdates = RealtimeService.subscribeToConversationUpdates(
      state.activeConversation?.id || 'global',
      () => {
        // Reload conversations when there are updates
        console.log('Conversation metadata updated, reloading conversations...')
        loadConversations()
      }
    )

    // Set user as offline when leaving
    return () => {
      RealtimeService.updatePresence(user.id, 'offline')
      unsubscribePresence()
      unsubscribeConversationUpdates()
    }
  }, [user, state.activeConversation?.id, loadConversations])

  // Load conversations on mount
  useEffect(() => {
    if (user) {
      loadConversations()
    }
  }, [user, loadConversations])

  const value: MessagingContextType = useMemo(() => ({
    state,
    loadConversations,
    createConversation,
    createDirectConversation,
    createJobConversation,
    setActiveConversation,
    markConversationAsRead,
    archiveConversation,
    loadMessages,
    sendMessage,
    editMessage,
    deleteMessage,
    searchMessages,
    sendTypingIndicator,
    updatePresence,
    clearError
  }), [
    state,
    loadConversations,
    createConversation,
    createDirectConversation,
    createJobConversation,
    setActiveConversation,
    markConversationAsRead,
    archiveConversation,
    loadMessages,
    sendMessage,
    editMessage,
    deleteMessage,
    searchMessages,
    sendTypingIndicator,
    updatePresence,
    clearError
  ])

  return (
    <MessagingContext.Provider value={value}>
      {children}
    </MessagingContext.Provider>
  )
}

// Hook to use messaging context
export function useMessaging() {
  const context = useContext(MessagingContext)
  if (!context) {
    throw new Error('useMessaging must be used within a MessagingProvider')
  }
  return context
}
