'use client'

import { useCallback, useEffect, useState, useRef } from 'react'
import { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { useSupabaseAuth } from '@/contexts/supabase-auth-context'

export interface Conversation {
  id: string
  title?: string
  job_id?: string
  application_id?: string
  created_by_id: string
  participant_ids: string[]
  participant_names: string[]
  participant_avatars?: (string | null)[]
  is_active: boolean
  created_at: string
  updated_at: string
  unread_count?: number
  last_message_preview?: string
  last_message_at?: string
  last_sender_id?: string
}

interface ConversationRecord {
  id: string
  title?: string
  job_id?: string
  application_id?: string
  created_by_id: string
  participant_ids: string[]
  participant_names: string[]
  participant_avatars?: (string | null)[]
  is_active: boolean
  created_at: string
  updated_at: string
  last_message_at?: string
  last_message_preview?: string
  last_sender_id?: string
  hidden_for_users?: string[] | null
  [key: string]: unknown
}

interface UseRealtimeConversationsProps {
  enabled?: boolean
}

/**
 * Hook for managing conversations list with realtime updates via Broadcast
 * Handles conversation list, unread counts, and realtime synchronization
 */
export function useRealtimeConversations({
  enabled = true
}: UseRealtimeConversationsProps = {}) {
  const { user, session } = useSupabaseAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  
  const channelRef = useRef<RealtimeChannel | null>(null)
  const retryCountRef = useRef<number>(0)
  const maxRetries = 5

  // Load conversations
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

      // Filter out hidden conversations
      const visibleConversations = (data || []).filter(conv => {
        const hiddenForUsers = (conv as Record<string, unknown>).hidden_for_users as string[] | null | undefined
        return !hiddenForUsers || !hiddenForUsers.includes(user.id)
      })

      // Calculate unread counts
      const conversationsWithUnread = await Promise.all(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        visibleConversations.map(async (conv: any) => {
          const { data: messages } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conv.id)
            .neq('sender_id', user.id)

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const unreadCount = (messages || []).filter((msg: any) => {
            const readBy = msg.read_by || []
            const deletedByUsers = (msg as unknown as Record<string, unknown>).deleted_by_users as string[] | null | undefined
            return !readBy.includes(user.id) && (!deletedByUsers || !deletedByUsers.includes(user.id))
          }).length

          return {
            ...conv,
            title: conv.title || undefined,
            unread_count: unreadCount
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

  // Set up realtime subscription for conversations using Broadcast
  useEffect(() => {
    if (!user?.id || !enabled || !session?.access_token) {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
      retryCountRef.current = 0
      return
    }

    let retryTimeout: NodeJS.Timeout | null = null

    const setupSubscription = async () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }

      // Set auth for private channel
      await supabase.realtime.setAuth()

      const channel = supabase.channel(`topic:conversations:user:${user.id}`, {
        config: {
          broadcast: { self: false },
          private: true
        }
      })
      channelRef.current = channel

      channel
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .on('broadcast', { event: 'INSERT' }, (payload: any) => {
          const newConversation = payload.payload.new as ConversationRecord
          const hiddenForUsers = newConversation.hidden_for_users || []
          const isHiddenForUser = hiddenForUsers.includes(user.id)
          
          if (!isHiddenForUser && 
              Array.isArray(newConversation.participant_ids) && 
              newConversation.participant_ids.includes(user.id)) {
            loadConversations()
          }
        })
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .on('broadcast', { event: 'UPDATE' }, (payload: any) => {
          const updatedConversation = payload.payload.new as ConversationRecord
          const hiddenForUsers = updatedConversation.hidden_for_users || []
          const isHiddenForUser = hiddenForUsers.includes(user.id)
          
          if (Array.isArray(updatedConversation.participant_ids) && 
              updatedConversation.participant_ids.includes(user.id)) {
            if (isHiddenForUser) {
              setConversations(prev => prev.filter(c => c.id !== updatedConversation.id))
            } else {
              loadConversations()
            }
          }
        })
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .subscribe((status: any, err: any) => {
          console.log('📡 Conversations realtime (broadcast):', status)
          setIsConnected(status === 'SUBSCRIBED')
          
          if (status === 'SUBSCRIBED') {
            setError(null)
            retryCountRef.current = 0
            if (retryTimeout) {
              clearTimeout(retryTimeout)
              retryTimeout = null
            }
          } else if (status === 'CHANNEL_ERROR') {
            console.error('❌ Conversations realtime error:', err)
            setError('Realtime connection failed')
            
            const errorString = JSON.stringify(err)
            if (err?.message?.includes('Token has expired') || 
                err?.message?.includes('InvalidJWTToken') ||
                errorString.includes('Token has expired') ||
                errorString.includes('InvalidJWTToken')) {
              console.log('🔑 Token error, skipping retry')
              retryCountRef.current = 0
              return
            }
            
            if (retryCountRef.current < maxRetries) {
              const backoffDelay = Math.min(Math.pow(2, retryCountRef.current) * 1000, 30000)
              retryCountRef.current++
              
              if (!retryTimeout) {
                retryTimeout = setTimeout(() => setupSubscription(), backoffDelay)
              }
            }
          }
        })
    }

    setupSubscription()

    return () => {
      if (retryTimeout) clearTimeout(retryTimeout)
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [user?.id, enabled, session?.access_token, loadConversations])

  // Load initial conversations
  useEffect(() => {
    if (enabled) {
      loadConversations()
    }
  }, [loadConversations, enabled])

  // Update unread count for a specific conversation
  const updateUnreadCount = useCallback((conversationId: string, count: number) => {
    setConversations(prev => prev.map(conv => 
      conv.id === conversationId ? { ...conv, unread_count: count } : conv
    ))
  }, [])

  // Clear unread count when conversation is opened
  const clearUnreadCount = useCallback((conversationId: string) => {
    updateUnreadCount(conversationId, 0)
  }, [updateUnreadCount])

  const totalUnreadCount = conversations.reduce((sum, conv) => sum + (conv.unread_count || 0), 0)

  return {
    conversations,
    loading,
    error,
    isConnected,
    totalUnreadCount,
    loadConversations,
    updateUnreadCount,
    clearUnreadCount
  }
}
