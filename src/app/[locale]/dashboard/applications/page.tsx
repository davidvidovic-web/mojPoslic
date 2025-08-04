'use client'

import { useSupabaseAuth } from '@/contexts/supabase-auth-context'
import { ApplicationsSection } from '@/components/dashboard/tasker/applications-section'
import { SavedJobsSection } from '@/components/dashboard/tasker/saved-jobs-section'
import { RecommendedJobsSection } from '@/components/dashboard/tasker/recommended-jobs-section'
import { formatDisplayName, getTimeBasedGreeting } from '@/lib/utils'
import { useApplications } from '@/hooks/use-applications'
import { useRecommendedJobsQuery } from '@/hooks/queries/useJobs'

export default function ApplicationsPage() {
  const { user } = useSupabaseAuth()
  
  // Use new Supabase-based hooks
  const { data: applications = [], isLoading: applicationsLoading } = useApplications()
  const { data: recommendedJobs = [], isLoading: recommendedLoading } = useRecommendedJobsQuery(user?.id, 5)
  
  // TODO: Implement saved jobs query when available
  const savedJobs: Array<unknown> = []

  const loading = applicationsLoading || recommendedLoading

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading your applications...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Job Applications & Opportunities
          </h1>
          <p className="text-muted-foreground mt-2">
            {getTimeBasedGreeting()}, <span className="font-bold">{formatDisplayName(user?.name || undefined)}</span>! Track applications, browse saved jobs, and discover new opportunities.
          </p>
        </div>

        {/* Content */}
        <div className="space-y-8 max-w-6xl">
          <ApplicationsSection applications={applications} />
          <SavedJobsSection savedJobs={savedJobs} />
          <RecommendedJobsSection recommendedJobs={recommendedJobs} />
        </div>
      </div>
    </div>
  )
}
