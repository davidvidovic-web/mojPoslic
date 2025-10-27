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
  deleted_by_users?: string[]
  created_at: string
}

interface MessageRecord {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  message_type: string
  sender_name: string
  sender_avatar_url?: string
  read_by: string[]
  deleted_by_users?: string[] | null
  created_at: string
  [key: string]: unknown
}

interface UseRealtimeMessagesProps {
  conversationId?: string
  enabled?: boolean
  onUnreadCountChange?: (count: number) => void
}

/**
 * Hook for managing messages in a conversation with realtime updates via Broadcast
 * Handles message loading, sending, realtime updates, typing indicators
 */
export function useRealtimeMessages({
  conversationId,
  enabled = true,
  onUnreadCountChange
}: UseRealtimeMessagesProps) {
  const { user, session } = useSupabaseAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const [isConnected, setIsConnected] = useState(false)
  
  const channelRef = useRef<RealtimeChannel | null>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Get user display name
  const getUserDisplayName = useCallback(() => {
    if (!user) return 'Unknown User'
    if (user.name) return user.name
    if (user.user_metadata?.full_name) return user.user_metadata.full_name as string
    if (user.user_metadata?.name) return user.user_metadata.name as string
    if (user.username) return user.username
    return user.email || 'Unknown User'
  }, [user])

  // Load messages for conversation
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

      const filteredMessages = (data || [])
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .filter((msg: any) => msg.conversation_id && msg.sender_id && msg.created_at)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .filter((msg: any) => {
          const deletedByUsers = (msg as Record<string, unknown>).deleted_by_users as string[] | null | undefined
          return !deletedByUsers || !deletedByUsers.includes(user.id)
        })
        .map(msg => ({
          id: msg.id,
          conversation_id: msg.conversation_id!,
          sender_id: msg.sender_id!,
          content: msg.content,
          message_type: (msg.message_type as 'text' | 'image' | 'file') || 'text',
          sender_name: msg.sender_name,
          sender_avatar_url: msg.sender_avatar_url || undefined,
          read_by: msg.read_by || [],
          deleted_by_users: ((msg as Record<string, unknown>).deleted_by_users as string[] | undefined) || undefined,
          created_at: msg.created_at!
        }))

      setMessages(filteredMessages)

      // Mark unread messages as read
      const unreadMessages = filteredMessages.filter(msg => 
        msg.sender_id !== user.id && 
        !msg.read_by?.includes(user.id)
      )

      if (unreadMessages.length > 0) {
        await Promise.all(
          unreadMessages.map(message =>
            supabase
              .from('messages')
              .update({ read_by: [...(message.read_by || []), user.id] })
              .eq('id', message.id)
          )
        )
        
        if (onUnreadCountChange) {
          onUnreadCountChange(0)
        }
      }
    } catch (err) {
      console.error('Failed to load messages:', err)
      setError(err instanceof Error ? err.message : 'Failed to load messages')
    } finally {
      setLoading(false)
    }
  }, [user?.id, enabled, onUnreadCountChange])

  // Send message
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

    setMessages(prev => [...prev, tempMessage])

    try {
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

      // Update conversation timestamp
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

  // Start typing
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

  // Set up realtime subscription for messages using Broadcast
  useEffect(() => {
    if (!user?.id || !conversationId || !enabled || !session?.access_token) {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
      return
    }

    const setupChannel = async () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }

      // Set auth for private channel
      await supabase.realtime.setAuth()

      const channel = supabase.channel(`topic:${conversationId}`, {
        config: {
          broadcast: { self: false },
          private: true
        }
      })
      channelRef.current = channel

      channel
        .on('broadcast', { event: 'INSERT' }, (payload) => {
          const dbMessage = payload.payload.new as MessageRecord
          const deletedByUsers = dbMessage.deleted_by_users || []
          const isDeletedForUser = deletedByUsers.includes(user.id)
          
          if (!isDeletedForUser && dbMessage.sender_id !== user.id && 
              dbMessage.conversation_id && dbMessage.sender_id && dbMessage.created_at) {
            const newMessage: Message = {
              id: dbMessage.id,
              conversation_id: dbMessage.conversation_id,
              sender_id: dbMessage.sender_id,
              content: dbMessage.content,
              message_type: (dbMessage.message_type as 'text' | 'image' | 'file') || 'text',
              sender_name: dbMessage.sender_name,
              sender_avatar_url: dbMessage.sender_avatar_url || undefined,
              read_by: dbMessage.read_by || [],
              deleted_by_users: dbMessage.deleted_by_users || undefined,
              created_at: dbMessage.created_at
            }

            setMessages(prev => {
              const exists = prev.find(msg => msg.id === newMessage.id)
              if (exists) return prev
              return [...prev, newMessage]
            })
          }
        })
        
        .on('broadcast', { event: 'UPDATE' }, (payload) => {
          const dbMessage = payload.payload.new as MessageRecord
          const deletedByUsers = dbMessage.deleted_by_users || []
          const isDeletedForUser = deletedByUsers.includes(user.id)
          
          if (!isDeletedForUser && dbMessage.conversation_id && 
              dbMessage.sender_id && dbMessage.created_at) {
            const updatedMessage: Message = {
              id: dbMessage.id,
              conversation_id: dbMessage.conversation_id,
              sender_id: dbMessage.sender_id,
              content: dbMessage.content,
              message_type: (dbMessage.message_type as 'text' | 'image' | 'file') || 'text',
              sender_name: dbMessage.sender_name,
              sender_avatar_url: dbMessage.sender_avatar_url || undefined,
              read_by: dbMessage.read_by || [],
              deleted_by_users: dbMessage.deleted_by_users || undefined,
              created_at: dbMessage.created_at
            }

            setMessages(prev => prev.map(msg => 
              msg.id === updatedMessage.id ? updatedMessage : msg
            ))
          } else if (isDeletedForUser) {
            setMessages(prev => prev.filter(msg => msg.id !== dbMessage.id))
          }
        })
        
        .on('broadcast', { event: 'typing' }, (payload) => {
          const { user_id, typing } = payload.payload
          
          if (user_id !== user.id) {
            setTypingUsers(prev => {
              if (typing) {
                return prev.includes(user_id) ? prev : [...prev, user_id]
              } else {
                return prev.filter(id => id !== user_id)
              }
            })
          }
        })
        
        .subscribe((status, err) => {
          setIsConnected(status === 'SUBSCRIBED')
          
          if (status === 'SUBSCRIBED') {
            console.log('✅ Messages realtime connected (broadcast):', conversationId)
          } else if (status === 'CHANNEL_ERROR') {
            console.error('❌ Messages realtime error:', err)
            
            if (err?.message?.includes('Token has expired') || 
                err?.message?.includes('InvalidJWTToken')) {
              console.log('🔑 Token expired, will reconnect on session refresh')
            } else {
              setError(`Realtime connection failed: ${err?.message || 'Unknown error'}`)
            }
          }
        })
    }

    setupChannel()

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
        typingTimeoutRef.current = null
      }
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
      setTypingUsers([])
    }
  }, [user?.id, conversationId, enabled, session?.access_token])

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

  return {
    messages,
    loading,
    error,
    typingUsers,
    isConnected,
    sendMessage,
    startTyping,
    stopTyping,
    loadMessages
  }
}
