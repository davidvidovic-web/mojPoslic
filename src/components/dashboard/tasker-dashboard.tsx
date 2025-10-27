'use client'

import { useSupabaseAuth } from "@/contexts/supabase-auth-context"
import { useTranslations } from 'next-intl'
import { ApplicationStatus } from '@/types/application'
import TaskerApplicationManager from './tasker/tasker-application-manager'
import { TaskerQuickStats } from '@/components/dashboard/tasker/tasker-quick-stats'
import { ConnectionsWidget } from '@/components/dashboard/connections/connections-widget'
import { DashboardLayout } from './dashboard-layout'
import { JobCompletionCard } from './job-completion-card'
import { Card, CardContent } from '@/components/ui/card'
import { useUserApplications } from '@/hooks/use-applications'
import { useJobAcceptanceManager } from '@/hooks/useQueryManagers'
import type { ActiveJob } from '@/hooks/use-job-acceptance'
import { ReviewClientDialog } from './tasker/review-client-dialog'
import { useTaskerReviewMutation } from '@/hooks/queries/useJobs'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { UnifiedMessagingInterface } from '@/components/messaging/unified-messaging-interface'

interface ApplicationStats {
  total: number
  pending: number
  accepted: number
  rejected: number
}

export function TaskerDashboard() {
  const { user } = useSupabaseAuth()
  const searchParams = useSearchParams()
  
  // Translation hooks
  const tDashboard = useTranslations('dashboard')
  
  // State for messaging
  const [messagingConversationId, setMessagingConversationId] = useState<string | null>(null)
  const [showMessaging, setShowMessaging] = useState(false)
  
  // Review dialog state
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false)
  const [reviewingJob, setReviewingJob] = useState<{
    jobId: string
    jobTitle: string
    clientId: string
    clientName: string
    clientAvatarUrl: string | null
  } | null>(null)
  
  // Use Supabase hooks for user-specific data
  const { data: applications = [], isLoading: applicationsLoading } = useUserApplications(user?.id)
  const { activeJobs, isLoading: isLoadingActiveJobs } = useJobAcceptanceManager()
  const reviewMutation = useTaskerReviewMutation()
  
  // Handle reviewJob URL parameter
  useEffect(() => {
    const reviewJobId = searchParams.get('reviewJob')
    if (reviewJobId && user) {
      // Fetch job and client details
      const fetchJobForReview = async () => {
        // Get job details
        const { data: job, error: jobError } = await supabase
          .from('job_listings')
          .select('id, title, posted_by_id')
          .eq('id', reviewJobId)
          .single()
        
        if (jobError || !job || !job.posted_by_id) {
          console.error('Error fetching job for review:', jobError)
          return
        }
        
        // Get client details
        const { data: client, error: clientError } = await supabase
          .from('users')
          .select('id, name, avatar_url')
          .eq('id', job.posted_by_id)
          .single()
        
        if (clientError || !client) {
          console.error('Error fetching client for review:', clientError)
          return
        }
        
        // Set review dialog data and open
        setReviewingJob({
          jobId: job.id,
          jobTitle: job.title,
          clientId: client.id,
          clientName: client.name || 'Client',
          clientAvatarUrl: client.avatar_url
        })
        setIsReviewDialogOpen(true)
      }
      
      fetchJobForReview()
    }
  }, [searchParams, user])
  
  const handleReviewSubmit = async (rating: number, comment: string) => {
    if (!reviewingJob || !user) return
    
    await reviewMutation.mutateAsync({
      jobId: reviewingJob.jobId,
      clientId: reviewingJob.clientId,
      reviewerId: user.id,
      reviewerName: user.name || 'Tasker',
      reviewerAvatarUrl: user.avatarUrl || undefined,
      rating,
      comment
    })
    
    setIsReviewDialogOpen(false)
    setReviewingJob(null)
  }

  const handleMessageClick = (conversationId: string | null) => {
    setMessagingConversationId(conversationId)
    setShowMessaging(true)
  }
  
  // Calculate derived data from hook data
  const stats: ApplicationStats = {
    total: applications.length,
    pending: applications.filter(app => app.status === ApplicationStatus.PENDING).length,
    accepted: applications.filter(app => app.status === ApplicationStatus.SELECTED).length,
    rejected: applications.filter(app => app.status === ApplicationStatus.REJECTED).length,
  }
  
  const loading = applicationsLoading || isLoadingActiveJobs

  // TanStack Query automatically fetches data, no manual fetch needed

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{tDashboard('loading.tasker')}</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <DashboardLayout 
        userRole="tasker" 
        userName={user?.name}
        sidebar={
          <div className="space-y-6">
            {/* Connections Widget */}
            <ConnectionsWidget />
          </div>
        }
      >
        {/* Quick Stats - collapsed on mobile */}
        <div className="hidden md:block mb-8">
          <TaskerQuickStats stats={stats} />
        </div>
        
        <div className="space-y-12 lg:space-y-20">
          {/* Active Jobs Section */}
          {activeJobs.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <div className="mb-6">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                    {tDashboard('tasker.activeJobs.title') || 'Active Jobs'}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 text-lg">
                    {tDashboard('tasker.activeJobs.description', { count: activeJobs.length }) || 'Jobs you are currently working on'}
                  </p>
                </div>
                <div className="space-y-4">
                  {activeJobs.map((job: ActiveJob) => (
                    <JobCompletionCard
                      key={job.assignmentId}
                      jobAssignment={{
                        id: job.assignmentId,
                        contractStatus: job.contractStatus,
                        job: {
                          id: job.jobId,
                          title: job.title,
                          company: job.company,
                          postedBy: {
                            id: job.client.id,
                            name: job.client.name || '',
                            email: job.client.email || ''
                          }
                        },
                        selectedApplication: {
                          user: {
                            id: job.client.id,
                            name: job.client.name || '',
                            email: job.client.email || ''
                          }
                        }
                      }}
                      userRole="tasker"
                      onUpdate={() => {
                        // Refresh data when job is updated
                        window.location.reload()
                      }}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Applications Section */}
          <Card>
            <CardContent className="p-6">
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                  {tDashboard('tasker.applicationManager.recentApplications') || 'My Applications'}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  {tDashboard('tasker.applicationManager.recentApplicationsDescription') || 'Track your job applications and their status'}
                </p>
              </div>
              <TaskerApplicationManager 
                showOnlyHistorical={false}
                onMessageClick={handleMessageClick}
              />
            </CardContent>
          </Card>

          {/* Completed Jobs Section */}
          <Card>
            <CardContent className="p-6">
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-green-700 dark:text-green-400 mb-1">
                  {tDashboard('jobManagement.completedJobsSection') || 'Completed Jobs'}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  {tDashboard('tasker.applications.completedJobsDescription') || 'View your completed work and past applications'}
                </p>
              </div>
              <TaskerApplicationManager 
                showOnlyHistorical={true}
                onMessageClick={handleMessageClick}
              />
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
      
      {/* Review Client Dialog */}
      {reviewingJob && (
        <ReviewClientDialog
          open={isReviewDialogOpen}
          onOpenChange={setIsReviewDialogOpen}
          jobTitle={reviewingJob.jobTitle}
          clientName={reviewingJob.clientName}
          clientAvatarUrl={reviewingJob.clientAvatarUrl}
          onSubmit={handleReviewSubmit}
          isSubmitting={reviewMutation.isPending}
        />
      )}

      {/* Messaging Interface */}
      {showMessaging && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
          <div className="fixed inset-4 z-50 flex items-center justify-center">
            <div className="w-full max-w-4xl h-full max-h-[600px] bg-background border rounded-lg shadow-lg relative">
              <UnifiedMessagingInterface 
                conversationId={messagingConversationId || undefined}
                onClose={() => setShowMessaging(false)}
                className="h-full"
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}