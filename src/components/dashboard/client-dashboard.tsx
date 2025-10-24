'use client'

import React, { useState } from 'react'
import { useUserJobsQuery, useDeleteJobMutation, useFeatureJobMutation, useFinishJobMutation } from '@/hooks/queries/useJobs'
import { queryKeys } from '@/lib/query-keys'
import { useMultipleJobApplicantCounts, useUpdateApplication } from '@/hooks/use-applications'
import { useClientApplications } from '@/hooks/use-client-applications'
import { useSupabaseAuth } from '@/contexts/supabase-auth-context'
import { useDialogStore } from '@/stores/dialog-store'
import { useConnectionsManager } from '@/hooks/use-connections'
import { supabase } from '@/lib/supabase'
import { UnifiedJobDialog } from '@/components/core/unified-job-dialog'
import { JobEditDialog } from '@/components/core/job-edit-dialog'
import { FeatureJobDialog } from './client/feature-job-dialog'
import { DeleteJobDialog } from './client/delete-job-dialog'
import { FinishJobDialog } from './client/finish-job-dialog'
import { ClientJobsManager } from './client/client-jobs-manager'
import { ClientApplicationsManager } from './client/client-applications-manager'
import { ClientQuickStats } from './client/client-quick-stats'
import { ConnectionsWidget } from './connections/connections-widget'
import { DashboardLayout } from './dashboard-layout'
import { MessagingInterface } from '@/components/messaging/messaging-interface'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import { useQueryClient } from '@tanstack/react-query'
import { Job } from '@/types/job'
import { ApplicationStatus } from '@/types/application'
export function ClientDashboard() {
  const t = useTranslations()
  const tJobs = useTranslations('jobs.messages')
  const tDashboard = useTranslations('dashboard')
  const queryClient = useQueryClient()
  
  // Local state for edit dialog
  const [editingJob, setEditingJob] = useState<Job | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  
  // State for feature job dialog
  const [featuringJob, setFeaturingJob] = useState<Job | null>(null)
  const [isFeatureDialogOpen, setIsFeatureDialogOpen] = useState(false)
  
  // State for delete job dialog
  const [deletingJob, setDeletingJob] = useState<Job | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  
  // State for finish job dialog
  const [finishingJob, setFinishingJob] = useState<Job | null>(null)
  const [isFinishDialogOpen, setIsFinishDialogOpen] = useState(false)
  const [taskerInfo, setTaskerInfo] = useState<{ id: string; name: string } | null>(null)
  
  // State for messaging
  const [messagingConversationId, setMessagingConversationId] = useState<string | null>(null)
  const [showMessaging, setShowMessaging] = useState(false)
  
  const { user, session } = useSupabaseAuth()

  // TanStack Query hooks for job data
  const { data: jobsData = [], isLoading } = useUserJobsQuery(user?.id || '')
  const jobs = jobsData as unknown as Job[] // Cast to Job[] for type compatibility
  const deleteJobMutation = useDeleteJobMutation()
  const featureJobMutation = useFeatureJobMutation()
  const finishJobMutation = useFinishJobMutation()
  const updateApplicationMutation = useUpdateApplication()
  
  // Get user connections for feature job dialog
  const { connections: userConnections } = useConnectionsManager()
  
  // Get real applicant counts for user's jobs
  const jobIds = jobs.map(job => job.id)
  const { data: applicationCounts = {} } = useMultipleJobApplicantCounts(jobIds)
  
  // Fetch applications for all client jobs
  const { data: allApplications = [], isLoading: applicationsLoading } = useClientApplications(jobIds, jobs)
  
  // Zustand stores for UI state
  const {
    isJobPostDialogOpen,
    openJobPostDialog,
    closeJobPostDialog,
  } = useDialogStore()
  
  const handleJobPosted = () => {
    closeJobPostDialog()
    // Explicitly invalidate and refetch job-related queries for immediate refresh
    queryClient.invalidateQueries({ queryKey: queryKeys.jobs.list({ postedBy: user?.id || '' }) })
    queryClient.invalidateQueries({ queryKey: queryKeys.jobs.lists() })
    // Show success message
    toast.success(tJobs('success.jobPosted'))
  }

  const handleJobUpdated = () => {
    setIsEditDialogOpen(false)
    setEditingJob(null)
    // Explicitly invalidate and refetch job-related queries for immediate refresh
    queryClient.invalidateQueries({ queryKey: queryKeys.jobs.list({ postedBy: user?.id || '' }) })
    queryClient.invalidateQueries({ queryKey: queryKeys.jobs.lists() })
    // Show success message
    toast.success(tJobs('success.jobUpdated'))
  }

  const handleEditJob = (job: Job) => {
    setEditingJob(job)
    setIsEditDialogOpen(true)
  }

  const handleDeleteJob = async (jobId: string) => {
    const job = jobs.find(j => j.id === jobId)
    if (!job) return
    
    setDeletingJob(job as any) // eslint-disable-line @typescript-eslint/no-explicit-any
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDeleteJob = async () => {
    if (!deletingJob) return

    try {
      console.log('🗑️ Attempting to delete job:', deletingJob.id, deletingJob.title)
      await deleteJobMutation.mutateAsync(deletingJob.id)
      toast.success(tJobs('success.jobDeleted'))
      setIsDeleteDialogOpen(false)
      setDeletingJob(null)
    } catch (error) {
      console.error('❌ Error deleting job:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        jobId: deletingJob.id,
        jobTitle: deletingJob.title
      })
      const errorMessage = error instanceof Error ? error.message : tJobs('errors.deleteError')
      toast.error(errorMessage)
    }
  }

  const handleFeatureJob = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId)
    if (!job) return
    
    setFeaturingJob(job)
    setIsFeatureDialogOpen(true)
  }

  const handleConfirmFeatureJob = async () => {
    if (!featuringJob) return

    try {
      const newFeaturedState = !featuringJob.is_featured
      await featureJobMutation.mutateAsync({
        jobId: featuringJob.id,
        isFeatured: newFeaturedState
      })
      
      const successMessage = newFeaturedState 
        ? tJobs('jobFeaturedSuccess', { jobTitle: featuringJob.title })
        : tJobs('jobFeatureRemovedSuccess', { jobTitle: featuringJob.title })
      
      toast.success(successMessage)
      
      // Invalidate user connections query to refresh the count
      queryClient.invalidateQueries({ queryKey: ['user-connections', user?.id] })
      
      setIsFeatureDialogOpen(false)
      setFeaturingJob(null)
    } catch (error) {
      console.error('Error featuring job:', error)
      const errorMessage = error instanceof Error ? error.message : tJobs('featureJobFailed')
      toast.error(errorMessage)
    }
  }

  const handleAcceptJob = async (jobId: string) => {
    try {
      // Accept logic - could mark job as accepted or accept top applicant
      console.log('Accepting job:', jobId)
      toast.success(tJobs('success.jobAccepted') || 'Job accepted successfully')
      // TODO: Implement actual accept logic
    } catch (error) {
      console.error('Error accepting job:', error)
      toast.error(tJobs('errors.acceptError') || 'Failed to accept job')
    }
  }

  const handleRejectJob = async (jobId: string) => {
    try {
      // Reject logic - could reject all pending applicants
      console.log('Rejecting job:', jobId)
      toast.success(tJobs('success.jobRejected') || 'Job rejected successfully')
      // TODO: Implement actual reject logic
    } catch (error) {
      console.error('Error rejecting job:', error)
      toast.error(tJobs('errors.rejectError') || 'Failed to reject job')
    }
  }

  const handleCloseJob = async (jobId: string) => {
    const job = jobs.find(j => j.id === jobId)
    if (!job || !user) return
    
    // Fetch the tasker info from job assignments
    try {
      const { data: assignment, error } = await supabase
        .from('job_assignments')
        .select(`
          tasker_id,
          tasker:users!job_assignments_tasker_id_fkey (
            id,
            name,
            email
          )
        `)
        .eq('job_id', jobId)
        .eq('client_id', user.id)
        .single()
      
      if (error || !assignment) {
        console.error('Error fetching tasker info:', error)
        toast.error('Could not find the tasker for this job')
        return
      }
      
      const tasker = assignment.tasker as { id: string; name: string; email: string } | null
      if (!tasker) {
        toast.error('Could not find the tasker for this job')
        return
      }
      
      setTaskerInfo({
        id: tasker.id,
        name: tasker.name || tasker.email || 'Tasker'
      })
      
      // Open finish job dialog to collect review
      setFinishingJob(job)
      setIsFinishDialogOpen(true)
    } catch (error) {
      console.error('Error preparing to finish job:', error)
      toast.error('Failed to load job information')
    }
  }

  const handleConfirmFinishJob = async (rating: number, comment: string, taskerId: string) => {
    if (!finishingJob || !user) return

    try {
      console.log('🏁 Finishing job:', finishingJob.id, 'with review for tasker:', taskerId)
      
      // Create review and mark job as finished
      await finishJobMutation.mutateAsync({
        jobId: finishingJob.id,
        taskerId,
        reviewerId: user.id,
        reviewerName: user.name || user.email || 'Client',
        reviewerAvatarUrl: user.avatarUrl || undefined,
        rating,
        comment,
      })
      
      toast.success(tJobs('success.jobFinished') || 'Job marked as finished!')
      setIsFinishDialogOpen(false)
      setFinishingJob(null)
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.lists() })
    } catch (error) {
      console.error('❌ Error finishing job:', error)
      const errorMessage = error instanceof Error ? error.message : tJobs('errors.finishError')
      toast.error(errorMessage || 'Failed to finish job')
    }
  }

  const handleUpdateApplicationStatus = async (applicationId: string, status: string) => {
    try {
      // Convert UI strings to ApplicationStatus enum values
      const statusMapping: Record<string, ApplicationStatus> = {
        'accepted': ApplicationStatus.SELECTED, // UI button uses 'accepted' but enum is 'SELECTED'
        'rejected': ApplicationStatus.REJECTED,
        'pending': ApplicationStatus.PENDING,
        'reviewed': ApplicationStatus.REVIEWED,
        'shortlisted': ApplicationStatus.SHORTLISTED,
        'withdrawn': ApplicationStatus.WITHDRAWN
      }
      
      const applicationStatus = statusMapping[status] || ApplicationStatus.PENDING
      
      await updateApplicationMutation.mutateAsync({
        applicationId,
        updates: { status: applicationStatus }
      })
      toast.success(t('applications.statusUpdated') || 'Application status updated successfully')
    } catch (error) {
      console.error('Error updating application status:', error)
      toast.error(t('applications.statusUpdateError') || 'Failed to update application status')
    }
  }

  const handleMessageApplicant = async (applicationId: string, userId: string) => {
    console.log('DEBUG: handleMessageApplicant called with:', { applicationId, userId })
    
    try {
      console.log('Starting to create conversation for:', { applicationId, userId })
      
      // Find the application to get job details
      const application = allApplications.find(app => app.id === applicationId)
      if (!application) {
        toast.error('Application not found')
        return
      }

      if (!application.job) {
        toast.error('Job information not found')
        return
      }

      console.log('Creating job conversation with:', {
        jobId: application.job.id,
        userId,
        jobTitle: application.job.title
      })

      // Create conversation via API
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          applicationId: applicationId,
          jobId: application.job.id,
          taskerId: userId,
          clientId: user?.id
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create conversation')
      }

      if (result.success) {
        // Show messaging interface with the conversation
        setMessagingConversationId(result.data.conversationId)
        setShowMessaging(true)
        toast.success(`Started conversation about "${application.job.title}"`)
      } else {
        throw new Error(result.error || 'Failed to create conversation')
      }

    } catch (error) {
      console.error('Error creating conversation:', error)
      toast.error('Failed to start conversation. Please try again.')
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
            <p className="text-muted-foreground">{tDashboard('loading.jobs')}</p>
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
          {/* Connections Widget */}
          <ConnectionsWidget />
        </div>
      }
    >
      {/* Quick Stats - collapsed on mobile */}
      <div className="hidden md:block mb-8">
        <ClientQuickStats 
          jobs={jobs} 
          applicationCounts={applicationCounts}
        />
      </div>
      
      <div className="space-y-12 lg:space-y-20">
        {/* Jobs Section */}
        <Card>
          <CardContent className="p-6">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                {tDashboard('tabs.myJobs') || 'My Jobs'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                {tDashboard('client.jobs.description') || 'Manage your job postings and track applications'}
              </p>
            </div>
            <ClientJobsManager
              jobs={jobs}
              applicationCounts={applicationCounts}
              onEdit={handleEditJob}
              onDelete={handleDeleteJob}
              onFeature={handleFeatureJob}
              onAccept={handleAcceptJob}
              onReject={handleRejectJob}
              onClose={handleCloseJob}
              onPostNewJob={openJobPostDialog}
              loading={isLoading}
            />
          </CardContent>
        </Card>

        {/* Applications Section */}
        <Card>
          <CardContent className="p-6">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                {tDashboard('tabs.applications') || 'Applications'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                {tDashboard('client.applications.description') || 'Review and manage applications for your jobs'}
              </p>
            </div>
            <ClientApplicationsManager
              applications={allApplications}
              onUpdateApplicationStatus={handleUpdateApplicationStatus}
              onMessageApplicant={handleMessageApplicant}
              loading={applicationsLoading}
            />
          </CardContent>
        </Card>
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

      {/* Feature Job Dialog */}
      {featuringJob && (
        <FeatureJobDialog
          isOpen={isFeatureDialogOpen}
          onOpenChange={setIsFeatureDialogOpen}
          onConfirm={handleConfirmFeatureJob}
          jobTitle={featuringJob.title}
          currentlyFeatured={featuringJob.is_featured || false}
          userConnections={userConnections}
        />
      )}

      {/* Delete Job Dialog */}
      {deletingJob && (
        <DeleteJobDialog
          isOpen={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onConfirm={handleConfirmDeleteJob}
          jobTitle={deletingJob.title}
        />
      )}

      {/* Finish Job Dialog */}
      {finishingJob && taskerInfo && (
        <FinishJobDialog
          isOpen={isFinishDialogOpen}
          onOpenChange={setIsFinishDialogOpen}
          onConfirm={handleConfirmFinishJob}
          jobTitle={finishingJob.title}
          taskerName={taskerInfo.name}
          taskerId={taskerInfo.id}
        />
      )}

      {/* Messaging Interface */}
      {showMessaging && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
          <div className="fixed inset-4 z-50 flex items-center justify-center">
            <div className="w-full max-w-4xl h-full max-h-[600px] bg-background border rounded-lg shadow-lg relative">
              <MessagingInterface 
                conversationId={messagingConversationId || undefined}
                onClose={() => setShowMessaging(false)}
                className="h-full"
              />
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
