import { useState, useEffect, useCallback } from 'react'
import { useSupabaseAuth } from '@/contexts/supabase-auth-context'
import { supabase } from '@/lib/supabase'

interface ConnectionHistoryItem {
  id: string
  action: string
  connectionsBefore: number
  connectionsAfter: number
  amountChanged: number
  reason?: string
  createdAt: string
}

interface UseConnectionsManagerReturn {
  connections: number
  history: ConnectionHistoryItem[]
  isLoading: boolean
  refetchAll: () => void
}

export function useConnectionsManager(): UseConnectionsManagerReturn {
  const { user } = useSupabaseAuth()
  const [connections, setConnections] = useState(0)
  const [history, setHistory] = useState<ConnectionHistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchConnections = useCallback(async () => {
    if (!user) return

    try {
      const { data: userProfile } = await supabase
        .from('users')
        .select('connections')
        .eq('id', user.id)
        .single()

      if (userProfile) {
        setConnections(userProfile.connections || 0)
      }
    } catch (error) {
      console.error('Error fetching connections:', error)
    }
  }, [user])

  const fetchHistory = useCallback(async () => {
    if (!user) return

    try {
      const { data: historyData } = await supabase
        .from('connection_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)

      if (historyData) {
        const formattedHistory: ConnectionHistoryItem[] = historyData.map((item) => ({
          id: item.id as string,
          action: item.action as string,
          connectionsBefore: item.connections_before as number,
          connectionsAfter: item.connections_after as number,
          amountChanged: item.amount_changed as number,
          reason: item.reason as string | undefined,
          createdAt: item.created_at as string
        }))
        setHistory(formattedHistory)
      }
    } catch (error) {
      console.error('Error fetching connection history:', error)
    }
  }, [user])

  const refetchAll = useCallback(async () => {
    setIsLoading(true)
    await Promise.all([fetchConnections(), fetchHistory()])
    setIsLoading(false)
  }, [fetchConnections, fetchHistory])

  useEffect(() => {
    if (user) {
      refetchAll()
    } else {
      setConnections(0)
      setHistory([])
      setIsLoading(false)
    }
  }, [user, refetchAll])

  return {
    connections,
    history,
    isLoading,
    refetchAll
  }
}