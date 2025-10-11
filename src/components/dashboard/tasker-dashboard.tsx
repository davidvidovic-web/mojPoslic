'use client'

import { useState } from 'react'
import { useSupabaseAuth } from "@/contexts/supabase-auth-context"
import { useTranslations } from 'next-intl'
import { ApplicationStatus } from '@/types/application'
import TaskerApplicationManager from './tasker/tasker-application-manager'
import { TaskerQuickStats } from '@/components/dashboard/tasker/tasker-quick-stats'
import { ConnectionsWidget } from '@/components/dashboard/connections/connections-widget'
import { ConnectionsFullHistory } from './connections/connections-full-history'
import { DashboardLayout } from './dashboard-layout'
import { JobCompletionCard } from './job-completion-card'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Star, Briefcase, History, ChevronDown, ChevronUp } from 'lucide-react'
import { useUserApplications } from '@/hooks/use-applications'
import { useJobAcceptanceManager } from '@/hooks/useQueryManagers'
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
  
  // State for collapsible sections
  const [isConnectionHistoryOpen, setIsConnectionHistoryOpen] = useState(false)
  
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
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-600/20 flex items-center justify-center">
                  <Briefcase className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                    {tDashboard('tasker.activeJobs.title') || 'Active Jobs'}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 text-lg">
                    {tDashboard('tasker.activeJobs.description', { count: activeJobs.length }) || 'Jobs you are currently working on'}
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
            </CardContent>
          </Card>
        )}

        {/* Applications Section */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center">
                <Briefcase className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                  {tDashboard('tasker.applicationManager.recentApplications') || 'My Applications'}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  {tDashboard('tasker.applicationManager.recentApplicationsDescription') || 'Track your job applications and their status'}
                </p>
              </div>
            </div>
            <TaskerApplicationManager 
              showOnlyHistorical={false}
              title={tDashboard('tasker.applicationManager.recentApplications')}
              description={tDashboard('tasker.applicationManager.recentApplicationsDescription')}
            />
          </CardContent>
        </Card>

        {/* Shortlisted Jobs Section */}
        {shortlistedApplications.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-2xl bg-gradient-to-br from-yellow-500/10 to-yellow-600/20 flex items-center justify-center">
                  <Star className="h-4 w-4 text-yellow-600" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                    {tDashboard('tasker.shortlisted.title') || 'Shortlisted'}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 text-lg">
                    {tDashboard('tasker.shortlisted.employersInterested', { count: shortlistedApplications.length }) || 'Jobs where employers are interested'}
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
                          {application.job?.posted_by?.name || 'Unknown Company'}
                        </p>
                      </div>
                      <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 rounded-full px-2 py-1 text-xs font-medium">
                        {tDashboard('tasker.stats.shortlisted')}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

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
                      {tDashboard('connections.fullHistory') || 'Connection History'}
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
    </DashboardLayout>
  )
}