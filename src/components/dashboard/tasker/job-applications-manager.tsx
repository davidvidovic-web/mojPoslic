'use client'

import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Users, CheckCircle, XCircle, Clock, Eye, MessageCircle } from 'lucide-react'
import { useApplications } from '@/hooks/use-applications'
import { ApplicationStatus, JobApplication } from '@/types/application'

interface JobApplicationsManagerProps {
  // For future enhancement - job filtering
  jobIds?: string[]
}

export function JobApplicationsManager({}: JobApplicationsManagerProps) {
  const tCommon = useTranslations('common')
  const tDashboard = useTranslations('dashboard')
  const { data: applications = [], isLoading } = useApplications()

  const pendingApplications = applications.filter((app: JobApplication) => app.status === ApplicationStatus.PENDING)
  const reviewedApplications = applications.filter((app: JobApplication) => 
    app.status === ApplicationStatus.REVIEWED || 
    app.status === ApplicationStatus.SHORTLISTED || 
    app.status === ApplicationStatus.SELECTED
  )

  const getStatusIcon = (status: ApplicationStatus) => {
    switch (status) {
      case ApplicationStatus.PENDING:
        return <Clock className="h-4 w-4" />
      case ApplicationStatus.REVIEWED:
        return <Eye className="h-4 w-4" />
      case ApplicationStatus.SHORTLISTED:
        return <Eye className="h-4 w-4" />
      case ApplicationStatus.SELECTED:
        return <CheckCircle className="h-4 w-4" />
      case ApplicationStatus.REJECTED:
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: ApplicationStatus) => {
    switch (status) {
      case ApplicationStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
      case ApplicationStatus.REVIEWED:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
      case ApplicationStatus.SHORTLISTED:
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300'
      case ApplicationStatus.SELECTED:
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
      case ApplicationStatus.REJECTED:
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Job Applications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">{tDashboard('loading.jobs')}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Job Applications
          <Badge variant="secondary">{applications.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {/* Pending Applications Section */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-2xl bg-gradient-to-br from-yellow-500/10 to-yellow-600/20 flex items-center justify-center">
                <Clock className="h-4 w-4 text-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {tCommon('pending')} ({pendingApplications.length})
              </h3>
            </div>
            
            {pendingApplications.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">{tCommon('noPendingApplications')}</h3>
                <p className="text-muted-foreground">{tCommon('newApplicationsWillAppearHere')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingApplications.map((application: JobApplication) => (
                  <div key={application.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={application.user?.avatarUrl} />
                        <AvatarFallback>
                          {application.user?.name?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium">{application.user?.name || 'Unknown User'}</h4>
                        <p className="text-sm text-muted-foreground">{application.job?.title || 'Job Title'}</p>
                        <p className="text-xs text-muted-foreground">
                          {tCommon('applied')} {new Date(application.appliedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(application.status)}>
                        {getStatusIcon(application.status)}
                        <span className="ml-1 capitalize">{application.status.toLowerCase()}</span>
                      </Badge>
                      <Button 
                        size="sm"
                        variant="outline"
                        onClick={() => {/* TODO: Implement messaging */}}
                      >
                        <MessageCircle className="h-4 w-4 mr-1" />
                        Message
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Reviewed Applications Section */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-2xl bg-gradient-to-br from-green-500/10 to-green-600/20 flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {tCommon('reviewed')} ({reviewedApplications.length})
              </h3>
            </div>
            
            {reviewedApplications.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">{tCommon('noReviewedApplications')}</h3>
                <p className="text-muted-foreground">{tCommon('reviewedApplicationsWillAppearHere')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {reviewedApplications.map((application: JobApplication) => (
                  <div key={application.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={application.user?.avatarUrl} />
                        <AvatarFallback>
                          {application.user?.name?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium">{application.user?.name || 'Unknown User'}</h4>
                        <p className="text-sm text-muted-foreground">{application.job?.title || 'Job Title'}</p>
                        <p className="text-xs text-muted-foreground">
                          {tCommon('applied')} {new Date(application.appliedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(application.status)}>
                        {getStatusIcon(application.status)}
                        <span className="ml-1 capitalize">{application.status.toLowerCase()}</span>
                      </Badge>
                      <Button 
                        size="sm"
                        variant="outline"
                        onClick={() => {/* TODO: Implement messaging */}}
                      >
                        <MessageCircle className="h-4 w-4 mr-1" />
                        Message
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
