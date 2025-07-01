'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Job } from '@/types/job'
import { MapPin, Calendar, DollarSign, Car } from 'lucide-react'
import { formatJobType, formatTransportation } from '@/lib/job-utils'
import { JobCardActions } from './job-card-actions'

interface JobCardProps {
  job: Job
  applicationCount: number
  onEdit: (job: Job) => void
  onDelete: (jobId: string) => void
}

export function JobCard({ job, applicationCount, onEdit, onDelete }: JobCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold">{job.title}</h3>
              <Badge variant="secondary">{formatJobType(job.type)}</Badge>
              {job.transportation && (
                <Badge variant="outline" className="text-xs">
                  <Car className="h-3 w-3 mr-1" />
                  {formatTransportation(job.transportation, job.transportation_amount)}
                </Badge>
              )}
              {typeof applicationCount === 'number' && (
                <Badge 
                  variant={applicationCount > 0 ? "default" : "outline"}
                  className="text-xs"
                >
                  {applicationCount} application{applicationCount !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>
            
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {job.description}
            </p>
            
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                {job.city?.name || 'Remote'}
              </div>
              {job.salary && (
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-1" />
                  {job.salary}
                </div>
              )}
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                Posted {formatDate(job.created_at)}
              </div>
            </div>
            
            {job.tags && job.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {job.tags.slice(0, 3).map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {job.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{job.tags.length - 3} more
                  </Badge>
                )}
              </div>
            )}
          </div>
          
          <JobCardActions 
            applicationCount={applicationCount}
            onEdit={() => onEdit(job)}
            onDelete={() => onDelete(job.id)}
          />
        </div>
      </CardContent>
    </Card>
  )
}
