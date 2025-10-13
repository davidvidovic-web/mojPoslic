'use client'

import { useState } from 'react'
import { useApplicationManager } from '@/hooks/useQueryManagers'
import { useSupabaseAuth } from '@/contexts/supabase-auth-context'
import { ApplicationStatus } from '@/types/application'
import { useUpdateApplication } from '@/hooks/use-applications'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Search, MessageCircle, ExternalLink, X } from 'lucide-react'
import { formatDistanceToNowLocalized } from '@/lib/date-format'
import { useTranslations, useLocale } from 'next-intl'
import { useDialogStore } from '@/stores/dialog-store'
import { supabase } from '@/lib/supabase'

interface TaskerApplicationManagerProps {
  showOnlyHistorical?: boolean // If true, only show completed/rejected applications
}

export default function TaskerApplicationManager({ 
  showOnlyHistorical = false
}: TaskerApplicationManagerProps) {
  const { user } = useSupabaseAuth()
  const { applications = [], isLoading } = useApplicationManager(undefined, user?.id)
  const updateApplicationMutation = useUpdateApplication()
  const { openMessagingDialog } = useDialogStore()
  const t = useTranslations('dashboard.applicationManagement')
  const locale = useLocale()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // Helper functions
  const formatDate = (date: string | Date) => {
    return formatDistanceToNowLocalized(date, locale as 'en' | 'bs', { addSuffix: true })
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
        return t('cancelledByClient')
      case ApplicationStatus.WITHDRAWN:
        return t('withdrawn')
      default:
        return t('unknown')
    }
  }

  const handleWithdraw = async (applicationId: string) => {
    if (confirm(t('confirmWithdraw'))) {
      try {
        await updateApplicationMutation.mutateAsync({
          applicationId,
          updates: {
            status: ApplicationStatus.WITHDRAWN
          }
        })
      } catch (error) {
        console.error('Withdraw error:', error)
      }
    }
  }

  const handleMessage = async (application: { id: string }) => {
    try {
      // Find the conversation for this application
      const { data: conversation, error } = await supabase
        .from('conversations')
        .select('id')
        .eq('application_id', application.id)
        .single()
      
      if (error) {
        console.error('Error finding conversation:', error)
        // If no conversation exists, just open general messaging
        openMessagingDialog()
        return
      }

      if (conversation) {
        // Open messaging dialog with specific conversation
        openMessagingDialog(conversation.id)
      } else {
        // No conversation found, open general messaging
        openMessagingDialog()
      }
    } catch (error) {
      console.error('Error handling message:', error)
      // Fallback to general messaging
      openMessagingDialog()
    }
  }

  // Filter applications based on showOnlyHistorical
  const relevantApplications = showOnlyHistorical 
    ? applications.filter(app => {
        const status = app.status?.toLowerCase() || ''
        return ['rejected', 'withdrawn'].includes(status)
      })
    : applications.filter(app => {
        const status = app.status?.toLowerCase() || ''
        return ['pending', 'selected'].includes(status)
      })
  
  // Filter applications
  const filteredApplications = relevantApplications.filter(application => {
    const matchesSearch = !searchTerm || 
      application.job?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      application.job?.posted_by?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || application.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  if (isLoading) {
    return (
      <div className="space-y-6">        
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
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
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
                    {/* Client Avatar */}
                    <Avatar className="h-8 w-8">
                      <AvatarImage 
                        src={(application.job?.posted_by as { name: string; company_name?: string | null; avatar_url?: string | null })?.avatar_url || undefined} 
                        alt={application.job?.posted_by?.name || t('unknownCompany')}
                      />
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">
                        {application.job?.posted_by?.name 
                          ? application.job.posted_by.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                          : '??'
                        }
                      </AvatarFallback>
                    </Avatar>
                    
                    <h3 className="font-medium text-card-foreground">
                      {application.job?.title || t('unknownJob')}
                    </h3>
                    
                    {/* Status Badge */}
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      application.status === ApplicationStatus.PENDING ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      application.status === ApplicationStatus.SELECTED ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                      application.status === ApplicationStatus.REJECTED ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                      application.status === ApplicationStatus.WITHDRAWN ? 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                    }`}>
                      {getStatusText((application.status as ApplicationStatus) || ApplicationStatus.PENDING)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Application Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">{t('appliedLabel')}:</span>{' '}
                  <span className="text-foreground">{application.applied_at ? formatDate(application.applied_at) : t('unknownTime')}</span>
                </div>
                {(application.job?.salary_min || application.job?.salary_max) && (
                  <div>
                    <span className="text-muted-foreground">{t('salaryLabel')}:</span>{' '}
                    <span className="text-foreground">
                      {application.job.salary_min && application.job.salary_max 
                        ? `${application.job.salary_min} - ${application.job.salary_max} BAM`
                        : application.job.salary_min 
                        ? `${application.job.salary_min} BAM`
                        : `Up to ${application.job.salary_max} BAM`}
                    </span>
                  </div>
                )}
              </div>

              {/* Application Message */}
              {application.cover_letter && (
                <div className="border-t border-border pt-3">
                  <p className="text-sm text-muted-foreground mb-1">{t('messageLabel')}:</p>
                  <p className="text-sm text-foreground line-clamp-3 bg-muted/50 p-2 rounded">
                    {stripHtml(application.cover_letter)}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap justify-between items-center gap-2 pt-2 border-t border-border">
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`/jobs/${application.job?.id}`, '_blank')}
                    className="hover:bg-accent hover:text-accent-foreground whitespace-nowrap"
                    disabled={!application.job?.id}
                  >
                    <ExternalLink className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{t('viewJob')}</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleMessage(application)}
                    className="hover:bg-accent hover:text-accent-foreground whitespace-nowrap"
                  >
                    <MessageCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{t('messages')}</span>
                  </Button>
                </div>

                {application.status === ApplicationStatus.PENDING && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleWithdraw(application.id)}
                    disabled={updateApplicationMutation.isPending}
                    className="border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground whitespace-nowrap"
                  >
                    <X className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{t('cancelApplication')}</span>
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}