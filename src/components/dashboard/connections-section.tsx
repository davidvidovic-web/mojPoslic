'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Zap } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { ConnectionBalance } from './connections/connection-balance'
import { ConnectionCosts } from './connections/connection-costs'
import { MonthlyRefreshInfo } from './connections/monthly-refresh-info'
import { ConnectionActivity } from './connections/connection-activity'
import { LowConnectionsWarning } from './connections/low-connections-warning'
import { PurchaseConnectionsSection } from './connections/purchase-connections-section'

interface ConnectionHistoryEntry {
  id: string
  action: string
  actionLabel: string
  amount: number
  description: string | null
  jobId: string | null
  createdAt: string
  isPositive: boolean
  isNegative: boolean
}

export function ConnectionsSection() {
  const { user, loading: authLoading } = useAuth()
  const [connections, setConnections] = useState<number>(0)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  const [loading, setLoading] = useState(true)
  const [history, setHistory] = useState<ConnectionHistoryEntry[]>([])

  const fetchConnections = useCallback(async () => {
    if (!user?.email) {
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/user/connections', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      
      if (response.ok) {
        const data = await response.json()
        setConnections(data.connections || 0)
        setLastRefresh(data.lastRefresh ? new Date(data.lastRefresh) : null)
      } else {
        const errorData = await response.json()
        console.error('Error response:', errorData)
        // Set default values on error
        setConnections(0)
        setLastRefresh(null)
      }
    } catch (error) {
      console.error('Error fetching connections:', error)
      // Set default values on error
      setConnections(0)
      setLastRefresh(null)
    } finally {
      setLoading(false)
    }
  }, [user?.email])

  const fetchHistory = useCallback(async () => {
    if (!user?.email) return

    try {
      const response = await fetch('/api/user/connections/history', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      
      if (response.ok) {
        const data = await response.json()
        setHistory(data.history || [])
      } else {
        const errorData = await response.json()
        console.error('Error response:', errorData)
        setHistory([])
      }
    } catch (error) {
      console.error('Error fetching connection history:', error)
      setHistory([])
    }
  }, [user?.email])

  useEffect(() => {
    if (!authLoading) {
      if (user?.email) {
        fetchConnections()
        fetchHistory()
      } else {
        // If no user, stop loading
        setLoading(false)
      }
    }

    // Add a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (loading) {
        setLoading(false)
      }
    }, 10000) // 10 seconds timeout

    return () => clearTimeout(timeout)
  }, [user?.email, authLoading, fetchConnections, fetchHistory, loading])

  // Listen for refresh events
  useEffect(() => {
    const handleRefresh = () => {
      if (user?.email) {
        fetchConnections()
        fetchHistory()
      }
    }

    window.addEventListener('refresh-connections', handleRefresh)
    
    return () => {
      window.removeEventListener('refresh-connections', handleRefresh)
    }
  }, [user?.email, fetchConnections, fetchHistory])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Connections
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-8 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card id="connections">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-blue-500" />
          Connections
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <ConnectionBalance connections={connections} />
        
        <Separator />
        
        <ConnectionCosts userRole={user?.role} />
        
        <Separator />
        
        <MonthlyRefreshInfo lastRefresh={lastRefresh} />
        
        <Separator />
        
        <ConnectionActivity history={history} />
        
        <LowConnectionsWarning connections={connections} userRole={user?.role} />
        
        <Separator />
        
        <PurchaseConnectionsSection userRole={user?.role} />
      </CardContent>
    </Card>
  )
}
