'use client'

import { useTranslations } from 'next-intl'

interface ConnectionBalanceProps {
  connections: number
}

export function ConnectionBalance({ connections }: ConnectionBalanceProps) {
  const t = useTranslations('dashboard.connections')
  
  return (
    <div className="text-center space-y-2">
      <div className="flex items-center justify-center gap-2">
        <span className="text-3xl font-bold">{connections}</span>
      </div>
      <p className="text-sm text-muted-foreground">
        {t('availableConnections')}
      </p>
    </div>
  )
}
