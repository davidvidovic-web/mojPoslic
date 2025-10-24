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

interface ApplicationStats {
  total: number
  pending: number
  accepted: number
  rejected: number
}

export function TaskerDashboard() {
  const { user } = useSupabaseAuth()
  
  // Translation hooks
  const tDashboard = useTranslations('dashboard')
  
  // Use Supabase hooks for user-specific data
  const { data: applications = [], isLoading: applicationsLoading } = useUserApplications(user?.id)
  const { activeJobs, isLoading: isLoadingActiveJobs } = useJobAcceptanceManager()
  
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
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}