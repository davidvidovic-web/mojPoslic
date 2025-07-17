'use client'

import { useTranslations } from 'next-intl'

interface LowConnectionsWarningProps {
  connections: number
  userRole?: string
}

export function LowConnectionsWarning({ connections, userRole = 'tasker' }: LowConnectionsWarningProps) {
  const t = useTranslations('dashboard.connections')
  
  if (connections >= 3) return null

  const getWarningMessage = () => {
    switch (userRole) {
      case 'client':
        return t('lowConnectionsClient')
      case 'company':
        return t('lowConnectionsCompany')
      case 'tasker':
      default:
        return t('lowConnectionsTasker')
    }
  }

  return (
    <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
      <p className="text-sm text-yellow-700 dark:text-yellow-300">
        <strong>{getWarningMessage()}</strong> {t('sharingReward')}
      </p>
    </div>
  )
}
