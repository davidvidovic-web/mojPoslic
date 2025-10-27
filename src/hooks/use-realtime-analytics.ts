'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { RealtimeChannel } from '@supabase/supabase-js'
import { toast } from 'sonner'
import { useSupabaseAuth } from '@/contexts/supabase-auth-context'
import { supabase } from '@/lib/supabase'

export interface LiveStats {
  totalJobs: number
  activeJobs: number
  totalApplications: number
  pendingApplications: number
  totalUsers: number
  activeUsers: number
  connectionsUsed: number
  jobsPostedToday: number
  applicationsToday: number
  newUsersToday: number
}

export interface JobStats {
  totalViews: number
  uniqueViews: number
  applicationsCount: number
  averageApplicationsPerJob: number
  topPerformingJobs: Array<{
    id: string
    title: string
    views: number
    applications: number
  }>
}

export interface UserEngagement {
  dailyActiveUsers: number
  weeklyActiveUsers: number
  averageSessionDuration: number
  topUserActivities: Array<{
    activity: string
    count: number
  }>
}

interface UseRealtimeAnalyticsProps {
  enabled?: boolean
  refreshInterval?: number
}

export function useRealtimeAnalytics({ 
  enabled = true, 
  refreshInterval = 30000 // 30 seconds
}: UseRealtimeAnalyticsProps = {}) {
  const { user } = useSupabaseAuth()
  
  const [liveStats, setLiveStats] = useState<LiveStats>({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    pendingApplications: 0,
    totalUsers: 0,
    activeUsers: 0,
    connectionsUsed: 0,
    jobsPostedToday: 0,
    applicationsToday: 0,
    newUsersToday: 0
  })
  
  const [jobStats, setJobStats] = useState<JobStats>({
    totalViews: 0,
    uniqueViews: 0,
    applicationsCount: 0,
    averageApplicationsPerJob: 0,
    topPerformingJobs: []
  })
  
  const [userEngagement, setUserEngagement] = useState<UserEngagement>({
    dailyActiveUsers: 0,
    weeklyActiveUsers: 0,
    averageSessionDuration: 0,
    topUserActivities: []
  })
  
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  // Fetch live statistics
  const fetchLiveStats = useCallback(async () => {
    if (!enabled) return

    try {
      const today = new Date().toISOString().split('T')[0]
      
      // Execute multiple queries in parallel
      const [
        jobsData,
        applicationsData,
        usersData,
        jobViewsData,
        connectionsData
      ] = await Promise.all([
        // Jobs statistics
        supabase
          .from('job_listings')
          .select('id, title, status, created_at'),
        
        // Applications statistics  
        supabase
          .from('applications')
          .select('id, job_id, status, applied_at'),
          
        // Users statistics
        supabase
          .from('users')
          .select('id, created_at, connections, last_login_at'),
          
        // Job views statistics
        (supabase as any)
          .from('job_views')
          .select('id, job_id, user_id, ip_address, viewed_at'),
          
        // Connection history
        supabase
          .from('connection_history')
          .select('amount_changed, created_at')
          .gte('created_at', today)
      ])

      if (jobsData.error) throw jobsData.error
      if (applicationsData.error) throw applicationsData.error
      if (usersData.error) throw usersData.error
      if (jobViewsData.error) throw jobViewsData.error
      if (connectionsData.error) throw connectionsData.error

      // Process live stats
      const jobs = jobsData.data || []
      const applications = applicationsData.data || []
      const users = usersData.data || []
      const views = jobViewsData.data || []
      const connections = connectionsData.data || []

      const now = new Date()
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())

      setLiveStats({
        totalJobs: jobs.length,
        activeJobs: jobs.filter(j => j.status === 'active').length,
        totalApplications: applications.length,
        pendingApplications: applications.filter(a => a.status === 'PENDING').length,
        totalUsers: users.length,
        activeUsers: users.filter(u => 
          u.last_login_at && new Date(u.last_login_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
        ).length,
        connectionsUsed: Math.abs(connections.reduce((sum, c) => sum + (c.amount_changed || 0), 0)),
        jobsPostedToday: jobs.filter(j => new Date(j.created_at) >= todayStart).length,
        applicationsToday: applications.filter(a => new Date(a.applied_at) >= todayStart).length,
        newUsersToday: users.filter(u => new Date(u.created_at) >= todayStart).length
      })

      // Process job statistics
      const jobViewCounts = views.reduce((acc, view) => {
        acc[view.job_id] = (acc[view.job_id] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      const uniqueJobViews = views.reduce((acc, view) => {
        const key = `${view.job_id}-${view.user_id || view.ip_address}`
        acc[view.job_id] = acc[view.job_id] || new Set()
        acc[view.job_id].add(key)
        return acc
      }, {} as Record<string, Set<string>>)

      const jobApplicationCounts = applications.reduce((acc, app) => {
        acc[app.job_id] = (acc[app.job_id] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      // Get top performing jobs
      const topJobs = Object.entries(jobViewCounts)
        .map(([jobId, viewCount]) => {
          const job = jobs.find(j => j.id === jobId)
          return {
            id: jobId,
            title: job?.title || 'Unknown Job',
            views: viewCount,
            applications: jobApplicationCounts[jobId] || 0
          }
        })
        .sort((a, b) => ((b.views as number) + b.applications * 2) - ((a.views as number) + a.applications * 2))
        .slice(0, 5)

      setJobStats({
        totalViews: views.length,
        uniqueViews: Object.values(uniqueJobViews as Record<string, Set<string>>).reduce((sum: number, set: Set<string>) => sum + set.size, 0),
        applicationsCount: applications.length,
        averageApplicationsPerJob: applications.length / Math.max(jobs.length, 1),
        topPerformingJobs: topJobs as any
      })

      // Process user engagement
      const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

      setUserEngagement({
        dailyActiveUsers: users.filter(u => 
          u.last_login_at && new Date(u.last_login_at) > dayAgo
        ).length,
        weeklyActiveUsers: users.filter(u => 
          u.last_login_at && new Date(u.last_login_at) > weekAgo
        ).length,
        averageSessionDuration: 0, // Would need session tracking
        topUserActivities: [
          { activity: 'Job Applications', count: applications.length },
          { activity: 'Job Views', count: views.length },
          { activity: 'New Registrations', count: users.filter(u => new Date(u.created_at) >= todayStart).length }
        ]
      })

      setLastUpdated(new Date())
      setError(null)

    } catch (err) {
      console.error('Failed to fetch analytics:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics')
    } finally {
      setIsLoading(false)
    }
  }, [enabled, supabase])

  // Get user-specific analytics (for regular users)
  const fetchUserAnalytics = useCallback(async () => {
    if (!user?.id || !enabled) return

    try {
      const [userJobsData, userApplicationsData] = await Promise.all([
        supabase
          .from('job_listings')
          .select('id, title, status, created_at')
          .eq('posted_by_id', user.id),
          
        supabase
          .from('applications')
          .select('id, status, applied_at, job_id')
          .eq('user_id', user.id)
      ])

      if (userJobsData.error) throw userJobsData.error
      if (userApplicationsData.error) throw userApplicationsData.error

      const userJobs = userJobsData.data || []
      const userApplications = userApplicationsData.data || []

      // Get views for user's jobs
      const { data: userJobViews } = await (supabase as any)
        .from('job_views')
        .select('job_id, viewed_at')
        .in('job_id', userJobs.map(j => j.id))

      const viewCounts = (userJobViews || []).reduce((acc, view) => {
        acc[view.job_id] = (acc[view.job_id] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      const topUserJobs = userJobs
        .map(job => ({
          id: job.id,
          title: job.title,
          views: viewCounts[job.id] || 0,
          applications: userApplications.filter(a => a.job_id === job.id).length
        }))
        .sort((a, b) => (b.views + b.applications * 2) - (a.views + a.applications * 2))
        .slice(0, 5)

      setJobStats(prev => ({
        ...prev,
        topPerformingJobs: topUserJobs
      }))

    } catch (err) {
      console.error('Failed to fetch user analytics:', err)
    }
  }, [user?.id, enabled, supabase])

  // Set up real-time subscriptions for live updates
  useEffect(() => {
    if (!enabled) return

    const channel = supabase
      .channel('analytics_updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'job_listings'
      }, () => {
        // Refresh stats when jobs change
        fetchLiveStats()
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'applications'
      }, () => {
        // Refresh stats when applications change
        fetchLiveStats()
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'job_views'
      }, () => {
        // Refresh stats when views change
        fetchLiveStats()
      })
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [enabled, fetchLiveStats, supabase])

  // Set up periodic refresh
  useEffect(() => {
    if (!enabled) return

    const interval = setInterval(() => {
      fetchLiveStats()
      if (user?.id) {
        fetchUserAnalytics()
      }
    }, refreshInterval)

    return () => {
      clearInterval(interval)
    }
  }, [enabled, refreshInterval, fetchLiveStats, fetchUserAnalytics, user?.id])

  // Initial load
  useEffect(() => {
    if (enabled) {
      fetchLiveStats()
      if (user?.id) {
        fetchUserAnalytics()
      }
    }
  }, [enabled, fetchLiveStats, fetchUserAnalytics, user?.id])

  return {
    // Data
    liveStats,
    jobStats,
    userEngagement,
    
    // State
    isLoading,
    error,
    lastUpdated,
    
    // Actions
    refresh: () => {
      fetchLiveStats()
      if (user?.id) {
        fetchUserAnalytics()
      }
    },
    
    // Utilities
    isAdmin: user?.role === 'admin',
    hasData: !isLoading && !error
  }
}
