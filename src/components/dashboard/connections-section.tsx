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
    try {
      console.log('Fetching connections for user:', user?.email)
      const response = await fetch('/api/user/connections', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      console.log('Connections response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Connections data:', data)
        setConnections(data.connections || 0)
        setLastRefresh(data.lastRefresh ? new Date(data.lastRefresh) : null)
      } else {
        const errorData = await response.json()
        console.error('Error response:', errorData)
      }
    } catch (error) {
      console.error('Error fetching connections:', error)
    } finally {
      setLoading(false)
    }
  }, [user?.email])

  const fetchHistory = useCallback(async () => {
    try {
      console.log('Fetching connection history for user:', user?.email)
      const response = await fetch('/api/user/connections/history', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      console.log('History response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('History data:', data)
        setHistory(data.history || [])
      } else {
        const errorData = await response.json()
        console.error('Error response:', errorData)
      }
    } catch (error) {
      console.error('Error fetching connection history:', error)
    }
  }, [user?.email])

  useEffect(() => {
    if (user?.email && !authLoading) {
      fetchConnections()
      fetchHistory()
    }
  }, [user?.email, authLoading, fetchConnections, fetchHistory])

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
        
        <ConnectionCosts />
        
        <Separator />
        
        <MonthlyRefreshInfo lastRefresh={lastRefresh} />
        
        <Separator />
        
        <ConnectionActivity history={history} />
        
        <LowConnectionsWarning connections={connections} />
        
        <Separator />
        
        <PurchaseConnectionsSection />
      </CardContent>
    </Card>
  )
}
