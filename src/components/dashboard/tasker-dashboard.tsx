'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useTranslations } from 'next-intl'
import { Job } from '@/types/job'
import { AppliedJobsSection } from './tasker/applied-jobs-section'
import { TaskerQuickStats } from './tasker/tasker-quick-stats'
import { TaskerQuickActions } from './tasker/tasker-quick-actions'
import { SavedJobsSection } from './tasker/saved-jobs-section'
import { RecommendedJobsSection } from './tasker/recommended-jobs-section'
import { ConnectionsSection } from './connections-section'
import { DashboardLayout } from './dashboard-layout'
import { Badge } from '@/components/ui/badge'
import { Star } from 'lucide-react'
import { toast } from 'sonner'

interface JobApplication {
  id: string
  job_id: string
  appliedAt: string
  status: 'PENDING' | 'REVIEWED' | 'SHORTLISTED' | 'INTERVIEW_SCHEDULED' | 'SELECTED' | 'REJECTED' | 'WITHDRAWN'
  job: Job
  clientNotes?: string
  shortlistedAt?: string
  interviewDate?: string
}

interface ApplicationStats {
  total: number
  pending: number
  shortlisted: number
  accepted: number
  completed: number
  rejected: number
  totalEarnings: number
}

export function TaskerDashboard() {
  const { user } = useAuth()
  
  // Translation hooks
  const tDashboard = useTranslations('dashboard')
  const tErrors = useTranslations('errors')
  
  const [applications, setApplications] = useState<JobApplication[]>([])
  const [savedJobs, setSavedJobs] = useState<Job[]>([])
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([])
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set())
  const [shortlistedApplications, setShortlistedApplications] = useState<JobApplication[]>([])
  const [stats, setStats] = useState<ApplicationStats>({
    total: 0,
    pending: 0,
    shortlisted: 0,
    accepted: 0,
    completed: 0,
    rejected: 0,
    totalEarnings: 0
  })
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const fetchTaskerData = async () => {
      if (!user) return
      
      try {
        // Fetch all data in parallel
        const [applicationsResponse, savedResponse, recommendedResponse] = await Promise.all([
          fetch('/api/tasker/applications', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          }),
          fetch(`/api/user/saved-jobs?userId=${user.id}`),
          fetch('/api/jobs/recommended')
        ])
        
        // Handle applications data
        if (applicationsResponse.ok) {
          const applicationsData = await applicationsResponse.json()
          setApplications(applicationsData || [])
          
          // Filter shortlisted applications
          const shortlisted = (applicationsData || []).filter((app: JobApplication) => 
            app.status === 'SHORTLISTED' || app.status === 'INTERVIEW_SCHEDULED'
          )
          setShortlistedApplications(shortlisted)
          
          // TODO: Add notification for new shortlisted applications when notification store is available
          // const newShortlisted = shortlisted.filter((app: JobApplication) => 
          //   !shortlistedApplications.some(existing => existing.id === app.id)
          // )
          
          // newShortlisted.forEach((app: JobApplication) => {
          //   addNotification({
          //     type: 'success',
          //     title: 'You\'ve been shortlisted!',
          //     message: `Great news! You've been shortlisted for "${app.job.title}" at ${app.job.company}`,
          //     action: {
          //       label: 'View Details',
          //       onClick: () => router.push(`/jobs/${app.job.id}`)
          //     }
          //   })
          // })
          
          // Calculate stats from applications
          const apps = applicationsData || []
          
          // Calculate total earnings from completed jobs
          const completedApps = apps.filter((app: JobApplication) => app.status === 'SELECTED')
          const totalEarnings = completedApps.reduce((sum: number, app: JobApplication) => {
            // Extract salary from completed job applications
            if (app.job.salaryMin && app.job.salaryMax) {
              // Use average of min and max salary
              return sum + (app.job.salaryMin + app.job.salaryMax) / 2
            } else if (app.job.salaryMin) {
              return sum + app.job.salaryMin
            }
            return sum
          }, 0)
          
          const newStats: ApplicationStats = {
            total: apps.length,
            pending: apps.filter((app: JobApplication) => app.status === 'PENDING').length,
            shortlisted: apps.filter((app: JobApplication) => app.status === 'SHORTLISTED' || app.status === 'INTERVIEW_SCHEDULED').length,
            accepted: apps.filter((app: JobApplication) => ['SHORTLISTED', 'INTERVIEW_SCHEDULED', 'SELECTED'].includes(app.status)).length,
            completed: apps.filter((app: JobApplication) => app.status === 'SELECTED').length,
            rejected: apps.filter((app: JobApplication) => app.status === 'REJECTED').length,
            totalEarnings: Math.round(totalEarnings)
          }
          setStats(newStats)
        }

        // Handle saved jobs data
        if (savedResponse.ok) {
          const savedData = await savedResponse.json()
          const jobs = savedData.savedJobs || []
          setSavedJobs(jobs)
          // Create a set of saved job IDs for quick lookup
          setSavedJobIds(new Set(jobs.map((job: Job) => job.id)))
        }

        // Handle recommended jobs data
        if (recommendedResponse.ok) {
          const recommendedData = await recommendedResponse.json()
          setRecommendedJobs(recommendedData.jobs || [])
        }

      } catch (error) {
        console.error('Error fetching tasker data:', error)
        toast.error(tErrors('failedToLoad.dashboardData'))
      } finally {
        setLoading(false)
      }
    }
    
    fetchTaskerData()
  }, [user, tErrors])

  // Handle job save/unsave
  const handleJobSaveToggle = async (jobId: string, isSaved: boolean) => {
    if (isSaved) {
      // Add to saved jobs
      setSavedJobIds(prev => new Set([...prev, jobId]))
      // Optionally refresh saved jobs list to get full job data
      try {
        const response = await fetch(`/api/user/saved-jobs?userId=${user?.id}`)
        if (response.ok) {
          const savedData = await response.json()
          setSavedJobs(savedData.savedJobs || [])
        }
      } catch (error) {
        console.error('Error refreshing saved jobs:', error)
      }
    } else {
      // Remove from saved jobs
      setSavedJobIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(jobId)
        return newSet
      })
      setSavedJobs(prev => prev.filter(job => job.id !== jobId))
    }
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout userRole="tasker" userName={user?.name}>
      {/* Quick Stats - collapsed on mobile */}
      <div className="hidden md:block mb-8">
        <TaskerQuickStats stats={stats} />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Mobile: Quick Actions first, then content */}
        <div className="lg:col-span-2">
          {/* Quick Actions - prioritized for mobile */}
          <div className="block lg:hidden mb-8">
            <TaskerQuickActions />
          </div>
          
          {/* Applied Jobs - first/second on mobile */}
          <div className="mb-8">
            <AppliedJobsSection applications={applications.slice(0, 5)} />
          </div>
          
          {/* Shortlisted Jobs - second/third on mobile */}
          {shortlistedApplications.length > 0 && (
            <div className="mb-8">
              <div className="bg-card border rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                    <Star className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">{tDashboard('tasker.shortlisted.title')}</h2>
                    <p className="text-sm text-muted-foreground">
                      {tDashboard('tasker.shortlisted.employersInterested', { count: shortlistedApplications.length })}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  {shortlistedApplications.slice(0, 2).map((application) => (
                    <div key={application.id} className="border rounded-lg p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border-yellow-200 dark:border-yellow-800">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                            {application.job.title}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 font-medium">
                            {application.job.company}
                          </p>
                        </div>
                        <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                          {tDashboard('tasker.stats.shortlisted')}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Recommended Jobs - third/fourth on mobile */}
          <div className="mb-8">
            <RecommendedJobsSection 
              recommendedJobs={recommendedJobs.slice(0, 3)} 
              savedJobIds={savedJobIds}
              onSaveToggle={handleJobSaveToggle}
            />
          </div>
          
          {/* Saved Jobs - fourth on mobile */}
          <div>
            <SavedJobsSection 
              savedJobs={savedJobs.slice(0, 3)} 
              onSaveToggle={handleJobSaveToggle}
            />
          </div>
        </div>
        
        {/* Right Column - Quick Actions & Connections for desktop */}
        <div className="hidden lg:block space-y-8">
          <TaskerQuickActions />
          
          {/* Connections */}
          <ConnectionsSection />
        </div>
      </div>
    </DashboardLayout>
  )
}