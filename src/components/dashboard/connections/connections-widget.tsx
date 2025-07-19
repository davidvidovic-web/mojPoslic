'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ConnectionBalance } from './connection-balance'
import { ConnectionCosts } from './connection-costs'
import { MonthlyRefreshInfo } from './monthly-refresh-info'
import { PurchaseConnectionsSection } from './purchase-connections-section'
import { LowConnectionsWarning } from './low-connections-warning'
import { ConnectionActivity } from './connection-activity'
import { Zap, TrendingUp } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface ConnectionsWidgetProps {
  className?: string
}

export function ConnectionsWidget({ className }: ConnectionsWidgetProps) {
  const t = useTranslations('dashboard.connections')
  const [connections, setConnections] = useState(0)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchConnectionData()
  }, [])

  const fetchConnectionData = async () => {
    try {
      // Fetch current connections
      const connectionsResponse = await fetch('/api/user/connections')
      if (connectionsResponse.ok) {
        const connectionsData = await connectionsResponse.json()
        setConnections(connectionsData.connections || 0)
      }

      // Fetch recent history
      const historyResponse = await fetch('/api/user/connections/history')
      if (historyResponse.ok) {
        const historyData = await historyResponse.json()
        setHistory(historyData || [])
      }
    } catch (error) {
      console.error('Error fetching connection data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Listen for connection updates
  useEffect(() => {
    const handleRefresh = () => {
      fetchConnectionData()
    }

    window.addEventListener('refresh-connections', handleRefresh)
    return () => window.removeEventListener('refresh-connections', handleRefresh)
  }, [])

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            {t('overview')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          {t('overview')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Low connections warning */}
        <LowConnectionsWarning connections={connections} />
        
        {/* Connection balance */}
        <ConnectionBalance connections={connections} />
        
        {/* Connection costs info */}
        <ConnectionCosts />
        
        {/* Monthly refresh info */}
        <MonthlyRefreshInfo />
        
        {/* Purchase connections */}
        <PurchaseConnectionsSection />
        
        {/* Recent activity preview */}
        {history.length > 0 && (
          <div>
            <h4 className="font-medium flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4" />
              {t('recentActivityPreview')}
            </h4>
            <ConnectionActivity history={history.slice(0, 3)} />
            <p className="text-xs text-muted-foreground text-center mt-2">
              {t('viewFullHistory')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
