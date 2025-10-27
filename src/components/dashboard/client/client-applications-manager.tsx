'use client'

import { useState } from 'react'
import { JobApplication, ApplicationStatus } from '@/types/application'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Search, User, Eye, MessageCircle, Check, X } from 'lucide-react'
import { formatDistanceToNowLocalized } from '@/lib/date-format'
import { useTranslations, useLocale } from 'next-intl'
import { TaskerProfileCard } from './tasker-profile-card'

interface ClientApplicationsManagerProps {
  applications: JobApplication[]
  onUpdateApplicationStatus?: (applicationId: string, status: string) => void
  onMessageApplicant?: (applicationId: string, userId: string) => void
  loading?: boolean
}

export function ClientApplicationsManager({ 
  applications, 
  onUpdateApplicationStatus,
  onMessageApplicant,
  loading = false 
}: ClientApplicationsManagerProps) {
  const t = useTranslations('dashboard.applicationManagement')
  const locale = useLocale() as 'bs' | 'en'
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null)
  
  // Helper functions
  const formatDate = (date: string | Date) => {
    return formatDistanceToNowLocalized(date, locale, { addSuffix: true })
  }

  const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>/g, '')
  }

  const getStatusText = (status: ApplicationStatus) => {
    switch (status) {
      case ApplicationStatus.PENDING:
        return t('pending')
      case ApplicationStatus.SELECTED:
        return t('accepted') 
      case ApplicationStatus.REJECTED:
        return t('rejected')
      case ApplicationStatus.REVIEWED:
        return t('reviewed')
      case ApplicationStatus.SHORTLISTED:
        return t('shortlisted')
      case ApplicationStatus.WITHDRAWN:
        return t('withdrawn')
      default:
        return t('unknown')
    }
  }
  
  // Filter applications - exclude withdrawn and selected applications
  const filteredApplications = applications.filter(application => {
    // Exclude withdrawn and selected applications (selected applicants are shown in the job card)
    if (application.status === ApplicationStatus.WITHDRAWN || application.status === ApplicationStatus.SELECTED) {
      return false
    }
    
    const matchesSearch = !searchTerm || 
      application.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      application.job?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      application.message?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || application.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  // Calculate statistics - exclude withdrawn and selected applications
  const activeApplications = applications.filter(app => 
    app.status !== ApplicationStatus.WITHDRAWN && 
    app.status !== ApplicationStatus.SELECTED
  )
  const totalApplications = activeApplications.length
  const pendingApplications = activeApplications.filter(app => app.status === ApplicationStatus.PENDING).length
  const acceptedApplications = applications.filter(app => app.status === ApplicationStatus.SELECTED).length // Keep full count for selected
  const rejectedApplications = activeApplications.filter(app => app.status === ApplicationStatus.REJECTED).length

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="flex justify-between items-center border-b border-border pb-4">
          <div>
            <div className="h-6 bg-muted rounded w-48 animate-pulse mb-2"></div>
            <div className="h-4 bg-muted rounded w-80 animate-pulse"></div>
          </div>
        </div>
        
        {/* Filters skeleton */}
        <div className="flex flex-col md:flex-row gap-4 border-b border-border pb-4">
          <div className="flex-1">
            <div className="h-10 bg-muted rounded animate-pulse"></div>
          </div>
          <div className="w-full md:w-48">
            <div className="h-10 bg-muted rounded animate-pulse"></div>
          </div>
        </div>
        
        {/* Applications skeleton */}
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border border-border bg-card p-4 space-y-3 animate-pulse">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="h-5 bg-muted rounded w-48 mb-2"></div>
                  <div className="h-4 bg-muted rounded w-64"></div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="h-4 bg-muted rounded w-32"></div>
                <div className="h-4 bg-muted rounded w-24"></div>
              </div>
              <div className="flex gap-2 pt-2">
                <div className="h-8 bg-muted rounded w-20"></div>
                <div className="h-8 bg-muted rounded w-16"></div>
                <div className="h-8 bg-muted rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-border pb-4">
        <div>
          <h2 className="text-lg font-medium text-foreground">{t('title')}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {totalApplications} {t('totalApplications')} • {pendingApplications} {t('pendingApplications')} • {acceptedApplications} {t('acceptedApplications')} • {rejectedApplications} {t('rejectedApplications')}
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 border-b border-border pb-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="w-full md:w-48">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder={t('filterByStatus')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allStatuses')}</SelectItem>
              <SelectItem value="PENDING">{t('pending')}</SelectItem>
              <SelectItem value="SELECTED">{t('accepted')}</SelectItem>
              <SelectItem value="REJECTED">{t('rejected')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {filteredApplications.length === 0 ? (
          <div className="text-center py-16 border border-border bg-muted/30 rounded-lg">
            <div className="max-w-md mx-auto">
              <h3 className="text-lg font-medium text-foreground mb-2">
                {searchTerm || statusFilter !== 'all' ? t('noResultsTitle') || 'No results found' : t('noApplicationsTitle') || 'No applications yet'}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {searchTerm || statusFilter !== 'all' ? t('noFilterResults') : t('noApplicationsMessage')}
              </p>
              {(searchTerm || statusFilter !== 'all') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('')
                    setStatusFilter('all')
                  }}
                  className="mt-4"
                >
                  {t('clearFilters') || 'Clear filters'}
                </Button>
              )}
            </div>
          </div>
        ) : (
          filteredApplications.map((application) => (
            <div key={application.id} className="border border-border bg-card p-4 space-y-3 hover:shadow-sm transition-shadow">
              {/* Application Header */}
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    {/* Profile Picture */}
                    <Avatar className="h-8 w-8">
                      <AvatarImage 
                        src={application.user?.avatarUrl} 
                        alt={application.user?.name || t('anonymousTasker')}
                      />
                      <AvatarFallback className="text-xs">
                        {application.user?.name 
                          ? application.user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                          : <User className="h-4 w-4" />
                        }
                      </AvatarFallback>
                    </Avatar>
                    
                    <h3 className="font-medium text-card-foreground">
                      {application.user?.name || 
                       (application.user?.email ? application.user.email.split('@')[0] : null) ||
                       t('anonymousTasker')}
                    </h3>
                    
                    {/* Status Badge */}
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      application.status === ApplicationStatus.PENDING ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      application.status === ApplicationStatus.REVIEWED ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                      application.status === ApplicationStatus.SHORTLISTED ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' :
                      application.status === ApplicationStatus.SELECTED ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                      application.status === ApplicationStatus.REJECTED ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                    }`}>
                      {getStatusText(application.status)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t('appliedFor')} {application.job?.title || t('unknownJob')}
                  </p>
                </div>
              </div>

              {/* Application Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">{t('appliedLabel')}:</span>{' '}
                  <span className="text-foreground">{application.appliedAt ? formatDate(application.appliedAt) : t('unknownTime')}</span>
                </div>
                {application.user?.averageRating && (
                  <div>
                    <span className="text-muted-foreground">{t('ratingLabel')}:</span>{' '}
                    <span className="text-foreground">{application.user.averageRating.toFixed(1)}/5</span>
                  </div>
                )}
              </div>

              {/* Application Message */}
              {application.message && (
                <div className="border-t border-border pt-3">
                  <p className="text-sm text-muted-foreground mb-1">{t('messageLabel')}:</p>
                  <p className="text-sm text-foreground line-clamp-3 bg-muted/50 p-2 rounded">
                    {stripHtml(application.message)}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap justify-between gap-2 pt-2 border-t border-border">
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedApplication(application)}
                    className="hover:bg-accent hover:text-accent-foreground"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    {t('viewProfile')}
                  </Button>
                  
                  {onMessageApplicant && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onMessageApplicant(application.id, application.user?.id || application.userId)}
                      className="hover:bg-accent hover:text-accent-foreground"
                    >
                      <MessageCircle className="h-4 w-4 mr-1" />
                      {t('message')}
                    </Button>
                  )}
                </div>

                {application.status === ApplicationStatus.PENDING && onUpdateApplicationStatus && (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      onClick={() => onUpdateApplicationStatus(application.id, 'accepted')}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Check className="h-4 w-4 mr-1" />
                      {t('accept')}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onUpdateApplicationStatus(application.id, 'rejected')}
                      className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/30"
                    >
                      <X className="h-4 w-4 mr-1" />
                      {t('reject')}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Profile Card Modal */}
      {selectedApplication && selectedApplication.user && (
        <TaskerProfileCard
          user={selectedApplication.user as any}
          application={{
            id: selectedApplication.id,
            message: selectedApplication.message,
            appliedAt: selectedApplication.appliedAt,
            job: selectedApplication.job
          }}
          onClose={() => setSelectedApplication(null)}
          onMessage={onMessageApplicant ? (userId: string) => onMessageApplicant(selectedApplication.id, userId) : undefined}
        />
      )}
    </div>
  )
}
