'use client'

import { useAuth } from '@/contexts/auth-context'
import { useUserJobs, useDeleteJob } from '@/hooks/use-jobs'
import { useDialogStore } from '@/stores/dialog-store'
import { useRouter } from 'next/navigation'
import { Job } from '@/types/job'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { MultiStepJobForm } from '@/components/jobs/job-post-form/multi-step-job-form'
import { ConnectionsSection } from '@/components/dashboard/connections-section'
import { JobsListSection } from './client/jobs-list-section'
import { ClientQuickStats } from './client/client-quick-stats'
import { ClientQuickActions } from './client/client-quick-actions'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { getTimeBasedGreetingWithIcon } from '@/lib/utils'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
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
  const router = useRouter()
  
  // TanStack Query hooks for job data
  const { data: jobs = [], isLoading } = useUserJobs(user?.id || '')
  const deleteJobMutation = useDeleteJob()
  
  // Zustand stores for UI state
  const { 
    isJobPostDialogOpen, 
    openJobPostDialog, 
    closeJobPostDialog,
    isEditJobDialogOpen,
    openEditJobDialog,
    closeEditJobDialog,
    editingJob
  } = useDialogStore()
  
  // Application counts are now handled by TanStack Query in useUserJobs hook
  const applicationCounts = jobs.reduce((acc, job) => {
    // Mock application counts for now - this should be part of the job data from the API
    acc[job.id] = 0 // This will be replaced when the API includes application counts
    return acc
  }, {} as Record<string, number>)
  
  // Get active section from URL
  const getActiveSection = () => {
    const urlParams = new URLSearchParams(window.location.search)
    const tab = urlParams.get('tab')
    return tab === 'jobs' ? 'jobs' : 'overview'
  }

  const activeTab = getActiveSection()

  // Navigate to section
  const navigateToSection = (section: string) => {
    if (section === 'overview' || section === 'jobs') {
      // These stay within the dashboard
      if (section === 'jobs') {
        router.push('/dashboard?tab=jobs')
      } else {
        router.push('/dashboard')
      }
    } else {
      // These navigate to dedicated pages
      switch (section) {
        case 'messages':
          router.push('/messages')
          break
        case 'connections':
          router.push('/connections')
          break
        case 'finances':
          toast.info('Finances feature coming soon!')
          break
        case 'analytics':
          toast.info('Analytics feature coming soon!')
          break
        case 'integrations':
          toast.info('Integrations feature coming soon!')
          break
        default:
          router.push('/dashboard')
      }
    }
  }
  
  // Get time-based greeting
  const { greeting } = getTimeBasedGreetingWithIcon()
  
  const handleJobPosted = () => {
    closeJobPostDialog()
    // TanStack Query will automatically invalidate and refetch user jobs
  }

  const handleEditJob = (job: Job) => {
    openEditJobDialog(job)
  }

  const handleEditComplete = () => {
    closeEditJobDialog()
    // TanStack Query will automatically invalidate and refetch user jobs
  }

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job posting?')) return

    try {
      await deleteJobMutation.mutateAsync(jobId)
      toast.success('Job deleted successfully')
    } catch (error) {
      console.error('Error deleting job:', error)
      toast.error('Failed to delete job')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your jobs...</p>
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
                    <span className="text-lg font-medium">{greeting}!</span>
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
                        Jobs
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
                    <SelectItem value="finances" disabled>
                      <div className="flex items-center gap-2 opacity-50">
                        <DollarSign className="h-4 w-4 text-emerald-600" />
                        Finances
                        <Lock className="h-3 w-3 ml-1" />
                      </div>
                    </SelectItem>
                    <SelectItem value="analytics" disabled>
                      <div className="flex items-center gap-2 opacity-50">
                        <BarChart3 className="h-4 w-4 text-indigo-600" />
                        Analytics
                        <Lock className="h-3 w-3 ml-1" />
                      </div>
                    </SelectItem>
                    <SelectItem value="integrations" disabled>
                      <div className="flex items-center gap-2 opacity-50">
                        <Puzzle className="h-4 w-4 text-orange-600" />
                        Integrations
                        <Lock className="h-3 w-3 ml-1" />
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
              <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7">
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <LayoutDashboard className="h-4 w-4 text-blue-600" />
                  <span className="hidden lg:inline">Overview</span>
                </TabsTrigger>
                <TabsTrigger value="jobs" className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-green-600" />
                  <span className="hidden lg:inline">Jobs</span>
                </TabsTrigger>
                <TabsTrigger value="messages" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-purple-600" />
                  <span className="hidden lg:inline">Messages</span>
                </TabsTrigger>
                <TabsTrigger value="connections" className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-600" />
                  <span className="hidden lg:inline">Connections</span>
                </TabsTrigger>
                <TabsTrigger value="finances" disabled className="opacity-50">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-emerald-600" />
                    <span className="hidden lg:inline">Finances</span>
                    <Lock className="h-3 w-3" />
                  </div>
                </TabsTrigger>
                <TabsTrigger value="analytics" disabled className="opacity-50">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-indigo-600" />
                    <span className="hidden lg:inline">Analytics</span>
                    <Lock className="h-3 w-3" />
                  </div>
                </TabsTrigger>
                <TabsTrigger value="integrations" disabled className="opacity-50">
                  <div className="flex items-center gap-2">
                    <Puzzle className="h-4 w-4 text-orange-600" />
                    <span className="hidden lg:inline">Integrations</span>
                    <Lock className="h-3 w-3" />
                  </div>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Content based on selected section */}
          {activeTab === 'overview' && (
            <div>
              {/* Quick Stats - collapsed on mobile */}
              <div className="hidden md:block">
                <ClientQuickStats 
                  jobs={jobs}
                  applicationCounts={applicationCounts}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Mobile: Quick Actions first, then Jobs */}
                <div className="lg:col-span-2">
                  {/* Quick Actions - prioritized for mobile */}
                  <div className="block lg:hidden mb-8">
                    <ClientQuickActions 
                      onPostNewJob={() => openJobPostDialog()}
                    />
                  </div>
                  
                  {/* Jobs List - second on mobile */}
                  <div>
                    <JobsListSection 
                      jobs={jobs}
                      applicationCounts={applicationCounts}
                      onEdit={handleEditJob}
                      onDelete={handleDeleteJob}
                      onPostNewJob={() => openJobPostDialog()}
                    />
                  </div>
                </div>

                {/* Right Column - Quick Actions & Connections for desktop */}
                <div className="hidden lg:block">
                  <div className="mb-8">
                    <ClientQuickActions 
                      onPostNewJob={() => openJobPostDialog()}
                    />
                  </div>
                  
                  {/* Connections */}
                  <div>
                    <ConnectionsSection />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'jobs' && (
            <div className="space-y-6">
              {/* Quick Actions - first on mobile */}
              <div className="block lg:hidden">
                <ClientQuickActions 
                  onPostNewJob={() => openJobPostDialog()}
                />
              </div>
              
              {/* Jobs List - second on mobile */}
              <JobsListSection 
                jobs={jobs}
                applicationCounts={applicationCounts}
                onEdit={handleEditJob}
                onDelete={handleDeleteJob}
                onPostNewJob={() => openJobPostDialog()}
              />
            </div>
          )}
        </div>

        {/* Post New Job Dialog */}
        <Dialog open={isJobPostDialogOpen} onOpenChange={(open) => open ? openJobPostDialog() : closeJobPostDialog()}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="hidden">
              Post Job
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[95vw] w-full max-h-[90vh] overflow-y-auto xl:max-w-6xl 2xl:max-w-7xl">
            <DialogHeader>
              <DialogTitle>Post a Job - Free & Easy</DialogTitle>
            </DialogHeader>
            <MultiStepJobForm
              onJobPosted={handleJobPosted}
              showCard={false}
            />
          </DialogContent>
        </Dialog>

        {/* Edit Job Dialog */}
        <Dialog open={isEditJobDialogOpen} onOpenChange={(open) => open ? openEditJobDialog(editingJob!) : closeEditJobDialog()}>
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
    </div>
  )
}
