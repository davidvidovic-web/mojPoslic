'use client'

import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Star, MapPin, Clock, DollarSign, ExternalLink, Calendar } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import { formatSalary } from '@/lib/job-utils'

interface Job {
  id: string
  title: string
  company: string
  type: string
  city_id: string
  salary?: string
  salaryType?: string
  salaryMin?: number
  salaryMax?: number
  description: string
  createdAt: string
  job_address?: string
  tags?: string[]
}

interface JobApplication {
  id: string
  job_id: string
  status: 'PENDING' | 'SELECTED' | 'REJECTED' | 'WITHDRAWN'
  appliedAt: string
  job: Job
  clientNotes?: string
  shortlistedAt?: string
  interviewDate?: string
}

interface ShortlistedJobsSectionProps {
  shortlistedApplications: JobApplication[]
  loading?: boolean
}

export function ShortlistedJobsSection({ shortlistedApplications, loading = false }: ShortlistedJobsSectionProps) {
  const t = useTranslations('dashboard')
  const tCommon = useTranslations('common')

  // Filter to only show shortlisted and interview scheduled applications
  const filteredApplications = shortlistedApplications.filter(app => 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (app.status as any) === 'SHORTLISTED' || (app.status as any) === 'INTERVIEW_SCHEDULED'
  )

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Shortlisted Opportunities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border rounded-lg p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (filteredApplications.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Shortlisted Opportunities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Star className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No shortlisted applications yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              When employers shortlist your applications, they&apos;ll appear here
            </p>
            <Link href="/jobs">
              <Button>
                Browse More Jobs
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }



  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SHORTLISTED':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-0 rounded-full px-2 py-1 text-xs font-medium">
            <Star className="h-3 w-3 mr-1" />
            {t('shortlistedJobs.statuses.shortlisted')}
          </Badge>
        )
      case 'INTERVIEW_SCHEDULED':
        return (
          <Badge className="bg-blue-100 text-blue-800 border-0 rounded-full px-2 py-1 text-xs font-medium">
            <Calendar className="h-3 w-3 mr-1" />
            {t('shortlistedJobs.statuses.interviewScheduled')}
          </Badge>
        )
      default:
        return (
          <Badge className="rounded-full px-2 py-1 text-xs font-medium" variant="secondary">
            {status}
          </Badge>
        )
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            {t('shortlistedJobs.title')}
            <Badge variant="secondary" className="ml-2 rounded-full px-2 py-1 text-xs font-medium">
              {filteredApplications.length}
            </Badge>
          </CardTitle>
          {filteredApplications.length > 3 && (
            <Link href="/dashboard/applications">
              <Button variant="ghost" size="sm">
                {tCommon('buttons.viewAll')}
              </Button>
            </Link>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredApplications.slice(0, 3).map((application) => (
            <div
              key={application.id}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border-yellow-200 dark:border-yellow-800"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-1">
                    {application.job.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 font-medium">
                    {application.job.company}
                  </p>
                </div>
                {getStatusBadge(application.status)}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <MapPin className="h-4 w-4" />
                  <span>{application.job.job_address || tCommon('messages.locationNotSpecified')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <DollarSign className="h-4 w-4" />
                  <span>{formatSalary(application.job)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Clock className="h-4 w-4" />
                  <span>Shortlisted {(() => {
                    const dateStr = application.shortlistedAt || application.appliedAt
                    if (!dateStr) return 'recently'
                    try {
                      return formatDistanceToNow(new Date(dateStr), { addSuffix: true })
                    } catch {
                      return 'recently'
                    }
                  })()}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Badge variant="outline" className="text-xs rounded-full px-2 py-1 font-medium">
                    {application.job.type}
                  </Badge>
                </div>
              </div>

              {application.clientNotes && (
                <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-md border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Client Note:</strong> {application.clientNotes}
                  </p>
                </div>
              )}

              {application.interviewDate && (
                <div className="mb-3 p-3 bg-green-50 dark:bg-green-950/30 rounded-md border border-green-200 dark:border-green-800">
                  <p className="text-sm text-green-800 dark:text-green-200">
                    <strong>Interview Scheduled:</strong> {new Date(application.interviewDate).toLocaleDateString()}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {application.job.tags?.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs rounded-full px-2 py-1 font-medium">
                      {tag}
                    </Badge>
                  ))}
                  {application.job.tags && application.job.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs rounded-full px-2 py-1 font-medium">
                      +{application.job.tags.length - 3} more
                    </Badge>
                  )}
                </div>
                <Link href={`/jobs/${application.job.id}`}>
                  <Button size="sm" variant="outline">
                    <ExternalLink className="h-4 w-4 mr-1" />
                    {tCommon('actions.viewDetails')}
                  </Button>
                </Link>
              </div>
            </div>
          ))}

          {filteredApplications.length > 3 && (
            <div className="text-center pt-4">
              <Link href="/dashboard/applications?filter=shortlisted">
                <Button variant="outline">
                  {t('viewAllShortlistedApplications', { count: filteredApplications.length })}
                </Button>
              </Link>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
