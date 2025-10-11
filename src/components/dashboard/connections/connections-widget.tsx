'use client'

import { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ConnectionBalance } from './connection-balance'
import { ConnectionCosts } from './connection-costs'
import { MonthlyRefreshInfo } from './monthly-refresh-info'
import { PurchaseConnectionsSection } from './purchase-connections-section'
import { LowConnectionsWarning } from './low-connections-warning'
import { ConnectionActivity } from './connection-activity'
import { useConnectionsManager } from '@/hooks/use-connections'
import { Zap, TrendingUp } from 'lucide-react'
import { useTranslations } from 'next-intl'

export function ConnectionsWidget() {
  const t = useTranslations('dashboard.connections')
  
  // Use Supabase hooks instead of manual fetch() calls
  const { 
    connections, 
    history, 
    isLoading: loading,
    error,
    refetchAll 
  } = useConnectionsManager()

  useEffect(() => {
    const handleRefresh = () => {
      refetchAll()
    }

    window.addEventListener('refresh-connections', handleRefresh)
    return () => window.removeEventListener('refresh-connections', handleRefresh)
  }, [refetchAll])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            {t('overview')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Balance skeleton */}
          <div className="h-12 bg-muted rounded animate-pulse"></div>
          
          {/* Stats skeletons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded animate-pulse"></div>
            ))}
          </div>
          
          {/* Activity skeleton */}
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded w-1/3 animate-pulse"></div>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            {t('overview')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold">{t('errorTitle')}</h3>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button onClick={refetchAll} variant="outline">
              {t('tryAgain')}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          {t('overview')}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-6">
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
            <h4 className="font-medium flex items-center gap-2 mb-3 text-gray-900 dark:text-gray-100">
              <TrendingUp className="h-4 w-4" />
              {t('recentActivityPreview')}
            </h4>
            <ConnectionActivity history={history.slice(0, 3)} />
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
              {t('viewFullHistory')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
