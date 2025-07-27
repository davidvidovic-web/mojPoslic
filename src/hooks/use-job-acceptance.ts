// Legacy compatibility layer - redirects to new Supabase-based hooks
// This file maintains backward compatibility while we migrate components

import { useCallback } from 'react'
import { useNotificationStore } from '@/stores/notification-store'
import { toast } from 'sonner'
import { 
  useActiveJobsQuery, 
  useAcceptTaskerMutation,
  type ActiveJob 
} from './queries/useJobs'
import { useSupabaseAuth } from '@/contexts/supabase-auth-context'

export interface JobAcceptanceData {
  agreedSalary?: number
  startDate?: string
  notes?: string
}

// Re-export the ActiveJob type for compatibility
export type { ActiveJob }

export function useJobAcceptance() {
  const { user } = useSupabaseAuth()
  const { addNotification } = useNotificationStore()
  
  // Use new Supabase-based hooks
  const activeJobsQuery = useActiveJobsQuery(user?.id)
  const acceptTaskerMutation = useAcceptTaskerMutation()

  /**
   * Accept a tasker for a job - now uses Supabase mutation
   */
  const acceptTasker = useCallback(async (
    jobId: string,
    applicationId: string,
    acceptanceData: JobAcceptanceData = {}
  ) => {
    try {
      const result = await acceptTaskerMutation.mutateAsync({
        applicationId,
        acceptanceData
      })
      
      toast.success('Tasker accepted successfully! Job is now locked.')
      
      // Add notification for successful acceptance
      addNotification({
        type: 'success',
        title: 'Tasker Accepted',
        message: `You have successfully accepted a tasker for "${result.job?.title}". The job is now locked.`
      })

      return result
    } catch (error) {
      console.error('useJobAcceptance error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to accept tasker'
      toast.error(errorMessage)
      throw error
    }
  }, [acceptTaskerMutation, addNotification])

  /**
   * Fetch active jobs - now uses React Query
   */
  const fetchActiveJobs = useCallback(async () => {
    try {
      await activeJobsQuery.refetch()
      return activeJobsQuery.data || []
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch active jobs'
      console.error('Error fetching active jobs:', error)
      toast.error(errorMessage)
      return []
    }
  }, [activeJobsQuery])

  /**
   * Check if user has any active jobs
   */
  const hasActiveJobs = useCallback(() => {
    return (activeJobsQuery.data || []).length > 0
  }, [activeJobsQuery.data])

  /**
   * Get active job by ID
   */
  const getActiveJob = useCallback((jobId: string) => {
    return (activeJobsQuery.data || []).find(job => job.jobId === jobId)
  }, [activeJobsQuery.data])

  /**
   * Simulate receiving job acceptance notification for tasker
   */
  const handleJobAcceptanceNotification = useCallback((jobTitle: string, clientName?: string) => {
    addNotification({
      type: 'success',
      title: '🎉 Job Accepted!',
      message: `Congratulations! You have been accepted for "${jobTitle}"${clientName ? ` by ${clientName}` : ''}. The job is now active in your dashboard.`,
      action: {
        label: 'View Dashboard',
        onClick: () => {
          // Navigate to dashboard overview
          window.location.href = '/dashboard'
        }
      }
    })

    toast.success(`🎉 Accepted for "${jobTitle}"!`, {
      description: 'Check your active jobs for more details.'
    })
  }, [addNotification])

  return {
    // States - now derived from React Query
    isAccepting: acceptTaskerMutation.isPending,
    activeJobs: activeJobsQuery.data || [],
    isLoadingActiveJobs: activeJobsQuery.isLoading,

    // Actions
    acceptTasker,
    fetchActiveJobs,
    hasActiveJobs,
    getActiveJob,
    handleJobAcceptanceNotification,
  }
}
