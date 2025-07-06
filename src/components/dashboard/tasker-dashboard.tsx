'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Job } from '@/types/job'
import { ApplicationsSection } from './tasker/applications-section'
import { TaskerQuickStats } from './tasker/tasker-quick-stats'
import { TaskerQuickActions } from './tasker/tasker-quick-actions'
import { SavedJobsSection } from './tasker/saved-jobs-section'
import { RecommendedJobsSection } from './tasker/recommended-jobs-section'
import { TaskerMessagesSection } from './tasker/messages-section'
import { ConnectionsSection } from './connections-section'
import { getTimeBasedGreetingWithIcon } from '@/lib/utils'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DashboardFooter } from '@/components/core/dashboard-footer'
import { 
  Sunrise, 
  Sun, 
  Moon,
  LayoutDashboard,
  Briefcase,
  MessageSquare,
  Zap,
  DollarSign,
  BarChart3,
  Puzzle,
  Lock
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
  const [savedJobs, setSavedJobs] = useState<Job[]>([])
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([])
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set())
  const [stats, setStats] = useState<ApplicationStats>({
    total: 0,
    pending: 0,
    accepted: 0,
    completed: 0,
    rejected: 0,
    totalEarnings: 0
  })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  
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
          
          // Calculate stats from applications
          const apps = applicationsData || []
          const newStats: ApplicationStats = {
            total: apps.length,
            pending: apps.filter((app: JobApplication) => app.status === 'pending').length,
            accepted: apps.filter((app: JobApplication) => app.status === 'accepted').length,
            completed: apps.filter((app: JobApplication) => app.status === 'completed').length,
            rejected: apps.filter((app: JobApplication) => app.status === 'rejected').length,
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
  }, [user])

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
                    Ready to find your next opportunity and grow your skills
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

        {/* Main Content with Dropdown Navigation */}
        <div className="space-y-6">
          {/* Section Selector */}
          <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
            <div className="flex items-center gap-4">
              <label htmlFor="section-select" className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
                View Section:
              </label>
              <Select value={activeTab} onValueChange={setActiveTab}>
                <SelectTrigger className="w-[200px]" id="section-select">
                  <SelectValue placeholder="Select a section" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overview">
                    <div className="flex items-center gap-2">
                      <LayoutDashboard className="h-4 w-4" />
                      Overview
                    </div>
                  </SelectItem>
                  <SelectItem value="jobs">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      Jobs
                    </div>
                  </SelectItem>
                  <SelectItem value="messages">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Messages
                    </div>
                  </SelectItem>
                  <SelectItem value="connections">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      Connections
                    </div>
                  </SelectItem>
                  <SelectItem value="finances" disabled>
                    <div className="flex items-center gap-2 opacity-50">
                      <DollarSign className="h-4 w-4" />
                      Finances
                      <Lock className="h-3 w-3 ml-1" />
                    </div>
                  </SelectItem>
                  <SelectItem value="analytics" disabled>
                    <div className="flex items-center gap-2 opacity-50">
                      <BarChart3 className="h-4 w-4" />
                      Analytics
                      <Lock className="h-3 w-3 ml-1" />
                    </div>
                  </SelectItem>
                  <SelectItem value="integrations" disabled>
                    <div className="flex items-center gap-2 opacity-50">
                      <Puzzle className="h-4 w-4" />
                      Integrations
                      <Lock className="h-3 w-3 ml-1" />
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
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
                <div className="lg:col-span-2 space-y-8">
                  {/* Quick Actions - prioritized for mobile */}
                  <div className="block lg:hidden">
                    <TaskerQuickActions />
                  </div>
                  
                  {/* Applications - second on mobile */}
                  <ApplicationsSection applications={applications.slice(0, 5)} />
                  
                  {/* Recommended Jobs - third on mobile */}
                  <RecommendedJobsSection 
                    recommendedJobs={recommendedJobs.slice(0, 3)} 
                    savedJobIds={savedJobIds}
                    onSaveToggle={handleJobSaveToggle}
                  />
                  
                  {/* Saved Jobs - fourth on mobile */}
                  <SavedJobsSection 
                    savedJobs={savedJobs.slice(0, 3)} 
                    onSaveToggle={handleJobSaveToggle}
                  />
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Mobile: Quick Actions first, then Jobs */}
              <div className="lg:col-span-2 space-y-8">
                {/* Quick Actions - prioritized for mobile */}
                <div className="block lg:hidden">
                  <TaskerQuickActions />
                </div>
                
                {/* Applications - second on mobile */}
                <ApplicationsSection applications={applications} />
                
                {/* Recommended Jobs - third on mobile */}
                <RecommendedJobsSection 
                  recommendedJobs={recommendedJobs} 
                  savedJobIds={savedJobIds}
                  onSaveToggle={handleJobSaveToggle}
                />
                
                {/* Saved Jobs - fourth on mobile */}
                <SavedJobsSection 
                  savedJobs={savedJobs} 
                  onSaveToggle={handleJobSaveToggle}
                />
              </div>

              {/* Right Column - Quick Actions & Connections for desktop */}
              <div className="hidden lg:block space-y-8">
                <TaskerQuickActions />
                
                {/* Connections */}
                <ConnectionsSection />
              </div>
            </div>
          )}

          {activeTab === 'messages' && (
            <TaskerMessagesSection />
          )}

          {activeTab === 'connections' && (
            <div className="space-y-6">
              <ConnectionsSection />
            </div>
          )}

          {activeTab === 'finances' && (
            <div className="space-y-6">
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mx-auto mb-4">
                    <DollarSign className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-muted-foreground mb-2">Finances Coming Soon</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Earnings tracking, payment history, and tax documents will be available in a future update.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mx-auto mb-4">
                    <BarChart3 className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-muted-foreground mb-2">Analytics Coming Soon</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Performance insights, application success rates, and detailed reporting will be available in a future update.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className="space-y-6">
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mx-auto mb-4">
                    <Puzzle className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-muted-foreground mb-2">Integrations Coming Soon</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Connect with calendar apps, portfolio platforms, and productivity tools to streamline your workflow.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <DashboardFooter />
    </div>
  )
}