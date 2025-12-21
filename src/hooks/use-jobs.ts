/**
 * Optimized Jobs Data Hooks  
 * Uses cached data from optimized database structure for better performance
 * Replaces TanStack Query with custom hooks for simplified data management
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { Job, JobFilters } from '@/types/job'

interface JobsState {
  jobs: Job[]
  loading: boolean
  error: string | null
  totalCount: number
}

/**
 * Hook for fetching jobs with filters - uses cached data for better performance
 */
export function useJobs(filters: JobFilters = {}) {
  const [state, setState] = useState<JobsState>({
    jobs: [],
    loading: true,
    error: null,
    totalCount: 0
  })

  const fetchJobs = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))

      // Build query parameters
      const params = new URLSearchParams()
      if (filters.search) params.append('search', filters.search)
      if (filters.city && filters.city !== 'all') params.append('city', filters.city)
      if (filters.category && filters.category !== 'all') params.append('category', filters.category)
      if (filters.type && filters.type !== 'all') params.append('type', filters.type)
      if (filters.subcategory) params.append('subcategory', filters.subcategory)

      // Add cache busting parameter to ensure fresh data
      params.append('_t', Date.now().toString())

      const response = await fetch(`/api/jobs?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch jobs: ${response.statusText}`)
      }

      const jobs: Job[] = await response.json()

      setState({
        jobs,
        loading: false,
        error: null,
        totalCount: jobs.length
      })
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch jobs'
      }))
    }
  }, [filters])

  const refetch = useCallback(() => {
    fetchJobs()
  }, [fetchJobs])

  useEffect(() => {
    fetchJobs()
  }, [fetchJobs])

  // Auto-refresh data when page becomes visible (user returns from job detail)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Refetch with a small delay to allow for any pending updates
        setTimeout(() => {
          refetch()
        }, 500)
      }
    }

    const handleFocus = () => {
      // Refetch when window regains focus
      setTimeout(() => {
        refetch()
      }, 500)
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [refetch])

  return {
    ...state,
    refetch
  }
}

/**
 * Hook for a specific job by ID
 */
export function useJob(jobId: string | undefined) {
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchJob = async () => {
      if (!jobId) {
        setJob(null)
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/jobs/${jobId}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Job not found')
          }
          throw new Error(`Failed to fetch job: ${response.statusText}`)
        }

        const jobData: Job = await response.json()
        setJob(jobData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch job')
        setJob(null)
      } finally {
        setLoading(false)
      }
    }

    fetchJob()
  }, [jobId])

  return { job, loading, error }
}

/**
 * Hook for featured jobs
 */
export function useFeaturedJobs() {
  const [featuredJobs, setFeaturedJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchFeaturedJobs = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch('/api/jobs?featured=true')
        
        if (!response.ok) {
          throw new Error(`Failed to fetch featured jobs: ${response.statusText}`)
        }

        const jobs: Job[] = await response.json()
        setFeaturedJobs(jobs.filter(job => job.is_featured))
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch featured jobs')
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedJobs()
  }, [])

  return { featuredJobs, loading, error }
}

/**
 * Hook for recent jobs
 */
export function useRecentJobs(limit: number = 10) {
  const [recentJobs, setRecentJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRecentJobs = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/jobs?limit=${limit}`)
        
        if (!response.ok) {
          throw new Error(`Failed to fetch recent jobs: ${response.statusText}`)
        }

        const jobs: Job[] = await response.json()
        setRecentJobs(jobs.slice(0, limit))
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch recent jobs')
      } finally {
        setLoading(false)
      }
    }

    fetchRecentJobs()
  }, [limit])

  return { recentJobs, loading, error }
}

/**
 * Hook for user's jobs
 */
export function useUserJobs(userId?: string) {
  const [userJobs, setUserJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserJobs = async () => {
      try {
        setLoading(true)
        setError(null)

        const endpoint = userId ? `/api/users/${userId}/jobs` : '/api/jobs/my-jobs'
        const response = await fetch(endpoint)
        
        if (!response.ok) {
          throw new Error(`Failed to fetch user jobs: ${response.statusText}`)
        }

        const jobs: Job[] = await response.json()
        setUserJobs(jobs)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch user jobs')
      } finally {
        setLoading(false)
      }
    }

    fetchUserJobs()
  }, [userId])

  return { userJobs, loading, error }
}

// Legacy exports for backward compatibility
export const useJobsList = useJobs
export const useJobDetail = useJob
