'use client'

import { Calendar } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface MonthlyRefreshInfoProps {
  lastRefresh?: Date | null
}

export function MonthlyRefreshInfo({ lastRefresh }: MonthlyRefreshInfoProps) {
  const t = useTranslations('dashboard.connections')
  
  const getNextRefreshDate = () => {
    const now = new Date()
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    return nextMonth.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="space-y-2">
      <h4 className="font-medium flex items-center gap-2">
        <Calendar className="h-4 w-4" />
        {t('monthlyRefresh')}
      </h4>
      <div className="text-sm text-muted-foreground space-y-1">
        <p>{t('monthlyRefreshInfo')}</p>
        <p className="font-medium">{t('nextRefresh', { date: getNextRefreshDate() })}</p>
        {lastRefresh && (
          <p>{t('lastRefresh', { date: lastRefresh.toLocaleDateString() })}</p>
        )}
      </div>
    </div>
  )
}
