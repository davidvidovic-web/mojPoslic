'use client'

import { useSupabaseAuth } from '@/contexts/supabase-auth-context'
import { useNotificationsQuery, useMarkNotificationReadMutation, useMarkAllNotificationsReadMutation } from '@/hooks/queries/useNotifications'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Bell, Check, CheckCheck, UserPlus, Briefcase, MessageSquare, Star, AlertCircle } from 'lucide-react'
import { formatRelativeDate } from '@/lib/date-format'
import { useTranslations } from 'next-intl'
import { useLocale } from 'next-intl'
import { toast } from 'sonner'
import type { Database } from '@/types/supabase'

type NotificationRow = Database['public']['Tables']['notifications']['Row']

interface TaskerNotificationsSectionProps {
  className?: string
}

export function TaskerNotificationsSection({ className }: TaskerNotificationsSectionProps) {
  const { user } = useSupabaseAuth()
  const t = useTranslations('dashboard.notifications')
  const locale = useLocale() as 'bs' | 'en'
  
  const { data: notifications = [], isLoading } = useNotificationsQuery(user?.id || '')
  const markAsReadMutation = useMarkNotificationReadMutation()
  const markAllAsReadMutation = useMarkAllNotificationsReadMutation()

  const unreadNotifications = notifications.filter(n => !n.is_read)
  const recentNotifications = notifications.slice(0, 10)

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'JOB_APPLICATION':
        return <UserPlus className="h-4 w-4 text-blue-500" />
      case 'JOB_UPDATE':
        return <Briefcase className="h-4 w-4 text-green-500" />
      case 'NEW_MESSAGE':
        return <MessageSquare className="h-4 w-4 text-purple-500" />
      case 'NEW_REVIEW':
        return <Star className="h-4 w-4 text-yellow-500" />
      case 'SYSTEM':
        return <AlertCircle className="h-4 w-4 text-orange-500" />
      default:
        return <Bell className="h-4 w-4 text-gray-500" />
    }
  }

  const getLocalizedNotificationContent = (notification: NotificationRow) => {
    // Fallback to database content if no translation pattern matches
    let title = notification.title || ''
    let message = notification.message || ''

    // Try to translate based on notification type and content patterns
    try {
      switch (notification.type) {
        case 'JOB_APPLICATION':
          if (locale === 'bs') {
            title = 'Nova prijava za posao'
            message = notification.message || 'Imate novu prijavu za jedan od vaših poslova'
          } else {
            title = 'New Job Application'
            message = notification.message || 'You have a new application for one of your jobs'
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
          if (locale === 'bs') {
            title = 'Nova poruka'
            message = notification.message || 'Imate novu poruku'
          } else {
            title = 'New Message'
            message = notification.message || 'You have a new message'
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

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsReadMutation.mutateAsync(notificationId)
    } catch (error) {
      console.error('Error marking notification as read:', error)
      toast.error(t('error'))
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsReadMutation.mutateAsync(user?.id || '')
      toast.success(t('allMarkedRead'))
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
      toast.error(t('error'))
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
    }
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="h-5 w-5" />
            {t('title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="h-5 w-5" />
            {t('title')}
            {unreadNotifications.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadNotifications.length}
              </Badge>
            )}
          </CardTitle>
          {unreadNotifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={markAllAsReadMutation.isPending}
              className="text-xs"
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              {t('markAllRead')}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {recentNotifications.length === 0 ? (
          <div className="text-center py-8 px-6 text-muted-foreground">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>{t('noNotifications')}</p>
          </div>
        ) : (
          <ScrollArea className="h-96">
            <div className="space-y-1 p-4">
              {recentNotifications.map((notification) => {
                const { title, message } = getLocalizedNotificationContent(notification)
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
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${
                            notification.is_read ? 'text-muted-foreground' : 'text-foreground'
                          }`}>
                            {title}
                          </p>
                          <p className={`text-xs mt-1 ${
                            notification.is_read ? 'text-muted-foreground' : 'text-muted-foreground'
                          }`}>
                            {message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {notification.created_at && formatRelativeDate(notification.created_at, locale)}
                          </p>
                        </div>
                        {!notification.is_read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleMarkAsRead(notification.id)
                            }}
                            disabled={markAsReadMutation.isPending}
                            className="h-6 w-6 p-0 hover:bg-white/20"
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        )}
        {notifications.length > 10 && (
          <div className="border-t p-4">
            <Button variant="ghost" className="w-full text-sm">
              {t('viewAll')}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}