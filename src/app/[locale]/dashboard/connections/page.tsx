'use client'

import { useAuth } from '@/contexts/auth-context'
import { ConnectionsSection } from '@/components/dashboard/connections-section'
import { formatDisplayName, getTimeBasedGreeting } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'

export default function ConnectionsPage() {
  const { user } = useAuth()
  const t = useTranslations('connections')

  return (
    <DashboardLayout 
      activeTab="connections" 
      title={t('title')} 
      subtitle={t('subtitle')}
      userRole={user?.role}
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          Connections
        </h1>
        <p className="text-muted-foreground mt-2">
          {getTimeBasedGreeting()}, <span className="font-bold">{formatDisplayName(user?.name || undefined)}</span>! Manage your application credits.
        </p>
      </div>

      {/* Connections Content */}
      <div className="max-w-4xl">
        <ConnectionsSection />
      </div>
    </DashboardLayout>
  )
}
