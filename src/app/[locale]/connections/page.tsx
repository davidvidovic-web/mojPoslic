'use client'

import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { ConnectionsWidget } from '@/components/dashboard/connections/connections-widget'
import { ConnectionsFullHistory } from '@/components/dashboard/connections/connections-full-history'
import { useTranslations } from 'next-intl'

export default function ConnectionsPage() {
  const t = useTranslations('dashboard.connections')
  
  return (
    <DashboardLayout 
      title={t('title')}
      subtitle={t('subtitle')}
      activeTab="connections"
    >
      {/* Responsive grid layout - stacked on mobile, side by side on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left column - Connections Widget */}
        <div className="lg:sticky lg:top-8 lg:self-start">
          <ConnectionsWidget />
        </div>
        
        {/* Right column - Full Connections History */}
        <div>
          <ConnectionsFullHistory />
        </div>
      </div>
    </DashboardLayout>
  )
}
