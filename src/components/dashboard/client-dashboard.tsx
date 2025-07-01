'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/prisma-auth-context'
import { Job } from '@/types/job'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { MultiStepJobForm } from '@/components/job-post-form/multi-step-job-form'
import { ConnectionsSection } from '@/components/dashboard/connections-section'
import { DashboardHeader } from './client/dashboard-header'
import { DashboardStatsCards } from './client/dashboard-stats-cards'
import { JobsListSection } from './client/jobs-list-section'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export function ClientDashboard() {
  const { user } = useAuth()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingJob, setEditingJob] = useState<Job | null>(null)
  const [jobApplicationCounts, setJobApplicationCounts] = useState<Record<string, number>>({})

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
    toast.success('Job posted successfully!')
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <DashboardHeader 
          userName={user?.name || undefined}
          isDialogOpen={isDialogOpen}
          setIsDialogOpen={setIsDialogOpen}
          onJobPosted={handleJobPosted}
        />

        {/* Stats Cards */}
        <DashboardStatsCards jobs={jobs} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Jobs List */}
          <div className="lg:col-span-2">
            <JobsListSection 
              jobs={jobs}
              applicationCounts={jobApplicationCounts}
              onEdit={handleEditJob}
              onDelete={handleDeleteJob}
              onPostNewJob={() => setIsDialogOpen(true)}
            />
          </div>

          {/* Right Column - Connections */}
          <div className="space-y-8">
            <ConnectionsSection />
          </div>
        </div>

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
                  job_longitude: editingJob.job_longitude
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
