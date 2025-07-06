'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { JobCard } from '@/components/jobs/job-card'
import { Target } from 'lucide-react'
import { Job } from '@/types/job'

interface RecommendedJobsSectionProps {
  recommendedJobs: Job[]
}

export function RecommendedJobsSection({ recommendedJobs }: RecommendedJobsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Target className="h-5 w-5 mr-2" />
          Recommended Jobs
        </CardTitle>
      </CardHeader>
      <CardContent>
        {recommendedJobs.length === 0 ? (
          <div className="text-center py-8">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold">No recommendations yet</h3>
          </div>
        ) : (
          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            {recommendedJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
