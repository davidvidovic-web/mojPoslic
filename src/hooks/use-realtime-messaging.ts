'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { toast } from 'sonner'
import { RealtimeChannel } from '@supabase/supabase-js'
import { useSupabaseAuth } from '@/contexts/supabase-auth-context'
import { supabase } from '@/lib/supabase'
import type { RealtimeChannel, RealtimePresenceState } from '@supabase/supabase-js'

interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  message_type: 'text' | 'image' | 'file'
  attachment_url?: string
  created_at: string
  sender?: {
    id: string
    name: string
    avatar_url?: string
  }
}

interface Conversation {
  id: string
  title?: string
  job_id?: string
  created_at: string
  updated_at: string
  participants?: {
    user_id: string
    user: {
      id: string
      name: string
      avatar_url?: string
    }
  }[]
  last_message?: Message
  unread_count?: number
}

interface TypingUser {
  user_id: string
  name: string
  avatar_url?: string
}

interface OnlineUser {
  user_id: string
  name: string
  avatar_url?: string
  last_seen: string
}

interface UseRealtimeMessagingProps {
  conversationId?: string
  enabled?: boolean
}

export function useRealtimeMessaging() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isTyping, setIsTyping] = useState<string[]>([])
  const channelRef = useRef<RealtimeChannel | null>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const { user } = useSupabaseAuth()  // Load initial conversations
  const loadConversations = useCallback(async () => {
    if (!user?.id || !enabled) return

    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          conversation_participants!inner (
            user_id,
            users (
              id,
              name,
              avatar_url
            )
          ),
          messages (
            id,
            content,
            created_at,
            sender_id,
            users (
              id,
              name,
              avatar_url
            )
          )
        `)
        .eq('conversation_participants.user_id', user.id)
        .eq('is_active', true)
        .order('updated_at', { ascending: false })

      if (error) throw error

      // Process conversations with unread counts and last messages
      const processedConversations = data?.map(conv => ({
        ...conv,
        participants: conv.conversation_participants?.map((p: { user_id: string; users: { id: string; name: string; avatar_url?: string } }) => ({
          user_id: p.user_id,
          user: p.users
        })),
        last_message: conv.messages?.[conv.messages.length - 1],
        unread_count: 0 // TODO: Calculate based on last_read_at
      })) || []

      setConversations(processedConversations)
    } catch (err) {
      console.error('Failed to load conversations:', err)
      setError(err instanceof Error ? err.message : 'Failed to load conversations')
    } finally {
      setIsLoading(false)
    }
  }, [user?.id, enabled, supabase])

  // Load messages for specific conversation
  const loadMessages = useCallback(async (convId: string) => {
    if (!user?.id || !enabled) return

    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          users (
            id,
            name,
            avatar_url
          )
        `)
        .eq('conversation_id', convId)
        .order('created_at', { ascending: true })
        .limit(50)

      if (error) throw error

      const processedMessages = data?.map(msg => ({
        ...msg,
        sender: msg.users
      })) || []

      setMessages(processedMessages)

      // Mark messages as read
      await supabase
        .from('conversation_participants')
        .update({ last_read_at: new Date().toISOString() })
        .eq('conversation_id', convId)
        .eq('user_id', user.id)

    } catch (err) {
      console.error('Failed to load messages:', err)
      setError(err instanceof Error ? err.message : 'Failed to load messages')
    }
  }, [user?.id, enabled, supabase])

  // Send message
  const sendMessage = useCallback(async (content: string, messageType: 'text' | 'image' | 'file' = 'text', attachmentUrl?: string) => {
    if (!user?.id || !conversationId || !content.trim()) return

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: content.trim(),
          message_type: messageType,
          attachment_url: attachmentUrl
        })
        .select(`
          *,
          users (
            id,
            name,
            avatar_url
          )
        `)
        .single()

      if (error) throw error

      // Update conversation's updated_at
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId)

      return data
    } catch (err) {
      console.error('Failed to send message:', err)
      throw err
    }
  }, [user?.id, conversationId, supabase])

  // Send typing indicator
  const sendTypingIndicator = useCallback(() => {
    if (!user?.id || !conversationId || !channelRef.current) return

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Send typing event
    channelRef.current.send({
      type: 'broadcast',
      event: 'typing',
      payload: {
        user_id: user.id,
        name: user.name,
        avatar_url: user.avatarUrl
      }
    })

    // Stop typing after 3 seconds
    typingTimeoutRef.current = setTimeout(() => {
      if (channelRef.current) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'stop_typing',
          payload: { user_id: user.id }
        })
      }
    }, 3000)
  }, [user, conversationId])

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user?.id || !enabled) return

    const channel = supabase.channel(`messaging_${user.id}`, {
      config: {
        presence: {
          key: user.id,
        },
      },
    })

    channelRef.current = channel

    // Join presence for online status
    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({
          user_id: user.id,
          name: user.name,
          avatar_url: user.avatarUrl,
          online_at: new Date().toISOString(),
        })
      }
    })

    // Listen for presence changes (online/offline users)
    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState()
      presenceStateRef.current = state
      
      const online = Object.keys(state).map(key => {
        const presenceList = state[key] as unknown as Array<{
          user_id: string
          name: string
          avatar_url?: string
          online_at: string
        }>
        const presence = presenceList[0]
        return {
          user_id: presence.user_id,
          name: presence.name,
          avatar_url: presence.avatar_url,
          last_seen: presence.online_at
        }
      }).filter(u => u.user_id !== user.id)
      
      setOnlineUsers(online)
    })

    // Listen for typing indicators
    channel.on('broadcast', { event: 'typing' }, ({ payload }) => {
      if (payload.user_id !== user.id) {
        setTypingUsers(prev => {
          const filtered = prev.filter(u => u.user_id !== payload.user_id)
          return [...filtered, {
            user_id: payload.user_id,
            name: payload.name,
            avatar_url: payload.avatar_url
          }]
        })
        
        // Remove typing indicator after 5 seconds
        setTimeout(() => {
          setTypingUsers(prev => prev.filter(u => u.user_id !== payload.user_id))
        }, 5000)
      }
    })

    channel.on('broadcast', { event: 'stop_typing' }, ({ payload }) => {
      setTypingUsers(prev => prev.filter(u => u.user_id !== payload.user_id))
    })

    // Listen for new messages
    channel.on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: conversationId ? `conversation_id=eq.${conversationId}` : undefined
    }, async (payload) => {
      // Fetch complete message with sender info
      const { data: messageData } = await supabase
        .from('messages')
        .select(`
          *,
          users (
            id,
            name,
            avatar_url
          )
        `)
        .eq('id', payload.new.id)
        .single()

      if (messageData) {
        const processedMessage = {
          ...messageData,
          sender: messageData.users
        }

        if (conversationId === payload.new.conversation_id) {
          setMessages(prev => [...prev, processedMessage])
        }

        // Update conversation's last message
        setConversations(prev => prev.map(conv => 
          conv.id === payload.new.conversation_id 
            ? { ...conv, last_message: processedMessage, updated_at: payload.new.created_at }
            : conv
        ))
      }
    })

    // Listen for conversation updates
    channel.on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'conversations'
    }, (payload) => {
      setConversations(prev => prev.map(conv =>
        conv.id === payload.new.id
          ? { ...conv, ...payload.new }
          : conv
      ))
    })

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      channel.unsubscribe()
    }
  }, [user, conversationId, enabled, supabase])

  // Load initial data
  useEffect(() => {
    if (enabled) {
      loadConversations()
    }
  }, [loadConversations, enabled])

  // Load messages when conversation changes
  useEffect(() => {
    if (conversationId && enabled) {
      loadMessages(conversationId)
    }
  }, [conversationId, loadMessages, enabled])

  return {
    // Data
    conversations,
    messages,
    typingUsers,
    onlineUsers,
    
    // States
    isLoading,
    error,
    
    // Actions
    sendMessage,
    sendTypingIndicator,
    loadConversations,
    loadMessages,
    
    // Utilities
    isUserOnline: (userId: string) => onlineUsers.some(u => u.user_id === userId),
    getUnreadCount: () => conversations.reduce((sum, conv) => sum + (conv.unread_count || 0), 0)
  }
}
