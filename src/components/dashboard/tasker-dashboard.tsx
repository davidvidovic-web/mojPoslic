'use client'

import { useSupabaseAuth } from "@/contexts/supabase-auth-context"
import { useTranslations } from 'next-intl'
import { ApplicationStatus } from '@/types/application'
import { TaskerApplicationManager } from './tasker/tasker-application-manager'
import { TaskerQuickStats } from './tasker/tasker-quick-stats'
import { ConnectionsWidget } from './connections/connections-widget'
import { ConnectionsFullHistory } from './connections/connections-full-history'
import { MessagingDialog } from '@/components/dashboard/messaging/messaging-dialog'
import { DashboardLayout } from './dashboard-layout'
import { JobCompletionCard } from './job-completion-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Star, Briefcase, History, MessageCircle } from 'lucide-react'
import { useUserApplications } from '@/hooks/use-applications'
import { useJobAcceptanceManager } from '@/hooks/useQueryManagers'
import { useDialogStore } from '@/stores/dialog-store'
import { useOptimizedMessaging } from '@/hooks/use-optimized-messaging'
import type { ActiveJob } from '@/hooks/use-job-acceptance'

interface ApplicationStats {
  total: number
  pending: number
  shortlisted: number
  accepted: number
  completed: number
  rejected: number
  totalEarnings: number
}

export function TaskerDashboard() {
  const { user } = useSupabaseAuth()
  
  // Translation hooks
  const tDashboard = useTranslations('dashboard')
  
  // Dialog and messaging state
  const { openMessagingDialog } = useDialogStore()
  const { totalUnreadCount, conversations } = useOptimizedMessaging()
  
  // Use Supabase hooks for user-specific data
  const { data: applications = [], isLoading: applicationsLoading } = useUserApplications(user?.id)
  const { activeJobs, isLoading: isLoadingActiveJobs } = useJobAcceptanceManager()
  
  // Calculate derived data from hook data
  const shortlistedApplications = applications.filter(app => 
    app.status === ApplicationStatus.SHORTLISTED
  )
  
  const stats: ApplicationStats = {
    total: applications.length,
    pending: applications.filter(app => app.status === ApplicationStatus.PENDING).length,
    shortlisted: applications.filter(app => app.status === ApplicationStatus.SHORTLISTED).length,
    accepted: applications.filter(app => app.status === ApplicationStatus.SELECTED).length,
    completed: 0, // TODO: Get from completed job assignments
    rejected: applications.filter(app => app.status === ApplicationStatus.REJECTED).length,
    totalEarnings: 0 // TODO: Calculate from completed assignments
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
    <DashboardLayout 
      userRole="tasker" 
      userName={user?.name}
      sidebar={
        <div className="space-y-6">
          {/* Messages Section - Prominent and First */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-[calc(var(--radius)*1.5)] p-6 border border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-[calc(var(--radius)*1.5)] bg-green-500 flex items-center justify-center">
                  <MessageCircle className="h-4 w-4 text-white" />
                </div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">Messages</h3>
                  {totalUnreadCount > 0 && (
                    <Badge variant="destructive" className="text-xs px-2 py-1">
                      {totalUnreadCount}
                    </Badge>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => openMessagingDialog()}
                className="text-green-700 hover:text-green-900 dark:text-green-300 dark:hover:text-green-100"
              >
                Open
              </Button>
            </div>
            <p className="text-sm text-green-700 dark:text-green-300 leading-relaxed mb-3">
              Communicate with clients and manage your conversations in real-time.
            </p>
            {conversations.length > 0 && (
              <div className="text-xs text-green-600 dark:text-green-400">
                {conversations.length} active conversation{conversations.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>
          
          {/* Connections Widget */}
          <ConnectionsWidget />
        </div>
      }
    >
      {/* Quick Stats - collapsed on mobile */}
      <div className="hidden md:block mb-8">
        <TaskerQuickStats stats={stats} />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Mobile: Content */}
        <div className="lg:col-span-2">
          
          {/* Active Jobs - Jobs in progress that can be marked complete */}
          {activeJobs.length > 0 && (
            <div className="mb-8">
              <div className="bg-card border rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <Briefcase className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">Active Jobs</h2>
                    <p className="text-sm text-muted-foreground">
                      You have {activeJobs.length} job{activeJobs.length !== 1 ? 's' : ''} in progress
                    </p>
                  </div>
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
              </div>
            </div>
          )}
          
          {/* Applied Jobs - first/second on mobile */}
          <div className="mb-8">
            <Card>
              <CardContent className="p-6">
                <TaskerApplicationManager 
                  showOnlyHistorical={false}
                  title="Recent Applications"
                  description="Your latest job applications and their status"
                />
              </CardContent>
            </Card>
          </div>
          
          {/* Shortlisted Jobs - second/third on mobile */}
          {shortlistedApplications.length > 0 && (
            <div className="mb-8">
              <div className="bg-card border rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                    <Star className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">{tDashboard('tasker.shortlisted.title')}</h2>
                    <p className="text-sm text-muted-foreground">
                      {tDashboard('tasker.shortlisted.employersInterested', { count: shortlistedApplications.length })}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  {shortlistedApplications.slice(0, 2).map((application) => (
                    <div key={application.id} className="border rounded-lg p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border-yellow-200 dark:border-yellow-800">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                            {application.job?.title || 'Untitled Job'}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 font-medium">
                            {application.job?.company || 'Unknown Company'}
                          </p>
                        </div>
                        <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                          {tDashboard('tasker.stats.shortlisted')}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Connections History Section */}
          <div className="mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-[calc(var(--radius)*1.5)] bg-gradient-to-br from-purple-500/10 to-purple-600/20 flex items-center justify-center">
                    <History className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {tDashboard('connections.fullHistory') || 'Connection History'}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      View your complete connections transaction history
                    </p>
                  </div>
                </div>
                <ConnectionsFullHistory />
              </CardContent>
            </Card>
          </div>
        </div>
        
      </div>

      {/* Messaging Dialog */}
      <MessagingDialog />
    </DashboardLayout>
  )
}