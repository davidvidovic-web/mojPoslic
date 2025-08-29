'use client'

import { useCallback, useEffect, useState, useRef } from 'react'
import { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { useSupabaseAuth } from '@/contexts/supabase-auth-context'

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  message_type: 'text' | 'image' | 'file'
  sender_name: string
  sender_avatar_url?: string
  read_by: string[]
  created_at: string
}

export interface Conversation {
  id: string
  title?: string
  job_id?: string
  application_id?: string
  created_by_id: string
  participant_ids: string[]
  participant_names: string[]
  is_active: boolean
  created_at: string
  updated_at: string
  unread_count?: number
}

interface UseSupabaseRealtimeChatProps {
  conversationId?: string
  enabled?: boolean
}

/**
 * Modern Supabase Realtime Chat Hook
 * Follows latest Supabase documentation patterns for postgres_changes
 * Reference: https://supabase.com/docs/guides/realtime/postgres-changes
 */
export function useSupabaseRealtimeChat({
  conversationId,
  enabled = true
}: UseSupabaseRealtimeChatProps) {
  const { user } = useSupabaseAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  
  const channelRef = useRef<RealtimeChannel | null>(null)
  const conversationsChannelRef = useRef<RealtimeChannel | null>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Clear error function
  const clearError = useCallback(() => setError(null), [])

  // Helper function to get user display name
  const getUserDisplayName = useCallback(() => {
    if (!user) return 'Unknown User'
    if (user.name) return user.name
    if (user.user_metadata?.full_name) return user.user_metadata.full_name as string
    if (user.user_metadata?.name) return user.user_metadata.name as string
    if (user.username) return user.username
    return user.email || 'Unknown User'
  }, [user])

  // Load conversations for user
  const loadConversations = useCallback(async () => {
    if (!user?.id || !enabled) return

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('conversations')
        .select('*')
        .contains('participant_ids', [user.id])
        .order('updated_at', { ascending: false })

      if (fetchError) throw fetchError

      // Calculate unread counts for each conversation
      const conversationsWithUnread = await Promise.all(
        (data || []).map(async (conv) => {
          const { count } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .not('read_by', 'cs', `{${user.id}}`)

          return {
            ...conv,
            title: conv.title || undefined,
            unread_count: count || 0
          }
        })
      )

      setConversations(conversationsWithUnread as Conversation[])
    } catch (err) {
      console.error('Failed to load conversations:', err)
      setError(err instanceof Error ? err.message : 'Failed to load conversations')
    } finally {
      setLoading(false)
    }
  }, [user?.id, enabled])

  // Load messages for specific conversation
  const loadMessages = useCallback(async (convId: string) => {
    if (!user?.id || !enabled) return

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', convId)
        .order('created_at', { ascending: true })

      if (fetchError) throw fetchError

      // Filter and convert to proper Message type
      const filteredMessages = (data || [])
        .filter(msg => msg.conversation_id && msg.sender_id && msg.created_at)
        .map(msg => ({
          id: msg.id,
          conversation_id: msg.conversation_id!,
          sender_id: msg.sender_id!,
          content: msg.content,
          message_type: (msg.message_type as 'text' | 'image' | 'file') || 'text',
          sender_name: msg.sender_name,
          sender_avatar_url: msg.sender_avatar_url || undefined,
          read_by: msg.read_by || [],
          created_at: msg.created_at!
        }))

      setMessages(filteredMessages)

      // Mark messages as read
      if (filteredMessages.length > 0) {
        const unreadMessages = filteredMessages.filter(msg => 
          msg.sender_id !== user.id && 
          !msg.read_by?.includes(user.id)
        )

        if (unreadMessages.length > 0) {
          await Promise.all(
            unreadMessages.map(message =>
              supabase
                .from('messages')
                .update({ 
                  read_by: [...(message.read_by || []), user.id] 
                })
                .eq('id', message.id)
            )
          )
        }
      }
    } catch (err) {
      console.error('Failed to load messages:', err)
      setError(err instanceof Error ? err.message : 'Failed to load messages')
    } finally {
      setLoading(false)
    }
  }, [user?.id, enabled])

  // Send message with optimistic updates
  const sendMessage = useCallback(async (content: string, convId?: string) => {
    const targetConversationId = convId || conversationId
    if (!user?.id || !targetConversationId || !content.trim() || !enabled) return

    const tempMessage: Message = {
      id: `temp-${Date.now()}-${Math.random()}`,
      conversation_id: targetConversationId,
      sender_id: user.id,
      content: content.trim(),
      message_type: 'text',
      sender_name: getUserDisplayName(),
      sender_avatar_url: user.user_metadata?.avatar_url as string | undefined,
      read_by: [user.id],
      created_at: new Date().toISOString()
    }

    // Optimistic update
    setMessages(prev => [...prev, tempMessage])

    try {
      // Insert into database - this will trigger realtime for other users
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: targetConversationId,
          sender_id: user.id,
          content: content.trim(),
          message_type: 'text',
          sender_name: getUserDisplayName(),
          sender_avatar_url: user.user_metadata?.avatar_url as string | undefined,
          read_by: [user.id]
        })
        .select()
        .single()

      if (error) throw error

      // Replace temp message with real message
      if (data) {
        const realMessage: Message = {
          id: data.id,
          conversation_id: data.conversation_id!,
          sender_id: data.sender_id!,
          content: data.content,
          message_type: (data.message_type as 'text' | 'image' | 'file') || 'text',
          sender_name: data.sender_name,
          sender_avatar_url: data.sender_avatar_url || undefined,
          read_by: data.read_by || [],
          created_at: data.created_at!
        }

        setMessages(prev => prev.map(msg => 
          msg.id === tempMessage.id ? realMessage : msg
        ))
      }

      // Update conversation's last_message_at
      await supabase
        .from('conversations')
        .update({ 
          updated_at: new Date().toISOString(),
          last_message_at: new Date().toISOString(),
          last_message_preview: content.trim().substring(0, 100),
          last_sender_id: user.id
        })
        .eq('id', targetConversationId)

    } catch (err) {
      console.error('Failed to send message:', err)
      // Remove temp message on error
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id))
      setError(err instanceof Error ? err.message : 'Failed to send message')
    }
  }, [user?.id, getUserDisplayName, user?.user_metadata?.avatar_url, conversationId, enabled])

  // Send typing indicator
  const sendTyping = useCallback(async (typing: boolean) => {
    if (!user?.id || !conversationId || !enabled || !channelRef.current) return

    await channelRef.current.send({
      type: 'broadcast',
      event: 'typing',
      payload: { 
        user_id: user.id, 
        typing, 
        user_name: getUserDisplayName()
      }
    })
  }, [user?.id, getUserDisplayName, conversationId, enabled])

  // Start typing (with auto-stop after 3 seconds)
  const startTyping = useCallback(() => {
    sendTyping(true)
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      sendTyping(false)
    }, 3000)
  }, [sendTyping])

  // Stop typing
  const stopTyping = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
      typingTimeoutRef.current = null
    }
    sendTyping(false)
  }, [sendTyping])

  // Set up realtime subscription for conversation messages
  useEffect(() => {
    if (!user?.id || !conversationId || !enabled) {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
      return
    }

    console.log('🔄 Setting up message realtime for conversation:', conversationId)

    // Create channel with proper naming convention
    const channel = supabase.channel(`messages:${conversationId}`)
    channelRef.current = channel

    channel
      // Listen for new messages via postgres_changes
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      }, (payload) => {
        const dbMessage = payload.new as any
        console.log('📨 New message via postgres_changes:', dbMessage)
        
        // Add message if it's not from current user (optimistic updates handle own messages)
        if (dbMessage.sender_id !== user.id && dbMessage.conversation_id && dbMessage.sender_id && dbMessage.created_at) {
          const newMessage: Message = {
            id: dbMessage.id,
            conversation_id: dbMessage.conversation_id,
            sender_id: dbMessage.sender_id,
            content: dbMessage.content,
            message_type: dbMessage.message_type || 'text',
            sender_name: dbMessage.sender_name,
            sender_avatar_url: dbMessage.sender_avatar_url || undefined,
            read_by: dbMessage.read_by || [],
            created_at: dbMessage.created_at
          }

          setMessages(prev => {
            // Prevent duplicates
            const exists = prev.find(msg => msg.id === newMessage.id)
            if (exists) return prev
            return [...prev, newMessage]
          })
        }
      })
      
      // Listen for message updates (read status, etc.)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      }, (payload) => {
        const dbMessage = payload.new as any
        console.log('📝 Message updated via postgres_changes:', dbMessage)
        
        if (dbMessage.conversation_id && dbMessage.sender_id && dbMessage.created_at) {
          const updatedMessage: Message = {
            id: dbMessage.id,
            conversation_id: dbMessage.conversation_id,
            sender_id: dbMessage.sender_id,
            content: dbMessage.content,
            message_type: dbMessage.message_type || 'text',
            sender_name: dbMessage.sender_name,
            sender_avatar_url: dbMessage.sender_avatar_url || undefined,
            read_by: dbMessage.read_by || [],
            created_at: dbMessage.created_at
          }

          setMessages(prev => prev.map(msg => 
            msg.id === updatedMessage.id ? updatedMessage : msg
          ))
        }
      })
      
      // Listen for typing indicators via broadcast
      .on('broadcast', { event: 'typing' }, (payload) => {
        const { user_id, typing, user_name } = payload.payload
        console.log('⌨️ Typing indicator:', { user_id, typing, user_name })
        
        if (user_id !== user.id) { // Don't show own typing
          setTypingUsers(prev => {
            if (typing) {
              return prev.includes(user_id) ? prev : [...prev, user_id]
            } else {
              return prev.filter(id => id !== user_id)
            }
          })
        }
      })
      
      .subscribe((status) => {
        console.log('📡 Message realtime status:', status)
        if (status === 'SUBSCRIBED') {
          console.log('✅ Message realtime connected')
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Message realtime error')
          setError('Realtime connection failed')
        }
      })

    return () => {
      console.log('🧹 Cleaning up message realtime')
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
        typingTimeoutRef.current = null
      }
      supabase.removeChannel(channel)
      channelRef.current = null
      setTypingUsers([])
    }
  }, [user?.id, conversationId, enabled])

  // Set up realtime subscription for conversations list
  useEffect(() => {
    if (!user?.id || !enabled) {
      if (conversationsChannelRef.current) {
        supabase.removeChannel(conversationsChannelRef.current)
        conversationsChannelRef.current = null
      }
      return
    }

    console.log('🔄 Setting up conversations realtime')

    // Create channel for conversations
    const channel = supabase.channel('conversations')
    conversationsChannelRef.current = channel

    channel
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'conversations'
      }, (payload) => {
        const newConversation = payload.new as any
        console.log('📋 New conversation:', newConversation)
        
        if (newConversation.participant_ids?.includes(user.id)) {
          loadConversations() // Reload to get proper data
        }
      })
      
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'conversations'
      }, (payload) => {
        const updatedConversation = payload.new as any
        console.log('📋 Updated conversation:', updatedConversation)
        
        if (updatedConversation.participant_ids?.includes(user.id)) {
          setConversations(prev => prev.map(conv => 
            conv.id === updatedConversation.id ? { 
              ...conv,
              title: updatedConversation.title || undefined,
              last_message_at: updatedConversation.last_message_at,
              last_message_preview: updatedConversation.last_message_preview,
              last_sender_id: updatedConversation.last_sender_id,
              updated_at: updatedConversation.updated_at
            } : conv
          ))
        }
      })
      
      .subscribe((status) => {
        console.log('📡 Conversations realtime status:', status)
        if (status === 'SUBSCRIBED') {
          console.log('✅ Conversations realtime connected')
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Conversations realtime error')
        }
      })

    return () => {
      console.log('🧹 Cleaning up conversations realtime')
      supabase.removeChannel(channel)
      conversationsChannelRef.current = null
    }
  }, [user?.id, enabled, loadConversations])

  // Load conversations on mount
  useEffect(() => {
    if (enabled) {
      loadConversations()
    }
  }, [loadConversations, enabled])

  // Load messages when conversation changes
  useEffect(() => {
    if (conversationId && enabled) {
      loadMessages(conversationId)
    } else {
      setMessages([])
    }
  }, [conversationId, loadMessages, enabled])

  // Clear typing users when conversation changes
  useEffect(() => {
    setTypingUsers([])
  }, [conversationId])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
      }
      if (conversationsChannelRef.current) {
        supabase.removeChannel(conversationsChannelRef.current)
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [])

  const totalUnreadCount = conversations.reduce((sum, conv) => sum + (conv.unread_count || 0), 0)

  return {
    messages,
    conversations,
    loading,
    error,
    typingUsers,
    totalUnreadCount,
    sendMessage,
    startTyping,
    stopTyping,
    clearError,
    loadConversations,
    loadMessages
  }
}
