'use client'

import React from 'react'
import { useUserJobs, useDeleteJob, jobKeys } from '@/hooks/use-jobs'
import { useMultipleJobApplicantCounts } from '@/hooks/use-applications'
import { useDialogStore } from '@/stores/dialog-store'
import { UnifiedJobDialog } from '@/components/core/unified-job-dialog'
import { ConnectionsSection } from '@/components/dashboard/connections-section'
import { JobsListSection } from './client/jobs-list-section'
import { ClientQuickStats } from './client/client-quick-stats'
import { ClientQuickActions } from './client/client-quick-actions'
import { DashboardLayout } from './dashboard-layout'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import { useQueryClient } from '@tanstack/react-query'

export function ClientDashboard() {
  const t = useTranslations()
  const queryClient = useQueryClient()
  
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
  } = useDialogStore()
  
  const handleJobPosted = () => {
    closeJobPostDialog()
    // Explicitly invalidate and refetch job-related queries for immediate refresh
    queryClient.invalidateQueries({ queryKey: jobKeys.user('current') })
    queryClient.invalidateQueries({ queryKey: ['jobs'] })
    // Show success message
    toast.success(t('jobs.success.jobPosted'))
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
              onDelete={handleDeleteJob}
            />
          </div>

          {/* Right Column - Quick Actions & Connections */}
          <div className="space-y-8">
            <ClientQuickActions />
            
            <ConnectionsSection />
          </div>
        </div>
      </div>

      {/* Post New Job Dialog - No trigger needed since it's controlled */}
      <UnifiedJobDialog
        isOpen={isJobPostDialogOpen}
        onOpenChange={(open) => open ? openJobPostDialog() : closeJobPostDialog()}
        onJobPosted={handleJobPosted}
      />
    </DashboardLayout>
  )
}
