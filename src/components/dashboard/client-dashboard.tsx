'use client'

import React, { useState } from 'react'
import { useUserJobsQuery, useDeleteJobMutation } from '@/hooks/queries/useJobs'
import { queryKeys } from '@/lib/query-keys'
import { useMultipleJobApplicantCounts, useUpdateApplication } from '@/hooks/use-applications'
import { useClientApplications } from '@/hooks/use-client-applications'
import { useSupabaseAuth } from '@/contexts/supabase-auth-context'
import { useDialogStore } from '@/stores/dialog-store'
import { UnifiedJobDialog } from '@/components/core/unified-job-dialog'
import { JobEditDialog } from '@/components/core/job-edit-dialog'
import { ClientJobsManager } from './client/client-jobs-manager'
import { ClientApplicationsManager } from './client/client-applications-manager'
import { ClientNotificationsSection } from './client/client-notifications-section'
import { ConnectionsWidget } from './connections/connections-widget'
import { ConnectionsFullHistory } from './connections/connections-full-history'
import { DashboardLayout } from './dashboard-layout'
import { MessagingDialog } from '@/components/dashboard/messaging/messaging-dialog'
import { Briefcase, Users, History, ChevronDown, ChevronUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
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
  
  // State for collapsible connection history
  const [isConnectionHistoryOpen, setIsConnectionHistoryOpen] = useState(false)
  const { user, session } = useSupabaseAuth()
  
  // TanStack Query hooks for job data
  const { data: jobs = [], isLoading } = useUserJobsQuery(user?.id || '')
  const deleteJobMutation = useDeleteJobMutation()
  const updateApplicationMutation = useUpdateApplication()
  
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
    openMessagingDialog,
  } = useDialogStore()
  
  const handleJobPosted = () => {
    closeJobPostDialog()
    // Explicitly invalidate and refetch job-related queries for immediate refresh
    queryClient.invalidateQueries({ queryKey: queryKeys.jobs.list({ postedBy: user?.id || '' }) })
    queryClient.invalidateQueries({ queryKey: queryKeys.jobs.lists() })
    // Show success message
    toast.success(t('jobs.success.jobPosted'))
  }

  const handleJobUpdated = () => {
    setIsEditDialogOpen(false)
    setEditingJob(null)
    // Explicitly invalidate and refetch job-related queries for immediate refresh
    queryClient.invalidateQueries({ queryKey: queryKeys.jobs.list({ postedBy: user?.id || '' }) })
    queryClient.invalidateQueries({ queryKey: queryKeys.jobs.lists() })
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
        // Open messaging dialog with the conversation
        openMessagingDialog(result.data.conversationId)
        toast.success(`Started conversation about "${application.job.title}"`)
      } else {
        throw new Error(result.error || 'Failed to create conversation')
      }

    } catch (error) {
      console.error('Error creating conversation:', error)
      toast.error('Failed to start conversation. Please try again.')
    }
  }

  const handleViewProfile = (userId: string, applicationId: string) => {
    console.log('Viewing profile for user:', userId, 'application:', applicationId)
    
    // Find the application to get user details
    const application = allApplications.find(app => app.id === applicationId)
    if (!application || !application.user) {
      toast.error('User information not found')
      return
    }

    // For now, show user information in a toast
    // TODO: Implement proper profile view modal/page
    const user = application.user
    const userInfo = [
      `Name: ${user.name}`,
      `Email: ${user.email}`,
      user.location && `Location: ${user.location}`,
      user.bio && `Bio: ${user.bio}`,
      user.skills && Array.isArray(user.skills) && user.skills.length > 0 && `Skills: ${user.skills.join(', ')}`
    ].filter(Boolean).join('\n')

    toast.info(`User Profile:\n${userInfo}`, { duration: 10000 })
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
          {/* Connections Widget */}
          <ConnectionsWidget />
          
          {/* Notifications Section */}
          <ClientNotificationsSection />
        </div>
      }
    >
      <div className="space-y-12 lg:space-y-20">
        {/* Jobs Section */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center">
                <Briefcase className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                  {t('dashboard.tabs.myJobs') || 'My Jobs'}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  {t('dashboard.client.jobs.description') || 'Manage your job postings and track applications'}
                </p>
              </div>
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
          </CardContent>
        </Card>

        {/* Applications Section */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-600/20 flex items-center justify-center">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                  {t('dashboard.tabs.applications') || 'Applications'}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  {t('dashboard.client.applications.description') || 'Review and manage applications for your jobs'}
                </p>
              </div>
            </div>
            <ClientApplicationsManager
              applications={allApplications}
              onUpdateApplicationStatus={handleUpdateApplicationStatus}
              onMessageApplicant={handleMessageApplicant}
              onViewProfile={handleViewProfile}
              loading={applicationsLoading}
            />
          </CardContent>
        </Card>

        {/* Collapsible Connections History Section */}
        <Card>
          <Collapsible open={isConnectionHistoryOpen} onOpenChange={setIsConnectionHistoryOpen}>
            <div>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full flex items-center justify-between p-6 hover:bg-gray-50 dark:hover:bg-gray-900/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-2xl bg-gradient-to-br from-purple-500/10 to-purple-600/20 flex items-center justify-center">
                      <History className="h-4 w-4 text-purple-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {t('dashboard.connections.fullHistory') || 'Connection History'}
                    </h2>
                  </div>
                  {isConnectionHistoryOpen ? (
                    <ChevronUp className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="px-6 pb-6">
                  <ConnectionsFullHistory />
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
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

      {/* Messaging Dialog */}
      <MessagingDialog />
    </DashboardLayout>
  )
}
