'use client'

import React from 'react'
import { useUserJobs, useDeleteJob } from '@/hooks/use-jobs'
import { useMultipleJobApplicantCounts } from '@/hooks/use-applications'
import { useDialogStore } from '@/stores/dialog-store'
import { Job } from '@/types/job'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { MultiStepJobForm } from '@/components/jobs/job-post-form/multi-step-job-form'
import { ConnectionsSection } from '@/components/dashboard/connections-section'
import { JobsListSection } from './client/jobs-list-section'
import { ClientQuickStats } from './client/client-quick-stats'
import { ClientQuickActions } from './client/client-quick-actions'
import { DashboardLayout } from './dashboard-layout'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'

export function ClientDashboard() {
  const t = useTranslations()
  
  // TanStack Query hooks for job data
  const { data: jobs = [], isLoading } = useUserJobs()
  const deleteJobMutation = useDeleteJob()
  
  // Get real applicant counts for user's jobs
  const jobIds = jobs.map(job => job.id)
  const { data: applicationCounts = {} } = useMultipleJobApplicantCounts(jobIds)
  
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
    if (!confirm(t('jobs.deleteConfirm'))) return

    try {
      await deleteJobMutation.mutateAsync(jobId)
      toast.success(t('jobs.deleteSuccess'))
    } catch (error) {
      console.error('Error deleting job:', error)
      toast.error(t('jobs.deleteError'))
    }
  }

  // const handleFeatureJob = async (jobId: string, isFeatured: boolean) => {
  //   try {
  //     await featureJobMutation.mutateAsync({ id: jobId, is_featured: isFeatured })
  //   } catch (error) {
  //     console.error('Error updating job featured status:', error)
  //     toast.error('Failed to update job featured status')
  //   }
  // }

  if (isLoading) {
    return (
      <DashboardLayout userRole="client">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">{t('dashboard.loading.jobs')}</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userRole="client">
      <div className="space-y-6">
        {/* Quick Stats */}
        <ClientQuickStats 
          jobs={jobs}
          applicationCounts={applicationCounts}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Jobs List */}
          <div className="lg:col-span-2">
            <JobsListSection 
              jobs={jobs}
              applicationCounts={applicationCounts}
              onEdit={handleEditJob}
              onDelete={handleDeleteJob}
            />
          </div>

          {/* Right Column - Quick Actions & Connections */}
          <div className="space-y-8">
            <ClientQuickActions 
              onPostNewJob={() => openJobPostDialog()}
            />
            
            <ConnectionsSection />
          </div>
        </div>
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
            <DialogTitle>{t('jobs.dialogs.postJobDialog')}</DialogTitle>
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
            <DialogTitle>{t('jobs.dialogs.editJobDialog')}</DialogTitle>
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
    </DashboardLayout>
  )
}
