'use client'

import { Job } from '@/types/job'
import { JobCard } from './job-card'
import { Card, CardContent } from '@/components/ui/card'
import { Briefcase } from 'lucide-react'

interface JobsListSectionProps {
  jobs: Job[]
  applicationCounts: Record<string, number>
  onDelete: (jobId: string) => void
  onFeature?: (jobId: string, isFeatured: boolean) => void
  isLoading?: boolean
}

export function JobsListSection({ 
  jobs, 
  applicationCounts, 
  onDelete, 
  onFeature,
  isLoading = false 
}: JobsListSectionProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (jobs.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No jobs posted yet</h3>
            <p className="text-muted-foreground">
              Click &quot;Post a Job&quot; to create your first job posting.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <JobCard
          key={job.id}
          job={job}
          applicationCount={applicationCounts[job.id] || 0}
          onDelete={onDelete}
          onFeature={onFeature}
        />
      ))}
    </div>
  )
}
