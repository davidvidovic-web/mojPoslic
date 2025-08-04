'use client'

import { Badge } from '@/components/ui/badge'
import { Job } from '@/types/job'
import { formatJobType } from '@/lib/job-utils'
import { JobCardActions } from './job-card-actions'
import { useTranslations, useLocale } from 'next-intl'

interface JobCardProps {
  job: Job
  applicationCount: number
  onDelete: (jobId: string) => void
  onEdit?: (job: Job) => void
  onFeature?: (jobId: string, isFeatured: boolean) => void
}

export function JobCard({ job, applicationCount, onDelete, onEdit, onFeature }: JobCardProps) {
  const t = useTranslations('dashboard.jobCard')
  const locale = useLocale()
  
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) {
      return 'Not available'
    }
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        return 'Invalid date'
      }
      return date.toLocaleDateString()
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
      const typeMap: Record<string, string> = {
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
      const typeMap: Record<string, string> = {
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
    <div className={`bg-white dark:bg-gray-950 rounded-[var(--radius)] border ${job.is_featured ? 'border-yellow-200 dark:border-yellow-800 bg-gradient-to-br from-yellow-50/50 to-transparent dark:from-yellow-950/20' : 'border-gray-100 dark:border-gray-800'} p-4 hover:shadow-md hover:shadow-primary/5 transition-all duration-200 group`}>
      {/* Header - Title, Status, and Actions in one row */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          {/* Title and Badges */}
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 group-hover:text-primary transition-colors truncate">{job.title}</h3>
            {job.is_featured && (
              <Badge className="bg-yellow-500 text-yellow-50 border-0 rounded-[var(--radius)] px-2 py-0.5 text-xs flex-shrink-0">
                {t('featured')}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <Badge className="bg-primary/10 text-primary border-0 rounded-[var(--radius)] px-2 py-0.5 text-xs">{formatJobType(job.type || job.job_type, locale)}</Badge>
            <Badge className={`border-0 rounded-[var(--radius)] px-2 py-0.5 text-xs ${status.color === 'text-green-600' ? 'bg-green-100 dark:bg-green-950/30 text-green-800 dark:text-green-400' : status.color === 'text-red-600' ? 'bg-red-100 dark:bg-red-950/30 text-red-800 dark:text-red-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-400'}`}>
              {status.text}
            </Badge>
            {typeof applicationCount === 'number' && (
              <Badge 
                className={`border-0 rounded-[var(--radius)] px-2 py-0.5 text-xs ${applicationCount > 0 ? 'bg-blue-100 dark:bg-blue-950/30 text-blue-800 dark:text-blue-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}
              >
                {applicationCount}
              </Badge>
            )}
            {/* All Tags */}
            {job.tags && job.tags.length > 0 && (
              job.tags.map((tag, index) => (
                <Badge key={index} className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-0 rounded-[var(--radius)] px-2 py-0.5 text-xs">
                  {tag}
                </Badge>
              ))
            )}
          </div>
        </div>
        
        {/* Actions - Only Edit and Delete */}
        <div className="flex-shrink-0">
          <JobCardActions 
            onDelete={() => onDelete(job.id)}
            onEdit={onEdit ? () => onEdit(job) : undefined}
            onFeature={onFeature ? (isFeatured: boolean) => onFeature(job.id, isFeatured) : undefined}
            isFeatured={job.is_featured || false}
          />
        </div>
      </div>

      {/* Description - Single line with ellipsis */}
      <div 
        className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-1 prose prose-sm max-w-none"
        dangerouslySetInnerHTML={{ __html: job.description }}
      />
      
      {/* Details - Text Only Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3 text-xs text-gray-500 dark:text-gray-400">
        <div>
          <span className="font-medium">{t('salary')}: </span>
          <span className="text-green-600 font-medium">{formatSalary(job)}</span>
        </div>
        
        <div>
          <span className="font-medium">{t('location')}: </span>
          <span>
            {job.exact_location || job.job_address ? (
              <span className="text-sm">
                {job.exact_location || job.job_address}
                {job.city?.name && (
                  <span className="text-gray-500 dark:text-gray-400 ml-1">
                    ({job.city.name})
                  </span>
                )}
              </span>
            ) : (
              job.city?.name || t('remote')
            )}
          </span>
        </div>
        
        <div>
          <span className="font-medium">{t('startDate')}: </span>
          <span>{formatStartDate(job.start_date)}</span>
        </div>
        
        {job.duration ? (
          <div>
            <span className="font-medium">{t('duration')}: </span>
            <span>{job.duration}</span>
          </div>
        ) : job.expires_at && (
          <div>
            <span className="font-medium">{t('expires')}: </span>
            <span>{formatDate(job.expires_at)}</span>
          </div>
        )}
      </div>
      {/* Footer */}
      <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-800">
        <span>{t('posted')} {formatDate(job.posted_at || job.createdAt)}</span>
        
        {applicationCount > 0 && (
          <span className="text-blue-600 font-medium">
            {applicationCount} {applicationCount === 1 ? t('application') : t('applications')}
          </span>
        )}
      </div>
    </div>
  )
}
