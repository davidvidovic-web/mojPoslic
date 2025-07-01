'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react"
import { Job } from "@/types/job"

interface JobTimelineProps {
  job: Job
  formatDate: (dateString: string) => string
}

export function JobTimeline({ job, formatDate }: JobTimelineProps) {
  if (!job.start_date && !job.start_time && !job.duration && !job.expires_at) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Schedule & Timeline
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {job.start_date && (
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <div>
              <p className="text-sm font-medium">Start Date</p>
              <p className="text-sm text-muted-foreground">
                {new Date(job.start_date).toLocaleDateString()}
                {job.start_time && ` at ${new Date(`2000-01-01T${job.start_time}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`}
              </p>
            </div>
          </div>
        )}
        
        {job.duration && (
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-600" />
            <div>
              <p className="text-sm font-medium">Expected Duration</p>
              <p className="text-sm text-muted-foreground">
                {job.duration.replace('_', ' ').replace(/(\d+)/, '$1 ').toLowerCase()}
              </p>
            </div>
          </div>
        )}
        
        {job.expires_at && (
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <div>
              <p className="text-sm font-medium">Application Deadline</p>
              <p className="text-sm text-muted-foreground">
                {formatDate(job.expires_at)}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
