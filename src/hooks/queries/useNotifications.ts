'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { queryKeys } from '@/lib/query-keys'
import type { Database } from '@/types/supabase'

type NotificationInsert = Database['public']['Tables']['notifications']['Insert']
type NotificationType = Database['public']['Enums']['notification_type']

export function useNotificationsQuery(userId: string) {
  return useQuery({
    queryKey: queryKeys.notifications.user(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    },
    enabled: !!userId,
  })
}

export function useUnreadNotificationsQuery(userId: string) {
  return useQuery({
    queryKey: queryKeys.notifications.unread(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .eq('is_read', false)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    },
    enabled: !!userId,
  })
}

export function useNotificationsByTypeQuery(userId: string, type: NotificationType) {
  return useQuery({
    queryKey: queryKeys.notifications.byType(userId, type),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .eq('type', type)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    },
    enabled: !!userId && !!type,
  })
}

export function useMarkNotificationReadMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { data, error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (notification) => {
      // Update cache
      queryClient.setQueryData(
        queryKeys.notifications.detail(notification.id),
        notification
      )
      
      // Invalidate user notifications if user_id exists
      if (notification.user_id) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.notifications.user(notification.user_id)
        })
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.notifications.unread(notification.user_id)
        })
      }
    },
  })
}

export function useMarkAllNotificationsReadMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (userId: string) => {
      const { data, error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false)
        .select()

      if (error) throw error
      return data
    },
    onSuccess: (notifications) => {
      if (notifications.length > 0) {
        const userId = notifications[0].user_id
        
        // Invalidate all notification queries for this user if user_id exists
        if (userId) {
          queryClient.invalidateQueries({ 
            queryKey: queryKeys.notifications.user(userId)
          })
          queryClient.invalidateQueries({ 
            queryKey: queryKeys.notifications.unread(userId)
          })
        }
      }
    },
  })
}

export function useCreateNotificationMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (notificationData: NotificationInsert) => {
      const { data, error } = await supabase
        .from('notifications')
        .insert([notificationData])
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (notification) => {
      // Invalidate user notifications if user_id exists
      if (notification.user_id) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.notifications.user(notification.user_id)
        })
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.notifications.unread(notification.user_id)
        })
      }
    },
  })
}

export function useDeleteNotificationMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)

      if (error) throw error
      return notificationId
    },
    onSuccess: (notificationId) => {
      // Remove from cache
      queryClient.removeQueries({ 
        queryKey: queryKeys.notifications.detail(notificationId)
      })
      
      // Invalidate notification lists
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.notifications.all
      })
    },
  })
}
