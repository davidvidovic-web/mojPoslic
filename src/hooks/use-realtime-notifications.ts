'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { useSupabaseAuth } from '@/contexts/supabase-auth-context'
import { toast } from 'sonner'

export type NotificationType = 
  | 'NEW_MESSAGE' 
  | 'NEW_REVIEW' 
  | 'JOB_APPLICATION' 
  | 'JOB_UPDATE' 
  | 'SYSTEM'
  | 'APPLICATION_STATUS_CHANGE'
  | 'NEW_JOB_MATCH'
  | 'CONNECTION_UPDATE'

export interface NotificationData {
  url?: string
  job_id?: string
  conversation_id?: string
  application_id?: string
  user_id?: string
  amount?: number
  [key: string]: string | number | boolean | undefined
}

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  message: string
  data?: NotificationData
  is_read: boolean
  created_at: string
}

interface UseRealtimeNotificationsProps {
  enabled?: boolean
  showToasts?: boolean
}

export function useRealtimeNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const channelRef = useRef<RealtimeChannel | null>(null)
  const { user } = useSupabaseAuth()

  // Load initial notifications
  const loadNotifications = useCallback(async () => {
    if (!user?.id || !enabled) return

    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error

      setNotifications(data || [])
      setUnreadCount(data?.filter(n => !n.is_read).length || 0)
    } catch (err) {
      console.error('Failed to load notifications:', err)
      setError(err instanceof Error ? err.message : 'Failed to load notifications')
    } finally {
      setIsLoading(false)
    }
  }, [user?.id, enabled, supabase])

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    if (!user?.id) return

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', user.id)

      if (error) throw error

      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, is_read: true } : n
      ))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (err) {
      console.error('Failed to mark notification as read:', err)
    }
  }, [user?.id, supabase])

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!user?.id) return

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false)

      if (error) throw error

      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      setUnreadCount(0)
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err)
    }
  }, [user?.id, supabase])

  // Delete notification
  const deleteNotification = useCallback(async (notificationId: string) => {
    if (!user?.id) return

    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', user.id)

      if (error) throw error

      const deletedNotification = notifications.find(n => n.id === notificationId)
      setNotifications(prev => prev.filter(n => n.id !== notificationId))
      
      if (deletedNotification && !deletedNotification.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (err) {
      console.error('Failed to delete notification:', err)
    }
  }, [user?.id, notifications, supabase])

  // Create notification (for testing or manual creation)
  const createNotification = useCallback(async (
    type: NotificationType,
    title: string,
    message: string,
    data?: NotificationData
  ) => {
    if (!user?.id) return

    try {
      const { data: notification, error } = await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          type,
          title,
          message,
          data
        })
        .select()
        .single()

      if (error) throw error
      return notification
    } catch (err) {
      console.error('Failed to create notification:', err)
      throw err
    }
  }, [user?.id, supabase])

  // Format notification for display
  const formatNotification = useCallback((notification: Notification) => {
    const timeAgo = new Date(notification.created_at).toLocaleString()
    
    return {
      ...notification,
      timeAgo,
      icon: getNotificationIcon(notification.type),
      color: getNotificationColor(notification.type)
    }
  }, [])

  // Set up real-time subscription
  useEffect(() => {
    if (!user?.id || !enabled) return

    const channel = supabase
      .channel(`notifications_${user.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`
      }, (payload: any) => {
        const newNotification = payload.new as Notification
        
        setNotifications(prev => [newNotification, ...prev])
        setUnreadCount(prev => prev + 1)

        // Show toast notification
        if (showToasts) {
          toast(newNotification.title, {
            description: newNotification.message,
            action: {
              label: 'View',
              onClick: () => {
                // Handle notification action based on type
                handleNotificationAction(newNotification)
              }
            }
          })
        }
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        const updatedNotification = payload.new as Notification
        
        setNotifications(prev => prev.map(n => 
          n.id === updatedNotification.id ? updatedNotification : n
        ))
        
        // Update unread count if read status changed
        if (updatedNotification.is_read) {
          setUnreadCount(prev => Math.max(0, prev - 1))
        }
      })
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        const deletedId = payload.old.id
        const deletedNotification = notifications.find(n => n.id === deletedId)
        
        setNotifications(prev => prev.filter(n => n.id !== deletedId))
        
        if (deletedNotification && !deletedNotification.is_read) {
          setUnreadCount(prev => Math.max(0, prev - 1))
        }
      })
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [user?.id, enabled, showToasts, notifications, supabase])

  // Load initial notifications
  useEffect(() => {
    if (enabled) {
      loadNotifications()
    }
  }, [loadNotifications, enabled])

  return {
    // Data
    notifications,
    unreadCount,
    
    // State
    isLoading,
    error,
    
    // Actions
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createNotification,
    loadNotifications,
    
    // Utilities
    formatNotification,
    hasUnread: unreadCount > 0
  }
}

// Helper functions
function getNotificationIcon(type: NotificationType): string {
  switch (type) {
    case 'NEW_MESSAGE':
      return '💬'
    case 'NEW_REVIEW':
      return '⭐'
    case 'JOB_APPLICATION':
      return '📝'
    case 'JOB_UPDATE':
      return '🔄'
    case 'APPLICATION_STATUS_CHANGE':
      return '📋'
    case 'NEW_JOB_MATCH':
      return '🎯'
    case 'CONNECTION_UPDATE':
      return '🔗'
    case 'SYSTEM':
      return '⚙️'
    default:
      return '📢'
  }
}

function getNotificationColor(type: NotificationType): string {
  switch (type) {
    case 'NEW_MESSAGE':
      return 'blue'
    case 'NEW_REVIEW':
      return 'yellow'
    case 'JOB_APPLICATION':
      return 'green'
    case 'JOB_UPDATE':
      return 'orange'
    case 'APPLICATION_STATUS_CHANGE':
      return 'purple'
    case 'NEW_JOB_MATCH':
      return 'pink'
    case 'CONNECTION_UPDATE':
      return 'cyan'
    case 'SYSTEM':
      return 'gray'
    default:
      return 'blue'
  }
}

function handleNotificationAction(notification: Notification) {
  // Handle navigation based on notification type and data
  if (notification.data?.url) {
    window.location.href = notification.data.url
  } else {
    // Default handling based on type
    switch (notification.type) {
      case 'NEW_MESSAGE':
        if (notification.data?.conversation_id) {
          window.location.href = `/dashboard/messages?conversation=${notification.data.conversation_id}`
        }
        break
      case 'JOB_APPLICATION':
        if (notification.data?.job_id) {
          window.location.href = `/dashboard/jobs/${notification.data.job_id}/applications`
        }
        break
      case 'JOB_UPDATE':
        if (notification.data?.job_id) {
          window.location.href = `/jobs/${notification.data.job_id}`
        }
        break
      default:
        window.location.href = '/dashboard'
    }
  }
}
