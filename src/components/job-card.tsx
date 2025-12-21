'use client'

import { Job } from "@/types/job"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, CheckCircle } from "lucide-react"
import { useTranslations, useLocale } from "next-intl"
import { useJobDetailsDrawer } from "@/hooks/use-job-details-drawer"
import { useSupabaseAuth } from "@/contexts/supabase-auth-context"
import { formatSalary } from "@/lib/job-utils"

interface JobCardProps {
  job: Job
  viewMode?: 'grid' | 'list'
  hasApplied?: boolean
  hideFeaturedBadge?: boolean
}

export function JobCard({ job, viewMode = 'grid', hasApplied = false, hideFeaturedBadge = false }: JobCardProps) {
  const t = useTranslations('jobs')
  const locale = useLocale()
  const { openDrawer } = useJobDetailsDrawer()
  const { user } = useSupabaseAuth()

  // Helper functions for cached data display

  const getCategoryName = () => {
    // Use cached category data directly from job record
    if (job.category_name_bs && job.category_name_en) {
      return locale === 'bs' ? job.category_name_bs : job.category_name_en
    }
    
    // Use the category object directly since cached fields aren't populated
    if (job.category) {
      return locale === 'bs' ? job.category.name_bs : job.category.name_en || job.category.name
    }
    
    // Final fallback
    return job.category_name || ''
  }

  const getSubcategoryName = () => {
    // Use the subcategory object that comes from API enrichment
    if (job.subcategory) {
      return locale === 'bs' ? job.subcategory.name_bs : job.subcategory.name_en || job.subcategory.name
    }
    
    return ''
  }
  
  // Get relative time string for job posting date
  const getRelativeTimeString = (date: string) => {
    if (!date) {
      return t('time.unknown') || 'Nepoznato'
    }
    
    const now = new Date()
    const postDate = new Date(date)
    
    // Check if date is valid
    if (isNaN(postDate.getTime())) {
      return t('time.unknown') || 'Nepoznato'
    }
    
    const diffInDays = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60 * 60 * 24))
    
    // Handle negative values (future dates)
    if (diffInDays < 0) return t('time.today')
    
    if (diffInDays === 0) return t('time.today')
    if (diffInDays === 1) return t('time.yesterday')
    if (diffInDays < 7) return t('time.daysAgo', { count: diffInDays })
    if (diffInDays < 30) return t('time.weeksAgo', { count: Math.floor(diffInDays / 7) })
    return t('time.monthsAgo', { count: Math.floor(diffInDays / 30) })
  }
  
  // Format job type for display
  const formatJobType = (type: string) => {
    if (!type) {
      return 'N/A'
    }
    
    switch(type) {
      case 'quick_job': return t('types.quickJob') || 'Brzi posao'
      case 'full_time': return t('types.fullTime') || 'Puno radno vrijeme'
      case 'part_time': return t('types.partTime') || 'Djelomično radno vrijeme'
      case 'remote': return t('types.remote') || 'Udaljeni rad'
      default: 
        return type
    }
  }
  
  // Truncate description for preview
  const truncateDescription = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }



  // Handle opening job details in drawer
  const handleJobClick = (e: React.MouseEvent) => {
    e.preventDefault()
    
    // Check if user is logged in
    if (!user) {
      // Redirect to login with return URL
      const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
      const returnUrl = `${currentPath}?jobId=${job.id}`;
      window.location.href = `/auth/signin?returnUrl=${encodeURIComponent(returnUrl)}`;
      return;
    }
    
    openDrawer(job.id)
  }
  
  // List view layout
  if (viewMode === 'list') {
    return (
      <div className="group cursor-pointer border-0 bg-white dark:bg-gray-950 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 relative overflow-hidden rounded-[var(--radius)] p-5" onClick={handleJobClick}>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="relative flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            {/* Time Posted (12px font) */}
            <div className="text-xs text-muted-foreground mb-3" style={{ fontSize: '12px' }}>
              {t('card.timePosted') || 'Time posted:'} {getRelativeTimeString(job.posted_at || job.created_at)}
            </div>
            
            {/* Title */}
            <h3 className="text-lg font-bold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
              {job.title}
            </h3>

            {/* Payment Type - Payment Amount */}
            <div className="text-sm font-medium text-green-600 mb-3">
              {formatJobType(job.type || job.job_type)}{formatSalary(job) ? ` - ${formatSalary(job)}` : ''}
            </div>
            
            {/* Description */}
            <div 
              className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-3"
              dangerouslySetInnerHTML={{ 
                __html: truncateDescription(job.description, 150) 
              }}
            />

            {/* Category and Subcategory Bubbles */}
            <div className="flex items-center gap-2 flex-wrap mb-3">
              {job.is_featured && !hideFeaturedBadge && (
                <Badge className="bg-yellow-500 text-yellow-50 px-2.5 py-1 rounded-[var(--radius)] border-0 text-xs">
                  <Star className="h-3 w-3 fill-current mr-1" />
                  {t('card.featured')}
                </Badge>
              )}
              {getCategoryName() && (
                <Badge variant="secondary" className="text-xs px-2.5 py-1 rounded-[var(--radius)] border-0 bg-black dark:bg-white text-white dark:text-black">
                  {getCategoryName()}
                </Badge>
              )}
              {getSubcategoryName() && (
                <Badge variant="outline" className="text-xs px-2.5 py-1 rounded-[var(--radius)] border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400">
                  {getSubcategoryName()}
                </Badge>
              )}
            </div>

            {/* Views and Applications */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{job.view_count || 0} {(job.view_count || 0) === 1 ? t('card.view') || 'view' : t('card.views') || 'views'}</span>
              <span>{job.application_count || 0} {(job.application_count || 0) === 1 ? t('card.application') || 'application' : t('card.applications') || 'applications'}</span>
            </div>
          </div>
          
          <div className="flex flex-col justify-between md:items-end gap-4 md:min-w-[200px] h-full">
            <div className="flex flex-col items-end gap-2">
              {/* Applied badge */}
              {hasApplied && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500 text-white rounded-[var(--radius)] shadow-sm flex-shrink-0">
                  <CheckCircle className="h-3 w-3" />
                  <span className="text-xs font-medium">{t('card.applied')}</span>
                </div>
              )}
            </div>
            <div className="flex flex-col justify-between h-full gap-4 items-end">
              <Button 
                variant="default" 
                className="rounded-[var(--radius)] mt-auto"
                onClick={(e) => {
                  e.stopPropagation()
                  openDrawer(job.id)
                }}
              >
                {t('card.viewDetails')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }
    
    // Grid view layout (default)
    return (
      <div className="group cursor-pointer border-0 bg-white dark:bg-gray-950 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 relative overflow-hidden rounded-[var(--radius)] p-5 flex flex-col h-full" onClick={handleJobClick}>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="relative flex-1 flex flex-col">
          {/* Time Posted (12px font) */}
          <div className="flex justify-between items-start mb-3">
            <div className="text-xs text-muted-foreground" style={{ fontSize: '12px' }}>
              {t('card.timePosted') || 'Time posted:'} {getRelativeTimeString(job.posted_at || job.created_at)}
            </div>
            {/* Applied badge - top right corner */}
            {hasApplied && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500 text-white rounded-[var(--radius)] shadow-sm flex-shrink-0">
                <CheckCircle className="h-3 w-3" />
                <span className="text-xs font-medium">{t('card.applied')}</span>
              </div>
            )}
          </div>
        
          {/* Title */}
          <h3 className="text-lg font-bold mb-3 line-clamp-2 group-hover:text-primary transition-colors">
            {job.title}
          </h3>

          {/* Payment Type - Payment Amount */}
          <div className="text-sm font-medium text-green-600 mb-3">
            {formatJobType(job.type || job.job_type)}{formatSalary(job) ? ` - ${formatSalary(job)}` : ''}
          </div>
          
          {/* Description */}
          <div 
            className="text-sm text-muted-foreground mb-4 flex-1 line-clamp-3 leading-relaxed"
            dangerouslySetInnerHTML={{ 
              __html: truncateDescription(job.description, 120) 
            }}
          />

          {/* Category and Subcategory Bubbles */}
          <div className="flex flex-wrap gap-2 mb-4">
            {job.is_featured && !hideFeaturedBadge && (
              <Badge className="bg-yellow-500 text-yellow-50 px-2.5 py-1 rounded-[var(--radius)] border-0 text-xs">
                <Star className="h-3 w-3 fill-current mr-1" />
                {t('card.featured')}
              </Badge>
            )}
            {getCategoryName() && (
              <Badge variant="secondary" className="text-xs px-2.5 py-1 rounded-[var(--radius)] border-0 bg-black dark:bg-white text-white dark:text-black">
                {getCategoryName()}
              </Badge>
            )}
            {getSubcategoryName() && (
              <Badge variant="outline" className="text-xs px-2.5 py-1 rounded-[var(--radius)] border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400">
                {getSubcategoryName()}
              </Badge>
            )}
          </div>

          {/* Views and Applications */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
            <span>{job.view_count || 0} {(job.view_count || 0) === 1 ? t('card.view') || 'view' : t('card.views') || 'views'}</span>
            <span>{job.application_count || 0} {(job.application_count || 0) === 1 ? t('card.application') || 'application' : t('card.applications') || 'applications'}</span>
          </div>
          
          <Button 
            className="w-full mt-auto rounded-[var(--radius)]" 
            variant="default"
            onClick={(e) => {
              e.stopPropagation()
              openDrawer(job.id)
            }}
          >
            {t('card.viewDetails')}
          </Button>
        </div>
      </div>
    )
  }