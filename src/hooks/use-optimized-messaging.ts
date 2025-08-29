'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSupabaseAuth } from '@/contexts/supabase-auth-context'
import { supabase } from '@/lib/supabase'

interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  message_type: string
  attachment_url?: string
  sender_name: string
  sender_avatar_url?: string
  read_by: string[]
  created_at: string
}

interface Conversation {
  id: string
  title?: string
  job_id?: string
  application_id?: string
  created_by_id: string
  participant_ids: string[]
  participant_names: string[]
  participant_avatars?: string[]
  message_count: number
  last_message_at?: string
  last_message_preview?: string
  last_sender_id?: string
  is_active: boolean
  created_at: string
  updated_at: string
  unread_count?: number
}

/**
 * @deprecated This hook is deprecated. Use useSupabaseRealtimeChat instead.
 * Legacy hook maintained for backward compatibility.
 * Use the new UnifiedMessagingInterface component for new implementations.
 * 
 * @deprecated Use useSupabaseRealtimeChat hook instead
 */
export function useOptimizedMessaging() {
  const { user, session } = useSupabaseAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [messagingActive, setMessagingActive] = useState(false)

  // Load conversations
  const loadConversations = useCallback(async () => {
    if (!user?.id || !session) return

    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .contains('participant_ids', [user.id])
        .eq('is_active', true)
        .order('updated_at', { ascending: false })

      if (error) throw error

      // Calculate unread counts
      const conversationsWithUnread = await Promise.all(
        (data || []).map(async (conv) => {
          const { count } = await supabase
            .from('messages')
            .select('id', { count: 'exact' })
            .eq('conversation_id', conv.id)
            .not('read_by', 'cs', `{${user.id}}`)

          return {
            ...conv,
            unread_count: count || 0
          }
        })
      )

      setConversations(conversationsWithUnread)
    } catch (err) {
      console.error('Failed to load conversations:', err)
      setError(err instanceof Error ? err.message : 'Failed to load conversations')
    } finally {
      setIsLoading(false)
    }
  }, [user?.id, session])

  // Load messages for a conversation
  const loadMessages = useCallback(async (conversationId: string) => {
    if (!user?.id || !session) return

    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (error) throw error

      setMessages(data || [])

      // Mark messages as read
      const { data: unreadMessages } = await supabase
        .from('messages')
        .select('id, read_by')
        .eq('conversation_id', conversationId)
        .not('read_by', 'cs', `{${user.id}}`)

      if (unreadMessages && unreadMessages.length > 0) {
        for (const message of unreadMessages) {
          const updatedReadBy = [...(message.read_by || []), user.id]
          await supabase
            .from('messages')
            .update({ read_by: updatedReadBy })
            .eq('id', message.id)
        }
      }

    } catch (err) {
      console.error('Failed to load messages:', err)
      setError(err instanceof Error ? err.message : 'Failed to load messages')
    } finally {
      setIsLoading(false)
    }
  }, [user?.id, session])

  // Send message
  const sendMessage = useCallback(async (conversationId: string, content: string, messageType: string = 'text') => {
    if (!user?.id || !session || !content.trim()) return

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
          read_by: [user.id] // Mark as read by sender
        })
        .select()
        .single()

      if (error) throw error

      // Update conversation
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
  }, [user?.id, user?.email, session])

  // Basic realtime setup (limited compared to MessagingInterface)
  useEffect(() => {
    if (!user?.id || !messagingActive) return

    const channel = supabase.channel(`messaging_${user.id}`)

    // Listen for new messages
    channel.on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages'
    }, (payload) => {
      const newMessage = payload.new as Message
      
      // Add to messages if it's for the current conversation
      setMessages(prev => {
        if (prev.length > 0 && prev[0].conversation_id === newMessage.conversation_id) {
          return [...prev, newMessage]
        }
        return prev
      })

      // Update conversation list
      setConversations(prev => prev.map(conv => 
        conv.id === newMessage.conversation_id 
          ? { 
              ...conv, 
              message_count: conv.message_count + 1,
              last_message_at: newMessage.created_at,
              last_message_preview: newMessage.content.substring(0, 100),
              last_sender_id: newMessage.sender_id,
              updated_at: newMessage.created_at
            }
          : conv
      ))
    })

    channel.subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [user?.id, messagingActive])

  // Load conversations when messaging becomes active
  useEffect(() => {
    if (messagingActive) {
      loadConversations()
    }
  }, [messagingActive, loadConversations])

  const totalUnreadCount = conversations.reduce((sum, conv) => sum + (conv.unread_count || 0), 0)

  return {
    conversations,
    messages,
    isLoading,
    error,
    totalUnreadCount,
    messagingActive,
    setMessagingActive,
    loadConversations,
    loadMessages,
    sendMessage
  }
}
