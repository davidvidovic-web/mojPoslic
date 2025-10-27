'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Briefcase, MapPin, Calendar, Banknote, Tag, Clock, Mail, Phone, Car, ParkingCircle, Bus, AlertCircle, Timer, CalendarDays, MapPinned, Award }
 from "lucide-react"
import { Job } from "@/types/job"
import { toast } from "sonner"
import { JobApplicationForm } from "@/components/jobs/job-application-form"
import { GoogleJobLocationMap } from "@/components/jobs/google-job-location-map"
import { useUserAppliedJobs } from "@/hooks/use-applications"
import { useTranslations, useLocale } from 'next-intl'
import { formatJobType, getJobExpirationDate } from "@/lib/job-utils"
import { formatRelativeDate, formatDate as formatDateUtil } from '@/lib/date-format'
import { useSupabaseAuth } from "@/contexts/supabase-auth-context"
import { useData } from "@/hooks/use-data"
import { ReviewScore } from '@/components/reviews/review-score'

interface JobDetailsProps {
  jobId: string
}

export function JobDetails({ jobId }: JobDetailsProps) {
  const t = useTranslations()
  const locale = useLocale() as 'bs' | 'en'
  const router = useRouter()
  const { user, loading: authLoading } = useSupabaseAuth()
  const { getCategoryByKey } = useData()
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [showApplicationForm, setShowApplicationForm] = useState(false)
  const viewTrackedRef = useRef(false) // Prevent double view tracking
  
  // Check if user has already applied to this job (only if authenticated)
  const { data: appliedJobIds = new Set(), refetch: refetchAppliedJobs } = useUserAppliedJobs(user?.id || '')
  const hasApplied = job && user ? appliedJobIds.has(job.id) : false
  const isOwner = !!(user && job && job.postedBy?.id === user.id)

  // Redirect non-logged-in users to login page
  useEffect(() => {
    if (!authLoading && !user) {
      const returnUrl = `/jobs/${jobId}`
      router.push(`/auth/signin?returnUrl=${encodeURIComponent(returnUrl)}`)
      return
    }
  }, [user, authLoading, jobId, router])

  useEffect(() => {
    // Don't fetch job if user is not authenticated
    if (!user || authLoading) return
    
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
        
        // Check if this device has already viewed this job today
        const hasViewedToday = () => {
          const viewKey = `job_view_${jobId}_${new Date().toDateString()}`
          return localStorage.getItem(viewKey) === 'true'
        }

        // Mark this device as having viewed this job today
        const markAsViewed = () => {
          const viewKey = `job_view_${jobId}_${new Date().toDateString()}`
          localStorage.setItem(viewKey, 'true')
        }
        
        // Increment view count only if not already viewed today and not already tracked in this session
        if (!hasViewedToday() && !viewTrackedRef.current) {
          viewTrackedRef.current = true
          markAsViewed()
          
          fetch(`/api/jobs/${jobId}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              action: 'increment_view'
            })
          }).catch(error => {
            console.error('Failed to increment view count:', error)
          })
        }
      } catch (error) {
        console.error('Error fetching job:', error)
        toast.error(t('jobs.errors.loadFailed'))
        router.push('/')
      } finally {
        setLoading(false)
      }
    }
    if (jobId) {
      fetchJob(jobId)
    }
  }, [jobId, router, t, user, authLoading])

  const handleApply = async () => {
    if (!job) return
    
    // Check if user is a client
    if (user?.role === 'client') {
      toast.error(t('jobs.errors.clientCannotApply'))
      return
    }
    
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

  const handleGoBack = () => {
    // Check if this page was opened in a new tab/window (no history)
    if (window.history.length <= 1) {
      // No browser history, navigate to appropriate dashboard
      if (user?.user_metadata?.role === 'tasker') {
        router.push('/dashboard/tasker')
      } else if (user?.user_metadata?.role === 'client') {
        router.push('/dashboard/client')
      } else {
        router.push('/')
      }
    } else {
      // Check if user came from within our app
      const referrer = document.referrer
      if (referrer && referrer.includes(window.location.origin)) {
        router.back()
      } else {
        // External referrer, navigate to appropriate dashboard
        if (user?.user_metadata?.role === 'tasker') {
          router.push('/dashboard/tasker')
        } else if (user?.user_metadata?.role === 'client') {
          router.push('/dashboard/client')
        } else {
          router.push('/')
        }
      }
    }
  }

  const formatDate = (dateString: string) => {
    return formatRelativeDate(dateString, locale)
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

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('common.status.loading')}</p>
        </div>
      </div>
    )
  }

  // Don't render anything if user is not authenticated (redirect will happen)
  if (!user) {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
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
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Back Button */}
      <Button 
        variant="ghost" 
        onClick={handleGoBack}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        {t('common.buttons.back')}
      </Button>
      
      {/* Job Header */}
      <div className="mb-8 pb-6 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-foreground mb-3 leading-tight">{job.title}</h1>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-[calc(var(--radius)*1.5)] bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <span className="text-lg font-bold text-gray-700 dark:text-gray-300">
                  {job.company ? job.company.charAt(0).toUpperCase() : 'U'}
                </span>
              </div>
              <div>
                <p className="text-xl font-semibold text-foreground">
                  {job.company || job.postedBy?.name || 'Individual'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {job.posted_at ? formatDate(job.posted_at) : ''}
                </p>
                {/* Client Review Score */}
                {job.postedBy?.id && (
                  <div className="mt-1">
                    <ReviewScore userId={job.postedBy.id} size="sm" showCount={true} />
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="outline" className="px-3 py-1 rounded-[var(--radius)] border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                {formatJobType(job.type, locale)}
              </Badge>
              {job.is_featured && (
                <Badge className="bg-black dark:bg-white text-white dark:text-black px-3 py-1 rounded-[var(--radius)] border-0">
                  {t('jobs.card.featured')}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-4">
            {hasApplied && (
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-[var(--radius)]">
                <div className="w-2 h-2 bg-gray-700 dark:bg-gray-300 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('jobs.form.labels.applied')}
                </span>
              </div>
            )}
            {!isOwner && !hasApplied && user?.role !== 'client' && (
              <Button onClick={handleApply} size="default" className="rounded-[var(--radius)]">
                {job.application_url ? t('jobs.form.labels.applyExternally') : t('jobs.form.labels.applyNow')}
              </Button>
            )}
            {isOwner && (
              <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-[var(--radius)]">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('jobs.form.labels.yourJob')}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Job Meta Information */}
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-900/50 rounded-[var(--radius)]">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">{job.city?.name || t('common.jobTypes.remote')}</span>
          </div>
          
          {job.category && (
            <div className="flex items-center gap-2 px-4 py-2 bg-black dark:bg-white rounded-[var(--radius)]">
              <Tag className="h-4 w-4 text-white dark:text-black" />
              <span className="text-sm font-medium text-white dark:text-black">
                {locale === 'bs' ? job.category.name_bs || job.category.name : job.category.name_en || job.category.name}
              </span>
            </div>
          )}
          
          {job.subcategory_id && (() => {
            const subcategory = getCategoryByKey(job.subcategory_id);
            return subcategory ? (
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-900 rounded-[var(--radius)]">
                <Tag className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {locale === 'bs' ? subcategory.name_bs || subcategory.name : subcategory.name_en || subcategory.name}
                </span>
              </div>
            ) : null;
          })()}
          
          {formatSalary(job) && (
            <div className="flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-950/30 rounded-[var(--radius)]">
              <Banknote className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-700 dark:text-green-400">{formatSalary(job)}</span>
            </div>
          )}
        </div>
      </div>
      {/* Job Content */}
      <div className="space-y-8">
        {/* Description */}
        <section>
          <h2 className="text-2xl font-bold mb-4 text-foreground">
            {t('jobs.content.jobDescription')}
          </h2>
          <div 
            className="prose max-w-none text-foreground prose-headings:text-foreground prose-p:text-muted-foreground prose-li:text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: job.description }}
          />
        </section>
        {/* Requirements */}
        {job.requirements && (
          <section>
            <h2 className="text-2xl font-bold mb-4 text-foreground">
              {t('jobs.content.requirements')}
            </h2>
            <div 
              className="prose max-w-none text-foreground prose-headings:text-foreground prose-p:text-muted-foreground prose-li:text-muted-foreground"
              dangerouslySetInnerHTML={{ __html: job.requirements }}
            />
          </section>
        )}

        {/* Benefits */}
        {job.benefits && (
          <section>
            <h2 className="text-2xl font-bold mb-4 text-foreground">
              {t('jobs.content.benefits')}
            </h2>
            <div 
              className="prose max-w-none text-foreground prose-headings:text-foreground prose-p:text-muted-foreground prose-li:text-muted-foreground"
              dangerouslySetInnerHTML={{ __html: job.benefits }}
            />
          </section>
        )}

        {/* Skills & Tags */}
        {job.tags && job.tags.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-4 text-foreground">{t('jobs.content.skillsAndTechnologies')}</h2>
            <div className="flex flex-wrap gap-2">
              {job.tags.map((tag, index) => (
                <Badge key={index} className="px-3 py-1 rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent text-gray-700 dark:text-gray-300 text-sm">
                  {tag}
                </Badge>
              ))}
            </div>
          </section>
        )}

        {/* Compensation Details */}
        {(formatSalary(job) || (job as any).performance_bonus !== undefined || user) && (
          <section>
            <h2 className="text-2xl font-bold mb-4 text-foreground">
              {t('jobs.details.compensation')}
            </h2>
            
            <div className="space-y-4">
              {(formatSalary(job) || user) && (
                <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950/30 rounded-xl">
                  <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                    <Banknote className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">{t('jobs.details.salary')}</span>
                    <p className="text-lg font-semibold text-green-700 dark:text-green-400">
                      {formatSalary(job) ? `${formatSalary(job)}` : t('common.messages.notSpecified')}
                    </p>
                  </div>
                </div>
              )}
              
              {((job as any).performance_bonus !== undefined || user) && (
                <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <Award className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">{t('jobs.form.labels.performanceBonus')}</span>
                    <p className="text-sm text-green-700 dark:text-green-400 font-medium">
                      {(job as any).performance_bonus ? t('jobs.form.labels.available') : t('jobs.form.labels.notAvailable')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}
        {/* Benefits */}
        {job.benefits && (
          <section className="bg-white dark:bg-gray-950 p-6 rounded-[calc(var(--radius)*1.5)] border border-gray-100 dark:border-gray-800">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3 text-foreground">
              <div className="w-8 h-8 rounded-[var(--radius)] bg-green-100 dark:bg-green-950/30 flex items-center justify-center">
                <Clock className="h-4 w-4 text-green-600" />
              </div>
              {t('jobs.content.benefits')}
            </h2>
            <div 
              className="prose max-w-none text-foreground prose-headings:text-foreground prose-p:text-muted-foreground prose-li:text-muted-foreground"
              dangerouslySetInnerHTML={{ __html: job.benefits }}
            />
          </section>
        )}
        {/* Skills & Tags */}
        {job.tags && job.tags.length > 0 && (
          <section className="bg-white dark:bg-gray-950 p-6 rounded-[calc(var(--radius)*1.5)] border border-gray-100 dark:border-gray-800">
            <h2 className="text-2xl font-bold mb-4 text-foreground">{t('jobs.content.skillsAndTechnologies')}</h2>
            <div className="flex flex-wrap gap-2">
              {job.tags.map((tag, index) => (
                <Badge key={index} className="px-3 py-1 rounded-xl border-0 bg-purple-100 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400 text-sm">
                  {tag}
                </Badge>
              ))}
            </div>
          </section>
        )}
        {/* Job Details */}
        <section>
          <h2 className="text-2xl font-bold mb-6 text-foreground">
            {t('jobs.details.jobDetails')}
          </h2>
          
          {/* Schedule & Timeline Group */}
          <div className="mb-8">
            <h3 className="font-semibold mb-4 text-lg text-foreground">{t('jobs.form.labels.scheduleAndTimeline')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Start Date */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">{t('jobs.form.labels.startDate')}</span>
                  {job.start_date && job.start_date !== 'negotiable' && job.start_date.trim() !== '' ? (
                    <p className="text-sm font-medium text-foreground">{formatDateUtil(job.start_date, locale, { format: 'short' })}</p>
                  ) : (
                    <p className="text-sm font-medium text-foreground">{t('jobs.form.labels.byAgreement')}</p>
                  )}
                </div>
              </div>
              
              {/* Start Time */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">{t('jobs.form.labels.startTime')}</span>
                  {job.start_time && job.start_time !== 'negotiable' && job.start_time.trim() !== '' ? (
                    <p className="text-sm font-medium text-foreground">{job.start_time}</p>
                  ) : (
                    <p className="text-sm font-medium text-foreground">{t('jobs.form.labels.byAgreement')}</p>
                  )}
                </div>
              </div>
              
              {/* Duration */}
              {(job.duration || job.duration_days || user) && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-[var(--radius)]">
                  <div className="w-8 h-8 rounded-[var(--radius)] bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <Timer className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">{t('jobs.form.labels.duration')}</span>
                    {job.duration ? (
                      <p className="text-sm font-medium text-foreground">{job.duration}</p>
                    ) : job.duration_days ? (
                      <p className="text-sm font-medium text-foreground">
                        {job.duration_days === 1 ? 
                          t('jobs.form.labels.oneDay') : 
                          t('jobs.form.labels.multipleDays', { days: job.duration_days })
                        }
                      </p>
                    ) : (
                      <p className="text-sm font-medium text-foreground">{t('common.messages.notSpecified')}</p>
                    )}
                  </div>
                </div>
              )}
              
              {/* Application Deadline */}
              {(job.application_deadline || user) && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-[var(--radius)]">
                  <div className="w-8 h-8 rounded-[var(--radius)] bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <CalendarDays className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">{t('jobs.form.labels.applicationDeadline')}</span>
                    <p className="text-sm font-medium text-foreground">
                      {job.application_deadline ? formatDate(job.application_deadline) : t('common.messages.notSpecified')}
                    </p>
                  </div>
                </div>
              )}
              
              {/* Expires */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-[var(--radius)]">
                <div className="w-8 h-8 rounded-[var(--radius)] bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">{t('jobs.form.labels.expires')}</span>
                  <p className="text-sm font-medium text-foreground">
                    {formatDate(getJobExpirationDate(job).toISOString())}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Transportation & Additional Details */}
          <div className="mb-8">
            <h3 className="font-semibold mb-4 text-lg text-foreground">{t('jobs.form.labels.transportationAndLocation')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Transportation */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-[var(--radius)]">
                  <div className="w-8 h-8 rounded-[var(--radius)] bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <Car className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">{t('jobs.form.labels.transportation')}</span>
                    <p className="text-sm font-medium text-foreground">
                      {job.transportation === 'provided' && t('jobs.form.labels.transportationProvided')}
                      {job.transportation === 'compensated' && (
                        <>
                          {t('jobs.form.labels.transportationCompensated')}
                          {job.transportation_amount && ` (${job.transportation_amount} BAM)`}
                        </>
                      )}
                      {(!job.transportation || job.transportation === 'not_provided') && t('jobs.form.labels.transportationNotProvided')}
                    </p>
                  </div>
                </div>

                {/* Parking */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-[var(--radius)]">
                  <div className="w-8 h-8 rounded-[var(--radius)] bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <ParkingCircle className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">{t('jobs.form.labels.parking')}</span>
                    <p className="text-sm font-medium text-foreground">
                      {job.has_parking ? t('jobs.form.labels.available') : t('jobs.form.labels.notAvailable')}
                    </p>
                  </div>
                </div>

                {/* Public Transport Info */}
                {(job.public_transport_info || user) && (
                  <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-[var(--radius)] md:col-span-2">
                    <div className="w-8 h-8 rounded-[var(--radius)] bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <Bus className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">{t('jobs.form.labels.publicTransport')}</span>
                      <p className="text-sm font-medium text-foreground">
                        {job.public_transport_info || t('common.messages.notSpecified')}
                      </p>
                    </div>
                  </div>
                )}

                {/* Urgency */}
                {job.is_urgent && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-[var(--radius)]">
                    <div className="w-8 h-8 rounded-[var(--radius)] bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <AlertCircle className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">{t('jobs.form.labels.priority')}</span>
                      <p className="text-sm font-medium text-foreground">{t('jobs.form.labels.urgent')}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

          {/* Location Group - Map Only */}
          {(job.job_address || (job.job_latitude && job.job_longitude)) && (
            <div className="mb-8">
              <h3 className="font-semibold mb-4 text-lg text-foreground">{t('jobs.form.labels.locationMap')}</h3>
              <div className={`space-y-4 ${!job.isSelectedTasker && !isOwner ? 'relative' : ''}`}>
                {/* Blur overlay for non-authorized users */}
                {!job.isSelectedTasker && !isOwner && (
                  <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/95 to-background/90 backdrop-blur-[8px] rounded-[var(--radius)] z-10 flex items-center justify-center">
                    <div className="text-center p-6 bg-white/95 dark:bg-gray-900/95 rounded-lg border border-yellow-200 dark:border-yellow-800 shadow-lg backdrop-blur-sm">
                      <MapPin className="h-8 w-8 text-yellow-600 mx-auto mb-3" />
                      <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300 mb-1">
                        {t('jobs.privacy.locationRestricted')}
                      </p>
                      <p className="text-xs text-yellow-600 dark:text-yellow-500">
                        {t('jobs.privacy.availableAfterSelection')}
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Job Address - Display above map if available */}
                {job.job_address && (
                  <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-[var(--radius)]">
                    <div className="w-8 h-8 rounded-[var(--radius)] bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <MapPin className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">{t('jobs.form.labels.address')}</span>
                      <p className="text-sm font-medium text-foreground">{job.job_address}</p>
                    </div>
                  </div>
                )}
                
                {/* Exact Location */}
                {job.exact_location && job.exact_location !== job.job_address && (
                  <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-[var(--radius)]">
                    <div className="w-8 h-8 rounded-[var(--radius)] bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <MapPinned className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">{t('jobs.form.labels.exactLocation')}</span>
                      <p className="text-sm font-medium text-foreground">{job.exact_location}</p>
                    </div>
                  </div>
                )}
                
                {/* Interactive Map with job location */}
                {job.job_latitude && job.job_longitude && (
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-[var(--radius)] p-3">
                    {(job.isSelectedTasker || isOwner) ? (
                      <GoogleJobLocationMap 
                        latitude={job.job_latitude}
                        longitude={job.job_longitude}
                      />
                    ) : (
                      <div className="h-[250px] rounded-[var(--radius)] bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                        <div className="text-center text-gray-500 dark:text-gray-400">
                          <MapPin className="h-8 w-8 mx-auto mb-2" />
                          <p className="text-sm font-medium">{t('jobs.privacy.mapHidden')}</p>
                          <p className="text-xs">{t('jobs.privacy.availableAfterSelection')}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
        {/* Contact Information */}
        <section>
          <h2 className="text-2xl font-bold mb-6 text-foreground">
            {t('jobs.form.labels.contactInformation')}
          </h2>
          
          {/* Primary Contact Group */}
          <div className="mb-8">
            <h3 className="font-medium mb-4 text-muted-foreground uppercase text-sm tracking-wide">{t('jobs.form.labels.primaryContact')}</h3>
            <div className="space-y-3">
              {/* Email */}
              <div className="flex items-center gap-3 text-sm py-2">
                <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="font-medium min-w-[120px]">{t('jobs.form.labels.email')}:</span>
                {isOwner || job.isSelectedTasker ? (
                  <span className="text-muted-foreground">{job.email || t('common.messages.notSpecified')}</span>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground bg-muted px-2 py-1 rounded text-xs">
                      {t('jobs.privacy.contactHidden')}
                    </span>
                    <span className="text-xs text-muted-foreground">{t('jobs.privacy.availableAfterSelection')}</span>
                  </div>
                )}
              </div>
              
              {/* Alternative Email */}
              {job.contact_email && job.contact_email !== job.email && (
                <div className="flex items-center gap-3 text-sm py-2">
                  <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="font-medium min-w-[120px]">{t('jobs.form.labels.altEmail')}:</span>
                  {isOwner || job.isSelectedTasker ? (
                    <span className="text-muted-foreground">{job.contact_email}</span>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground bg-muted px-2 py-1 rounded text-xs">
                        {t('jobs.privacy.contactHidden')}
                      </span>
                      <span className="text-xs text-muted-foreground">{t('jobs.privacy.availableAfterSelection')}</span>
                    </div>
                  )}
                </div>
              )}
              {/* Phone Number from User Profile */}
              <div className="flex items-center gap-3 text-sm py-2">
                <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="font-medium min-w-[120px]">{t('jobs.form.labels.phone')}:</span>
                {isOwner || job.isSelectedTasker ? (
                  <span className="text-muted-foreground">{job.postedBy?.phone || t('common.messages.notSpecified')}</span>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground bg-muted px-2 py-1 rounded text-xs">
                      {t('jobs.privacy.contactHidden')}
                    </span>
                    <span className="text-xs text-muted-foreground">{t('jobs.privacy.availableAfterSelection')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Links Group */}
          {(job.website || job.application_url) && (
            <div className="mb-8">
              <h3 className="font-medium mb-4 text-muted-foreground uppercase text-sm tracking-wide">{t('jobs.form.labels.links')}</h3>
              <div className="space-y-3">
                {/* Website */}
                {job.website && (
                  <div className="flex items-center gap-3 text-sm py-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="font-medium min-w-[120px]">{t('jobs.form.labels.website')}:</span>
                    <a href={job.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      {job.website}
                    </a>
                  </div>
                )}
                
                {/* Application URL */}
                {job.application_url && (
                  <div className="flex items-center gap-3 text-sm py-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="font-medium min-w-[120px]">{t('jobs.form.labels.applyUrl')}:</span>
                    <a href={job.application_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      {t('jobs.form.labels.externalApplication')}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </div>
      {/* Application Form Modal/Overlay */}
      {showApplicationForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white dark:bg-gray-900 rounded-[var(--radius)] max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl thin-scrollbar">
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
