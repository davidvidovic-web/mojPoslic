'use client'

import { Job } from "@/types/job"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Star, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useTranslations } from "next-intl"

interface JobCardProps {
  job: Job
  viewMode?: 'grid' | 'list'
  hasApplied?: boolean
}

export function JobCard({ job, viewMode = 'grid', hasApplied = false }: JobCardProps) {
  const t = useTranslations('jobs')
  
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
      <div className="group cursor-pointer border-0 bg-white dark:bg-gray-950 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 relative overflow-hidden rounded-2xl p-6">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="relative flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center ring-1 ring-primary/10">
                <span className="text-sm font-semibold text-primary">
                  {job.company ? job.company.charAt(0).toUpperCase() : 'J'}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs text-muted-foreground">
                  {getRelativeTimeString(job.posted_at || job.createdAt)}
                </span>
              </div>
            </div>
            
            <h3 className="text-xl font-bold mb-3 line-clamp-2 group-hover:text-primary transition-colors">
              <Link href={`/jobs/${job.id}`} className="hover:underline">
                {job.title}
              </Link>
            </h3>
            
            {job.city && (
              <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-gray-50 dark:bg-gray-900/50 rounded-xl w-fit">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{job.city.name}</span>
              </div>
            )}
            
            <div 
              className="text-sm text-muted-foreground line-clamp-2 leading-relaxed"
              dangerouslySetInnerHTML={{ 
                __html: truncateDescription(job.description, 150) 
              }}
            />
          </div>
          
          <div className="flex flex-col justify-between md:items-end gap-4 md:min-w-[200px]">
            <div className="flex flex-wrap gap-2 items-center">
              <Badge className="px-2.5 py-1 rounded-lg border-0 bg-primary/10 text-primary hover:bg-primary/20 text-xs">
                {formatJobType(job.type)}
              </Badge>
              {job.is_featured && (
                <Badge className="bg-yellow-500 text-yellow-50 px-2.5 py-1 rounded-lg border-0 text-xs">
                  <Star className="h-3 w-3 fill-current mr-1" />
                  {t('card.featured')}
                </Badge>
              )}
              {hasApplied && (
                <Badge className="bg-green-500 text-green-50 px-2.5 py-1 rounded-lg border-0 text-xs">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {t('card.applied')}
                </Badge>
              )}
            </div>
            <Button asChild variant={hasApplied ? "outline" : "default"} className="rounded-xl">
              <Link href={`/jobs/${job.id}`}>
                {hasApplied ? t('card.viewApplication') : t('card.viewJob')}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }
  
  // Grid view layout (default)
  return (
    <div className="group cursor-pointer border-0 bg-white dark:bg-gray-950 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 relative overflow-hidden rounded-2xl p-6 flex flex-col h-full">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center ring-1 ring-primary/10">
              <span className="text-sm font-semibold text-primary">
                {job.company ? job.company.charAt(0).toUpperCase() : 'J'}
              </span>
            </div>
            <span className="text-xs text-muted-foreground">
              {getRelativeTimeString(job.posted_at || job.createdAt)}
            </span>
          </div>
          
          {hasApplied && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 dark:bg-green-950/30 rounded-xl">
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
        
        {job.city && (
          <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-gray-50 dark:bg-gray-900/50 rounded-xl w-fit">
            <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{job.city.name}</span>
          </div>
        )}
        
        <div 
          className="text-sm text-muted-foreground mb-4 flex-1 line-clamp-3 leading-relaxed"
          dangerouslySetInnerHTML={{ 
            __html: truncateDescription(job.description, 120) 
          }}
        />
        
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge className="px-2.5 py-1 rounded-lg border-0 bg-primary/10 text-primary hover:bg-primary/20 text-xs">
            {formatJobType(job.type)}
          </Badge>
          {job.is_featured && (
            <Badge className="bg-yellow-500 text-yellow-50 px-2.5 py-1 rounded-lg border-0 text-xs">
              <Star className="h-3 w-3 fill-current mr-1" />
              {t('card.featured')}
            </Badge>
          )}
        </div>
        
        <Button asChild className="w-full mt-auto rounded-xl" variant={hasApplied ? "outline" : "default"}>
          <Link href={`/jobs/${job.id}`}>
            {hasApplied ? t('card.viewApplication') : t('card.viewDetails')}
          </Link>
        </Button>
      </div>
    </div>
  )
}
