'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSupabaseAuth } from '@/contexts/supabase-auth-context'
import { supabase } from '@/lib/supabase'

export interface JobMatch {
  jobId: string
  similarityScore: number
  jobDetails: {
    id: string
    title: string
    description: string
    city_id: string
    category_id: string
    job_type: string
    salary_amount?: number
    salary_type: string
    created_at: string
    posted_by: {
      id: string
      name: string
      company_name?: string
    }
  }
  reasonsForMatch: string[]
}

export interface MatchingCriteria {
  skills: string[]
  location: string
  jobTypes: string[]
  salaryRange: {
    min?: number
    max?: number
  }
  keywords: string[]
}

interface UseAIJobMatchingProps {
  enabled?: boolean
  autoRefresh?: boolean
  refreshInterval?: number
}

export function useAIJobMatching({ 
  enabled = true, 
  autoRefresh = true,
  refreshInterval = 300000 // 5 minutes
}: UseAIJobMatchingProps = {}) {
  const { user } = useSupabaseAuth()
  
  const [matches, setMatches] = useState<JobMatch[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [criteria, setCriteria] = useState<MatchingCriteria>({
    skills: [],
    location: '',
    jobTypes: [],
    salaryRange: {},
    keywords: []
  })

  // Get AI-powered job matches
  const getJobMatches = useCallback(async (customCriteria?: Partial<MatchingCriteria>) => {
    if (!user?.id || !enabled) return

    try {
      setIsLoading(true)
      setError(null)

      // Call the job matching Edge Function
      const { data, error: functionError } = await supabase.functions.invoke('job-matching', {
        body: {
          userId: user.id,
          limit: 20,
          includeSkillsMatch: true,
          criteria: customCriteria || criteria
        }
      })

      if (functionError) throw functionError

      setMatches(data.matches || [])
      setLastUpdated(new Date())

    } catch (err) {
      console.error('Failed to get job matches:', err)
      setError(err instanceof Error ? err.message : 'Failed to get job matches')
    } finally {
      setIsLoading(false)
    }
  }, [user?.id, enabled, criteria, supabase])

  // Update matching criteria
  const updateCriteria = useCallback((newCriteria: Partial<MatchingCriteria>) => {
    setCriteria(prev => ({ ...prev, ...newCriteria }))
  }, [])

  // Get matches by job type
  const getMatchesByType = useCallback((jobType: string) => {
    return matches.filter(match => match.jobDetails.job_type === jobType)
  }, [matches])

  // Get matches by score threshold
  const getHighQualityMatches = useCallback((minScore: number = 0.7) => {
    return matches.filter(match => match.similarityScore >= minScore)
  }, [matches])

  // Save job for later
  const saveJob = useCallback(async (jobId: string) => {
    if (!user?.id) return

    try {
      const { error } = await (supabase as any)
        .from('saved_jobs')
        .upsert({
          user_id: user.id,
          job_id: jobId
        })

      if (error) throw error

      // Update matches to reflect saved status
      setMatches(prev => prev.map(match => 
        match.jobId === jobId 
          ? { ...match, jobDetails: { ...match.jobDetails, isSaved: true } }
          : match
      ))

    } catch (err) {
      console.error('Failed to save job:', err)
    }
  }, [user?.id, supabase])

  // Apply to job directly from matches
  const applyToJob = useCallback(async (jobId: string, applicationData: {
    coverLetter?: string
    hourlyRate?: number
    estimatedDuration?: string
  }) => {
    if (!user?.id) return

    try {
      const { data, error } = await (supabase as any)
        .from('applications')
        .insert({
          job_id: jobId,
          user_id: user.id,
          cover_letter: applicationData.coverLetter,
          hourly_rate: applicationData.hourlyRate,
          estimated_duration: applicationData.estimatedDuration
        })
        .select()
        .single()

      if (error) throw error

      // Update matches to reflect applied status
      setMatches(prev => prev.map(match => 
        match.jobId === jobId 
          ? { ...match, jobDetails: { ...match.jobDetails, hasApplied: true } }
          : match
      ))

      return data

    } catch (err) {
      console.error('Failed to apply to job:', err)
      throw err
    }
  }, [user?.id, supabase])

  // Track job view for analytics
  const trackJobView = useCallback(async (jobId: string) => {
    if (!user?.id) return

    try {
      await (supabase as any)
        .from('job_views')
        .insert({
          job_id: jobId,
          user_id: user.id,
          viewed_at: new Date().toISOString()
        })
    } catch (err) {
      // Silent fail for analytics
      console.debug('Analytics tracking failed:', err)
    }
  }, [user?.id, supabase])

  // Set up real-time updates for new jobs using Broadcast
  useEffect(() => {
    if (!enabled || !user?.id) return

    const setupChannel = async () => {
      // Set auth for private channel
      await supabase.realtime.setAuth()

      const channel = supabase
        .channel(`topic:applications:user:${user.id}`, {
          config: { private: true }
        })
        .on('broadcast', { event: 'INSERT' }, () => {
          // Refresh matches when new application is created
          getJobMatches()
        })
        .on('broadcast', { event: 'UPDATE' }, () => {
          // Refresh matches when application is updated
          getJobMatches()
        })
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }

    setupChannel()
  }, [enabled, user?.id, getJobMatches, supabase])

  // Set up auto-refresh
  useEffect(() => {
    if (!autoRefresh || !enabled) return

    const interval = setInterval(() => {
      getJobMatches()
    }, refreshInterval)

    return () => {
      clearInterval(interval)
    }
  }, [autoRefresh, enabled, refreshInterval, getJobMatches])

  // Load user preferences and initial matches
  useEffect(() => {
    if (!user?.id || !enabled) return

    const loadUserPreferences = async () => {
      try {
        // Get user skills and preferences
        const { data: userProfile } = await supabase
          .from('users')
          .select(`
            skills,
            preferred_job_types,
            location,
            user_skills (
              skill:skills (name)
            )
          `)
          .eq('id', user.id)
          .single()

        if (userProfile) {
          const userSkills = (typeof userProfile.skills === 'string' ? (userProfile.skills as string).split(',') : userProfile.skills) || []
          const jobTypes = userProfile.preferred_job_types?.split(',') || []

          setCriteria({
            skills: userSkills,
            location: userProfile.location || '',
            jobTypes: jobTypes,
            salaryRange: {},
            keywords: []
          })
        }

        // Get initial matches
        await getJobMatches()

      } catch (err) {
        console.error('Failed to load user preferences:', err)
      }
    }

    loadUserPreferences()
  }, [user?.id, enabled, supabase, getJobMatches])

  return {
    // Data
    matches,
    criteria,
    
    // State
    isLoading,
    error,
    lastUpdated,
    
    // Actions
    getJobMatches,
    updateCriteria,
    saveJob,
    applyToJob,
    trackJobView,
    
    // Utilities
    getMatchesByType,
    getHighQualityMatches,
    hasMatches: matches.length > 0,
    matchCount: matches.length,
    averageScore: matches.length > 0 
      ? matches.reduce((sum, match) => sum + match.similarityScore, 0) / matches.length 
      : 0,
    
    // Categories
    quickJobs: getMatchesByType('quick_job'),
    fullTimeJobs: getMatchesByType('full_time'),
    partTimeJobs: getMatchesByType('part_time'),
    remoteJobs: getMatchesByType('remote'),
    
    // Quality tiers
    perfectMatches: getHighQualityMatches(0.9),
    goodMatches: getHighQualityMatches(0.7),
    potentialMatches: matches.filter(m => m.similarityScore >= 0.5 && m.similarityScore < 0.7)
  }
}
