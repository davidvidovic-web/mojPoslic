'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useTranslations } from 'next-intl'
import { Job } from '@/types/job'
import { TaskerApplicationManager } from './tasker/tasker-application-manager'
import { TaskerQuickStats } from './tasker/tasker-quick-stats'
import { ConnectionsWidget } from './connections/connections-widget'
import { ConnectionsFullHistory } from './connections/connections-full-history'
import { MessagingDialog } from './messaging/messaging-dialog'
import { DashboardLayout } from './dashboard-layout'
import { JobCompletionCard } from './job-completion-card'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Star, Briefcase, History } from 'lucide-react'
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

interface JobAssignment {
  assignmentId: string
  jobId: string
  title: string
  company?: string
  contractStatus: string
  assignedAt: string
  client: {
    id: string
    name: string
    email: string
  }
  agreedSalary?: number
}

export function TaskerDashboard() {
  const { user } = useAuth()
  
  // Translation hooks
  const tDashboard = useTranslations('dashboard')
  const tErrors = useTranslations('errors')
  
  const [shortlistedApplications, setShortlistedApplications] = useState<JobApplication[]>([])
  const [activeJobs, setActiveJobs] = useState<JobAssignment[]>([])
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
        // Fetch applications data
        const applicationsResponse = await fetch('/api/tasker/applications', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        })
        
        // Fetch active job assignments
        const activeJobsResponse = await fetch('/api/tasker/active-jobs', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        })
        
        // Handle applications data
        if (applicationsResponse.ok) {
          const applicationsData = await applicationsResponse.json()
          
          // Filter shortlisted applications
          const shortlisted = (applicationsData || []).filter((app: JobApplication) => 
            app.status === 'SHORTLISTED' || app.status === 'INTERVIEW_SCHEDULED'
          )
          setShortlistedApplications(shortlisted)
          
          // Calculate stats from applications
          const apps = applicationsData || []
          
          // Note: Don't count SELECTED applications as completed - they are just accepted
          // Completed jobs should be counted from JobAssignments with COMPLETED status
          const totalEarnings = 0 // TODO: Calculate from actually completed job assignments
          
          const newStats: ApplicationStats = {
            total: apps.length,
            pending: apps.filter((app: JobApplication) => app.status === 'PENDING').length,
            shortlisted: apps.filter((app: JobApplication) => app.status === 'SHORTLISTED' || app.status === 'INTERVIEW_SCHEDULED').length,
            accepted: apps.filter((app: JobApplication) => app.status === 'SELECTED').length, // This is now "accepted" not "completed"
            completed: 0, // TODO: Get from completed job assignments API
            rejected: apps.filter((app: JobApplication) => app.status === 'REJECTED').length,
            totalEarnings: Math.round(totalEarnings)
          }
          setStats(newStats)
        }
        
        // Handle active jobs data
        if (activeJobsResponse.ok) {
          const activeJobsData = await activeJobsResponse.json()
          setActiveJobs(activeJobsData.activeJobs || [])
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

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{tDashboard('loading.tasker')}</p>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout 
      userRole="tasker" 
      userName={user?.name}
      sidebar={
        <div className="space-y-6">
          {/* Messages Section - Prominent and First */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-[calc(var(--radius)*1.5)] p-6 border border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-[calc(var(--radius)*1.5)] bg-green-500 flex items-center justify-center">
                  <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">Messages</h3>
              </div>
              <MessagingDialog />
            </div>
            <p className="text-sm text-green-700 dark:text-green-300 leading-relaxed">
              Communicate with clients and manage your conversations in real-time.
            </p>
          </div>
          
          {/* Connections Widget */}
          <ConnectionsWidget />
        </div>
      }
    >
      {/* Quick Stats - collapsed on mobile */}
      <div className="hidden md:block mb-8">
        <TaskerQuickStats stats={stats} />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Mobile: Content */}
        <div className="lg:col-span-2">
          
          {/* Active Jobs - Jobs in progress that can be marked complete */}
          {activeJobs.length > 0 && (
            <div className="mb-8">
              <div className="bg-card border rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <Briefcase className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">Active Jobs</h2>
                    <p className="text-sm text-muted-foreground">
                      You have {activeJobs.length} job{activeJobs.length !== 1 ? 's' : ''} in progress
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  {activeJobs.map((job) => (
                    <JobCompletionCard
                      key={job.assignmentId}
                      jobAssignment={{
                        id: job.assignmentId,
                        contractStatus: job.contractStatus,
                        job: {
                          id: job.jobId,
                          title: job.title,
                          company: job.company,
                          postedBy: {
                            id: job.client.id,
                            name: job.client.name,
                            email: job.client.email
                          }
                        },
                        selectedApplication: {
                          user: {
                            id: job.client.id,
                            name: job.client.name,
                            email: job.client.email
                          }
                        }
                      }}
                      userRole="tasker"
                      onUpdate={() => {
                        // Refresh data when job is updated
                        window.location.reload()
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Applied Jobs - first/second on mobile */}
          <div className="mb-8">
            <Card>
              <CardContent className="p-6">
                <TaskerApplicationManager 
                  showOnlyHistorical={false}
                  title="Recent Applications"
                  description="Your latest job applications and their status"
                />
              </CardContent>
            </Card>
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
          
          {/* Connections History Section */}
          <div className="mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-[calc(var(--radius)*1.5)] bg-gradient-to-br from-purple-500/10 to-purple-600/20 flex items-center justify-center">
                    <History className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {tDashboard('connections.fullHistory') || 'Connection History'}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      View your complete connections transaction history
                    </p>
                  </div>
                </div>
                <ConnectionsFullHistory />
              </CardContent>
            </Card>
          </div>
        </div>
        
      </div>
    </DashboardLayout>
  )
}