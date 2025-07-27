'use client'

import { useSupabaseAuth } from '@/contexts/supabase-auth-context'
import { SavedJobsSection } from '@/components/dashboard/tasker/saved-jobs-section'
import { RecommendedJobsSection } from '@/components/dashboard/tasker/recommended-jobs-section'
import { TaskerApplicationManager } from '@/components/dashboard/tasker/tasker-application-manager'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { useTranslations } from 'next-intl'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useRecommendedJobsQuery } from '@/hooks/queries/useJobs'

export default function JobsPage() {
  const { user } = useSupabaseAuth()
  const t = useTranslations('dashboard.jobs')
  
  // Use new Supabase-based hooks
  const { data: recommendedJobs = [], isLoading: recommendedLoading } = useRecommendedJobsQuery(user?.id, 10)
  
  // TODO: Implement saved jobs query when available
  const savedJobs: Array<unknown> = []
  const loading = recommendedLoading

  if (loading) {
    return (
      <DashboardLayout title={t('title')} subtitle={t('loading')}>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">{t('loading')}</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout 
      title={t('title')} 
      subtitle={t('subtitle')}
      userRole={user?.role}
    >
      <div className="space-y-8 max-w-6xl">
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="active">{t('tabs.active')}</TabsTrigger>
            <TabsTrigger value="history">{t('tabs.history')}</TabsTrigger>
            <TabsTrigger value="discover">{t('tabs.discover')}</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('activeApplications.title')}</CardTitle>
                <CardDescription>
                  {t('activeApplications.description')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TaskerApplicationManager 
                  showOnlyHistorical={false}
                  title=""
                  description=""
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('applicationHistory.title')}</CardTitle>
                <CardDescription>
                  {t('applicationHistory.description')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TaskerApplicationManager 
                  showOnlyHistorical={true}
                  title=""
                  description=""
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="discover" className="space-y-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t('savedJobs.title')}</CardTitle>
                  <CardDescription>
                    {t('savedJobs.description')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SavedJobsSection savedJobs={savedJobs} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t('recommendedJobs.title')}</CardTitle>
                  <CardDescription>
                    {t('recommendedJobs.description')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RecommendedJobsSection recommendedJobs={recommendedJobs} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
