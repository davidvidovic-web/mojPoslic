'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Bookmark } from 'lucide-react'
import { Job } from '@/types/job'
import { formatJobType, formatEmployerName } from '@/lib/job-utils'

interface SavedJobsSectionProps {
  savedJobs: Job[]
}

export function SavedJobsSection({ savedJobs }: SavedJobsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Bookmark className="h-5 w-5 mr-2" />
          Saved Jobs
        </CardTitle>
      </CardHeader>
      <CardContent>
        {savedJobs.length === 0 ? (
          <div className="text-center py-8">
            <Bookmark className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No saved jobs</h3>
            <p className="text-muted-foreground">
              Save interesting jobs to apply later.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {savedJobs.map((job) => (
              <div key={job.id} className="border rounded-lg p-4">
                <h4 className="font-semibold mb-1">{job.title}</h4>
                <p className="text-sm text-muted-foreground mb-2">{formatEmployerName(job.company)}</p>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">{formatJobType(job.type)}</Badge>
                  <Button size="sm">Apply Now</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
