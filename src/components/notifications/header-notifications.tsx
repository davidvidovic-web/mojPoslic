'use client'

import React from 'react'
import { Bell, UserPlus, Briefcase, MessageCircle, Star, AlertCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useLocale } from 'next-intl'
import { useSupabaseAuth } from '@/contexts/supabase-auth-context'
import { useNotificationsQuery, useMarkNotificationReadMutation, useMarkAllNotificationsReadMutation } from '@/hooks/queries/useNotifications'
import { useUserName } from '@/hooks/use-user-name'
import { formatRelativeDate } from '@/lib/date-format'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { Database } from '@/types/supabase'

type NotificationRow = Database['public']['Tables']['notifications']['Row']

// Type for notification data structure
interface NotificationData {
  applicant_name?: string
  applicant_id?: string
  applicant?: {
    name?: string
  }
  job_title?: string
  job_id?: string
  job?: {
    title?: string
  }
  application_id?: string
  client_name?: string
  client?: {
    name?: string
  }
  sender_name?: string
  sender_id?: string
  conversation_id?: string
  message_id?: string
}

interface HeaderNotificationsProps {
  className?: string
}

export function HeaderNotifications({ className }: HeaderNotificationsProps) {
  const { user } = useSupabaseAuth()
  const t = useTranslations('dashboard.notifications')
  const locale = useLocale() as 'bs' | 'en'
  
  const { data: notifications = [], isLoading } = useNotificationsQuery(user?.id || '')
  const markAsReadMutation = useMarkNotificationReadMutation()
  const markAllAsReadMutation = useMarkAllNotificationsReadMutation()

  const unreadNotifications = notifications.filter(n => !n.is_read)
  const recentNotifications = notifications.slice(0, 10)

  // Enhanced utility function to determine if we need to resolve a name
  const needsNameResolution = (name: string): boolean => {
    return !!name && name.includes('@') && name.includes('.')
  }

  // Component to handle individual notification with potential name resolution
  const NotificationItem = ({ notification }: { notification: NotificationRow }) => {
    // Extract applicant ID for name resolution
    let applicantId = ''
    let storedApplicantName = ''
    
    if (notification.data) {
      try {
        const data = notification.data as NotificationData
        applicantId = data.applicant_id || ''
        storedApplicantName = data.applicant_name || data.applicant?.name || ''
      } catch (e) {
        console.warn('Failed to parse notification data:', e)
      }
    }

    // Only fetch name if the stored name looks like an email
    const shouldResolve = needsNameResolution(storedApplicantName)
    const { data: resolvedName } = useUserName(shouldResolve ? applicantId : undefined)

    // Use resolved name if available and needed, otherwise use stored name or fallback
    let finalApplicantName = ''
    if (shouldResolve && resolvedName) {
      // We successfully resolved the name from the database
      finalApplicantName = resolvedName
    } else if (!shouldResolve && storedApplicantName) {
      // We have a stored name that doesn't look like an email, use it directly
      finalApplicantName = storedApplicantName
    } else {
      // Fallback: clean the stored name (this will convert emails to "Someone/Neko")
      finalApplicantName = cleanDisplayName(storedApplicantName)
    }

    // Generate the notification content with the proper name
    const { title, message } = getLocalizedNotificationContentWithName(notification, finalApplicantName)

    return (
      <div
        key={notification.id}
        className={`flex items-start gap-3 p-3 rounded-lg transition-colors cursor-pointer ${
          notification.is_read 
            ? 'hover:bg-muted/50' 
            : 'bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30'
        }`}
        onClick={() => handleNotificationClick(notification)}
      >
        <div className="flex-shrink-0 mt-0.5">
          {getNotificationIcon(notification.type || '')}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {title}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                {message}
              </p>
            </div>
            {!notification.is_read && (
              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {formatRelativeDate(notification.created_at || '', locale)}
          </p>
        </div>
      </div>
    )
  }

  // Utility function to clean email addresses from names
  const cleanDisplayName = (name: string): string => {
    if (!name) return ''
    
    // Check if the name looks like an email address
    if (name.includes('@') && name.includes('.')) {
      return locale === 'bs' ? 'Neko' : 'Someone'
    }
    
    return name
  }

  // Enhanced notification content generator that takes a resolved name
  const getLocalizedNotificationContentWithName = (notification: NotificationRow, applicantName: string) => {
    let title = notification.title || ''
    let message = notification.message || ''

    // Debug logging
    // Debug information for notification content generation
    // This helps track how notifications are processed and displayed

    try {
      switch (notification.type) {
        case 'JOB_APPLICATION':
          // Extract job details
          let jobTitle = ''
          let clientName = ''
          
          if (notification.data) {
            try {
              const data = notification.data as NotificationData
              jobTitle = data.job_title || data.job?.title || ''
              clientName = data.client_name || data.client?.name || ''
              
              console.log('📋 Job data extracted:', { jobTitle, clientName, data })
              
              // If job title is missing from notification data, try to extract from message
              if (!jobTitle && notification.message) {
                const messageMatch = notification.message.match(/"([^"]+)"/);
                if (messageMatch) {
                  jobTitle = messageMatch[1];
                  console.log('📋 Job title extracted from message:', jobTitle);
                }
              }
            } catch (e) {
              console.warn('Failed to parse notification data:', e)
            }
          }

          if (user?.role === 'client') {
            // For clients: someone applied to your job
            if (locale === 'bs') {
              title = 'Nova prijava za posao'
              if (applicantName && jobTitle) {
                message = `${applicantName} se prijavio za posao "${jobTitle}"`
              } else if (jobTitle) {
                message = `Neko se prijavio za posao "${jobTitle}"`
              } else {
                message = `${applicantName} se prijavio za jedan od vaših poslova`
              }
            } else {
              title = 'New Job Application'
              if (applicantName && jobTitle) {
                message = `${applicantName} applied for "${jobTitle}"`
              } else if (jobTitle) {
                message = `Someone applied for "${jobTitle}"`
              } else {
                message = `${applicantName} applied for one of your jobs`
              }
            }
          } else {
            // For taskers: application status update
            if (locale === 'bs') {
              title = 'Ažuriranje prijave'
              if (clientName && jobTitle) {
                message = `${clientName} je ažurirao vašu prijavu za "${jobTitle}"`
              } else if (jobTitle) {
                message = `Vaša prijava za "${jobTitle}" je ažurirana`
              } else {
                message = 'Vaša prijava je ažurirana'
              }
            } else {
              title = 'Application Update'
              if (clientName && jobTitle) {
                message = `${clientName} updated your application for "${jobTitle}"`
              } else if (jobTitle) {
                message = `Your application for "${jobTitle}" was updated`
              } else {
                message = 'Your application was updated'
              }
            }
          }
          break

        case 'JOB_UPDATE':
          if (locale === 'bs') {
            title = 'Ažuriranje posla'
            message = notification.message || 'Posao je ažuriran'
          } else {
            title = 'Job Update'
            message = notification.message || 'A job has been updated'
          }
          break

        case 'NEW_MESSAGE':
          let senderName = ''
          
          if (notification.data) {
            try {
              const data = notification.data as NotificationData
              // Check for sender_name first (new format), then fallback to old format
              senderName = cleanDisplayName(
                data.sender_name || 
                data.applicant_name || 
                data.client_name || 
                ''
              )
            } catch (e) {
              console.warn('Failed to parse notification data:', e)
            }
          }

          if (locale === 'bs') {
            title = 'Nova poruka'
            if (senderName) {
              message = `Dobili ste poruku od ${senderName}`
            } else {
              message = 'Dobili ste novu poruku'
            }
          } else {
            title = 'New Message'
            if (senderName) {
              message = `You received a message from ${senderName}`
            } else {
              message = 'You received a new message'
            }
          }
          break

        case 'NEW_REVIEW':
          if (locale === 'bs') {
            title = 'Nova recenzija'
            message = notification.message || 'Dobili ste novu recenziju'
          } else {
            title = 'New Review'
            message = notification.message || 'You received a new review'
          }
          break

        case 'SYSTEM':
          // Keep original system messages as they might be more specific
          title = notification.title || (locale === 'bs' ? 'Sistemska poruka' : 'System Message')
          message = notification.message || ''
          break

        default:
          // Use original content for unknown types
          title = notification.title || ''
          message = notification.message || ''
      }
    } catch {
      // If translation fails, use original content
      title = notification.title || ''
      message = notification.message || ''
    }

    return { title, message }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'JOB_APPLICATION':
        return <UserPlus className="h-4 w-4 text-blue-500" />
      case 'JOB_UPDATE':
        return <Briefcase className="h-4 w-4 text-green-500" />
      case 'NEW_MESSAGE':
        return <MessageCircle className="h-4 w-4 text-purple-500" />
      case 'NEW_REVIEW':
        return <Star className="h-4 w-4 text-yellow-500" />
      case 'SYSTEM':
        return <AlertCircle className="h-4 w-4 text-orange-500" />
      default:
        return <Bell className="h-4 w-4 text-gray-500" />
    }
  }

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsReadMutation.mutateAsync(notificationId)
    } catch (error) {
      console.error('Error marking notification as read:', error)
      toast.error(t('errors.markReadFailed'))
    }
  }

  const handleMarkAllAsRead = async () => {
    if (!user?.id || unreadNotifications.length === 0) return
    
    try {
      await markAllAsReadMutation.mutateAsync(user.id)
      toast.success(t('allMarkedRead'))
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
      toast.error(t('errors.markAllReadFailed'))
    }
  }

  const handleNotificationClick = (notification: NotificationRow) => {
    // Mark as read if not already read
    if (!notification.is_read) {
      handleMarkAsRead(notification.id)
    }

    // Handle navigation based on notification type and data
    if (notification.type === 'JOB_APPLICATION') {
      // Could navigate to the specific job applications
      console.log('Navigate to job applications for notification:', notification.id)
    } else if (notification.type === 'NEW_MESSAGE') {
      // Navigate to the conversation
      if (notification.data) {
        try {
          const data = notification.data as NotificationData
          if (data.conversation_id) {
            window.location.href = `/dashboard/messaging?conversation=${data.conversation_id}`
          } else {
            // Fallback to general messaging page
            window.location.href = '/dashboard/messaging'
          }
        } catch (e) {
          console.warn('Failed to parse message notification data:', e)
          window.location.href = '/dashboard/messaging'
        }
      } else {
        window.location.href = '/dashboard/messaging'
      }
    }
  }

  if (!user) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`relative h-9 w-9 rounded-full ${className}`}
        >
          <Bell className="h-7 w-7" />
          {unreadNotifications.length > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 text-xs h-5 min-w-[20px] px-1 flex items-center justify-center"
            >
              {unreadNotifications.length > 99 ? '99+' : unreadNotifications.length}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-80 p-0" 
        align="end"
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-medium text-sm">{t('title')}</h3>
          {unreadNotifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="text-xs h-auto p-1 hover:bg-muted"
            >
              {t('markAllRead')}
            </Button>
          )}
        </div>

        {/* Notifications List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : recentNotifications.length === 0 ? (
          <div className="text-center py-8 px-6 text-muted-foreground">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">{t('noNotifications')}</p>
          </div>
        ) : (
          <ScrollArea className="max-h-96">
            <div className="p-2">
              {recentNotifications.map((notification) => (
                <NotificationItem 
                  key={notification.id} 
                  notification={notification} 
                />
              ))}
            </div>
          </ScrollArea>
        )}

        {/* View All Link */}
        {notifications.length > 10 && (
          <div className="border-t p-3">
            <Button 
              variant="ghost" 
              className="w-full text-sm"
              onClick={() => {
                // Navigate to full notifications page
                console.log('Navigate to full notifications')
              }}
            >
              {t('viewAll')} ({notifications.length})
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
