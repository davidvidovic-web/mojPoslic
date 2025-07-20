'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { ArrowLeft, Briefcase } from "lucide-react"
import { Job } from "@/types/job"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import { JobHeader } from "@/components/jobs/job/job-header"
import { JobContent } from "@/components/jobs/job/job-content"
import { JobLocation } from "@/components/jobs/job/job-location"
import { JobTimeline } from "@/components/jobs/job/job-timeline"
import { JobApplicationSidebar } from "@/components/jobs/job/job-application-sidebar"
import { JobDetailsSidebar } from "@/components/jobs/job/job-details-sidebar"
import { JobApplicationForm } from "@/components/jobs/job-application-form"
import { useUserAppliedJobs } from "@/hooks/use-applications"
import { useTranslations } from 'next-intl'

export default function JobDetailPage() {
  const t = useTranslations()
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [showApplicationForm, setShowApplicationForm] = useState(false)
  
  // Check if user has already applied to this job
  const { data: appliedJobIds = new Set(), refetch: refetchAppliedJobs } = useUserAppliedJobs(!!user)
  const hasApplied = job ? appliedJobIds.has(job.id) : false
  const isOwner = !!(user && job && job.postedBy?.id === user.id)

  useEffect(() => {
    const fetchJob = async (jobId: string) => {
      try {
        setLoading(true)
        const response = await fetch(`/api/jobs/${jobId}`)
        
        if (!response.ok) {
          const errorData = await response.json()
          console.error('Error fetching job:', errorData)
          toast.error(t('jobs.errors.jobNotFound'))
          router.push('/')
          return
        }

        const job = await response.json()
        setJob(job)

        // Track job view after successfully loading the job
        try {
          await fetch(`/api/jobs/${jobId}/view`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          })
        } catch {
          // Silently fail view tracking - it's not critical
        }
      } catch (error) {
        console.error('Error fetching job:', error)
        toast.error(t('jobs.errors.loadFailed'))
        router.push('/')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchJob(params.id as string)
    }
  }, [params.id, router, t])

  const handleApply = async () => {
    // Check if user is logged in
    if (!user) {
      // Redirect to login with return URL
      const returnUrl = `/jobs/${params.id}`
      router.push(`/login?returnUrl=${encodeURIComponent(returnUrl)}`)
      return
    }

    if (!job) return

    // Check if user is the owner of this job
    if (isOwner) {
      toast.error(t('jobs.errors.cannotApplyToOwnJob'))
      return
    }

    // Check if user has already applied
    if (hasApplied) {
      toast.error(t('jobs.errors.alreadyApplied'))
      return
    }

    // For jobs with external application URLs, open in new tab
    if (job.application_url) {
      window.open(job.application_url, '_blank')
      toast.success(t('jobs.messages.applicationPageOpened'))
      return
    } 

    // Use new application system for all other jobs (default behavior)
    setShowApplicationForm(true)
  }

  const handleApplicationSuccess = () => {
    setShowApplicationForm(false)
    // Refresh the applied jobs data to show the badge immediately
    refetchAppliedJobs()
    // Note: Toast notification is already handled by the useApplyToJob hook
    // to avoid duplicate success messages
  }

  const handleApplicationCancel = () => {
    setShowApplicationForm(false)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffInDays === 0) return t('common.time.today')
    if (diffInDays === 1) return t('common.time.yesterday')
    if (diffInDays < 7) return t('common.time.daysAgo', { count: diffInDays })
    return date.toLocaleDateString()
  }

  const formatSalary = (job: Job) => {
    // If we have structured salary data
    if (job.salaryMin && job.salaryMax && job.salaryType) {
      const min = job.salaryMin.toLocaleString()
      const max = job.salaryMax.toLocaleString()
      const type = job.salaryType === 'hourly' ? t('jobCard.hourly') : 
                   job.salaryType === 'daily' ? t('jobCard.daily') :
                   job.salaryType === 'weekly' ? t('jobCard.weekly') :
                   job.salaryType === 'monthly' ? t('jobCard.monthly') : ''
      return `${min} - ${max} BAM${type}`
    }
    
    // If we only have minimum salary
    if (job.salaryMin && job.salaryType) {
      const min = job.salaryMin.toLocaleString()
      const type = job.salaryType === 'hourly' ? t('jobCard.hourly') : 
                   job.salaryType === 'daily' ? t('jobCard.daily') :
                   job.salaryType === 'weekly' ? t('jobCard.weekly') :
                   job.salaryType === 'monthly' ? t('jobCard.monthly') : ''
      
      // Don't show "From" for fixed prices
      if (job.salaryType === 'fixed') {
        return `${min} BAM`
      }
      
      return `${t('jobCard.from')} ${min} BAM${type}`
    }
    
    // Fallback to legacy salary field
    return job.salary || null
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">{t('jobs.messages.loadingJobDetails')}</p>
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">{t('jobs.errors.jobNotFound')}</p>
          <Button onClick={() => router.push('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('jobs.actions.backToJobs')}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => router.back()}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('common.buttons.back')}
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Header */}
            <JobHeader job={job} formatDate={formatDate} formatSalary={formatSalary} />

            {/* Job Content */}
            <JobContent job={job} />

            {/* Job Location - hide full location for now */}
            <JobLocation job={job} showFullLocation={false} />

            {/* Job Timeline */}
            <JobTimeline job={job} formatDate={formatDate} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <JobApplicationSidebar 
              job={job} 
              user={user} 
              handleApply={handleApply}
              showAboutSection={job.postedBy?.role === 'company'}
              hasApplied={hasApplied}
              isOwner={isOwner}
            />
            <JobDetailsSidebar 
              job={job} 
              formatDate={formatDate} 
              formatSalary={formatSalary} 
              showAddress={false}
            />
          </div>
        </div>

        {/* Application Form Modal/Overlay */}
        {showApplicationForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="p-6">
                <JobApplicationForm
                  jobId={job.id}
                  jobTitle={job.title}
                  onSuccess={handleApplicationSuccess}
                  onCancel={handleApplicationCancel}
                />
              </div>
            </div>
          </div>
        )}
    </div>
  )
}
