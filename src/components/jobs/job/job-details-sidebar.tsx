'use client'

import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Job } from "@/types/job"
import { formatJobType, getJobTypeBadgeVariant, formatTransportation, getJobExpirationDate } from "@/lib/job-utils"
import { getJobCategoryName } from "@/types/utils"
import { formatDate as formatDateUtil } from "@/lib/date-format"
import { useLocale, useTranslations } from 'next-intl'

interface JobDetailsSidebarProps {
  job: Job
  formatDate: (dateString: string) => string
  formatSalary: (job: Job) => string | null
  showAddress?: boolean // New prop to control address visibility
}

export function JobDetailsSidebar({ job, formatDate, formatSalary, showAddress = false }: JobDetailsSidebarProps) {
  const getTypeVariant = getJobTypeBadgeVariant
  const locale = useLocale() as 'bs' | 'en'
  const t = useTranslations('jobs.details')
  
  // Format dates as absolute dates (not relative)
  const formatAbsoluteDate = (dateString: string) => {
    return formatDateUtil(dateString, locale, { format: 'short' })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('jobDetails')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">{t('jobType')}</span>
          <div className="flex items-center gap-2">
            <Badge variant={getTypeVariant(job.job_type)}>{formatJobType(job.job_type, locale)}</Badge>
            {job.is_urgent && (
              <Badge variant="destructive" className="text-xs px-2 py-1">
                {t('urgent')}
              </Badge>
            )}
          </div>
        </div>
        
        {(job.category_name_bs || job.category_name_en) && (
          <>
            <Separator />
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">{t('category')}</span>
              <span className="text-sm font-medium">{getJobCategoryName(job, locale as 'bs' | 'en')}</span>
            </div>
          </>
        )}
        
        <Separator />
        
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">{t('posted')}</span>
          <span className="text-sm">{job.posted_at ? formatDate(job.posted_at) : ''}</span>
        </div>
        
        {job.start_date && job.start_date !== 'negotiable' && (
          <>
            <Separator />
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">{t('startDate')}</span>
              <span className="text-sm">{new Date(job.start_date).toLocaleDateString()}</span>
            </div>
          </>
        )}
        
        {job.start_date === 'negotiable' && (
          <>
            <Separator />
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">{t('startDate')}</span>
              <span className="text-sm">{t('byAgreement')}</span>
            </div>
          </>
        )}
        
        {job.start_time && job.start_time !== 'negotiable' && (
          <>
            <Separator />
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">{t('startTime')}</span>
              <span className="text-sm">{job.start_time}</span>
            </div>
          </>
        )}
        
        {job.start_time === 'negotiable' && (
          <>
            <Separator />
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">{t('startTime')}</span>
              <span className="text-sm">{t('byAgreement')}</span>
            </div>
          </>
        )}
        
        {job.duration && (
          <>
            <Separator />
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">{t('duration')}</span>
              <span className="text-sm">{job.duration}</span>
            </div>
          </>
        )}
        
        {/* Job posting expiration (calculated) */}
        <>
          <Separator />
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">{t('expires')}</span>
            <span className="text-sm">{formatAbsoluteDate(getJobExpirationDate(job).toISOString())}</span>
          </div>
        </>
        
        {job.application_deadline && (
          <>
            <Separator />
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">{t('applicationDeadline')}</span>
              <span className="text-sm">{formatAbsoluteDate(job.application_deadline)}</span>
            </div>
          </>
        )}
        
        {formatSalary(job) && (
          <>
            <Separator />
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                {job.job_type === 'quick_job' ? t('payment') : t('salary')}
              </span>
              <span className="text-sm font-medium">{formatSalary(job)}</span>
            </div>
          </>
        )}

        {job.performance_bonus && (
          <>
            <Separator />
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">{t('performanceBonus')}</span>
              <span className="text-sm font-medium text-green-600">{t('available')}</span>
            </div>
          </>
        )}

        {job.transportation && (
          <>
            <Separator />
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">{t('transportation')}</span>
              <span className="text-sm font-medium">{formatTransportation(job.transportation, job.transportation_amount)}</span>
            </div>
          </>
        )}

        {(job.has_parking !== undefined && job.has_parking !== null) && (
          <>
            <Separator />
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">{t('parking')}</span>
              <span className="text-sm">{job.has_parking ? t('available') : t('notAvailable')}</span>
            </div>
          </>
        )}

        {job.public_transport_info && (
          <>
            <Separator />
            <div className="flex justify-between items-start">
              <span className="text-sm text-muted-foreground">{t('publicTransport')}</span>
              <span className="text-sm text-right max-w-[200px]">{job.public_transport_info}</span>
            </div>
          </>
        )}

        {job.job_address && showAddress && (
          <>
            <Separator />
            <div className="flex justify-between items-start">
              <span className="text-sm text-muted-foreground">{t('address')}</span>
              <span className="text-sm text-right max-w-[200px]">{job.job_address}</span>
            </div>
          </>
        )}

        {job.requirements && (
          <>
            <Separator />
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">{t('requirements')}</span>
              <span className="text-sm text-green-600">{t('available')}</span>
            </div>
          </>
        )}

        {job.benefits && (
          <>
            <Separator />
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">{t('benefits')}</span>
              <span className="text-sm text-green-600">{t('available')}</span>
            </div>
          </>
        )}

                {/* Tags */}
        {job.tags && job.tags.length > 0 && (
          <>
            <Separator />
            <div className="flex justify-between items-start">
              <span className="text-sm text-gray-600">{t('content.skillsAndTechnologies')}</span>
              <span className="text-sm text-right max-w-[150px]">
                {job.tags.length > 3 
                  ? `${job.tags.slice(0, 3).join(', ')}...` 
                  : job.tags.join(', ')
                }
              </span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
