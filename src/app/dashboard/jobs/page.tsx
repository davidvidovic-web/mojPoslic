'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Job } from '@/types/job'
import { SavedJobsSection } from '@/components/dashboard/tasker/saved-jobs-section'
import { RecommendedJobsSection } from '@/components/dashboard/tasker/recommended-jobs-section'
import { DashboardNavigation } from '@/components/dashboard/dashboard-navigation'
import { formatDisplayName, getTimeBasedGreeting } from '@/lib/utils'

export default function JobsPage() {
  const { user } = useAuth()
  const [savedJobs, setSavedJobs] = useState<Job[]>([])
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return

      try {
        const [savedResponse, recommendedResponse] = await Promise.all([
          fetch(`/api/user/saved-jobs?userId=${user.id}`),
          fetch('/api/jobs/recommended')
        ])

        if (savedResponse.ok) {
          const savedData = await savedResponse.json()
          setSavedJobs(savedData.savedJobs || [])
        }

        if (recommendedResponse.ok) {
          const recommendedData = await recommendedResponse.json()
          setRecommendedJobs(recommendedData.jobs || [])
        }
      } catch (error) {
        console.error('Error fetching jobs:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading jobs...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNavigation />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Jobs
          </h1>
          <p className="text-muted-foreground mt-2">
            {getTimeBasedGreeting()}, <span className="font-bold">{formatDisplayName(user?.name || undefined)}</span>! Manage your saved and find new opportunities.
          </p>
        </div>

        {/* Jobs Content */}
        <div className="space-y-8 max-w-4xl">
          <SavedJobsSection savedJobs={savedJobs} />
          <RecommendedJobsSection recommendedJobs={recommendedJobs} />
        </div>
      </div>
    </div>
  )
}
