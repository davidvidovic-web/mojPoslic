'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Job } from '@/types/job'
import { SavedJobsSection } from '@/components/dashboard/tasker/saved-jobs-section'
import { RecommendedJobsSection } from '@/components/dashboard/tasker/recommended-jobs-section'
import { TaskerApplicationManager } from '@/components/dashboard/tasker/tasker-application-manager'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { useTranslations } from 'next-intl'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function JobsPage() {
  const { user } = useAuth()
  const t = useTranslations('dashboard.jobs')
  const [savedJobs, setSavedJobs] = useState<Job[]>([])
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return

      try {
        const [savedResponse, recommendedResponse] = await Promise.all([
          fetch(`/api/user/saved-jobs?userId=${user.id}`),
          fetch('/api/jobs/recommended')
        ])

        if (savedResponse.ok) {
          const savedData = await savedResponse.json()
          setSavedJobs(savedData.savedJobs || [])
        }

        if (recommendedResponse.ok) {
          const recommendedData = await recommendedResponse.json()
          setRecommendedJobs(recommendedData.jobs || [])
        }
      } catch (error) {
        console.error('Error fetching jobs:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

  if (loading) {
    return (
      <DashboardLayout activeTab="jobs" title={t('title')} subtitle={t('loading')}>
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
      activeTab="jobs" 
      title={t('title')} 
      subtitle={t('subtitle')}
      userRole={user?.role}
    >
      <div className="space-y-8 max-w-6xl">
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="active">Active Applications</TabsTrigger>
            <TabsTrigger value="history">Application History</TabsTrigger>
            <TabsTrigger value="discover">Discover Jobs</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Active Applications</CardTitle>
                <CardDescription>
                  Track your ongoing job applications and manage active work assignments
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
                <CardTitle>Application History</CardTitle>
                <CardDescription>
                  View your past applications, completed work, and rejected applications
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
                  <CardTitle>Saved Jobs</CardTitle>
                  <CardDescription>
                    Jobs you&apos;ve bookmarked for later application
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SavedJobsSection savedJobs={savedJobs} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recommended for You</CardTitle>
                  <CardDescription>
                    Jobs matched to your skills and preferences
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
