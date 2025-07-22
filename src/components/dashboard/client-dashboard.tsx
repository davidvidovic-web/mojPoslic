'use client'

import React, { useState } from 'react'
import { useUserJobs, useDeleteJob, jobKeys } from '@/hooks/use-jobs'
import { useMultipleJobApplicantCounts, useUpdateApplication } from '@/hooks/use-applications'
import { useClientApplications } from '@/hooks/use-client-applications'
import { useDialogStore } from '@/stores/dialog-store'
import { UnifiedJobDialog } from '@/components/core/unified-job-dialog'
import { JobEditDialog } from '@/components/core/job-edit-dialog'
import { ClientJobsManager } from './client/client-jobs-manager'
import { ClientApplicationsManager } from './client/client-applications-manager'
import { ConnectionsWidget } from './connections/connections-widget'
import { ConnectionsFullHistory } from './connections/connections-full-history'
import { MessagingDialog } from './messaging/messaging-dialog'
import { DashboardLayout } from './dashboard-layout'
import { Briefcase, Users, History } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import { useQueryClient } from '@tanstack/react-query'
import { Job } from '@/types/job'
import { ApplicationStatus } from '@/types/application'
export function ClientDashboard() {
  const t = useTranslations()
  const queryClient = useQueryClient()
  
  // Local state for edit dialog
  const [editingJob, setEditingJob] = useState<Job | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  
  // TanStack Query hooks for job data
  const { data: jobs = [], isLoading } = useUserJobs()
  const deleteJobMutation = useDeleteJob()
  const updateApplicationMutation = useUpdateApplication()
  
  // Get real applicant counts for user's jobs
  const jobIds = jobs.map(job => job.id)
  const { data: applicationCounts = {} } = useMultipleJobApplicantCounts(jobIds)
  
  // Get all applications for the client's jobs
  const { data: allApplications = [], isLoading: applicationsLoading } = useClientApplications(jobIds)
  
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

  const handleJobUpdated = () => {
    setIsEditDialogOpen(false)
    setEditingJob(null)
    // Explicitly invalidate and refetch job-related queries for immediate refresh
    queryClient.invalidateQueries({ queryKey: jobKeys.user('current') })
    queryClient.invalidateQueries({ queryKey: ['jobs'] })
    // Show success message
    toast.success(t('jobs.success.jobUpdated') || 'Job updated successfully')
  }

  const handleEditJob = (job: Job) => {
    setEditingJob(job)
    setIsEditDialogOpen(true)
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

  const handleUpdateApplicationStatus = async (applicationId: string, status: string) => {
    try {
      // Convert lowercase string to ApplicationStatus enum
      const statusMapping: Record<string, ApplicationStatus> = {
        'pending': ApplicationStatus.PENDING,
        'accepted': ApplicationStatus.SELECTED, // In UI 'accepted' maps to 'SELECTED' in enum
        'rejected': ApplicationStatus.REJECTED,
        'completed': ApplicationStatus.SELECTED,
        'withdrawn': ApplicationStatus.WITHDRAWN
      }
      
      const applicationStatus = statusMapping[status] || ApplicationStatus.PENDING
      
      await updateApplicationMutation.mutateAsync({
        applicationId,
        data: { status: applicationStatus }
      })
      toast.success(t('applications.statusUpdated') || 'Application status updated successfully')
    } catch (error) {
      console.error('Error updating application status:', error)
      toast.error(t('applications.statusUpdateError') || 'Failed to update application status')
    }
  }

  const handleMessageApplicant = () => {
    // TODO: Implement messaging functionality
    toast.info('Messaging feature coming soon!')
  }

  const handleViewProfile = () => {
    // TODO: Implement profile viewing functionality
    toast.info('Profile viewing feature coming soon!')
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
    <DashboardLayout 
      userRole="client"
      sidebar={
        <div className="space-y-6">
          {/* Messages Section - Prominent and First */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-500 flex items-center justify-center">
                  <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">Messages</h3>
              </div>
              <MessagingDialog />
            </div>
            <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
              Communicate with job applicants and manage your conversations in real-time.
            </p>
          </div>
          
          {/* Connections Widget */}
          <ConnectionsWidget />
        </div>
      }
    >
      <div className="space-y-8">
        {/* Jobs Section */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center">
              <Briefcase className="h-4 w-4 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {t('dashboard.tabs.myJobs') || 'My Jobs'}
            </h2>
          </div>
          <ClientJobsManager
            jobs={jobs}
            applicationCounts={applicationCounts}
            onEdit={handleEditJob}
            onDelete={handleDeleteJob}
            onFeature={() => {}} // TODO: Implement feature job functionality
            onPostNewJob={openJobPostDialog}
            loading={isLoading}
          />
        </div>

        {/* Applications Section */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-600/20 flex items-center justify-center">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {t('dashboard.tabs.applications') || 'Applications'}
            </h2>
          </div>
          <ClientApplicationsManager
            applications={allApplications}
            onUpdateApplicationStatus={handleUpdateApplicationStatus}
            onMessageApplicant={handleMessageApplicant}
            onViewProfile={handleViewProfile}
            loading={applicationsLoading}
          />
        </div>

        {/* Connections History Section */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-2xl bg-gradient-to-br from-purple-500/10 to-purple-600/20 flex items-center justify-center">
              <History className="h-4 w-4 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {t('dashboard.connections.fullHistory') || 'Connection History'}
            </h2>
          </div>
          <ConnectionsFullHistory />
        </div>
      </div>

      {/* Post New Job Dialog - No trigger needed since it's controlled */}
      <UnifiedJobDialog
        isOpen={isJobPostDialogOpen}
        onOpenChange={(open) => open ? openJobPostDialog() : closeJobPostDialog()}
        onJobPosted={handleJobPosted}
      />

      {/* Edit Job Dialog */}
      {editingJob && (
        <JobEditDialog
          job={editingJob}
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onJobUpdated={handleJobUpdated}
        />
      )}
    </DashboardLayout>
  )
}
