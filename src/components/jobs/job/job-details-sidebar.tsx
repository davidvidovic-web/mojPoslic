'use client'

import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Job } from "@/types/job"
import { formatJobType, getJobTypeBadgeVariant, formatTransportation } from "@/lib/job-utils"
import { getJobCategoryName } from "@/types/utils"
import { useLocale, useTranslations } from 'next-intl'

interface JobDetailsSidebarProps {
  job: Job
  formatDate: (dateString: string) => string
  formatSalary: (job: Job) => string | null
  showAddress?: boolean // New prop to control address visibility
}

export function JobDetailsSidebar({ job, formatDate, formatSalary, showAddress = false }: JobDetailsSidebarProps) {
  const getTypeVariant = getJobTypeBadgeVariant
  const locale = useLocale()
  const t = useTranslations('jobs.details')

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('jobDetails')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">{t('jobType')}</span>
          <Badge variant={getTypeVariant(job.job_type)}>{formatJobType(job.job_type)}</Badge>
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
        
        {job.expires_at && (
          <>
            <Separator />
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">{t('expires')}</span>
              <span className="text-sm">{formatDate(job.expires_at)}</span>
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

        {job.transportation && (
          <>
            <Separator />
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">{t('transportation')}</span>
              <span className="text-sm font-medium">{formatTransportation(job.transportation, job.transportation_amount)}</span>
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
      </CardContent>
    </Card>
  )
}
