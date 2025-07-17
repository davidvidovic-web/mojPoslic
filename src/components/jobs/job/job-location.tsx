'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin } from "lucide-react"
import { Job } from "@/types/job"
import { JobLocationMap } from "@/components/jobs/job-location-map"
import { useTranslations } from 'next-intl'

interface JobLocationProps {
  job: Job
  showFullLocation?: boolean // New prop to control what location info to show
}

export function JobLocation({ job, showFullLocation = false }: JobLocationProps) {
  const t = useTranslations('jobs.location')
  
  // If no location data at all, don't render
  if (!job.city && !job.job_address && !job.job_latitude && !job.job_longitude) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          {t('jobLocation')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Always show city */}
        {job.city && (
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
            <p className="text-sm font-medium">{job.city.name}</p>
          </div>
        )}
        
        {/* Only show address and map if showFullLocation is true */}
        {showFullLocation && (
          <>
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
          </>
        )}
        
        {/* Show a message if location is hidden */}
        {!showFullLocation && (job.job_address || (job.job_latitude && job.job_longitude)) && (
          <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
            {t('exactAddressMessage')}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
