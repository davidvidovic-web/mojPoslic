'use client'

import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { ConnectionsSection } from '@/components/dashboard/connections-section'
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
        {/* Left column - Connections Section (same as overview dashboard) */}
        <div className="lg:sticky lg:top-8 lg:self-start">
          <ConnectionsSection />
        </div>
        
        {/* Right column - Full Connections History */}
        <div>
          <ConnectionsFullHistory />
        </div>
      </div>
    </DashboardLayout>
  )
}
