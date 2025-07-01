'use client'

import { useState, useEffect } from 'react'
import { useRobustAuth } from '@/contexts/robust-auth-context'
import { Job } from '@/types/job'
import { ConnectionsSection } from '@/components/dashboard/connections-section'
import { TaskerStatsCards } from './tasker/tasker-stats-cards'
import { ApplicationsSection } from './tasker/applications-section'
import { SavedJobsSection } from './tasker/saved-jobs-section'
import { RecommendedJobsSection } from './tasker/recommended-jobs-section'

interface JobApplication {
  id: string
  job_id: string
  applied_at: string
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected'
  job: Job
}

export function TaskerDashboard() {
  const { user } = useRobustAuth()
  const [applications, setApplications] = useState<JobApplication[]>([])
  const [savedJobs, setSavedJobs] = useState<Job[]>([])
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchApplications = async () => {
      if (!user) return

      try {
        // Fetch job applications from Prisma API
        const response = await fetch(`/api/user/applications?userId=${user.id}`)
        if (response.ok) {
          const data = await response.json()
          setApplications(data.applications || [])
        } else {
          console.error('Error fetching applications:', response.statusText)
        }
      } catch (error) {
        console.error('Error fetching applications:', error)
      }
    }

    const fetchSavedJobs = async () => {
      try {
        // Fetch saved jobs from Prisma API
        const response = await fetch(`/api/user/saved-jobs?userId=${user?.id}`)
        if (response.ok) {
          const data = await response.json()
          setSavedJobs(data.savedJobs || [])
        } else {
          console.error('Error fetching saved jobs:', response.statusText)
        }
      } catch (error) {
        console.error('Error fetching saved jobs:', error)
      }
    }

    const fetchRecommendedJobs = async () => {
      try {
        // Fetch recommended jobs from Prisma API
        const response = await fetch('/api/jobs/recommended')
        if (response.ok) {
          const data = await response.json()
          setRecommendedJobs(data.jobs || [])
        } else {
          console.error('Error fetching recommended jobs:', response.statusText)
        }
      } catch (error) {
        console.error('Error fetching recommended jobs:', error)
      }
    }

    const loadData = async () => {
      await Promise.all([
        fetchApplications(),
        fetchSavedJobs(),
        fetchRecommendedJobs()
      ])
      setLoading(false)
    }
    loadData()
  }, [user])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading your dashboard...</p>
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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Tasker Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Welcome back, {user?.name}! Track your applications and discover new opportunities.
          </p>
        </div>

        {/* Stats Cards */}
        <TaskerStatsCards 
          applications={applications} 
          savedJobsCount={savedJobs.length} 
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Applications and Jobs */}
          <div className="lg:col-span-2 space-y-8">
            {/* Applications Section */}
            <div className="space-y-6">
              <ApplicationsSection applications={applications} />
              <SavedJobsSection savedJobs={savedJobs} />
            </div>
          </div>

          {/* Right Column - Connections and Recommended Jobs */}
          <div className="space-y-8">
            {/* Connections Section */}
            <ConnectionsSection />
            
            {/* Recommended Jobs */}
            <RecommendedJobsSection recommendedJobs={recommendedJobs} />
          </div>
        </div>
      </div>
    </div>
  )
}
