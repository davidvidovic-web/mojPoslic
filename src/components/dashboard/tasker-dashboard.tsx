'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { Job } from '@/types/job'
import { AppliedJobsSection } from './tasker/applied-jobs-section'
import { TaskerQuickStats } from './tasker/tasker-quick-stats'
import { TaskerQuickActions } from './tasker/tasker-quick-actions'
import { SavedJobsSection } from './tasker/saved-jobs-section'
import { RecommendedJobsSection } from './tasker/recommended-jobs-section'
import { UnifiedJobsSection } from './tasker/unified-jobs-section'
import { ConnectionsSection } from './connections-section'
import { getTimeBasedGreetingWithIcon } from '@/lib/localized-greetings'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  Sunrise, 
  Sun, 
  Moon,
  LayoutDashboard,
  Briefcase,
  MessageSquare,
  Star,
  Zap
} from 'lucide-react'
import { toast } from 'sonner'

// Helper function to get full name display
const getFullNameDisplay = (name?: string | null): string => {
  if (!name || typeof name !== 'string') {
    return ''
  }
  return name.trim()
}

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
  const router = useRouter()
  
  // Translation hooks
  const tGreetings = useTranslations('greetings')
  const tNavigation = useTranslations('navigation.main')
  const tDashboard = useTranslations('dashboard')
  
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

  // Determine active section from URL
  const getActiveSection = () => {
    const urlParams = new URLSearchParams(window.location.search)
    const tab = urlParams.get('tab')
    return tab === 'jobs' ? 'jobs' : 'overview'
  }

  const activeTab = getActiveSection()

  // Navigate to section
  const navigateToSection = (section: string) => {
    switch (section) {
      case 'overview':
        router.push('/dashboard')
        break
      case 'jobs':
        router.push('/dashboard/jobs')
        break
      case 'messages':
        router.push('/dashboard/messages')
        break
      case 'connections':
        router.push('/connections')
        break
    }
  }
  
  // Get time-based greeting with icon
  const { greetingKey, iconName } = getTimeBasedGreetingWithIcon()
  const greeting = tGreetings(greetingKey)
  
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
          const newStats: ApplicationStats = {
            total: apps.length,
            pending: apps.filter((app: JobApplication) => app.status === 'PENDING').length,
            shortlisted: apps.filter((app: JobApplication) => app.status === 'SHORTLISTED' || app.status === 'INTERVIEW_SCHEDULED').length,
            accepted: apps.filter((app: JobApplication) => ['SHORTLISTED', 'INTERVIEW_SCHEDULED', 'SELECTED'].includes(app.status)).length,
            completed: apps.filter((app: JobApplication) => app.status === 'SELECTED').length,
            rejected: apps.filter((app: JobApplication) => app.status === 'REJECTED').length,
            totalEarnings: 0 // TODO: Calculate from completed jobs
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
        toast.error('Failed to load your dashboard data')
      } finally {
        setLoading(false)
      }
    }
    
    fetchTaskerData()
  }, [user, router])

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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
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
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-3">
              <div className="flex-1">
                <div className="space-y-2">
                  {/* Greeting message */}
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-300">
                    {renderTimeIcon()}
                    <span className="text-lg font-medium">{greeting}</span>
                  </div>
                  
                  {/* Full name - bold and prominent */}
                  <h1 className="text-xl sm:text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                    {getFullNameDisplay(user?.name)}
                  </h1>
                  
                  {/* Role-appropriate tagline */}
                  <p className="text-sm text-emerald-600 dark:text-emerald-300">
                    {tDashboard('taglines.tasker')}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-sm text-emerald-600 dark:text-emerald-300">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                <span>Job Seeking Active</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Quick Apply & Track</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content with Responsive Navigation */}
        <div className="space-y-6">
          {/* Section Selector - Dropdown on mobile, Tabs on tablet+ */}
          <div className="block md:hidden">
            <div className="bg-card border rounded-lg p-4">
              <div className="flex items-center gap-4">
                <label htmlFor="section-select" className="text-sm font-medium text-foreground whitespace-nowrap">
                  View Section:
                </label>
                <Select value={activeTab} onValueChange={navigateToSection}>
                  <SelectTrigger className="flex-1" id="section-select">
                    <SelectValue placeholder="Select a section" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="overview">
                      <div className="flex items-center gap-2">
                        <LayoutDashboard className="h-4 w-4 text-blue-600" />
                        Overview
                      </div>
                    </SelectItem>
                    <SelectItem value="jobs">
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-green-600" />
                        Jobs & Applications
                      </div>
                    </SelectItem>
                    <SelectItem value="messages">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-purple-600" />
                        Messages
                      </div>
                    </SelectItem>
                    <SelectItem value="connections">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-yellow-600" />
                        Connections
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Tabs for tablet and desktop */}
          <div className="hidden md:block">
            <Tabs value={activeTab} onValueChange={navigateToSection} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <LayoutDashboard className="h-4 w-4 text-blue-600" />
                  <span>Overview</span>
                </TabsTrigger>
                <TabsTrigger value="jobs" className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-green-600" />
                  <span>Jobs & Applications</span>
                </TabsTrigger>
                <TabsTrigger value="messages" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-purple-600" />
                  <span>Messages</span>
                </TabsTrigger>
                <TabsTrigger value="connections" className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-600" />
                  <span>Connections</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Content based on selected section */}
          {activeTab === 'overview' && (
            <div>
              {/* Quick Stats - collapsed on mobile */}
              <div className="hidden md:block">
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
                            <h2 className="text-lg font-semibold text-foreground">Shortlisted Opportunities</h2>
                            <p className="text-sm text-muted-foreground">
                              {shortlistedApplications.length} employer{shortlistedApplications.length > 1 ? 's' : ''} interested
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
                                  Shortlisted
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
            </div>
          )}

          {activeTab === 'jobs' && (
            <div className="space-y-6">
              <UnifiedJobsSection 
                applications={applications}
                shortlistedApplications={shortlistedApplications}
                savedJobs={savedJobs}
                recommendedJobs={recommendedJobs}
                savedJobIds={savedJobIds}
                onSaveToggle={handleJobSaveToggle}
                loading={loading}
              />
            </div>
          )}

        </div>
      </div>
    </div>
  )
}