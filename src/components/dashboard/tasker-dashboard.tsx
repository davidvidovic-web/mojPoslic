'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Job } from '@/types/job'
import { ConnectionsSection } from '@/components/dashboard/connections-section'
import { TaskerStatsCards } from './tasker/tasker-stats-cards'
import { ApplicationsSection } from './tasker/applications-section'
import { SavedJobsSection } from './tasker/saved-jobs-section'
import { RecommendedJobsSection } from './tasker/recommended-jobs-section'
import { FinancesSection } from './tasker/finances-section'
import { MessagesSection } from './tasker/messages-section'
import { formatDisplayName, getTimeBasedGreetingWithIcon } from '@/lib/utils'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DashboardFooter } from '@/components/core/dashboard-footer'
import { Sunrise, Sun, Moon } from 'lucide-react'

interface JobApplication {
  id: string
  job_id: string
  applied_at: string
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected' | 'completed'
  job: Job
}

interface ApplicationStats {
  total: number
  pending: number
  accepted: number
  completed: number
  rejected: number
  totalEarnings: number
}

export function TaskerDashboard() {
  const { user } = useAuth()
  const [applications, setApplications] = useState<JobApplication[]>([])
  const [stats, setStats] = useState<ApplicationStats>({
    total: 0,
    pending: 0,
    accepted: 0,
    completed: 0,
    rejected: 0,
    totalEarnings: 0
  })
  const [savedJobs, setSavedJobs] = useState<Job[]>([])
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)

  // Get time-based greeting with icon
  const { greeting, iconName } = getTimeBasedGreetingWithIcon()
  
  // Helper to render the appropriate icon
  const renderTimeIcon = () => {
    const iconProps = { className: "h-4 w-4" }
    switch (iconName) {
      case 'Sunrise':
        return <Sunrise {...iconProps} />
      case 'Sun':
        return <Sun {...iconProps} />
      case 'Moon':
        return <Moon {...iconProps} />
      default:
        return <Sun {...iconProps} />
    }
  }

  useEffect(() => {
    const fetchApplications = async () => {
      if (!user) return

      try {
        // Fetch job applications and stats from Prisma API
        const response = await fetch(`/api/user/applications?userId=${user.id}`)
        if (response.ok) {
          const data = await response.json()
          setApplications(data.applications || [])
          setStats(data.stats || {
            total: 0,
            pending: 0,
            accepted: 0,
            completed: 0,
            rejected: 0,
            totalEarnings: 0
          })
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
      if (!user) {
        setLoading(false)
        return
      }

      try {
        // Set a timeout to prevent infinite loading
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Request timeout')), 10000)
        )

        await Promise.race([
          Promise.allSettled([
            fetchApplications(),
            fetchSavedJobs(),
            fetchRecommendedJobs()
          ]),
          timeoutPromise
        ])
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        setLoading(false)
      }
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
    <div className="min-h-screen bg-background flex flex-col">
      <div className="container mx-auto px-4 py-8 flex-1">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 rounded-lg p-6 border border-emerald-100 dark:border-emerald-900/30">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800">
                <svg className="h-6 w-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v2a2 2 0 01-2 2H10a2 2 0 01-2-2V6m8 0V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">
                  Tasker Dashboard
                </h1>
                <p className="text-emerald-600 dark:text-emerald-300 mt-1 flex items-center gap-2">
                  <span className="font-bold">{formatDisplayName(user?.name || undefined)}</span>
                  {renderTimeIcon()}
                  <span>{greeting}! Ready to find your next opportunity?</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-emerald-600 dark:text-emerald-300">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Available for Work</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Profile Complete</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content with Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800">
            <TabsTrigger value="overview" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">Overview</TabsTrigger>
            <TabsTrigger value="messages" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">Messages</TabsTrigger>
            <TabsTrigger value="statistics" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">Statistics</TabsTrigger>
            <TabsTrigger value="finances" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white disabled:opacity-50" disabled>
              <div className="flex items-center gap-1">
                Finances
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </TabsTrigger>
            <TabsTrigger value="advanced-stats" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white disabled:opacity-50" disabled>
              <div className="flex items-center gap-1">
                Analytics
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </TabsTrigger>
            <TabsTrigger value="integrations" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white disabled:opacity-50" disabled>
              <div className="flex items-center gap-1">
                Integrations
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Applications and Jobs */}
              <div className="lg:col-span-2 space-y-8">
                {/* Applications Section */}
                <ApplicationsSection applications={applications} />
                
                {/* Saved Jobs Section */}
                <SavedJobsSection savedJobs={savedJobs} />
                
                {/* Recommended Jobs */}
                <RecommendedJobsSection recommendedJobs={recommendedJobs} />
              </div>

              {/* Right Column - Connections */}
              <div className="space-y-8">
                {/* Connections Section */}
                <ConnectionsSection />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="finances">
            <FinancesSection />
          </TabsContent>

          <TabsContent value="messages">
            <MessagesSection />
          </TabsContent>

          <TabsContent value="statistics">
            <TaskerStatsCards 
              applications={applications} 
              completedJobs={stats.completed}
              totalEarnings={stats.totalEarnings}
            />
          </TabsContent>

          <TabsContent value="advanced-stats">
            <div className="space-y-6">
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mx-auto mb-4">
                    <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-muted-foreground mb-2">Advanced Analytics Coming Soon</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Detailed performance metrics, earnings analytics, and career insights will be available in a future update.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="integrations">
            <div className="space-y-6">
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mx-auto mb-4">
                    <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a1 1 0 01-1-1V9a1 1 0 011-1h1a2 2 0 100-4H4a1 1 0 01-1-1V4a1 1 0 011-1h3a1 1 0 011 1v1a2 2 0 104 0V4z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-muted-foreground mb-2">Integrations Coming Soon</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Connect with tools like Google Calendar, LinkedIn, portfolio platforms, and time tracking apps to enhance your workflow.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer */}
      <DashboardFooter />
    </div>
  )
}
