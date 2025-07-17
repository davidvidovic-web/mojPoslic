'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Job } from '@/types/job'
import { SavedJobsSection } from '@/components/dashboard/tasker/saved-jobs-section'
import { RecommendedJobsSection } from '@/components/dashboard/tasker/recommended-jobs-section'
import { AppliedJobsSection } from '@/components/dashboard/tasker/applied-jobs-section'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { useTranslations } from 'next-intl'

interface JobApplication {
  id: string
  job_id: string
  applied_at: string
  status: 'PENDING' | 'REVIEWED' | 'SHORTLISTED' | 'SELECTED' | 'REJECTED' | 'WITHDRAWN'
  job: Job
}

export default function JobsPage() {
  const { user } = useAuth()
  const t = useTranslations('dashboard.jobs')
  const [savedJobs, setSavedJobs] = useState<Job[]>([])
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([])
  const [applications, setApplications] = useState<JobApplication[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return

      try {
        const [savedResponse, recommendedResponse, applicationsResponse] = await Promise.all([
          fetch(`/api/user/saved-jobs?userId=${user.id}`),
          fetch('/api/jobs/recommended'),
          fetch('/api/tasker/applications')
        ])

        if (savedResponse.ok) {
          const savedData = await savedResponse.json()
          setSavedJobs(savedData.savedJobs || [])
        }

        if (recommendedResponse.ok) {
          const recommendedData = await recommendedResponse.json()
          setRecommendedJobs(recommendedData.jobs || [])
        }

        if (applicationsResponse.ok) {
          const applicationsData = await applicationsResponse.json()
          setApplications(applicationsData || [])
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
      <DashboardLayout activeTab="jobs" title={t('title')} subtitle={t('loading')}>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">{t('loading')}</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout 
      activeTab="jobs" 
      title={t('title')} 
      subtitle={t('subtitle')}
      userRole={user?.role}
    >
      <div className="space-y-8 max-w-4xl">
        <AppliedJobsSection applications={applications} />
        <SavedJobsSection savedJobs={savedJobs} />
        <RecommendedJobsSection recommendedJobs={recommendedJobs} />
      </div>
    </DashboardLayout>
  )
}
