'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, Clock, Briefcase, XCircle, Search } from 'lucide-react'
import { ApplicationStatus } from '@/types/application'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

interface ApplicationsSectionProps {
  applications: Array<{
    id: string
    status: string
    applied_at: string
    job?: {
      id: string
      title: string
      job_type?: string
      posted_by?: { name: string }
    } | null
    [key: string]: unknown
  }>
}

export function ApplicationsSection({ applications }: ApplicationsSectionProps) {
  const t = useTranslations()
  
  const getStatusColor = (status: ApplicationStatus) => {
    switch (status) {
      case ApplicationStatus.PENDING: return 'bg-yellow-500/10 text-yellow-600 border border-yellow-500/20'
      case ApplicationStatus.REVIEWED: return 'bg-blue-500/10 text-blue-600 border border-blue-500/20'
      case ApplicationStatus.SELECTED: return 'bg-green-500/10 text-green-600 border border-green-500/20'
      case ApplicationStatus.REJECTED: return 'bg-red-500/10 text-red-600 border border-red-500/20'
      default: return 'bg-muted text-muted-foreground border border-border'
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString()
  }

  const getStatusIcon = (status: ApplicationStatus) => {
    switch (status) {
      case ApplicationStatus.PENDING: return <Clock className="h-4 w-4" />
      case ApplicationStatus.SELECTED: return <Briefcase className="h-4 w-4" />
      case ApplicationStatus.REJECTED: return <XCircle className="h-4 w-4" />
      default: return <TrendingUp className="h-4 w-4" />
    }
  }

  const getStatusLabel = (status: ApplicationStatus) => {
    switch (status) {
      case ApplicationStatus.PENDING: return t('dashboard.tasker.applications.status.pendingReview')
      case ApplicationStatus.REVIEWED: return t('dashboard.tasker.applications.status.underReview')
      case ApplicationStatus.SELECTED: return t('dashboard.tasker.applications.status.active')
      default: return status
    }
  }

  // Filter to only show active applications (pending, reviewed, selected)
  const activeApplications = applications.filter(app => 
    app.status === ApplicationStatus.PENDING || app.status === ApplicationStatus.REVIEWED || app.status === ApplicationStatus.SELECTED
  )

  const renderApplicationList = (apps: ApplicationsSectionProps['applications']) => {
    if (apps.length === 0) {
      return (
        <div className="text-center py-8">
          <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold">{t('dashboard.tasker.applications.noActiveApplications')}</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {t('dashboard.tasker.applications.startApplying')}
          </p>
          <Link href="/">
            <Button>
              <Search className="h-4 w-4 mr-2" />
              {t('dashboard.actions.findJobs')}
            </Button>
          </Link>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {apps.map((application) => (
          <div key={application.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h4 className="font-semibold flex items-center gap-2">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {getStatusIcon(application.status as any)}
                  {application.job?.title || 'Job Title Not Available'}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {application.job?.posted_by?.name || 'Company Not Available'}
                </p>
              </div>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <Badge className={`${getStatusColor(application.status as any)} rounded-full px-2 py-1 text-xs font-medium`}>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {getStatusLabel(application.status as any)}
              </Badge>
            </div>
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span>{t('dashboard.tasker.applications.applied')} {formatDate(new Date(application.applied_at))}</span>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(application.job as any)?.salary_min && (
                <span className="text-foreground font-medium">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {`${(application.job as any).salary_min}${(application.job as any).salary_max ? `-${(application.job as any).salary_max}` : ''} BAM`}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <TrendingUp className="h-5 w-5 mr-2" />
          {t('dashboard.tasker.applications.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {renderApplicationList(activeApplications)}
      </CardContent>
    </Card>
  )
}
