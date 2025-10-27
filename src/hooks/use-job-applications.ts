import { useState } from 'react'
import { toast } from 'sonner'
import { useDashboardTranslations } from './use-translations'

export interface ApplicationUser {
  id: string
  name: string
  email: string
  avatarUrl?: string
  phone?: string
  location?: string
  bio?: string
  skills?: string
  experience?: string
  position?: string
  website?: string
  createdAt: string
  reviewsReceived?: { rating: number }[]
}

export interface JobApplication {
  id: string
  status: 'PENDING' | 'REVIEWED' | 'SHORTLISTED' | 'SELECTED' | 'REJECTED' | 'WITHDRAWN'
  message?: string
  resume?: string
  clientNotes?: string
  feedback?: string
  appliedAt?: string
  reviewedAt?: string
  shortlistedAt?: string
  selectedAt?: string
  rejectedAt?: string
  withdrawnAt?: string
  createdAt: string
  updatedAt: string
  user: ApplicationUser
}

export interface ApplicationsResponse {
  jobId: string
  applicationCount: number
  canEdit: boolean
  applications: JobApplication[]
}

export function useJobApplications(jobId: string) {
  const t = useDashboardTranslations()
  const [applications, setApplications] = useState<JobApplication[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchApplications = async () => {
    if (!jobId) return

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/jobs/${jobId}/applications`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch applications: ${response.statusText}`)
      }

      const data: ApplicationsResponse = await response.json()
      setApplications(data.applications)
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch applications'
      setError(errorMessage)
      toast.error(t('toast.applicationUpdateFailed'))
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateApplicationStatus = async (
    applicationId: string, 
    action: string,
    options?: { feedback?: string; clientNotes?: string }
  ) => {
    try {
      const response = await fetch(`/api/jobs/${jobId}/applications/${applicationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action,
          feedback: options?.feedback,
          clientNotes: options?.clientNotes
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to update application: ${response.statusText}`)
      }

      const data = await response.json()
      
      // Update local state
      setApplications(prev => 
        prev.map(app => 
          app.id === applicationId ? { ...app, ...data.application } : app
        )
      )

      toast.success(t('toast.applicationUpdated'))
      return data.application
    } catch (err) {
      toast.error(t('toast.applicationUpdateFailed'))
      throw err
    }
  }

  const bulkUpdateApplications = async (
    applicationIds: string[],
    action: string,
    options?: { feedback?: string; clientNotes?: string }
  ) => {
    try {
      const response = await fetch(`/api/jobs/${jobId}/applications/bulk`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationIds,
          action,
          feedback: options?.feedback,
          clientNotes: options?.clientNotes
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to update applications: ${response.statusText}`)
      }

      const data = await response.json()
      
      // Update local state
      setApplications(prev => 
        prev.map(app => {
          const updatedApp = data.applications.find((updated: JobApplication) => updated.id === app.id)
          return updatedApp || app
        })
      )

      toast.success(t('toast.applicationsUpdated', { count: data.updated }))
      return data
    } catch (err) {
      toast.error(t('toast.applicationsUpdateFailed'))
      throw err
    }
  }

  const shortlistApplications = async (applicationIds: string[]) => {
    return bulkUpdateApplications(applicationIds, 'shortlist')
  }

  const rejectApplications = async (applicationIds: string[], feedback?: string) => {
    return bulkUpdateApplications(applicationIds, 'reject', { feedback })
  }

  const reviewApplications = async (applicationIds: string[]) => {
    return bulkUpdateApplications(applicationIds, 'move_to_reviewed')
  }

  const selectApplication = async (applicationId: string) => {
    return updateApplicationStatus(applicationId, 'SELECT')
  }

  const rejectApplication = async (applicationId: string, feedback?: string) => {
    return updateApplicationStatus(applicationId, 'REJECT', { feedback })
  }

  const shortlistApplication = async (applicationId: string) => {
    return updateApplicationStatus(applicationId, 'SHORTLIST')
  }

  const reviewApplication = async (applicationId: string) => {
    return updateApplicationStatus(applicationId, 'REVIEW')
  }

  return {
    applications,
    loading,
    error,
    fetchApplications,
    updateApplicationStatus,
    bulkUpdateApplications,
    shortlistApplications,
    rejectApplications,
    reviewApplications,
    selectApplication,
    rejectApplication,
    shortlistApplication,
    reviewApplication
  }
}

export function useApplicationsStats(applications: JobApplication[]) {
  const stats = {
    total: applications.length,
    pending: applications.filter(app => app.status === 'PENDING').length,
    reviewed: applications.filter(app => app.status === 'REVIEWED').length,
    shortlisted: applications.filter(app => app.status === 'SHORTLISTED').length,
    selected: applications.filter(app => app.status === 'SELECTED').length,
    rejected: applications.filter(app => app.status === 'REJECTED').length,
    withdrawn: applications.filter(app => app.status === 'WITHDRAWN').length
  }

  const conversionRate = stats.total > 0 ? (stats.selected / stats.total) * 100 : 0
  const shortlistRate = stats.total > 0 ? (stats.shortlisted / stats.total) * 100 : 0
  const reviewRate = stats.total > 0 ? ((stats.reviewed + stats.shortlisted + stats.selected) / stats.total) * 100 : 0

  return {
    ...stats,
    conversionRate: Math.round(conversionRate * 10) / 10,
    shortlistRate: Math.round(shortlistRate * 10) / 10,
    reviewRate: Math.round(reviewRate * 10) / 10
  }
}
