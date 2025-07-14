'use client'

import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { ConnectionsWidget } from '@/components/dashboard/connections/connections-widget'
import { ConnectionsFullHistory } from '@/components/dashboard/connections/connections-full-history'

export default function ConnectionsPage() {
  return (
    <DashboardLayout 
      title="Connections"
      subtitle="Manage your connections and view transaction history"
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
