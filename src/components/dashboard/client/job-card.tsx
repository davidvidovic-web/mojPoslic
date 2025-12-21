'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Job } from '@/types/job'
import { formatJobType, getJobExpirationDate, isJobExpired, formatSalary } from '@/lib/job-utils'
import { formatDate as formatDateUtil } from '@/lib/date-format'
import { JobCardActions } from './job-card-actions'
import { useTranslations, useLocale } from 'next-intl'
import { Eye, MessageCircle, User } from 'lucide-react'

interface SelectedCandidate {
  id: string
  name: string
  avatarUrl?: string
}

interface JobCardProps {
  job: Job
  applicationCount: number
  onDelete: (jobId: string) => void
  onEdit?: (job: Job) => void
  onFeature?: (jobId: string, isFeatured: boolean) => void
  hideFeaturedBadge?: boolean
  selectedCandidate?: SelectedCandidate | null
  onViewProfile?: (candidateId: string) => void
  onMessageCandidate?: (candidateId: string, jobId: string) => void
}

export function JobCard({ 
  job, 
  applicationCount, 
  onDelete, 
  onEdit, 
  onFeature, 
  hideFeaturedBadge = false,
  selectedCandidate,
  onViewProfile,
  onMessageCandidate
}: JobCardProps) {
  const t = useTranslations('dashboard.jobCard')
  const locale = useLocale()
  
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) {
      return 'Not available'
    }
    try {
      return formatDateUtil(dateString, locale as 'bs' | 'en', { format: 'short' })
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



  const getJobStatus = () => {
    // Check if job is expired based on application_deadline or 14 days from creation
    if (isJobExpired(job)) {
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
            {job.is_featured && !hideFeaturedBadge && (
              <Badge className="bg-yellow-500 text-yellow-50 border-0 rounded-[var(--radius)] px-2 py-0.5 text-xs flex-shrink-0">
                {t('featured')}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <Badge className="bg-primary/10 text-primary border-0 rounded-[var(--radius)] px-2 py-0.5 text-xs">{formatJobType(job.type || job.job_type, locale as 'bs' | 'en')}</Badge>
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
      
      {/* Selected Candidate Section */}
      {selectedCandidate && (
        <div className="mb-3 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-md">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <Avatar className="h-10 w-10 flex-shrink-0">
                <AvatarImage 
                  src={selectedCandidate.avatarUrl} 
                  alt={selectedCandidate.name}
                />
                <AvatarFallback className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                  {selectedCandidate.name 
                    ? selectedCandidate.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                    : <User className="h-5 w-5" />
                  }
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-sm font-medium text-green-900 dark:text-green-100">
                  {t('selectedCandidate') || 'Selected Candidate'}
                </p>
                <p className="text-sm text-green-700 dark:text-green-300 truncate">
                  {selectedCandidate.name}
                </p>
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              {onViewProfile && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewProfile(selectedCandidate.id)}
                  className="border-green-300 dark:border-green-700 hover:bg-green-100 dark:hover:bg-green-900/30"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  {t('viewProfile') || 'View'}
                </Button>
              )}
              {onMessageCandidate && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onMessageCandidate(selectedCandidate.id, job.id)}
                  className="border-green-300 dark:border-green-700 hover:bg-green-100 dark:hover:bg-green-900/30"
                >
                  <MessageCircle className="h-4 w-4 mr-1" />
                  {t('message') || 'Message'}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
      
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
        ) : (
          <div>
            <span className="font-medium">{t('expires')}: </span>
            <span>{formatDate(getJobExpirationDate(job).toISOString())}</span>
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
