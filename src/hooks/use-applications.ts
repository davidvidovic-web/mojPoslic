import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { 
  JobApplication, 
  ApplicationFilters, 
  UpdateApplicationRequest,
  CreateApplicationRequest,
  ApplicationStatus
} from '@/types/application'

// Hook for fetching user's applications (for taskers)
export function useApplications(filters?: ApplicationFilters) {
  return useQuery({
    queryKey: ['applications', filters],
    queryFn: async (): Promise<JobApplication[]> => {
      const params = new URLSearchParams()
      
      if (filters?.status?.length) {
        params.append('status', filters.status.join(','))
      }
      if (filters?.jobId) {
        params.append('jobId', filters.jobId)
      }
      if (filters?.search) {
        params.append('search', filters.search)
      }
      if (filters?.dateFrom) {
        params.append('dateFrom', filters.dateFrom.toISOString())
      }
      if (filters?.dateTo) {
        params.append('dateTo', filters.dateTo.toISOString())
      }

      const response = await fetch(`/api/user/applications?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch applications')
      }
      
      const data = await response.json()
      return data.applications || []
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

// Hook for fetching single application details
export function useApplication(applicationId: string) {
  return useQuery({
    queryKey: ['application', applicationId],
    queryFn: async (): Promise<JobApplication> => {
      const response = await fetch(`/api/applications/${applicationId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch application')
      }
      
      const data = await response.json()
      return data.application
    },
    enabled: !!applicationId,
  })
}

// Hook for fetching applications for a specific job (for job posters)
export function useJobApplications(jobId: string, filters?: ApplicationFilters) {
  return useQuery({
    queryKey: ['job-applications', jobId, filters],
    queryFn: async (): Promise<JobApplication[]> => {
      const params = new URLSearchParams()
      
      if (filters?.status?.length) {
        params.append('status', filters.status.join(','))
      }
      if (filters?.search) {
        params.append('search', filters.search)
      }

      const response = await fetch(`/api/jobs/${jobId}/applications?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch job applications')
      }
      
      const data = await response.json()
      return data.applications || []
    },
    enabled: !!jobId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}

// Hook for applying to a job
export function useApplyToJob() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ jobId, data }: { jobId: string; data: CreateApplicationRequest }) => {
      const response = await fetch(`/api/jobs/${jobId}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        
        // Handle specific error cases
        if (response.status === 409 || error.error?.includes('already applied')) {
          throw new Error('You have already applied for this job. You can check your application status in your dashboard.')
        }
        
        throw new Error(error.error || 'Failed to apply to job')
      }

      return response.json()
    },
    onSuccess: (data, variables) => {
      toast.success('Application submitted successfully!')
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      queryClient.invalidateQueries({ queryKey: ['job-applications', variables.jobId] })
      queryClient.invalidateQueries({ queryKey: ['user-applied-jobs'] }) // For applied badge update
      queryClient.invalidateQueries({ queryKey: ['user'] }) // For connections update
    },
    onError: (error: Error) => {
      if (error.message === 'ALREADY_APPLIED') {
        toast.error('You have already applied for this job. You can view your application status in your dashboard.')
      } else {
        toast.error(error.message || 'Failed to submit application')
      }
    },
  })
}

// Hook for updating application status/notes (for job posters)
export function useUpdateApplication() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ applicationId, data }: { applicationId: string; data: UpdateApplicationRequest }) => {
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update application')
      }

      return response.json()
    },
    onSuccess: (data, variables) => {
      toast.success('Application updated successfully!')
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['application', variables.applicationId] })
      queryClient.invalidateQueries({ queryKey: ['job-applications'] })
      queryClient.invalidateQueries({ queryKey: ['applications'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update application')
    },
  })
}

// Hook for withdrawing application (for applicants)
export function useWithdrawApplication() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (applicationId: string) => {
      const response = await fetch(`/api/applications/${applicationId}/withdraw`, {
        method: 'PATCH',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to withdraw application')
      }

      return response.json()
    },
    onSuccess: (data, applicationId) => {
      toast.success('Application withdrawn successfully!')
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['application', applicationId] })
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      queryClient.invalidateQueries({ queryKey: ['job-applications'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to withdraw application')
    },
  })
}

// Hook for shortlist management
export function useShortlist(jobId: string) {
  return useQuery({
    queryKey: ['shortlist', jobId],
    queryFn: async (): Promise<JobApplication[]> => {
      const response = await fetch(`/api/jobs/${jobId}/shortlist`)
      if (!response.ok) {
        throw new Error('Failed to fetch shortlist')
      }
      
      const data = await response.json()
      return data.applications || []
    },
    enabled: !!jobId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}

// Hook for adding applications to shortlist
export function useAddToShortlist() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ 
      jobId, 
      applicationIds, 
      clientNotes 
    }: { 
      jobId: string
      applicationIds: string[]
      clientNotes?: string 
    }) => {
      const response = await fetch(`/api/jobs/${jobId}/shortlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ applicationIds, clientNotes }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to add to shortlist')
      }

      return response.json()
    },
    onSuccess: (data, variables) => {
      toast.success(`Successfully shortlisted ${data.updated} applications`)
      
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: ['shortlist', variables.jobId] })
      queryClient.invalidateQueries({ queryKey: ['job-applications', variables.jobId] })
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

// Hook for removing application from shortlist
export function useRemoveFromShortlist() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ jobId, applicationId }: { jobId: string; applicationId: string }) => {
      const response = await fetch(`/api/jobs/${jobId}/shortlist/${applicationId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to remove from shortlist')
      }

      return response.json()
    },
    onSuccess: (data, variables) => {
      toast.success('Application removed from shortlist')
      
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: ['shortlist', variables.jobId] })
      queryClient.invalidateQueries({ queryKey: ['job-applications', variables.jobId] })
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

// Hook for bulk application operations
export function useBulkApplicationActions() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ 
      jobId, 
      applicationIds, 
      action, 
      status, 
      feedback, 
      clientNotes 
    }: { 
      jobId: string
      applicationIds: string[]
      action: 'review' | 'shortlist' | 'reject' | 'move_to_reviewed'
      status?: ApplicationStatus
      feedback?: string
      clientNotes?: string
    }) => {
      const response = await fetch(`/api/jobs/${jobId}/applications/bulk`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          applicationIds, 
          action, 
          status, 
          feedback, 
          clientNotes 
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to perform bulk action')
      }

      return response.json()
    },
    onSuccess: (data, variables) => {
      toast.success(data.message || `Successfully updated ${data.updated} applications`)
      
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: ['job-applications', variables.jobId] })
      queryClient.invalidateQueries({ queryKey: ['shortlist', variables.jobId] })
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

// Hook for job assignment
export function useAssignJob() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ 
      jobId, 
      selectedApplicationId, 
      startDate, 
      agreedSalary, 
      notes 
    }: { 
      jobId: string
      selectedApplicationId: string
      startDate?: string
      agreedSalary?: number
      notes?: string
    }) => {
      const response = await fetch(`/api/jobs/${jobId}/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          selectedApplicationId, 
          startDate, 
          agreedSalary, 
          notes 
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to assign job')
      }

      return response.json()
    },
    onSuccess: (data, variables) => {
      toast.success('Job successfully assigned!')
      
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: ['job-applications', variables.jobId] })
      queryClient.invalidateQueries({ queryKey: ['shortlist', variables.jobId] })
      queryClient.invalidateQueries({ queryKey: ['job-assignment', variables.jobId] })
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

// Hook for fetching job assignment
export function useJobAssignment(jobId: string) {
  return useQuery({
    queryKey: ['job-assignment', jobId],
    queryFn: async () => {
      const response = await fetch(`/api/jobs/${jobId}/assign`)
      if (!response.ok) {
        if (response.status === 404) {
          return null // No assignment yet
        }
        throw new Error('Failed to fetch job assignment')
      }
      
      const data = await response.json()
      return data.assignment
    },
    enabled: !!jobId,
  })
}

// Hook for updating assignment (contract status, etc.)
export function useUpdateAssignment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ 
      assignmentId, 
      contractStatus, 
      startDate, 
      agreedSalary, 
      notes 
    }: { 
      assignmentId: string
      contractStatus?: string
      startDate?: string
      agreedSalary?: number
      notes?: string
    }) => {
      const response = await fetch(`/api/assignments/${assignmentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          contractStatus, 
          startDate, 
          agreedSalary, 
          notes 
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update assignment')
      }

      return response.json()
    },
    onSuccess: (data) => {
      toast.success('Assignment updated successfully')
      
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: ['assignment', data.assignment.id] })
      queryClient.invalidateQueries({ queryKey: ['job-assignment', data.assignment.jobId] })
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

// Hook for fetching applicant count for a job
export function useJobApplicantCount(jobId: string) {
  return useQuery({
    queryKey: ['job-applicant-count', jobId],
    queryFn: async (): Promise<number> => {
      const response = await fetch(`/api/jobs/${jobId}/applications/count`)
      if (!response.ok) {
        // If unauthorized or forbidden, return 0 instead of throwing
        if (response.status === 401 || response.status === 403) {
          return 0
        }
        throw new Error('Failed to fetch applicant count')
      }
      
      const data = await response.json()
      return data.count || 0
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    enabled: !!jobId,
    retry: false, // Don't retry on auth errors
  })
}

// Hook for fetching applicant counts for multiple jobs
export function useMultipleJobApplicantCounts(jobIds: string[]) {
  return useQuery({
    queryKey: ['multiple-job-applicant-counts', jobIds],
    queryFn: async (): Promise<Record<string, number>> => {
      if (jobIds.length === 0) return {}
      
      const response = await fetch('/api/jobs/applications/counts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ jobIds }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch applicant counts')
      }
      
      const data = await response.json()
      return data.counts || {}
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    enabled: jobIds.length > 0,
  })
}

// Hook for getting user's applied job IDs (for job listing indication)
export function useUserAppliedJobs() {
  return useQuery({
    queryKey: ['user-applied-jobs'],
    queryFn: async (): Promise<Set<string>> => {
      const response = await fetch('/api/user/applications')
      if (!response.ok) {
        if (response.status === 401) {
          // User not authenticated, return empty set
          return new Set()
        }
        throw new Error('Failed to fetch user applications')
      }
      
      const data = await response.json()
      const applications: JobApplication[] = data.applications || []
      
      // Return a Set of job IDs for quick lookup
      return new Set(applications.map(app => app.jobId))
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    retry: false, // Don't retry on auth errors
  })
}

// Helper function to get application status badge props
export function getApplicationStatusProps(status: ApplicationStatus) {
  const statusConfig = {
    [ApplicationStatus.PENDING]: {
      variant: 'secondary' as const,
      className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
      label: 'Pending'
    },
    [ApplicationStatus.REVIEWED]: {
      variant: 'secondary' as const,
      className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
      label: 'Reviewed'
    },
    [ApplicationStatus.SHORTLISTED]: {
      variant: 'secondary' as const,
      className: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
      label: 'Shortlisted'
    },
    [ApplicationStatus.SELECTED]: {
      variant: 'default' as const,
      className: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
      label: 'Selected'
    },
    [ApplicationStatus.REJECTED]: {
      variant: 'destructive' as const,
      className: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
      label: 'Rejected'
    },
    [ApplicationStatus.WITHDRAWN]: {
      variant: 'outline' as const,
      className: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300',
      label: 'Withdrawn'
    }
  }

  return statusConfig[status] || statusConfig[ApplicationStatus.PENDING]
}
