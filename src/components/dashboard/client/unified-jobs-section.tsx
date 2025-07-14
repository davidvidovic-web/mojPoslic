'use client'

import { useState } from 'react'
import { Job } from '@/types/job'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { JobsListSection } from './jobs-list-section'
import { DashboardApplicationManager } from '@/components/dashboard/dashboard-application-manager'
import { 
  Briefcase, 
  Users, 
  Eye,
  TrendingUp,
  Plus
} from 'lucide-react'

interface UnifiedJobsSectionProps {
  jobs: Job[]
  applicationCounts: Record<string, number>
  onEdit: (job: Job) => void
  onDelete: (jobId: string) => void
  onFeature?: (jobId: string, isFeatured: boolean) => void
  onPostNewJob?: () => void
  loading?: boolean
}

export function UnifiedJobsSection({ 
  jobs, 
  applicationCounts, 
  onEdit, 
  onDelete, 
  onFeature,
  onPostNewJob,
  loading = false 
}: UnifiedJobsSectionProps) {
  const [activeSubTab, setActiveSubTab] = useState('my-jobs')

  // Calculate statistics
  const totalJobs = jobs.length
  const activeJobs = jobs.filter(job => job.is_active !== false).length
  const totalApplications = Object.values(applicationCounts).reduce((sum, count) => sum + count, 0)
  const featuredJobs = jobs.filter(job => job.is_featured).length

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-gray-200 rounded w-16"></div>
                <div className="h-4 w-4 bg-gray-200 rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-12 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-24"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalJobs}</div>
            <p className="text-xs text-muted-foreground">
              {activeJobs} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalApplications}</div>
            <p className="text-xs text-muted-foreground">
              Across all jobs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Featured Jobs</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{featuredJobs}</div>
            <p className="text-xs text-muted-foreground">
              Promoted listings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Applications</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalJobs > 0 ? Math.round(totalApplications / totalJobs) : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Per job posting
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Jobs and Applications Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Jobs & Applications Management
            </CardTitle>
            {onPostNewJob && (
              <Button onClick={onPostNewJob} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Post New Job
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="my-jobs" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                My Jobs ({totalJobs})
              </TabsTrigger>
              <TabsTrigger value="applications" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Applications ({totalApplications})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="my-jobs" className="space-y-4 mt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Posted Jobs</h3>
                  <p className="text-sm text-muted-foreground">
                    Manage your job postings, view applications, and track performance
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {totalJobs > 0 && (
                    <Badge variant="secondary">
                      {activeJobs} of {totalJobs} active
                    </Badge>
                  )}
                  {onPostNewJob && (
                    <Button variant="outline" size="sm" onClick={onPostNewJob} className="hidden sm:flex items-center gap-1">
                      <Plus className="h-3 w-3" />
                      Post Job
                    </Button>
                  )}
                </div>
              </div>
              
              <JobsListSection 
                jobs={jobs}
                applicationCounts={applicationCounts}
                onEdit={onEdit}
                onDelete={onDelete}
                onFeature={onFeature}
                isLoading={loading}
              />
            </TabsContent>

            <TabsContent value="applications" className="space-y-4 mt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Application Management</h3>
                  <p className="text-sm text-muted-foreground">
                    Review, manage, and respond to applications for all your job postings
                  </p>
                </div>
                {totalApplications > 0 && (
                  <Badge variant="secondary">
                    {totalApplications} total applications
                  </Badge>
                )}
              </div>
              
              <DashboardApplicationManager />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
