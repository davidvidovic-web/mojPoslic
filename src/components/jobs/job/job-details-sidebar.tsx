'use client'

import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Job } from "@/types/job"
import { formatJobType, getJobTypeBadgeVariant, formatTransportation } from "@/lib/job-utils"

interface JobDetailsSidebarProps {
  job: Job
  formatDate: (dateString: string) => string
  formatSalary: (job: Job) => string | null
}

export function JobDetailsSidebar({ job, formatDate, formatSalary }: JobDetailsSidebarProps) {
  const getTypeVariant = getJobTypeBadgeVariant

  return (
    <Card>
      <CardHeader>
        <CardTitle>Job Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Job Type</span>
          <Badge variant={getTypeVariant(job.type)}>{formatJobType(job.type)}</Badge>
        </div>
        
        {job.category && (
          <>
            <Separator />
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Category</span>
              <span className="text-sm font-medium">{job.category.name}</span>
            </div>
          </>
        )}
        
        <Separator />
        
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Posted</span>
          <span className="text-sm">{formatDate(job.posted_at)}</span>
        </div>
        
        {job.start_date && (
          <>
            <Separator />
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Start Date</span>
              <span className="text-sm">{new Date(job.start_date).toLocaleDateString()}</span>
            </div>
          </>
        )}
        
        {job.expires_at && (
          <>
            <Separator />
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Expires</span>
              <span className="text-sm">{formatDate(job.expires_at)}</span>
            </div>
          </>
        )}
        
        {formatSalary(job) && (
          <>
            <Separator />
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Salary</span>
              <span className="text-sm font-medium">{formatSalary(job)}</span>
            </div>
          </>
        )}

        {job.transportation && (
          <>
            <Separator />
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Transportation</span>
              <span className="text-sm font-medium">{formatTransportation(job.transportation, job.transportation_amount)}</span>
            </div>
          </>
        )}

        {job.job_address && (
          <>
            <Separator />
            <div className="flex justify-between items-start">
              <span className="text-sm text-muted-foreground">Address</span>
              <span className="text-sm text-right max-w-[200px]">{job.job_address}</span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
