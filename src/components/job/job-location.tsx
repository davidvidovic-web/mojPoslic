'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin } from "lucide-react"
import { Job } from "@/types/job"
import { JobLocationMap } from "@/components/job-location-map"

interface JobLocationProps {
  job: Job
}

export function JobLocation({ job }: JobLocationProps) {
  if (!job.job_address && !job.job_latitude && !job.job_longitude) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Job Location
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {job.job_address && (
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
            <p className="text-sm">{job.job_address}</p>
          </div>
        )}
        
        {job.job_latitude && job.job_longitude && (
          <JobLocationMap
            latitude={job.job_latitude}
            longitude={job.job_longitude}
            address={job.job_address}
            jobTitle={job.title}
            company={job.company}
          />
        )}
      </CardContent>
    </Card>
  )
}
