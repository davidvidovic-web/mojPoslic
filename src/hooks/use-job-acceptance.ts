import { useState, useCallback } from 'react'
import { useNotificationStore } from '@/stores/notification-store'
import { toast } from 'sonner'

export interface JobAcceptanceData {
  agreedSalary?: number
  startDate?: string
  notes?: string
}

export interface ActiveJob {
  assignmentId: string
  jobId: string
  title: string
  company: string
  description: string
  salary?: string
  salaryType?: string
  salaryMin?: number
  salaryMax?: number
  agreedSalary?: number
  startDate?: string
  startTime?: string
  duration?: string
  jobAddress?: string
  contractStatus: string
  assignedAt: string
  appliedAt: string
  selectedAt?: string
  applicationMessage?: string
  notes?: string
  client: {
    id: string
    name?: string
    email?: string
    companyName?: string
  }
}

export function useJobAcceptance() {
  const [isAccepting, setIsAccepting] = useState(false)
  const [activeJobs, setActiveJobs] = useState<ActiveJob[]>([])
  const [isLoadingActiveJobs, setIsLoadingActiveJobs] = useState(false)
  const { addNotification } = useNotificationStore()

  /**
   * Accept a tasker for a job
   */
  const acceptTasker = useCallback(async (
    jobId: string,
    applicationId: string,
    acceptanceData: JobAcceptanceData = {}
  ) => {
    console.log('useJobAcceptance: acceptTasker called', { jobId, applicationId, acceptanceData })
    setIsAccepting(true)
    try {
      const url = `/api/jobs/${jobId}/applications/${applicationId}/accept`
      console.log('Making POST request to:', url)
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(acceptanceData),
      })

      console.log('API response status:', response.status)

      if (!response.ok) {
        const error = await response.json()
        console.error('API error response:', error)
        throw new Error(error.error || 'Failed to accept tasker')
      }

      const result = await response.json()
      console.log('API success response:', result)
      
      toast.success('Tasker accepted successfully! Job is now locked.')
      
      // Add notification for successful acceptance
      addNotification({
        type: 'success',
        title: 'Tasker Accepted',
        message: `You have successfully accepted a tasker for "${result.application.job.title}". The job is now locked.`
      })

      return result
    } catch (error) {
      console.error('useJobAcceptance error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to accept tasker'
      toast.error(errorMessage)
      throw error
    } finally {
      setIsAccepting(false)
    }
  }, [addNotification])

  /**
   * Fetch active jobs for tasker
   */
  const fetchActiveJobs = useCallback(async () => {
    setIsLoadingActiveJobs(true)
    try {
      const response = await fetch('/api/tasker/active-jobs')
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch active jobs')
      }

      const result = await response.json()
      setActiveJobs(result.activeJobs || [])
      return result.activeJobs || []
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch active jobs'
      console.error('Error fetching active jobs:', error)
      toast.error(errorMessage)
      setActiveJobs([])
      return []
    } finally {
      setIsLoadingActiveJobs(false)
    }
  }, [])

  /**
   * Check if user has any active jobs
   */
  const hasActiveJobs = useCallback(() => {
    return activeJobs.length > 0
  }, [activeJobs])

  /**
   * Get active job by ID
   */
  const getActiveJob = useCallback((jobId: string) => {
    return activeJobs.find(job => job.jobId === jobId)
  }, [activeJobs])

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
    // States
    isAccepting,
    activeJobs,
    isLoadingActiveJobs,

    // Actions
    acceptTasker,
    fetchActiveJobs,
    hasActiveJobs,
    getActiveJob,
    handleJobAcceptanceNotification,
  }
}
