'use client'

import { useAuth } from '@/contexts/auth-context'
import { ClientMessagesSection } from '@/components/dashboard/client/messages-section'
import { formatDisplayName, getTimeBasedGreeting } from '@/lib/utils'

export default function MessagesPage() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Messages
          </h1>
          <p className="text-muted-foreground mt-2">
            {getTimeBasedGreeting()}, <span className="font-bold">{formatDisplayName(user?.name || undefined)}</span>! Stay connected with your clients.
          </p>
        </div>

        {/* Messages Content */}
        <div className="max-w-6xl">
          <ClientMessagesSection />
        </div>
      </div>
    </div>
  )
}
