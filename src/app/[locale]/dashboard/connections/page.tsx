'use client'

import { useAuth } from '@/contexts/auth-context'
import { ConnectionsSection } from '@/components/dashboard/connections-section'
import { formatDisplayName, getTimeBasedGreeting } from '@/lib/utils'

export default function ConnectionsPage() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
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
      </div>
    </div>
  )
}
