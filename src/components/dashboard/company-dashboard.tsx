'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Job } from '@/types/job'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { MultiStepJobForm } from '@/components/jobs/job-post-form/multi-step-job-form'
import { ConnectionsSection } from '@/components/dashboard/connections-section'
import { JobsListSection } from './company/jobs-list-section'
import { ClientMessagesSection } from './company/messages-section'
import { ClientQuickStats } from './company/client-quick-stats'
import { ClientQuickActions } from './company/client-quick-actions'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
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

// Helper function to get full name display
const getFullNameDisplay = (name?: string | null): string => {
  if (!name || typeof name !== 'string') {
    return ''
  }
  return name.trim()
}

export function CompanyDashboard() {
  const { user } = useAuth()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingJob, setEditingJob] = useState<Job | null>(null)
  const [jobApplicationCounts, setJobApplicationCounts] = useState<Record<string, number>>({})
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
    const fetchMyJobs = async () => {
      if (!user) return

      try {
        const response = await fetch('/api/jobs/my-jobs', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        setJobs(data || [])
        
        // Fetch application counts for each job
        if (data && Array.isArray(data)) {
          const counts: Record<string, number> = {}
          await Promise.all(
            data.map(async (job: Job) => {
              try {
                const appResponse = await fetch(`/api/jobs/${job.id}/applications`)
                if (appResponse.ok) {
                  const appData = await appResponse.json()
                  counts[job.id] = appData.applicationCount || 0
                }
              } catch (error) {
                console.error(`Error fetching applications for job ${job.id}:`, error)
                counts[job.id] = 0
              }
            })
          )
          setJobApplicationCounts(counts)
        }
      } catch (error) {
        console.error('Error fetching jobs:', {
          error,
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined
        })
        toast.error('Failed to load your jobs')
      } finally {
        setLoading(false)
      }
    }

    fetchMyJobs()
  }, [user])

  const handleJobPosted = () => {
    setIsDialogOpen(false)
    // Re-fetch jobs when a new job is posted
    const refetchJobs = async () => {
      if (!user) return
      try {
        const response = await fetch('/api/jobs/my-jobs')
        if (response.ok) {
          const data = await response.json()
          setJobs(data || [])
        }
      } catch (error) {
        console.error('Error refetching jobs after posting:', error)
      }
    }
    refetchJobs()
    
    // Force refresh of connections section to show updated count
    // Add a small delay to ensure backend transaction is complete
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('refresh-connections'))
      window.dispatchEvent(new CustomEvent('refresh-job-cost'))
    }, 500)
    
    // Note: Success toast is handled in the form component now
  }

  const handleEditJob = (job: Job) => {
    setEditingJob(job)
    setIsEditDialogOpen(true)
  }

  const handleEditComplete = () => {
    setIsEditDialogOpen(false)
    setEditingJob(null)
    // Refresh jobs list
    const fetchJobs = async () => {
      if (!user) return
      try {
        const response = await fetch('/api/jobs/my-jobs')
        if (response.ok) {
          const data = await response.json()
          setJobs(data || [])
        }
      } catch (error) {
        console.error('Error refreshing jobs:', error)
      }
    }
    fetchJobs()
  }

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job posting?')) return

    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      setJobs(jobs.filter(job => job.id !== jobId))
      toast.success('Job deleted successfully')
    } catch (error) {
      console.error('Error deleting job:', error)
      toast.error('Failed to delete job')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading your jobs...</p>
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
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-lg p-6 border border-blue-100 dark:border-blue-900/30">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-800">
                <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v2a2 2 0 01-2 2H10a2 2 0 01-2-2V6m8 0V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="space-y-2">
                  {/* Greeting message */}
                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-300">
                    {renderTimeIcon()}
                    <span className="text-lg font-medium">{greeting}, {user?.name?.split(' ')[0] || 'there'}!</span>
                  </div>
                  
                  {/* Full name - bold and prominent */}
                  <h1 className="text-xl sm:text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {getFullNameDisplay(user?.name)}
                  </h1>
                  
                  {/* Role-appropriate tagline */}
                  <p className="text-sm text-blue-600 dark:text-blue-300">
                    Scaling your business with top-tier talent
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-sm text-blue-600 dark:text-blue-300">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>Hiring Mode Active</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Quick Post & Hire</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content with Dropdown Navigation */}
        <div className="space-y-6">
          {/* Section Selector */}
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center gap-4">
              <label htmlFor="section-select" className="text-sm font-medium text-blue-900 dark:text-blue-100">
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
                <ClientQuickStats 
                  jobs={jobs}
                  applicationCounts={jobApplicationCounts}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Mobile: Quick Actions first, then Jobs */}
                <div className="lg:col-span-2 space-y-8">
                  {/* Quick Actions - prioritized for mobile */}
                  <div className="block lg:hidden">
                    <ClientQuickActions 
                      onPostNewJob={() => setIsDialogOpen(true)}
                    />
                  </div>
                  
                  {/* Jobs List - second on mobile */}
                  <JobsListSection 
                    jobs={jobs}
                    applicationCounts={jobApplicationCounts}
                    onEdit={handleEditJob}
                    onDelete={handleDeleteJob}
                    onPostNewJob={() => setIsDialogOpen(true)}
                  />
                </div>

                {/* Right Column - Quick Actions & Connections for desktop */}
                <div className="hidden lg:block space-y-8">
                  <ClientQuickActions 
                    onPostNewJob={() => setIsDialogOpen(true)}
                  />
                  
                  {/* Connections */}
                  <ConnectionsSection />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'jobs' && (
            <div className="space-y-6">
              {/* Quick Actions - first on mobile */}
              <div className="block lg:hidden">
                <ClientQuickActions 
                  onPostNewJob={() => setIsDialogOpen(true)}
                />
              </div>
              
              {/* Jobs List - second on mobile */}
              <JobsListSection 
                jobs={jobs}
                applicationCounts={jobApplicationCounts}
                onEdit={handleEditJob}
                onDelete={handleDeleteJob}
                onPostNewJob={() => setIsDialogOpen(true)}
              />
            </div>
          )}

          {activeTab === 'messages' && (
            <ClientMessagesSection />
          )}

          {activeTab === 'connections' && (
            <div className="space-y-6">
              <ConnectionsSection />
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
                    Advanced analytics, performance insights, and detailed reporting will be available in a future update.
                  </p>
                </div>
              </div>
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
                    Payment processing, invoicing, and financial analytics will be available in a future update.
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
                    Connect with popular tools like Slack, Calendar apps, CRM systems, and more to streamline your hiring workflow.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Post New Job Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="hidden">
              Post Job
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Post a New Job</DialogTitle>
            </DialogHeader>
            <MultiStepJobForm onJobPosted={handleJobPosted} />
          </DialogContent>
        </Dialog>

        {/* Edit Job Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="hidden">
              Edit Job
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Job Posting</DialogTitle>
            </DialogHeader>
            {editingJob && (
              <MultiStepJobForm 
                initialData={{
                  title: editingJob.title,
                  description: editingJob.description,
                  type: editingJob.type,
                  city_id: editingJob.city_id,
                  category_id: editingJob.category_id || '',
                  salary: editingJob.salary || '',
                  salaryType: editingJob.salaryType,
                  salaryMin: editingJob.salaryMin,
                  salaryMax: editingJob.salaryMax,
                  website: editingJob.website || '',
                  email: editingJob.email,
                  contact_email: editingJob.email,
                  application_url: editingJob.website || '',
                  start_date: editingJob.start_date,
                  job_address: editingJob.job_address,
                  job_latitude: editingJob.job_latitude,
                  job_longitude: editingJob.job_longitude,
                  tags: editingJob.tags 
                    ? (Array.isArray(editingJob.tags) 
                        ? editingJob.tags 
                        : (editingJob.tags as string).split(',').filter(Boolean))
                    : []
                }}
                isEditMode={true}
                jobId={editingJob.id}
                onJobPosted={handleEditComplete}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Footer */}
      <DashboardFooter />
    </div>
  )
}
