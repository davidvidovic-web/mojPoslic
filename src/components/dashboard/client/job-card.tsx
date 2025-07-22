'use client'

import { Badge } from '@/components/ui/badge'
import { Job } from '@/types/job'
import { MapPin, Calendar, DollarSign, Clock, AlertCircle, Star, Users } from 'lucide-react'
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
    <div className={`bg-white dark:bg-gray-950 rounded-2xl border ${job.is_featured ? 'border-yellow-200 dark:border-yellow-800 bg-gradient-to-br from-yellow-50/50 to-transparent dark:from-yellow-950/20' : 'border-gray-100 dark:border-gray-800'} p-6 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group`}>
      <div className="space-y-6">
        {/* Header with title and status */}
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center ring-1 ring-primary/10">
                <span className="text-lg font-bold text-primary">
                  {job.title.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 group-hover:text-primary transition-colors">{job.title}</h3>
                  {job.is_featured && (
                    <Badge className="bg-yellow-500 hover:bg-yellow-600 text-yellow-50 border-0 rounded-xl px-3 py-1 text-xs flex items-center gap-1">
                      <Star className="h-3 w-3 fill-current" />
                      {t('featured')}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className="bg-primary/10 text-primary border-0 rounded-xl px-3 py-1 text-xs">{formatJobType(job.type)}</Badge>
                  <Badge className={`border-0 rounded-xl px-3 py-1 text-xs ${status.color === 'text-green-600' ? 'bg-green-100 dark:bg-green-950/30 text-green-800 dark:text-green-400' : status.color === 'text-red-600' ? 'bg-red-100 dark:bg-red-950/30 text-red-800 dark:text-red-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-400'}`}>
                    {status.text}
                  </Badge>
                  {typeof applicationCount === 'number' && (
                    <Badge 
                      className={`border-0 rounded-xl px-3 py-1 text-xs ${applicationCount > 0 ? 'bg-blue-100 dark:bg-blue-950/30 text-blue-800 dark:text-blue-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}
                    >
                      <Users className="h-3 w-3 mr-1" />
                      {applicationCount} {applicationCount !== 1 ? t('applications') : t('application')}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            <div 
              className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 prose prose-sm max-w-none leading-relaxed"
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Start Date */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/30 flex items-center justify-center">
              <Calendar className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{t('startDate')}</p>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{formatStartDate(job.start_date)}</p>
            </div>
          </div>
          
          {/* Salary */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-green-100 dark:bg-green-950/30 flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{t('salary')}</p>
              <p className="text-sm font-semibold text-green-600">{formatSalary(job)}</p>
            </div>
          </div>
          
          {/* Location */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/30 flex items-center justify-center">
              <MapPin className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{t('location')}</p>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{job.city?.name || t('remote')}</p>
            </div>
          </div>
          
          {/* Duration or Expiration */}
          {job.duration ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-orange-100 dark:bg-orange-950/30 flex items-center justify-center">
                <Clock className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{t('duration')}</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{job.duration}</p>
              </div>
            </div>
          ) : job.expires_at && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-red-100 dark:bg-red-950/30 flex items-center justify-center">
                <AlertCircle className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{t('expires')}</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{formatDate(job.expires_at)}</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Tags section */}
        {job.tags && job.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {job.tags.slice(0, 4).map((tag, index) => (
              <Badge key={index} className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-0 rounded-xl px-3 py-1 text-xs">
                {tag}
              </Badge>
            ))}
            {job.tags.length > 4 && (
              <Badge className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-0 rounded-xl px-3 py-1 text-xs">
                +{job.tags.length - 4} {t('more')}
              </Badge>
            )}
          </div>
        )}
        
        {/* Footer info */}
        <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{t('posted')} {formatDate(job.createdAt)}</span>
          </div>
            
          {applicationCount > 0 && (
            <div className="flex items-center gap-2 text-blue-600">
              <Users className="h-4 w-4" />
              <span className="font-medium">{applicationCount} {t('applicants')}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
