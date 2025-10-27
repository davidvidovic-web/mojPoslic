'use client'

import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { ConnectionsFullHistory } from '@/components/dashboard/connections/connections-full-history'
import { ConnectionsWidget } from '@/components/dashboard/connections/connections-widget'
import { useTranslations } from 'next-intl'
import { RegistrationFlowGuard } from '@/components/auth/registration-flow-guard'

export default function ConnectionsPage() {
  const tDashboard = useTranslations('dashboard')
  const tNavigation = useTranslations('navigation.main')

  return (
    <RegistrationFlowGuard>
      <DashboardLayout
        sidebar={
          <div className="space-y-6">
            {/* Connections Overview & Purchase Widget */}
            <ConnectionsWidget />
          </div>
        }
      >
        {/* Page Header */}
        <div className="flex flex-col space-y-2 mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            {tNavigation('connections') || 'Connections'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {tDashboard('connections.description') || 'View your connection balance and transaction history'}
          </p>
        </div>

        {/* Full Connection History - Integrated as main content */}
        <div className="space-y-6">
          <ConnectionsFullHistory />
        </div>
      </DashboardLayout>
    </RegistrationFlowGuard>
  )
}
