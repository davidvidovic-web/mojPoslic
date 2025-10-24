'use client'

import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { ConnectionsFullHistory } from '@/components/dashboard/connections/connections-full-history'
import { ConnectionsWidget } from '@/components/dashboard/connections/connections-widget'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTranslations } from 'next-intl'
import { RegistrationFlowGuard } from '@/components/auth/registration-flow-guard'

export default function ConnectionsPage() {
  const tDashboard = useTranslations('dashboard')
  const tNavigation = useTranslations('navigation.main')

  return (
    <RegistrationFlowGuard>
      <DashboardLayout>
        <div className="space-y-8 px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="flex flex-col space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              {tNavigation('connections') || 'Connections'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {tDashboard('connections.description') || 'View your connection balance and transaction history'}
            </p>
          </div>

          {/* Connection Balance Widget */}
          <ConnectionsWidget />

          {/* Full Connection History */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                {tDashboard('connections.fullHistory') || 'Connection History'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ConnectionsFullHistory />
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </RegistrationFlowGuard>
  )
}
