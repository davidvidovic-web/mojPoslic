'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Job } from '@/types/job'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { MultiStepJobForm } from '@/components/jobs/job-post-form/multi-step-job-form'
import { ConnectionsSection } from '@/components/dashboard/connections-section'
import { JobsListSection } from './client/jobs-list-section'
import { ClientMessagesSection } from './client/messages-section'
import { DashboardStatsCards } from './client/dashboard-stats-cards'
import { ClientQuickStats } from './client/client-quick-stats'
import { ClientQuickActions } from './client/client-quick-actions'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatDisplayName, getTimeBasedGreetingWithIcon } from '@/lib/utils'
import { DashboardFooter } from '@/components/core/dashboard-footer'
import { Sunrise, Sun, Moon } from 'lucide-react'

export function ClientDashboard() {
  const { user } = useAuth()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingJob, setEditingJob] = useState<Job | null>(null)
  const [jobApplicationCounts, setJobApplicationCounts] = useState<Record<string, number>>({})
  
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
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-800">
                <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v2a2 2 0 01-2 2H10a2 2 0 01-2-2V6m8 0V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                  Client Dashboard
                </h1>
                <p className="text-blue-600 dark:text-blue-300 mt-1 flex items-center gap-2">
                  <span className="font-bold">{formatDisplayName(user?.name || undefined)}</span>
                  {renderTimeIcon()}
                  <span>{greeting}! Ready to find the perfect talent?</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-blue-600 dark:text-blue-300">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
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

        {/* Main Content with Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
            <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Overview</TabsTrigger>
            <TabsTrigger value="messages" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Messages</TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Analytics</TabsTrigger>
            <TabsTrigger value="finances" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white disabled:opacity-50" disabled>
              <div className="flex items-center gap-1">
                Finances
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </TabsTrigger>
            <TabsTrigger value="statistics" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white disabled:opacity-50" disabled>
              <div className="flex items-center gap-1">
                Statistics
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </TabsTrigger>
            <TabsTrigger value="integrations" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white disabled:opacity-50" disabled>
              <div className="flex items-center gap-1">
                Integrations
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            {/* Quick Stats */}
            <ClientQuickStats 
              jobs={jobs}
              applicationCounts={jobApplicationCounts}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Mobile: Jobs first, then Quick Actions */}
              <div className="lg:col-span-2 space-y-8">
                {/* Jobs List - prioritized for mobile */}
                <JobsListSection 
                  jobs={jobs}
                  applicationCounts={jobApplicationCounts}
                  onEdit={handleEditJob}
                  onDelete={handleDeleteJob}
                  onPostNewJob={() => setIsDialogOpen(true)}
                />
              </div>

              {/* Right Column - Quick Actions & Connections */}
              <div className="space-y-8">
                {/* Quick Actions - mobile shows after jobs */}
                <ClientQuickActions 
                  onPostNewJob={() => setIsDialogOpen(true)}
                />
                
                {/* Connections */}
                <ConnectionsSection />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="messages">
            <ClientMessagesSection />
          </TabsContent>

          <TabsContent value="analytics">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-6">Analytics & Insights</h2>
                <DashboardStatsCards jobs={jobs} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="finances">
            <div className="space-y-6">
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mx-auto mb-4">
                    <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-muted-foreground mb-2">Finances Coming Soon</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Payment processing, invoicing, and financial analytics will be available in a future update.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="statistics">
            <div className="space-y-6">
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mx-auto mb-4">
                    <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-muted-foreground mb-2">Advanced Statistics Coming Soon</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Detailed hiring analytics, performance metrics, and advanced reporting features will be available in a future update.
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
                    Connect with popular tools like Slack, Calendar apps, CRM systems, and more to streamline your hiring workflow.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

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
