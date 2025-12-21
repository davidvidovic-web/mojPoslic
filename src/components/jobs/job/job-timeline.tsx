'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react"
import { Job } from "@/types/job"
import { getJobExpirationDate } from "@/lib/job-utils"
import { formatDate as formatDateUtil } from "@/lib/date-format"
import { useTranslations, useLocale } from 'next-intl'

interface JobTimelineProps {
  job: Job
}

export function JobTimeline({ job }: JobTimelineProps) {
  const t = useTranslations('jobs.timeline')
  const locale = useLocale() as 'bs' | 'en'
  
  const formatAbsoluteDate = (dateString: string) => {
    return formatDateUtil(dateString, locale, { format: 'short' })
  }
  
  if (!job.start_date && !job.start_time && !job.duration && !job.application_deadline) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          {t('scheduleAndTimeline')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {job.start_date && job.start_date !== 'negotiable' && (
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <div>
              <p className="text-sm font-medium">{t('startDate')}</p>
              <p className="text-sm text-muted-foreground">
                {new Date(job.start_date).toLocaleDateString()}
                {job.start_time && job.start_time !== 'negotiable' && ` ${t('at')} ${new Date(`2000-01-01T${job.start_time}`).toLocaleTimeString(locale === 'bs' ? 'bs-BA' : 'en-US', { 
                  hour: 'numeric', 
                  minute: '2-digit', 
                  hour12: locale !== 'bs'
                })}`}
              </p>
            </div>
          </div>
        )}
        
        {job.start_date === 'negotiable' && (
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-orange-600" />
            <div>
              <p className="text-sm font-medium">{t('startDate')}</p>
              <p className="text-sm text-muted-foreground">
                {t('byAgreement')}
                {job.start_time === 'negotiable' && ` - ${t('timeByAgreement')}`}
              </p>
            </div>
          </div>
        )}
        
        {job.duration && (
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-600" />
            <div>
              <p className="text-sm font-medium">{t('expectedDuration')}</p>
              <p className="text-sm text-muted-foreground">
                {job.duration.replace('_', ' ').replace(/(\d+)/, '$1 ').toLowerCase()}
              </p>
            </div>
          </div>
        )}
        
        {job.application_deadline && (
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <div>
              <p className="text-sm font-medium">{t('applicationDeadline')}</p>
              <p className="text-sm text-muted-foreground">
                {formatAbsoluteDate(job.application_deadline)}
              </p>
            </div>
          </div>
        )}
        
        {/* Job posting expiration */}
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <div>
            <p className="text-sm font-medium">{t('jobExpiration')}</p>
            <p className="text-sm text-muted-foreground">
              {formatAbsoluteDate(getJobExpirationDate(job).toISOString())}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
