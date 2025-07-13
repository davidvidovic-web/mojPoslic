'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Job } from '@/types/job'
import { MapPin, Calendar, DollarSign, Car, Star } from 'lucide-react'
import { formatJobType, formatTransportation } from '@/lib/job-utils'
import { JobCardActions } from './job-card-actions'

interface JobCardProps {
  job: Job
  applicationCount: number
  onEdit: (job: Job) => void
  onDelete: (jobId: string) => void
  onFeature?: (jobId: string, isFeatured: boolean) => void
}

export function JobCard({ job, applicationCount, onEdit, onDelete, onFeature }: JobCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <Card className={`border-l-4 ${job.is_featured ? 'border-l-yellow-500 bg-yellow-50/50 dark:bg-yellow-950/20' : 'border-l-blue-500'}`}>
      <CardContent className="p-4 sm:p-6">
        <div className="space-y-4">
          {/* Header with title and actions in top right */}
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex flex-col gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">{job.title}</h3>
                  {job.is_featured && (
                    <Badge variant="default" className="bg-yellow-500 hover:bg-yellow-600 text-xs flex items-center gap-1">
                      <Star className="h-3 w-3 fill-current" />
                      Featured
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary">{formatJobType(job.type)}</Badge>
                  {typeof applicationCount === 'number' && (
                    <Badge 
                      variant={applicationCount > 0 ? "default" : "outline"}
                      className="text-xs"
                    >
                      {applicationCount} application{applicationCount !== 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>
              </div>
              
              <div 
                className="text-sm text-muted-foreground mb-3 line-clamp-2 prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: job.description }}
              />
            </div>
            
            {/* Actions moved to top right corner */}
            <div className="flex-shrink-0">
              <JobCardActions 
                applicationCount={applicationCount}
                onEdit={() => onEdit(job)}
                onDelete={() => onDelete(job.id)}
                onFeature={onFeature ? () => onFeature(job.id, !job.is_featured) : undefined}
                isFeatured={job.is_featured}
              />
            </div>
          </div>
          
          {/* Transportation and tags row */}
          <div className="space-y-2">
            {job.transportation && (
              <div className="flex items-center">
                <Badge variant="outline" className="text-xs">
                  <Car className="h-3 w-3 mr-1" />
                  {formatTransportation(job.transportation, job.transportation_amount)}
                </Badge>
              </div>
            )}
            
            {job.tags && job.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {job.tags.slice(0, 4).map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {job.tags.length > 4 && (
                  <Badge variant="outline" className="text-xs">
                    +{job.tags.length - 4} more
                  </Badge>
                )}
              </div>
            )}
          </div>
          
          {/* Footer info */}
          <div className="flex flex-wrap gap-3 sm:gap-4 text-sm text-muted-foreground pt-2 border-t border-border/50">
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
              <span className="truncate">{job.city?.name || 'Remote'}</span>
            </div>
            {job.salary && (
              <div className="flex items-center">
                <DollarSign className="h-4 w-4 mr-1 flex-shrink-0" />
                <span className="truncate">{job.salary}</span>
              </div>
            )}
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1 flex-shrink-0" />
              <span>Posted {formatDate(job.created_at)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
