'use client'

import { useRouter } from "next/navigation"
import { useTranslations, useLocale } from 'next-intl'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Calendar, ExternalLink, DollarSign, Building2, Car } from "lucide-react"
import { Job } from "@/types/job"
import { formatJobType, getJobTypeBadgeVariant, formatTransportation, formatClientName } from "@/lib/job-utils"
import { useSupabaseAuth } from "@/contexts/supabase-auth-context"

interface JobCardListProps {
  job: Job
}

export function JobCardList({ job }: JobCardListProps) {
  const router = useRouter()
  const { user } = useSupabaseAuth()
  const tCommon = useTranslations('common')
  const t = useTranslations('jobApplication')
  const locale = useLocale()

  // Check if the current user owns this job
  const isOwner = user && job.posted_by === user.id

  const formatSalary = (job: Job) => {
    // If we have structured salary data
    if (job.salaryMin && job.salaryMax && job.salaryType) {
      const min = job.salaryMin.toLocaleString()
      const max = job.salaryMax.toLocaleString()
      const type = job.salaryType === 'hourly' ? '/hr' : 
                   job.salaryType === 'daily' ? '/day' :
                   job.salaryType === 'weekly' ? '/week' :
                   job.salaryType === 'monthly' ? '/month' : ''
      return `${min}-${max} BAM${type}`
    }
    
    // If we only have minimum salary
    if (job.salaryMin && job.salaryType) {
      const min = job.salaryMin.toLocaleString()
      const type = job.salaryType === 'hourly' ? '/hr' : 
                   job.salaryType === 'daily' ? '/day' :
                   job.salaryType === 'weekly' ? '/week' :
                   job.salaryType === 'monthly' ? '/month' : ''
      
      // Don't show "From" for fixed prices
      if (job.salaryType === 'fixed') {
        return `${min} BAM`
      }
      
      return `From ${min} BAM${type}`
    }
    
    // Fallback to legacy salary field
    return job.salary || null
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffInDays === 0) return tCommon('time.today')
    if (diffInDays === 1) return tCommon('time.yesterday')
    if (diffInDays < 7) return tCommon('time.daysAgo', { count: diffInDays })
    return date.toLocaleDateString()
  }

  const handleViewDetails = () => {
    router.push(`/jobs/${job.id}`)
  }

  const handleApply = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent card click
    router.push(`/jobs/${job.id}`)
  }

  return (
    <Card 
      className="group cursor-pointer border-0 bg-white dark:bg-gray-950 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 relative overflow-hidden"
      onClick={handleViewDetails}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <CardContent className="relative p-6">
        {/* Header Section */}
        <div className="flex items-start gap-4 mb-5">
          {/* Company Avatar */}
          <div className="w-14 h-14 rounded-[var(--radius)] bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center ring-1 ring-primary/10 shrink-0">
            <span className="text-lg font-bold text-primary">
              {formatClientName(job.company).charAt(0).toUpperCase()}
            </span>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-xl leading-tight mb-2 text-foreground group-hover:text-primary transition-colors">
              {job.title}
            </h3>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Building2 className="h-4 w-4" />
              <span className="font-medium">{formatClientName(job.company)}</span>
              <span className="text-xs">•</span>
              <span className="text-sm">{job.posted_at ? formatDate(job.posted_at) : ''}</span>
            </div>
          </div>
        </div>
        
        {/* Description */}
        <div 
          className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-5 prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: job.description }}
        />
        
        {/* Key Information Pills */}
        <div className="flex flex-wrap gap-2 mb-5">
          <div className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 dark:bg-gray-900/50 rounded-sm">
            <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{job.city?.name || tCommon('jobTypes.remote')}</span>
          </div>
          
          {formatSalary(job) && (
            <div className="flex items-center gap-1.5 px-3 py-2 bg-green-50 dark:bg-green-950/30 rounded-sm">
              <DollarSign className="h-3.5 w-3.5 text-green-600" />
              <span className="text-sm font-medium text-green-600">{formatSalary(job)}</span>
            </div>
          )}
          
          <div className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 dark:bg-blue-950/30 rounded-sm">
            <Calendar className="h-3.5 w-3.5 text-blue-600" />
            <span className="text-sm text-blue-600">{job.posted_at ? formatDate(job.posted_at) : ''}</span>
          </div>
        </div>
        
        {/* Tags and Badges */}
        <div className="flex flex-wrap gap-2 mb-5">
          <Badge variant={getJobTypeBadgeVariant(job.type)} className="text-xs px-2.5 py-1 rounded-[var(--radius)] border-0 bg-primary/10 text-primary hover:bg-primary/20">
            {formatJobType(job.type, locale)}
          </Badge>
          
          {job.category && (
            <Badge variant="secondary" className="text-xs px-2.5 py-1 rounded-[var(--radius)] border-0 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
              {locale === 'bs' ? job.category.name_bs || job.category.name : job.category.name_en || job.category.name}
            </Badge>
          )}
          
          {job.transportation && (
            <Badge variant="outline" className="text-xs px-2.5 py-1 rounded-[var(--radius)] border border-gray-200 dark:border-gray-700">
              <Car className="h-3 w-3 mr-1.5" />
              {formatTransportation(job.transportation, job.transportation_amount)}
            </Badge>
          )}
        </div>
        
        {/* Actions */}
        <div className="flex gap-3">
          {isOwner ? (
            <Button 
              onClick={handleApply}
              size="sm"
              className="w-full rounded-sm bg-primary hover:bg-primary/90"
            >
              View Details
              <ExternalLink className="h-3.5 w-3.5 ml-2" />
            </Button>
          ) : (
            <Button 
              onClick={handleApply}
              size="sm"
              className="w-full rounded-sm bg-primary hover:bg-primary/90"
            >
              {t('viewDetailsAndApply')}
              <ExternalLink className="h-3.5 w-3.5 ml-2" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
