'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Job } from '@/types/job'
import { Briefcase, Plus } from 'lucide-react'
import { JobCard } from './job-card'

interface JobsListSectionProps {
  jobs: Job[]
  applicationCounts: Record<string, number>
  onEdit: (job: Job) => void
  onDelete: (jobId: string) => void
  onPostNewJob: () => void
  onFeature?: (jobId: string, isFeatured: boolean) => void
}

export function JobsListSection({ 
  jobs, 
  applicationCounts, 
  onEdit, 
  onDelete, 
  onPostNewJob,
  onFeature 
}: JobsListSectionProps) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="h-5 w-5" />
          Your Job Postings
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {jobs.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No jobs posted yet</h3>
            <p className="text-muted-foreground mb-4 text-sm sm:text-base">
              Start building your team by posting your first job opportunity.
            </p>
            <Button onClick={onPostNewJob} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Post Your First Job
            </Button>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                applicationCount={applicationCounts[job.id] || 0}
                onEdit={onEdit}
                onDelete={onDelete}
                onFeature={onFeature}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
