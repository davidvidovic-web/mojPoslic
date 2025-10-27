// Legacy compatibility layer - redirects to new Supabase-based hooks
// This file maintains backward compatibility while we migrate components

import { 
  useApplicationsQuery,
  useApplicationQuery,
  useUserApplicationsQuery,
  useUserAppliedJobsQuery,
  useCreateApplicationMutation,
  useUpdateApplicationMutation,
  type ApplicationFilters
} from './queries/useJobs'

// Re-export the new hooks with legacy names for backward compatibility
export const useApplications = useApplicationsQuery
export const useApplication = useApplicationQuery
export const useUserApplications = useUserApplicationsQuery
export const useUserAppliedJobs = useUserAppliedJobsQuery
export const useApplyToJob = useCreateApplicationMutation
export const useUpdateApplication = useUpdateApplicationMutation

// Re-export types
export type { ApplicationFilters }

// Legacy types for compatibility (these should be migrated to Supabase types)
export interface JobApplication {
  id: string
  job_id: string
  user_id: string
  cover_letter?: string
  status: 'PENDING' | 'REVIEWED' | 'SHORTLISTED' | 'SELECTED' | 'REJECTED' | 'WITHDRAWN'
  applied_at: string
  updated_at?: string
  // Related data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  job?: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user?: any
}

export interface CreateApplicationRequest {
  message: string
}

export interface UpdateApplicationRequest {
  status?: string
  client_notes?: string
}

export type ApplicationStatus = 'PENDING' | 'REVIEWED' | 'SHORTLISTED' | 'SELECTED' | 'REJECTED' | 'WITHDRAWN'
