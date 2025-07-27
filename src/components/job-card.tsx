'use client'

import { Job } from "@/types/job"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Star, CheckCircle, Tag, Eye, Users } from "lucide-react"
import Link from "next/link"
import { useTranslations, useLocale } from "next-intl"

interface JobCardProps {
  job: Job
  viewMode?: 'grid' | 'list'
  hasApplied?: boolean
}

export function JobCard({ job, viewMode = 'grid', hasApplied = false }: JobCardProps) {
  const t = useTranslations('jobs')
  const locale = useLocale()

  // Helper functions for cached data display
  const getCityName = () => {
    // Use cached city data directly from job record
    if (job.city_name_bs && job.city_name_en) {
      return locale === 'bs' ? job.city_name_bs : job.city_name_en
    }
    // Fallback to old structure if cached data not available
    return job.city?.name || job.city_name || 'Unknown City'
  }

  const getCategoryName = () => {
    // Use cached category data directly from job record
    if (job.category_name_bs && job.category_name_en) {
      return locale === 'bs' ? job.category_name_bs : job.category_name_en
    }
    // Fallback to old structure if cached data not available
    return job.category?.name || job.category_name || ''
  }
  
  // Get relative time string for job posting date
  const getRelativeTimeString = (date: string) => {
    const now = new Date()
    const postDate = new Date(date)
    const diffInDays = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffInDays === 0) return t('time.today')
    if (diffInDays === 1) return t('time.yesterday')
    if (diffInDays < 7) return t('time.daysAgo', { count: diffInDays })
    if (diffInDays < 30) return t('time.weeksAgo', { count: Math.floor(diffInDays / 7) })
    return t('time.monthsAgo', { count: Math.floor(diffInDays / 30) })
  }
  
  // Format job type for display
  const formatJobType = (type: string) => {
    switch(type) {
      case 'quick_job': return t('types.quickJob') || 'Quick Job'
      case 'full_time': return t('types.fullTime') || 'Full Time'
      case 'part_time': return t('types.partTime') || 'Part Time'
      case 'remote': return t('types.remote') || 'Remote'
      default: return type
    }
  }
  
  // Truncate description for preview
  const truncateDescription = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }
  
  // List view layout
  if (viewMode === 'list') {
    return (
      <div className="group cursor-pointer border-0 bg-white dark:bg-gray-950 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 relative overflow-hidden rounded-[var(--radius)] p-5">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="relative flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="flex items-start justify-start mb-4">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className="px-2.5 py-1 rounded-[var(--radius)] border-0 bg-primary/10 text-primary hover:bg-primary/20 text-xs">
                  {formatJobType(job.job_type)}
                </Badge>
                <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 dark:bg-gray-900/50 rounded-[var(--radius)]">
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{getCityName()}</span>
                </div>
                {getCategoryName() && (
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 dark:bg-blue-900/50 rounded-[var(--radius)]">
                    <Tag className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{getCategoryName()}</span>
                  </div>
                )}
              </div>
            </div>
            
            <h3 className="text-xl font-bold mb-3 line-clamp-2 group-hover:text-primary transition-colors">
              <Link href={`/jobs/${job.id}`} className="hover:underline">
                {job.title}
              </Link>
            </h3>
            
            <div 
              className="text-sm text-muted-foreground line-clamp-2 leading-relaxed"
              dangerouslySetInnerHTML={{ 
                __html: truncateDescription(job.description, 150) 
              }}
            />

            {/* Performance metrics for list view */}
            <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                <span>{job.view_count || 0} views</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>{job.application_count || 0} applications</span>
              </div>
            </div>
          </div>
          
            <div className="flex flex-col justify-between md:items-end gap-4 md:min-w-[200px] h-full">
              <div className="flex flex-wrap gap-2 items-center">
                {job.is_featured && (
                  <Badge className="bg-yellow-500 text-yellow-50 px-2.5 py-1 rounded-[var(--radius)] border-0 text-xs">
                    <Star className="h-3 w-3 fill-current mr-1" />
                    {t('card.featured')}
                  </Badge>
                )}
                {hasApplied && (
                  <Badge className="bg-green-500 text-green-50 px-2.5 py-1 rounded-[var(--radius)] border-0 text-xs">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {t('card.applied')}
                  </Badge>
                )}
              </div>
              <div className="flex flex-col justify-between h-full gap-4 items-end">
                <span className="text-xs text-muted-foreground">
                  {getRelativeTimeString(job.created_at)}
                </span>
                <Button asChild variant={hasApplied ? "outline" : "default"} className="rounded-[var(--radius)] mt-auto">
                  <Link href={`/jobs/${job.id}`}>
                    {hasApplied ? t('card.viewApplication') : t('card.viewJob')}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )
    }
    
    // Grid view layout (default)
    return (
      <div className="group cursor-pointer border-0 bg-white dark:bg-gray-950 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 relative overflow-hidden rounded-[var(--radius)] p-5 flex flex-col h-full">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="relative flex-1 flex flex-col">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className="px-2.5 py-1 rounded-[var(--radius)] border-0 bg-primary/10 text-primary hover:bg-primary/20 text-xs">
                {formatJobType(job.job_type)}
              </Badge>
              <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 dark:bg-gray-900/50 rounded-[var(--radius)]">
                <MapPin className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{getCityName()}</span>
              </div>
              {getCategoryName() && (
                <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 dark:bg-blue-900/50 rounded-[var(--radius)]">
                  <Tag className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{getCategoryName()}</span>
                </div>
              )}
            </div>
            <span className="text-xs text-muted-foreground flex-shrink-0">
              {getRelativeTimeString(job.created_at)}
            </span>
          </div>
        
          
          <div className="flex items-center justify-end mb-3">
            {hasApplied && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 dark:bg-green-950/30 rounded-[var(--radius)]">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs font-medium text-green-700 dark:text-green-400">Applied</span>
              </div>
            )}
          </div>
          
          <h3 className="text-lg font-bold mb-3 line-clamp-2 group-hover:text-primary transition-colors">
            <Link href={`/jobs/${job.id}`} className="hover:underline">
              {job.title}
            </Link>
          </h3>
          
          <div 
            className="text-sm text-muted-foreground mb-4 flex-1 line-clamp-3 leading-relaxed"
            dangerouslySetInnerHTML={{ 
              __html: truncateDescription(job.description, 120) 
            }}
          />

          {/* Performance metrics for grid view */}
          <div className="flex items-center justify-between gap-2 mb-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                <span>{job.view_count || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>{job.application_count || 0}</span>
              </div>
            </div>
            {job.poster_name && (
              <span className="truncate max-w-[120px]">by {job.poster_name}</span>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {job.is_featured && (
              <Badge className="bg-yellow-500 text-yellow-50 px-2.5 py-1 rounded-[var(--radius)] border-0 text-xs">
                <Star className="h-3 w-3 fill-current mr-1" />
                {t('card.featured')}
              </Badge>
            )}
          </div>
          
          <Button asChild className="w-full mt-auto rounded-[var(--radius)]" variant={hasApplied ? "outline" : "default"}>
            <Link href={`/jobs/${job.id}`}>
              {hasApplied ? t('card.viewApplication') : t('card.viewDetails')}
            </Link>
          </Button>
        </div>
      </div>
    )
  }