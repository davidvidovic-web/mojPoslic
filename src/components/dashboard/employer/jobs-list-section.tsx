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
}

export function JobsListSection({ 
  jobs, 
  applicationCounts, 
  onEdit, 
  onDelete, 
  onPostNewJob 
}: JobsListSectionProps) {
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
          <div className="space-y-4">
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                applicationCount={applicationCounts[job.id] || 0}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
