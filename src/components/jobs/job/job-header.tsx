'use client'

import { Badge } from "@/components/ui/badge"
import { Card, CardHeader } from "@/components/ui/card"
import { 
  MapPin, 
  Calendar, 
  DollarSign, 
  Tag,
  Car,
  Star,
  Users,
  CheckCircle
} from "lucide-react"
import { Job } from "@/types/job"
import { formatJobType, getJobTypeBadgeVariant, formatTransportation, formatClientName } from "@/lib/job-utils"
import { useJobApplicantCount } from "@/hooks/use-applications"

interface JobHeaderProps {
  job: Job
  formatDate: (dateString: string) => string
  formatSalary: (job: Job) => string | null
  hasApplied?: boolean
}

export function JobHeader({ job, formatDate, formatSalary, hasApplied = false }: JobHeaderProps) {
  const getTypeVariant = getJobTypeBadgeVariant
  const { data: applicantCount = 0 } = useJobApplicantCount(job.id)

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
              <div className="flex flex-wrap gap-2">
                <Badge variant={getTypeVariant(job.type)}>
                  {formatJobType(job.type)}
                </Badge>
                {job.is_featured && (
                  <Badge variant="default" className="bg-yellow-500 hover:bg-yellow-600 text-xs flex items-center gap-1">
                    <Star className="h-3 w-3 fill-current" />
                    Featured
                  </Badge>
                )}
                {hasApplied && (
                  <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-xs flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Applied
                  </Badge>
                )}
              </div>
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
              {applicantCount > 0 && (
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {applicantCount} {applicantCount === 1 ? 'applicant' : 'applicants'}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
    </Card>
  )
}
