'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { useSupabaseAuth } from '@/contexts/supabase-auth-context'

/**
 * @deprecated This hook is deprecated. Use useSupabaseRealtimeChat instead.
 * Legacy hook maintained for backward compatibility.
 * 
 * For modern realtime messaging, use useSupabaseRealtimeChat which follows
 * the latest Supabase documentation patterns.
 */

export interface ChatMessage {
  id: string
  content: string
  user: {
    name: string
    id: string
  }
  createdAt: string
  conversation_id?: string
}

interface UseRealtimeChatProps {
  roomName: string
  username: string
  initialMessages?: ChatMessage[]
  onMessage?: (messages: ChatMessage[]) => void
}

export function useRealtimeChat({
  roomName,
  username,
  initialMessages = [],
  onMessage
}: UseRealtimeChatProps) {
  const { user } = useSupabaseAuth()
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [loading, setLoading] = useState(false)
  const channelRef = useRef<RealtimeChannel | null>(null)

  // Update messages when initialMessages change
  useEffect(() => {
    setMessages(initialMessages)
  }, [initialMessages])

  // Set up realtime subscription
  useEffect(() => {
    if (!user?.id || !roomName) return

    const channel = supabase.channel(roomName, {
      config: {
        broadcast: { self: true },
        presence: { key: user.id }
      }
    })

    channelRef.current = channel

    // Subscribe to broadcast messages (for real-time message delivery)
    channel.on('broadcast', { event: 'message' }, (payload) => {
      const newMessage = payload.payload as ChatMessage
      
      setMessages(prevMessages => {
        // Check if message already exists to prevent duplicates
        const exists = prevMessages.find(msg => msg.id === newMessage.id)
        if (exists) return prevMessages

        const updatedMessages = [...prevMessages, newMessage]
        
        // Call onMessage callback if provided
        if (onMessage) {
          onMessage(updatedMessages)
        }
        
        return updatedMessages
      })
    })

    // Subscribe to postgres changes for persistent messages
    channel.on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `conversation_id=eq.${roomName}`
    }, (payload) => {
      const dbMessage = payload.new as {
        id: string
        content: string
        sender_id: string
        sender_name: string
        created_at: string
        conversation_id: string
      }
      
      // Convert database message to ChatMessage format
      const chatMessage: ChatMessage = {
        id: dbMessage.id,
        content: dbMessage.content,
        user: {
          name: dbMessage.sender_name || username,
          id: dbMessage.sender_id
        },
        createdAt: dbMessage.created_at,
        conversation_id: dbMessage.conversation_id
      }

      setMessages(prevMessages => {
        // Check if message already exists to prevent duplicates
        const exists = prevMessages.find(msg => msg.id === chatMessage.id)
        if (exists) return prevMessages

        const updatedMessages = [...prevMessages, chatMessage]
        
        // Call onMessage callback if provided
        if (onMessage) {
          onMessage(updatedMessages)
        }
        
        return updatedMessages
      })
    })

    // Subscribe to the channel
    channel.subscribe((status) => {
      console.log('🔗 Realtime chat connection status:', status)
    })

    // Cleanup function
    return () => {
      console.log('🧹 Cleaning up realtime chat subscription')
      channel.unsubscribe()
      channelRef.current = null
    }
  }, [user?.id, roomName, username, onMessage])

  // Send message function
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || !user?.id || !channelRef.current) return

    const message: ChatMessage = {
      id: `temp-${Date.now()}-${Math.random()}`,
      content: content.trim(),
      user: {
        name: username,
        id: user.id
      },
      createdAt: new Date().toISOString(),
      conversation_id: roomName
    }

    try {
      setLoading(true)

      // Send via broadcast for immediate delivery
      await channelRef.current.send({
        type: 'broadcast',
        event: 'message',
        payload: message
      })

      // Store in database for persistence (if roomName matches a conversation_id)
      if (onMessage) {
        try {
          const { data, error } = await supabase
            .from('messages')
            .insert({
              conversation_id: roomName,
              sender_id: user.id,
              content: content.trim(),
              message_type: 'text',
              sender_name: username
            })
            .select()
            .single()

          if (error) {
            console.warn('Failed to persist message to database:', error)
          }
        } catch (persistError) {
          console.warn('Database persistence failed:', persistError)
          // Continue anyway - message was sent via broadcast
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setLoading(false)
    }
  }, [user?.id, username, roomName, onMessage])

  // Clear messages
  const clearMessages = useCallback(() => {
    setMessages([])
  }, [])

  return {
    messages,
    sendMessage,
    clearMessages,
    loading
  }
}
