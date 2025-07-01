'use client'

import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Car } from "lucide-react"
import { Job } from "@/types/job"
import { formatJobType, getJobTypeBadgeVariant, formatSalary, formatRelativeDate, formatStartDate, formatTransportation, formatClientName } from "@/lib/job-utils"

interface JobCardProps {
  job: Job
}

export function JobCard({ job }: JobCardProps) {
  const handleApply = () => {
    if (job.website) {
      window.open(job.website, '_blank')
    } else if (job.email) {
      window.location.href = `mailto:${job.email}?subject=Application for ${job.title}`
    }
  }

  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
      <CardHeader className="flex-row items-start gap-4 p-6">
        <div className="w-12 h-12 rounded-lg bg-muted border flex items-center justify-center font-bold text-lg">
          {formatClientName(job.company).charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg leading-tight truncate">
                {job.title}
              </h3>
              <p className="text-muted-foreground mt-1">{formatClientName(job.company)}</p>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 space-y-4 pt-0 px-6">
        <div>
          <p className="text-sm line-clamp-3 text-muted-foreground">
            {job.description}
          </p>
        </div>

        <div className="space-y-3">
          {/* Badge section - all items styled consistently */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={getJobTypeBadgeVariant(job.type)}>
              {formatJobType(job.type)}
            </Badge>
            
            {job.category && (
              <Badge variant="secondary">
                {job.category.name}
              </Badge>
            )}
            
            <Badge variant="outline" className="text-xs">
              <span className="mr-1">📍</span>
              {job.city?.name || 'Remote'}
            </Badge>
            
            {formatSalary(job) && (
              <Badge variant="outline" className="text-xs">
                <span className="mr-1">💰</span>
                {formatSalary(job)}
              </Badge>
            )}
            
            {job.transportation && (
              <Badge variant="outline" className="text-xs">
                <Car className="h-3 w-3 mr-1" />
                {formatTransportation(job.transportation, job.transportation_amount)}
              </Badge>
            )}
          </div>

          {job.job_address && (
            <div className="flex items-center text-sm text-muted-foreground">
              <span className="mr-2">🏢</span>
              <span className="truncate">{job.job_address}</span>
            </div>
          )}

          <div className="flex items-center text-sm text-muted-foreground">
            <span className="mr-2">⏰</span>
            <span>{formatRelativeDate(job.posted_at)}</span>
          </div>

          {job.start_date && (
            <div className="flex items-center text-sm text-muted-foreground">
              <span className="mr-2">🚀</span>
              <span>{formatStartDate(job.start_date)}</span>
            </div>
          )}
        </div>

        <Separator className="my-4" />
        
        <div className="flex items-center text-xs text-muted-foreground">
          <span className="mr-2">👁️</span>
          <span>Posted {formatRelativeDate(job.posted_at)}</span>
        </div>
      </CardContent>

      <CardFooter className="p-6 pt-0">
        <Button 
          onClick={handleApply}
          className="w-full"
          disabled={!job.website && !job.email}
        >
          Apply Now {job.website || job.email ? '↗' : ''}
        </Button>
      </CardFooter>
    </Card>
  )
}
