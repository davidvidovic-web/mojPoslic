'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Job } from '@/types/job'
import { Briefcase, Plus, Star } from 'lucide-react'
import { JobCard } from './job-card'
import { useTranslations } from 'next-intl'

interface JobsListSectionProps {
  jobs: Job[]
  applicationCounts: Record<string, number>
  onEdit: (job: Job) => void
  onDelete: (jobId: string) => void
  onPostNewJob: () => void
}

export function JobsListSection({ 
  jobs, 
  applicationCounts, 
  onEdit, 
  onDelete, 
  onPostNewJob 
}: JobsListSectionProps) {
  const t = useTranslations('jobs')
  
  // Separate featured and regular jobs
  const featuredJobs = jobs.filter(job => job.is_featured)
  const regularJobs = jobs.filter(job => !job.is_featured)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Job Postings</CardTitle>
      </CardHeader>
      <CardContent>
        {jobs.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No jobs posted yet</h3>
            <p className="text-muted-foreground mb-4">
              Start building your team by posting your first job opportunity.
            </p>
            <Button onClick={onPostNewJob}>
              <Plus className="h-4 w-4 mr-2" />
              Post Your First Job
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Featured Jobs Section */}
            {featuredJobs.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-6 h-6 bg-yellow-100 dark:bg-yellow-950/30 rounded-full">
                    <Star className="w-3 h-3 text-yellow-600 fill-current" />
                  </div>
                  <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    {t('sections.featuredJobs', { count: featuredJobs.length })}
                  </h4>
                  <div className="h-px flex-1 bg-gradient-to-r from-yellow-500/20 to-transparent"></div>
                </div>
                
                <div className="space-y-4">
                  {featuredJobs.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      applicationCount={applicationCounts[job.id] || 0}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Regular Jobs Section */}
            {regularJobs.length > 0 && (
              <div className="space-y-4">
                {featuredJobs.length > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-6 h-6 bg-primary/10 rounded-full">
                      <Briefcase className="w-3 h-3 text-primary" />
                    </div>
                    <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                      {t('sections.regularJobs', { count: regularJobs.length })}
                    </h4>
                    <div className="h-px flex-1 bg-gradient-to-r from-primary/20 to-transparent"></div>
                  </div>
                )}
                
                <div className="space-y-4">
                  {regularJobs.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      applicationCount={applicationCounts[job.id] || 0}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
