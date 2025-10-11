'use client'

import { Job } from '@/types/job'
import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'
import { Plus, Edit, Star, Trash2 } from 'lucide-react'

interface ClientJobsManagerProps {
  jobs: Job[]
  applicationCounts: Record<string, number>
  onEdit: (job: Job) => void
  onDelete: (jobId: string) => void
  onFeature?: (jobId: string, isFeatured: boolean) => void
  onPostNewJob?: () => void
  loading?: boolean
}

export function ClientJobsManager({ 
  jobs, 
  applicationCounts, 
  onEdit, 
  onDelete, 
  onFeature,
  onPostNewJob,
  loading = false 
}: ClientJobsManagerProps) {
  const t = useTranslations('dashboard.jobManagement')
  
  // Calculate statistics
  const totalJobs = jobs.length
  const activeJobs = jobs.filter(job => job.is_active !== false).length
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
    const now = new Date()
    const expiresAt = job.expires_at ? new Date(job.expires_at) : null
    
    if (expiresAt && expiresAt < now) return t('expired')
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
            {totalJobs} {t('totalJobs')} • {activeJobs} {t('activeJobs')} • {featuredJobs} {t('featuredJobs')} • {totalApplications} {t('applications')}
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
      <div className="space-y-4">
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
          jobs.map((job) => (
            <div key={job.id} className="border border-border bg-card p-4 space-y-3 hover:shadow-sm transition-shadow">
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
                  <span className="text-muted-foreground">{t('category')}:</span> <span className="text-foreground">{job.category_name || t('notSpecified')}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">{t('location')}:</span> <span className="text-foreground">{job.city_name || t('notSpecified')}</span>
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
                  <span className="text-muted-foreground">{t('expires')}:</span> <span className="text-foreground">{formatDate(job.expires_at)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">{t('views')}:</span> <span className="text-foreground">{job.view_count || 0}</span>
                </div>
              </div>

              {/* Job Actions */}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                <Button 
                  onClick={() => onEdit(job)}
                  variant="outline" 
                  size="sm"
                  className="hover:bg-accent hover:text-accent-foreground"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  {t('edit')}
                </Button>
                
                {onFeature && (
                  <Button 
                    onClick={() => onFeature(job.id, !job.is_featured)}
                    variant="outline" 
                    size="sm"
                    className="hover:bg-accent hover:text-accent-foreground"
                  >
                    <Star className="h-4 w-4 mr-2" />
                    {job.is_featured ? t('removeFeatured') : t('makeFeatured')}
                  </Button>
                )}
                
                <Button 
                  onClick={() => onDelete(job.id)}
                  variant="outline" 
                  size="sm"
                  className="border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t('delete')}
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
