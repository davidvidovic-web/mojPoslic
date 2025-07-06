'use client'

import { Badge } from "@/components/ui/badge"
import { Card, CardHeader } from "@/components/ui/card"
import { 
  MapPin, 
  Calendar, 
  DollarSign, 
  Tag,
  Car
} from "lucide-react"
import { Job } from "@/types/job"
import { formatJobType, getJobTypeBadgeVariant, formatTransportation, formatClientName } from "@/lib/job-utils"

interface JobHeaderProps {
  job: Job
  formatDate: (dateString: string) => string
  formatSalary: (job: Job) => string | null
}

export function JobHeader({ job, formatDate, formatSalary }: JobHeaderProps) {
  const getTypeVariant = getJobTypeBadgeVariant

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-xl bg-muted border flex items-center justify-center font-bold text-xl">
            {formatClientName(job.company).charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold">{job.title}</h1>
                <p className="text-lg text-muted-foreground mt-1">{formatClientName(job.company)}</p>
              </div>
              <Badge variant={getTypeVariant(job.type)}>
                {formatJobType(job.type)}
              </Badge>
            </div>
            
            <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {job.city?.name || 'Remote'}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Posted {formatDate(job.posted_at)}
              </div>
              {job.category && (
                <div className="flex items-center gap-1">
                  <Tag className="h-4 w-4" />
                  {job.category.name}
                </div>
              )}
              {formatSalary(job) && (
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  {formatSalary(job)}
                </div>
              )}
              {job.transportation && (
                <div className="flex items-center gap-1">
                  <Car className="h-4 w-4" />
                  {formatTransportation(job.transportation, job.transportation_amount)}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
    </Card>
  )
}
