'use client'

import { Job } from '@/types/job'
import { Button } from '@/components/ui/button'
import { useTranslations, useLocale } from 'next-intl'
import { Plus, Edit, Star, Trash2, CircleCheckBig, UserCheck, Eye, MessageCircle } from 'lucide-react'
import { getJobExpirationDate, isJobExpired } from '@/lib/job-utils'

interface ClientJobsManagerProps {
  jobs: Job[]
  applicationCounts: Record<string, number>
  selectedApplicants?: Record<string, { name: string; id: string; avatarUrl?: string } | null>
  onEdit: (job: Job) => void
  onDelete: (jobId: string) => void
  onFeature?: (jobId: string, isFeatured: boolean) => void
  onPostNewJob?: () => void
  onClose?: (jobId: string) => void
  onViewProfile?: (candidateId: string) => void
  onMessageCandidate?: (candidateId: string, jobId: string) => void
  loading?: boolean
}

export function ClientJobsManager({ 
  jobs, 
  applicationCounts,
  selectedApplicants = {},
  onEdit, 
  onDelete, 
  onFeature,
  onPostNewJob,
  onClose,
  onViewProfile,
  onMessageCandidate,
  loading = false 
}: ClientJobsManagerProps) {
  const t = useTranslations('dashboard.jobManagement')
  const locale = useLocale()
  
  // Helper function to get localized category name
  const getCategoryName = (job: Job) => {
    if (locale === 'bs') {
      return job.category_name_bs || job.category_name
    }
    return job.category_name_en || job.category_name
  }
  
  // Helper function to get localized city name
  const getCityName = (job: Job) => {
    if (locale === 'bs') {
      return job.city_name_bs || job.city_name
    }
    return job.city_name_en || job.city_name
  }
  
  // Separate active, expired, and completed jobs
  const activeJobsList = jobs.filter(job => job.status === 'active' && !isJobExpired(job))
  const expiredJobsList = jobs.filter(job => (job.status === 'expired' || isJobExpired(job)) && job.status !== 'completed')
  const completedJobsList = jobs.filter(job => job.status === 'completed')
  
  // Calculate statistics
  const totalJobs = jobs.length
  const activeJobs = activeJobsList.length
  const expiredJobs = expiredJobsList.length
  const totalApplications = Object.values(applicationCounts).reduce((sum, count) => sum + count, 0)
  const featuredJobs = jobs.filter(job => job.is_featured).length

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return t('notAvailable')
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return t('invalidDate')
      return date.toLocaleDateString()
    } catch {
      return t('invalidDate')
    }
  }

  const formatSalary = (job: Job) => {
    if (job.salaryMin && job.salaryMax && job.salaryType) {
      const min = job.salaryMin.toLocaleString()
      const max = job.salaryMax.toLocaleString()
      const typeMap: Record<string, string> = {
        'hourly': '/h', 'daily': '/day', 'weekly': '/week', 'monthly': '/month', 'fixed': '', 'negotiable': ''
      }
      const typeSuffix = typeMap[job.salaryType] || ''
      
      if (job.salaryType === 'fixed') return `${min} BAM`
      return `${min} - ${max} BAM${typeSuffix}`
    }
    
    if (job.salaryMin && job.salaryType) {
      const min = job.salaryMin.toLocaleString()
      const typeMap: Record<string, string> = {
        'hourly': '/h', 'daily': '/day', 'weekly': '/week', 'monthly': '/month', 'fixed': '', 'negotiable': ''
      }
      const typeSuffix = typeMap[job.salaryType] || ''
      
      if (job.salaryType === 'fixed') return `${min} BAM`
      return `From ${min} BAM${typeSuffix}`
    }
    
    return job.salary || t('negotiable')
  }

  const getJobStatus = (job: Job) => {
    // Check if job is expired based on application_deadline or 14 days from creation
    if (isJobExpired(job)) return t('expired')
    if (!job.is_active) return t('inactive')
    return t('active')
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center border-b border-border pb-4">
          <div className="h-6 bg-muted rounded w-32 animate-pulse"></div>
          <div className="h-9 bg-muted rounded w-24 animate-pulse"></div>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border border-border p-4 animate-pulse">
              <div className="h-5 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-border pb-4">
        <div>
          <h2 className="text-lg font-medium text-foreground">{t('title')}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {totalJobs} {t('totalJobs')} • {activeJobs} {t('activeJobs')} • {expiredJobs} {t('expiredJobs')} • {featuredJobs} {t('featuredJobs')} • {totalApplications} {t('applications')}
          </p>
        </div>
        <Button 
          onClick={onPostNewJob} 
          variant="outline" 
          className="border-input hover:bg-accent hover:text-accent-foreground"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t('postNewJob')}
        </Button>
      </div>

      {/* Jobs List */}
      {jobs.length === 0 ? (
        <div className="text-center py-12 border border-border bg-muted/30">
          <p className="text-muted-foreground mb-4">{t('noJobsYet')}</p>
          <Button 
            onClick={onPostNewJob}
            variant="outline" 
            className="border-input hover:bg-accent hover:text-accent-foreground"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t('postFirstJob')}
          </Button>
        </div>
      ) : (
        <>
          {/* Active Jobs Section */}
          {activeJobsList.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-border">
                <h3 className="text-base font-semibold text-foreground">{t('activeJobsSection')}</h3>
                <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded-full">
                  {activeJobsList.length}
                </span>
              </div>
              {activeJobsList.map((job) => (
            <div key={job.id} className="border border-border bg-card p-4 space-y-3 hover:shadow-sm transition-shadow">
              {/* Job Title and Status */}
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-medium text-card-foreground">
                    {job.title}
                    {job.is_featured && <span className="ml-2 text-xs text-muted-foreground">[{t('featured')}]</span>}
                  </h3>
                  <div className="flex flex-col gap-1 mt-1">
                    <p className="text-sm text-muted-foreground">
                      {t('status')}: {getJobStatus(job)} • {t('applications')}: {applicationCounts[job.id] || 0}
                    </p>
                    {selectedApplicants[job.id] && (
                      <div className="flex items-center justify-between gap-2 mt-2 p-2 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded">
                        <div className="flex items-center gap-1.5 text-sm">
                          <UserCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                          <span className="text-emerald-700 dark:text-emerald-300 font-medium">
                            {t('acceptedApplicant')}: {selectedApplicants[job.id]?.name}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          {onViewProfile && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onViewProfile(selectedApplicants[job.id]!.id)}
                              className="h-7 px-2 text-xs border-emerald-300 dark:border-emerald-700 hover:bg-emerald-100 dark:hover:bg-emerald-900/30"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              {t('view')}
                            </Button>
                          )}
                          {onMessageCandidate && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onMessageCandidate(selectedApplicants[job.id]!.id, job.id)}
                              className="h-7 px-2 text-xs border-emerald-300 dark:border-emerald-700 hover:bg-emerald-100 dark:hover:bg-emerald-900/30"
                            >
                              <MessageCircle className="h-3 w-3 mr-1" />
                              {t('message')}
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Job Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">{t('category')}:</span> <span className="text-foreground">{getCategoryName(job) || t('notSpecified')}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">{t('location')}:</span> <span className="text-foreground">{getCityName(job) || t('notSpecified')}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">{t('salary')}:</span> <span className="text-foreground">{formatSalary(job)}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">{t('posted')}:</span> <span className="text-foreground">{formatDate(job.created_at)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">{t('expires')}:</span> <span className="text-foreground">{formatDate(getJobExpirationDate(job).toISOString())}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">{t('views')}:</span> <span className="text-foreground">{job.view_count || 0}</span>
                </div>
              </div>

              {/* Job Actions */}
              <div className="flex flex-wrap justify-between gap-2 pt-2 border-t border-border">
                <div className="flex flex-wrap gap-2">
                  <Button 
                    onClick={() => onEdit(job)}
                    variant="outline" 
                    size="sm"
                    className="hover:bg-accent hover:text-accent-foreground transition-colors whitespace-nowrap"
                  >
                    <Edit className="h-4 w-4 mr-1 flex-shrink-0" />
                    <span className="truncate">{t('edit')}</span>
                  </Button>
                  
                  {onFeature && (
                    <Button 
                      onClick={() => onFeature(job.id, !job.is_featured)}
                      variant="outline" 
                      size="sm"
                      className="hover:bg-accent hover:text-accent-foreground transition-colors whitespace-nowrap"
                    >
                      <Star className="h-4 w-4 mr-1 flex-shrink-0" />
                      <span className="truncate">{job.is_featured ? t('removeFeatured') : t('makeFeatured')}</span>
                    </Button>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {onClose && (
                    <Button 
                      onClick={() => onClose(job.id)}
                      variant="outline" 
                      size="sm"
                      className="border-emerald-500/50 text-emerald-600 dark:text-emerald-400 dark:border-emerald-500/50 hover:!bg-emerald-500 hover:!text-white hover:!border-emerald-500 dark:hover:!bg-emerald-600 dark:hover:!text-white dark:hover:!border-emerald-600 transition-all duration-200 whitespace-nowrap font-medium"
                    >
                      <CircleCheckBig className="h-4 w-4 mr-1 flex-shrink-0" />
                      <span className="truncate">{t('finishJob')}</span>
                    </Button>
                  )}
                  
                  <Button 
                    onClick={() => onDelete(job.id)}
                    variant="outline" 
                    size="sm"
                    className="border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors whitespace-nowrap"
                  >
                    <Trash2 className="h-4 w-4 mr-1 flex-shrink-0" />
                    <span className="truncate">{t('delete')}</span>
                  </Button>
                </div>
              </div>
            </div>
          ))}
            </div>
          )}

          {/* Expired Jobs Section */}
          {expiredJobsList.length > 0 && (
            <div className="space-y-4 mt-8">
              <div className="flex items-center gap-2 pb-2 border-b border-border">
                <h3 className="text-base font-semibold text-muted-foreground">{t('expiredJobsSection')}</h3>
                <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full">
                  {expiredJobsList.length}
                </span>
              </div>
              {expiredJobsList.map((job) => (
            <div key={job.id} className="border border-border bg-card/50 p-4 space-y-3 opacity-60 hover:opacity-80 transition-opacity">
              {/* Job Title and Status */}
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-medium text-card-foreground">
                    {job.title}
                    {job.is_featured && <span className="ml-2 text-xs text-muted-foreground">[{t('featured')}]</span>}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t('status')}: {getJobStatus(job)} • {t('applications')}: {applicationCounts[job.id] || 0}
                  </p>
                </div>
              </div>

              {/* Job Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">{t('category')}:</span> <span className="text-foreground">{getCategoryName(job) || t('notSpecified')}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">{t('location')}:</span> <span className="text-foreground">{getCityName(job) || t('notSpecified')}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">{t('salary')}:</span> <span className="text-foreground">{formatSalary(job)}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">{t('posted')}:</span> <span className="text-foreground">{formatDate(job.created_at)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">{t('expires')}:</span> <span className="text-foreground">{formatDate(getJobExpirationDate(job).toISOString())}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">{t('views')}:</span> <span className="text-foreground">{job.view_count || 0}</span>
                </div>
              </div>

              {/* Job Actions - Limited for expired jobs */}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                <Button 
                  onClick={() => onEdit(job)}
                  variant="outline" 
                  size="sm"
                  className="hover:bg-accent hover:text-accent-foreground transition-colors whitespace-nowrap"
                >
                  <Edit className="h-4 w-4 mr-1 flex-shrink-0" />
                  <span className="truncate">{t('edit')}</span>
                </Button>
                
                <Button 
                  onClick={() => onDelete(job.id)}
                  variant="outline" 
                  size="sm"
                  className="border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors whitespace-nowrap"
                >
                  <Trash2 className="h-4 w-4 mr-1 flex-shrink-0" />
                  <span className="truncate">{t('delete')}</span>
                </Button>
              </div>
            </div>
          ))}
            </div>
          )}

          {/* Completed Jobs Section */}
          {completedJobsList.length > 0 && (
            <div className="space-y-4 mt-8">
              <div className="flex items-center gap-2 pb-2 border-b border-border">
                <h3 className="text-base font-semibold text-green-600 dark:text-green-400">{t('completedJobsSection')}</h3>
                <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded-full">
                  {completedJobsList.length}
                </span>
              </div>
              {completedJobsList.map((job) => (
            <div key={job.id} className="border border-green-200 dark:border-green-900/50 bg-green-50/50 dark:bg-green-950/20 p-4 space-y-3">
              {/* Job Title and Status */}
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-medium text-card-foreground">
                    {job.title}
                    {job.is_featured && <span className="ml-2 text-xs text-muted-foreground">[{t('featured')}]</span>}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    <span className="text-green-600 dark:text-green-400 font-medium">{t('status')}: {t('completed')}</span> • {t('applications')}: {applicationCounts[job.id] || 0}
                  </p>
                  {selectedApplicants[job.id] && (
                    <div className="flex items-center justify-between gap-2 mt-2 p-2 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded">
                      <div className="flex items-center gap-1.5 text-sm">
                        <UserCheck className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                        <span className="text-green-700 dark:text-green-300 font-medium">
                          {t('completedBy')}: {selectedApplicants[job.id]?.name}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        {onViewProfile && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onViewProfile(selectedApplicants[job.id]!.id)}
                            className="h-7 px-2 text-xs border-green-400 dark:border-green-600 hover:bg-green-200 dark:hover:bg-green-800/30"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            {t('view')}
                          </Button>
                        )}
                        {onMessageCandidate && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onMessageCandidate(selectedApplicants[job.id]!.id, job.id)}
                            className="h-7 px-2 text-xs border-green-400 dark:border-green-600 hover:bg-green-200 dark:hover:bg-green-800/30"
                          >
                            <MessageCircle className="h-3 w-3 mr-1" />
                            {t('message')}
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Job Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">{t('category')}:</span> <span className="text-foreground">{getCategoryName(job) || t('notSpecified')}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">{t('location')}:</span> <span className="text-foreground">{getCityName(job) || t('notSpecified')}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">{t('salary')}:</span> <span className="text-foreground">{formatSalary(job)}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">{t('posted')}:</span> <span className="text-foreground">{formatDate(job.created_at)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">{t('expires')}:</span> <span className="text-foreground">{formatDate(getJobExpirationDate(job).toISOString())}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">{t('views')}:</span> <span className="text-foreground">{job.view_count || 0}</span>
                </div>
              </div>

              {/* No actions for completed jobs - they are read-only */}
            </div>
          ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
