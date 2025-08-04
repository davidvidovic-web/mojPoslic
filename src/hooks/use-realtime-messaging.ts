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

export function useRealtimeMessaging({ conversationId, enabled = true }: UseRealtimeMessagingProps = {}) {
  const [messages, setMessages] = useState<Message[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isTyping, setIsTyping] = useState<string[]>([])
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([])
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([])
  const channelRef = useRef<RealtimeChannel | null>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const presenceStateRef = useRef<RealtimePresenceState>({})
  const { user } = useSupabaseAuth()
  const loadConversations = useCallback(async () => {
    if (!user?.id || !enabled) return

    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          messages (
            id,
            content,
            created_at,
            sender_id,
            sender_name,
            sender_avatar_url
          )
        `)
        .contains('participant_ids', [user.id])
        .eq('is_active', true)
        .order('updated_at', { ascending: false })

      if (error) throw error

      // Process conversations with unread counts and last messages
      const processedConversations = data?.map(conv => {
        const participants = conv.participant_ids.map((userId: string, index: number) => ({
          user_id: userId,
          user: {
            id: userId,
            name: conv.participant_names?.[index] || 'Unknown User',
            avatar_url: conv.participant_avatars?.[index] || null
          }
        }))

        const lastMessage = conv.messages?.[conv.messages.length - 1]
        
        return {
          ...conv,
          participants,
          last_message: lastMessage,
          unread_count: 0 // TODO: Calculate based on read_by array
        }
      }) || []

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
          id,
          conversation_id,
          sender_id,
          content,
          message_type,
          attachment_url,
          sender_name,
          sender_avatar_url,
          read_by,
          created_at
        `)
        .eq('conversation_id', convId)
        .order('created_at', { ascending: true })
        .limit(50)

      if (error) throw error

      const processedMessages = data?.map(msg => ({
        ...msg,
        sender: {
          id: msg.sender_id,
          name: msg.sender_name,
          avatar_url: msg.sender_avatar_url
        }
      })) || []

      setMessages(processedMessages)

      // Mark messages as read by updating the read_by array
      const { data: messagesToUpdate } = await supabase
        .from('messages')
        .select('id, read_by')
        .eq('conversation_id', convId)
        .not('read_by', 'cs', `{${user.id}}`)

      if (messagesToUpdate && messagesToUpdate.length > 0) {
        // Update each message to add the user to read_by array
        for (const message of messagesToUpdate) {
          const currentReadBy = message.read_by || []
          const updatedReadBy = [...currentReadBy, user.id]
          
          await supabase
            .from('messages')
            .update({ read_by: updatedReadBy })
            .eq('id', message.id)
        }
      }



    } catch (err) {
      console.error('Failed to load messages:', err)
      setError(err instanceof Error ? err.message : 'Failed to load messages')
    }
  }, [user?.id, enabled, supabase])

  // Send message
  const sendMessage = useCallback(async (content: string, messageType: 'text' | 'image' | 'file' = 'text', attachmentUrl?: string) => {
    if (!user?.id || !conversationId || !content.trim()) return

    try {
      // Get user details for sender info
      const { data: userData } = await supabase
        .from('users')
        .select('name, avatar_url')
        .eq('id', user.id)
        .single()

      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          sender_name: userData?.name || user.email || 'Unknown User',
          sender_avatar_url: userData?.avatar_url || null,
          content: content.trim(),
          message_type: messageType,
          attachment_url: attachmentUrl,
          read_by: [user.id] // Mark as read by sender
        })
        .select(`
          id,
          conversation_id,
          sender_id,
          content,
          message_type,
          attachment_url,
          sender_name,
          sender_avatar_url,
          read_by,
          created_at
        `)
        .single()

      if (error) throw error

      // Update conversation's updated_at and message count
      const { data: currentConversation } = await supabase
        .from('conversations')
        .select('message_count')
        .eq('id', conversationId)
        .single()

      if (currentConversation) {
        await supabase
          .from('conversations')
          .update({ 
            updated_at: new Date().toISOString(),
            message_count: (currentConversation.message_count || 0) + 1,
            last_message_at: new Date().toISOString(),
            last_message_preview: content.trim().substring(0, 100),
            last_sender_id: user.id
          })
          .eq('id', conversationId)
      }

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
        name: user.name || user.email || 'Unknown User',
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
          name: user.name || user.email || 'Unknown User',
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
          id,
          conversation_id,
          sender_id,
          content,
          message_type,
          attachment_url,
          sender_name,
          sender_avatar_url,
          read_by,
          created_at
        `)
        .eq('id', payload.new.id)
        .single()

      if (messageData) {
        const processedMessage = {
          ...messageData,
          sender: {
            id: messageData.sender_id,
            name: messageData.sender_name,
            avatar_url: messageData.sender_avatar_url
          }
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
