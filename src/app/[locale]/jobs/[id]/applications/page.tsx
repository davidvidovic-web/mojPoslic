'use client'

import { useEffect, useState } from 'react'
import { useSupabaseAuth } from '@/contexts/supabase-auth-context'
import { ApplicationStatus } from '@/types/application'
import ApplicationManager from '@/components/dashboard/application-manager'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft, Briefcase } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'

interface JobDetails {
  id: string
  title: string
  company: string
  status: string
  type: string
  description: string
  salary?: string
  createdAt: string
}

interface JobApplication {
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
  user: {
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
}

interface ApplicationsData {
  jobId: string
  applicationCount: number
  canEdit: boolean
  applications: JobApplication[]
}

interface ManageApplicationsPageProps {
  params: Promise<{ id: string }>
}

export default function ManageApplicationsPage({ params }: ManageApplicationsPageProps) {
  const { user } = useSupabaseAuth()
  const router = useRouter()
  const t = useTranslations()
  const [jobId, setJobId] = useState<string | null>(null)
  const [jobDetails, setJobDetails] = useState<JobDetails | null>(null)
  const [applicationsData, setApplicationsData] = useState<ApplicationsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const getJobId = async () => {
      const resolvedParams = await params
      setJobId(resolvedParams.id)
    }
    getJobId()
  }, [params])

  useEffect(() => {
    const fetchJobAndApplications = async () => {
      if (!jobId || !user) return

      try {
        setLoading(true)
        setError(null)

        // Fetch job details and applications in parallel
        const [jobResponse, applicationsResponse] = await Promise.all([
          fetch(`/api/jobs/${jobId}`),
          fetch(`/api/jobs/${jobId}/applications`)
        ])

        if (!jobResponse.ok) {
          if (jobResponse.status === 404) {
            setError(t('jobs.applications.error.jobNotFound'))
          } else if (jobResponse.status === 403) {
            setError(t('jobs.applications.error.noPermissionToViewJob'))
          } else {
            setError(t('jobs.applications.error.failedToLoadJobDetails'))
          }
          return
        }

        if (!applicationsResponse.ok) {
          if (applicationsResponse.status === 404) {
            setError(t('jobs.applications.error.applicationsNotFound'))
          } else if (applicationsResponse.status === 403) {
            setError(t('jobs.applications.error.noPermissionToViewApplications'))
          } else {
            setError(t('jobs.applications.error.failedToLoadApplications'))
          }
          return
        }

        const job = await jobResponse.json()
        const applications = await applicationsResponse.json()

        setJobDetails(job)
        setApplicationsData(applications)

      } catch (error) {
        console.error('Error fetching data:', error)
        setError(t('jobs.applications.error.generic'))
      } finally {
        setLoading(false)
      }
    }

    fetchJobAndApplications()
  }, [jobId, user, t])

  const handleApplicationUpdate = async (applicationId: string, newStatus: string) => {
    // Optimistically update the local state
    setApplicationsData(prev => {
      if (!prev) return prev
      return {
        ...prev,
        applications: prev.applications.map(app =>
          app.id === applicationId ? { ...app, status: newStatus as JobApplication['status'] } : app
        )
      }
    })

    // Refetch data to ensure consistency
    refreshApplications()
  }

  const handleBulkStatusUpdate = async (applicationIds: string[], status: ApplicationStatus) => {
    // Optimistically update the local state
    setApplicationsData(prev => {
      if (!prev) return prev
      return {
        ...prev,
        applications: prev.applications.map(app =>
          applicationIds.includes(app.id) ? { ...app, status } : app
        )
      }
    })

    // Here you would typically make an API call to update the applications
    // For now, we'll just refetch to ensure consistency
    refreshApplications()
  }

  const refreshApplications = async () => {
    if (!jobId) return
    
    try {
      const response = await fetch(`/api/jobs/${jobId}/applications`)
      
      if (response.ok) {
        const data = await response.json()
        setApplicationsData(data)
      } else {
        console.error('Refresh API failed with status:', response.status)
      }
    } catch (error) {
      console.error('Error refreshing applications:', error)
    }
  }

  const getStatusStats = () => {
    if (!applicationsData) return null

    const stats = {
      total: applicationsData.applications.length,
      pending: applicationsData.applications.filter(app => app.status === 'PENDING').length,
      reviewed: applicationsData.applications.filter(app => app.status === 'REVIEWED').length,
      shortlisted: applicationsData.applications.filter(app => app.status === 'SHORTLISTED').length,
      selected: applicationsData.applications.filter(app => app.status === 'SELECTED').length,
      rejected: applicationsData.applications.filter(app => app.status === 'REJECTED').length
    }

    return stats
  }

  if (!user || (user.role !== 'client' && user.role !== 'company' && user.role !== 'admin')) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('jobs.applications.accessDenied.title')}</h1>
          <p className="text-gray-600 mb-4">{t('jobs.applications.accessDenied.message')}</p>
          <Link href="/dashboard">
            <Button>{t('jobs.applications.accessDenied.buttonText')}</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-4 w-20" />
                </CardContent>
              </Card>
            ))}
          </div>
          
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="h-8 w-20" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('jobs.applications.error.title')}</h1>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="space-x-2">
              <Button onClick={() => router.back()} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('jobs.applications.error.goBack')}
              </Button>
              <Link href="/dashboard">
                <Button>{t('jobs.applications.error.goToDashboard')}</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!jobDetails || !applicationsData) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('jobs.applications.noData.title')}</h1>
            <p className="text-gray-600 mb-4">{t('jobs.applications.noData.message')}</p>
            <Link href="/dashboard">
              <Button>{t('jobs.applications.noData.buttonText')}</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const stats = getStatusStats()

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('jobs.applications.header.back')}
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{jobDetails.title}</h1>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline">{jobDetails.type}</Badge>
                <Badge variant={jobDetails.status === 'active' ? 'default' : 'secondary'}>
                  {jobDetails.status}
                </Badge>
                {jobDetails.salary && (
                  <Badge variant="outline">{jobDetails.salary}</Badge>
                )}
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-sm text-gray-600">{t('jobs.applications.header.jobId')}: {jobDetails.id}</p>
            <p className="text-sm text-gray-600">
              {t('jobs.applications.header.posted')}{' '}
              {new Date(jobDetails.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                <div className="text-sm text-gray-600">{t('jobs.applications.stats.total')}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                <div className="text-sm text-gray-600">{t('jobs.applications.stats.pending')}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.reviewed}</div>
                <div className="text-sm text-gray-600">{t('jobs.applications.stats.reviewed')}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.shortlisted}</div>
                <div className="text-sm text-gray-600">{t('jobs.applications.stats.shortlisted')}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{stats.selected}</div>
                <div className="text-sm text-gray-600">{t('jobs.applications.stats.selected')}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
                <div className="text-sm text-gray-600">{t('jobs.applications.stats.rejected')}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Applications Manager */}
        {jobId && jobDetails && applicationsData && (
          <ApplicationManager
            jobTitle={jobDetails.title}
            applications={applicationsData.applications.map(app => ({
              ...app,
              appliedAt: app.appliedAt || app.createdAt,
              status: app.status as ApplicationStatus
            }))}
            onApplicationUpdate={(applicationId: string, status: ApplicationStatus) => 
              handleApplicationUpdate(applicationId, status)
            }
            onBulkStatusUpdate={handleBulkStatusUpdate}
          />
        )}
      </div>
    </div>
  )
}
