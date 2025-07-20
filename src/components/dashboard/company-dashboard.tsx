'use client'

import React from 'react'
import { useUserJobs, useDeleteJob } from '@/hooks/use-jobs'
import { useMultipleJobApplicantCounts } from '@/hooks/use-applications'
import { useDialogStore } from '@/stores/dialog-store'
import { Job } from '@/types/job'
import { UnifiedJobDialog } from '@/components/core/unified-job-dialog'
import { ConnectionsSection } from '@/components/dashboard/connections-section'
import { JobsListSection } from './company/jobs-list-section'
import { ClientQuickStats } from './client/client-quick-stats'
import { ClientQuickActions } from './client/client-quick-actions'
import { DashboardLayout } from './dashboard-layout'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'

export function CompanyDashboard() {
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
      <DashboardLayout userRole="company">
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
    <DashboardLayout userRole="company">
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
              onPostNewJob={() => openJobPostDialog()}
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
      <UnifiedJobDialog
        isOpen={isJobPostDialogOpen}
        onOpenChange={(open) => open ? openJobPostDialog() : closeJobPostDialog()}
        onJobPosted={handleJobPosted}
        triggerText="Post Job"
        isEditMode={false}
      />

      {/* Edit Job Dialog */}
      <UnifiedJobDialog
        isOpen={isEditJobDialogOpen}
        onOpenChange={(open) => open ? openEditJobDialog(editingJob!) : closeEditJobDialog()}
        onJobUpdated={handleEditComplete}
        isEditMode={true}
        initialData={editingJob ? {
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
        } : undefined}
        jobId={editingJob?.id}
      />
    </DashboardLayout>
  )
}
