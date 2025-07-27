'use client'

import { useEffect } from 'react'
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
      <div className="bg-white dark:bg-gray-950 rounded-[calc(var(--radius)*1.5)] border border-gray-100 dark:border-gray-800 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-[calc(var(--radius)*1.5)] bg-yellow-100 dark:bg-yellow-950/30 flex items-center justify-center">
            <Zap className="h-5 w-5 text-yellow-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {t('overview')}
          </h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-950 rounded-[calc(var(--radius)*1.5)] border border-gray-100 dark:border-gray-800 p-6 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-[calc(var(--radius)*1.5)] bg-yellow-100 dark:bg-yellow-950/30 flex items-center justify-center">
          <Zap className="h-5 w-5 text-yellow-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {t('overview')}
        </h3>
      </div>
      <div className="space-y-6">
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
      </div>
    </div>
  )
}
