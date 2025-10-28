'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Briefcase, MapPin, Calendar, Banknote, Tag, Clock, Mail, Phone, Star, ArrowLeft, ExternalLink, Car, ParkingCircle, Bus, AlertCircle, Timer, CalendarDays, MapPinned, Award, User } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Image from 'next/image'
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

interface JobDetailsDrawerProps {
  jobId: string
  isOpen: boolean
  onClose: () => void
}

export function JobDetailsDrawer({ jobId, isOpen, onClose }: JobDetailsDrawerProps) {
  const t = useTranslations()
  const locale = useLocale() as 'bs' | 'en'
  const { user, loading: authLoading } = useSupabaseAuth()
  const { getCategoryByKey } = useData()
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(false)
  const [showApplicationForm, setShowApplicationForm] = useState(false)
  const [showMobileButton, setShowMobileButton] = useState(false)
  const viewTrackedRef = useRef(false)
  const desktopApplyButtonRef = useRef<HTMLDivElement>(null)
  
  // Check if user has already applied to this job
  const { data: appliedJobIds = new Set(), refetch: refetchAppliedJobs } = useUserAppliedJobs(user?.id || '')
  const hasApplied = job && user ? appliedJobIds.has(job.id) : false
  const isOwner = !!(user && job && job.postedBy?.id === user.id)

  useEffect(() => {
    if (!isOpen) {
      setJob(null)
      setShowApplicationForm(false)
      setShowMobileButton(false)
      viewTrackedRef.current = false
      return
    }

    if (!jobId || authLoading) return
    
    const fetchJob = async (jobId: string) => {
      try {
        setLoading(true)
        const response = await fetch(`/api/jobs/${jobId}`)
        
        if (!response.ok) {
          const errorData = await response.json()
          console.error('Error fetching job:', errorData)
          toast.error(t('jobs.errors.jobNotFound'))
          onClose()
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
        onClose()
      } finally {
        setLoading(false)
      }
    }

    fetchJob(jobId)
  }, [jobId, isOpen, t, user, authLoading, onClose])

  // Scroll listener to show/hide mobile apply button
  useEffect(() => {
    if (!isOpen || !job) return

    const handleScroll = () => {
      if (desktopApplyButtonRef.current) {
        const rect = desktopApplyButtonRef.current.getBoundingClientRect()
        const isDesktopButtonVisible = rect.bottom > 0 && rect.top < window.innerHeight
        setShowMobileButton(!isDesktopButtonVisible)
      }
    }

    const scrollContainer = document.querySelector('.drawer-content')
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll)
      // Initial check
      handleScroll()
      
      return () => {
        scrollContainer.removeEventListener('scroll', handleScroll)
      }
    }
  }, [isOpen, job])

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
    refetchAppliedJobs()
  }

  const handleApplicationCancel = () => {
    setShowApplicationForm(false)
  }

  const formatDate = (dateString: string) => {
    return formatRelativeDate(dateString, locale)
  }
  
  const formatAbsoluteDate = (dateString: string) => {
    return formatDateUtil(dateString, locale, { format: 'short' })
  }

  const formatSalary = (job: Job) => {
    // Check if salary is negotiable first
    if (job.salary_type === 'negotiable' || job.is_salary_negotiable) {
      return t('jobs.form.labels.negotiable')
    }
    
    // If we have structured salary data
    if (job.salaryMin && job.salaryMax && job.salaryType) {
      const min = job.salaryMin.toLocaleString()
      const max = job.salaryMax.toLocaleString()
      const type = job.salaryType === 'hourly' ? t('jobCard.hourly') : 
                   job.salaryType === 'daily' ? t('jobCard.daily') :
                   job.salaryType === 'weekly' ? t('jobCard.weekly') :
                   job.salaryType === 'monthly' ? t('jobCard.monthly') : ''
      const result = `${min} - ${max} BAM${type}`
      return job.is_salary_negotiable ? `${result} (${t('jobs.form.labels.negotiable')})` : result
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
        const result = `${min} BAM`
        return job.is_salary_negotiable ? `${result} (${t('jobs.form.labels.negotiable')})` : result
      }
      
      const result = `${t('jobCard.from')} ${min} BAM${type}`
      return job.is_salary_negotiable ? `${result} (${t('jobs.form.labels.negotiable')})` : result
    }
    
    // Fallback to legacy salary field
    return job.salary || null
  }

  // Don't render anything if not open
  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-full max-w-4xl bg-white dark:bg-gray-950 shadow-2xl z-50 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (job) {
                window.open(`/jobs/${job.id}`, '_blank')
              }
            }}
            className="h-auto px-3 py-2 gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            <span className="text-sm">{t('jobs.actions.openInNewWindow')}</span>
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto drawer-content">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-100 mx-auto mb-4"></div>
                <p className="text-muted-foreground">{t('jobs.messages.loadingJobDetails')}</p>
              </div>
            </div>
          ) : job ? (
            <div className="p-6">
              {/* Job Header */}
              <div className="mb-8 pb-6 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-foreground mb-3 leading-tight">{job.title}</h1>
                    <div className="flex items-center gap-3 mb-4">
                      <Avatar className="h-12 w-12">
                        {job.postedBy?.avatar_url ? (
                          <AvatarImage 
                            src={job.postedBy.avatar_url}
                            alt={job.postedBy?.name || job.company || 'User avatar'}
                            asChild
                          >
                            <Image
                              src={job.postedBy.avatar_url}
                              alt={job.postedBy?.name || job.company || 'User avatar'}
                              width={48}
                              height={48}
                              className="object-cover"
                            />
                          </AvatarImage>
                        ) : (
                          <AvatarFallback className="text-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                            {job.company 
                              ? job.company.charAt(0).toUpperCase() 
                              : job.postedBy?.name 
                                ? job.postedBy.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                                : job.poster_name
                                  ? job.poster_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                                  : <User className="h-6 w-6" />
                            }
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div>
                        <p className="text-xl font-semibold text-foreground">
                          {job.company || job.postedBy?.name || job.poster_name || 'Unknown'}
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
                          <Star className="h-3 w-3 fill-current mr-1" />
                          {t('jobs.card.featured')}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-4" ref={desktopApplyButtonRef}>
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
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {(formatSalary(job) || (job as any).performance_bonus || user) && (
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
                              {formatSalary(job) || t('common.messages.notSpecified')}
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {((job as any).performance_bonus !== undefined || user) && (
                        <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                          <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                            <Award className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                          </div>
                          <div>
                            <span className="text-sm font-medium text-muted-foreground">{t('jobs.form.labels.performanceBonus')}</span>
                            <p className="text-sm text-green-700 dark:text-green-400 font-medium">
                              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                              {(job as any).performance_bonus ? t('jobs.form.labels.available') : t('jobs.form.labels.notAvailable')}
                            </p>
                          </div>
                        </div>
                      )}
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
                              {job.application_deadline ? formatAbsoluteDate(job.application_deadline) : t('common.messages.notSpecified')}
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
                            {formatAbsoluteDate(getJobExpirationDate(job).toISOString())}
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
                        
                        {/* Job Address */}
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
                        
                        {/* Interactive Map */}
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
                      
                      {/* Phone Number */}
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
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-muted-foreground mb-4">{t('jobs.errors.jobNotFound')}</p>
              </div>
            </div>
          )}
        </div>

        {/* Fixed Mobile Apply Button */}
        {job && !isOwner && !hasApplied && user && user.role !== 'client' && (
          <div className={`fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-4 z-50 md:hidden transition-all duration-300 ease-out transform ${
            showMobileButton ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-full scale-95 opacity-0'
          }`}>
            <Button 
              onClick={handleApply} 
              size="lg"
              className="w-full rounded-[var(--radius)] transition-transform duration-200 ease-out active:scale-95"
            >
              {job.application_url ? t('jobs.form.labels.applyExternally') : t('jobs.form.labels.applyNow')}
            </Button>
          </div>
        )}
      </div>

      {/* Application Form Modal */}
      {showApplicationForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white dark:bg-gray-900 rounded-[var(--radius)] max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6">
              <JobApplicationForm
                jobId={job!.id}
                jobTitle={job!.title}
                onSuccess={handleApplicationSuccess}
                onCancel={handleApplicationCancel}
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}