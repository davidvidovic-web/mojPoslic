'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Job } from '@/types/job'
import { MapPin, Calendar, DollarSign, Clock, AlertCircle, Star, CheckCircle, Users } from 'lucide-react'
import { formatJobType } from '@/lib/job-utils'
import { JobCardActions } from './job-card-actions'
import { useTranslations } from 'next-intl'

interface JobCardProps {
  job: Job
  applicationCount: number
  onDelete: (jobId: string) => void
  onEdit?: (job: Job) => void
  onFeature?: (jobId: string, isFeatured: boolean) => void
}

export function JobCard({ job, applicationCount, onDelete, onEdit, onFeature }: JobCardProps) {
  const t = useTranslations('dashboard.jobCard')
  
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString()
    } catch {
      return 'Invalid date'
    }
  }

  const formatStartDate = (dateString?: string) => {
    if (!dateString || dateString === 'negotiable') {
      return t('byAgreement')
    }
    try {
      return new Date(dateString).toLocaleDateString()
    } catch {
      return t('byAgreement')
    }
  }

  const formatSalary = (job: Job) => {
    // Use structured salary data if available
    if (job.salaryMin && job.salaryMax && job.salaryType) {
      const min = job.salaryMin.toLocaleString()
      const max = job.salaryMax.toLocaleString()
      const typeMap = {
        'hourly': '/h',
        'daily': '/day', 
        'weekly': '/week',
        'monthly': '/month',
        'fixed': '',
        'negotiable': ''
      }
      const typeSuffix = typeMap[job.salaryType] || ''
      
      if (job.salaryType === 'fixed') {
        return `${min} BAM`
      }
      return `${min} - ${max} BAM${typeSuffix}`
    }
    
    if (job.salaryMin && job.salaryType) {
      const min = job.salaryMin.toLocaleString()
      const typeMap = {
        'hourly': '/h',
        'daily': '/day', 
        'weekly': '/week',
        'monthly': '/month',
        'fixed': '',
        'negotiable': ''
      }
      const typeSuffix = typeMap[job.salaryType] || ''
      
      if (job.salaryType === 'fixed') {
        return `${min} BAM`
      }
      return `From ${min} BAM${typeSuffix}`
    }
    
    // Fallback to legacy salary field
    return job.salary || t('negotiable')
  }

  const getJobStatus = () => {
    const now = new Date()
    const expiresAt = job.expires_at ? new Date(job.expires_at) : null
    
    if (expiresAt && expiresAt < now) {
      return { status: 'expired', color: 'text-red-600', bgColor: 'bg-red-50 border-red-200', text: t('expired') }
    }
    
    if (!job.is_active) {
      return { status: 'inactive', color: 'text-gray-600', bgColor: 'bg-gray-50 border-gray-200', text: t('inactive') }
    }
    
    return { status: 'active', color: 'text-green-600', bgColor: 'bg-green-50 border-green-200', text: t('active') }
  }

  const status = getJobStatus()

  return (
    <Card className={`border-l-4 ${job.is_featured ? 'border-l-yellow-500 bg-yellow-50/50 dark:bg-yellow-950/20' : 'border-l-blue-500'} ${status.bgColor}`}>
      <CardContent className="p-4 sm:p-6">
        <div className="space-y-4">
          {/* Header with title and status */}
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex flex-col gap-2 mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg font-semibold">{job.title}</h3>
                  {job.is_featured && (
                    <Badge variant="default" className="bg-yellow-500 hover:bg-yellow-600 text-xs flex items-center gap-1">
                      <Star className="h-3 w-3 fill-current" />
                      {t('featured')}
                    </Badge>
                  )}
                  <Badge variant="outline" className={`text-xs ${status.color} border-current`}>
                    {status.text}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary">{formatJobType(job.type)}</Badge>
                  {typeof applicationCount === 'number' && (
                    <Badge 
                      variant={applicationCount > 0 ? "default" : "outline"}
                      className="text-xs"
                    >
                      {applicationCount} {applicationCount !== 1 ? t('applications') : t('application')}
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
                onDelete={() => onDelete(job.id)}
                onEdit={onEdit ? () => onEdit(job) : undefined}
                onFeature={onFeature ? () => onFeature(job.id, !job.is_featured) : undefined}
                isFeatured={job.is_featured}
              />
            </div>
          </div>
          
          {/* Key Job Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-muted/30 rounded-lg">
            {/* Start Date */}
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="font-medium min-w-[60px]">{t('startDate')}:</span>
              <span className="text-muted-foreground">{formatStartDate(job.start_date)}</span>
            </div>
            
            {/* Start Time */}
            {job.start_time && job.start_time !== 'negotiable' && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="font-medium min-w-[60px]">{t('startTime')}:</span>
                <span className="text-muted-foreground">{job.start_time}</span>
              </div>
            )}
            
            {/* Duration */}
            {job.duration && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="font-medium min-w-[60px]">{t('duration')}:</span>
                <span className="text-muted-foreground">{job.duration}</span>
              </div>
            )}
            
            {/* Salary */}
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="font-medium min-w-[60px]">{t('salary')}:</span>
              <span className="text-green-600 font-medium">{formatSalary(job)}</span>
            </div>
            
            {/* Location */}
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="font-medium min-w-[60px]">{t('location')}:</span>
              <span className="text-muted-foreground">{job.city?.name || t('remote')}</span>
            </div>
            
            {/* Expiration */}
            {job.expires_at && (
              <div className="flex items-center gap-2 text-sm">
                <AlertCircle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="font-medium min-w-[60px]">{t('expires')}:</span>
                <span className="text-muted-foreground">{formatDate(job.expires_at)}</span>
              </div>
            )}
          </div>
          
          {/* Tags section */}
          {job.tags && job.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {job.tags.slice(0, 4).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {job.tags.length > 4 && (
                <Badge variant="outline" className="text-xs">
                  +{job.tags.length - 4} {t('more')}
                </Badge>
              )}
            </div>
          )}
          
          {/* Footer info */}
          <div className="flex justify-between items-center text-sm text-muted-foreground pt-2 border-t border-border/50">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{t('posted')} {formatDate(job.createdAt)}</span>
            </div>
            
            {applicationCount > 0 && (
              <div className="flex items-center gap-1 text-blue-600">
                <Users className="h-3 w-3" />
                <span className="font-medium">{applicationCount} {t('applicants')}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
