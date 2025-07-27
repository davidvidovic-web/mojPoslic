'use client'

import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useSupabaseAuth } from '@/contexts/supabase-auth-context'

/**
 * Real-time jobs hook that invalidates cache when jobs are updated
 * Provides live updates for job listings
 * Only connects when user is authenticated to avoid unnecessary WebSocket connections
 */
export function useRealtimeJobs() {
  const queryClient = useQueryClient()
  const { user } = useSupabaseAuth()

  useEffect(() => {
    // Only connect to realtime if user is authenticated
    if (!user) {
      return
    }

    const subscription = supabase
      .channel('jobs')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'job_listings'
      }, () => {
        // Invalidate all job-related queries when any job changes
        queryClient.invalidateQueries({ queryKey: ['jobs'] })
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [queryClient, user])
}

/**
 * Real-time job applications hook for a specific job
 * Provides live updates for application counts
 */
export function useRealtimeJobApplications(jobId: string) {
  const queryClient = useQueryClient()
  const { user } = useSupabaseAuth()

  useEffect(() => {
    if (!jobId || !user) return

    const subscription = supabase
      .channel('job_applications')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'applications',
        filter: `job_id=eq.${jobId}`
      }, () => {
        // Invalidate applications for this specific job
        queryClient.invalidateQueries({ 
          queryKey: ['jobs', jobId, 'applications'] 
        })
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [jobId, queryClient, user])
}

/**
 * Real-time notifications hook for a specific user
 * Provides live notification updates
 * Only connects when user is authenticated
 */
export function useRealtimeNotifications() {
  const queryClient = useQueryClient()
  const { user } = useSupabaseAuth()

  useEffect(() => {
    if (!user) return

    const subscription = supabase
      .channel('user_notifications')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`
      }, () => {
        // Invalidate user notifications
        queryClient.invalidateQueries({ 
          queryKey: ['notifications', user.id] 
        })
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [queryClient, user])
}

/**
 * Real-time connection updates hook for user connections/credits
 * Provides live updates for user connection counts
 */
export function useRealtimeUserConnections() {
  const queryClient = useQueryClient()
  const { user } = useSupabaseAuth()

  useEffect(() => {
    if (!user) return

    const subscription = supabase
      .channel('user_connections')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'users',
        filter: `id=eq.${user.id}`
      }, () => {
        // Invalidate user profile data when connections change
        queryClient.invalidateQueries({ 
          queryKey: ['user', user.id] 
        })
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [queryClient, user])
}
