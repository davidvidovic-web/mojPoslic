'use client'

import { useRouter } from "next/navigation"
import { useState, useEffect, useCallback } from "react"
import { useTranslations, useLocale } from 'next-intl'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { MapPin, Calendar, ExternalLink, DollarSign, Building2, Edit, Car } from "lucide-react"
import { toast } from "sonner"
import { Job } from "@/types/job"
import { formatJobType, getJobTypeBadgeVariant, formatTransportation, formatClientName } from "@/lib/job-utils"
import { useAuth } from "@/contexts/auth-context"
import { MultiStepJobForm } from "@/components/jobs/job-post-form/multi-step-job-form"

interface JobCardListProps {
  job: Job
  onJobUpdated?: () => void
}

export function JobCardList({ job, onJobUpdated }: JobCardListProps) {
  const router = useRouter()
  const { user } = useAuth()
  const tCommon = useTranslations('common')
  const t = useTranslations('jobApplication')
  const tSuccess = useTranslations('jobs.success')
  const locale = useLocale()
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [applicationCount, setApplicationCount] = useState<number | null>(null)

  // Check if the current user owns this job
  const isOwner = user && job.posted_by === user.id
  
  // Check application count for owner's jobs
  const checkApplicationCount = useCallback(async () => {
    if (!isOwner) return
    
    try {
      const response = await fetch(`/api/jobs/${job.id}/applications`)
      if (response.ok) {
        const data = await response.json()
        setApplicationCount(data.applicationCount || 0)
      }
    } catch (error) {
      console.error('Error checking application count:', error)
    }
  }, [isOwner, job.id])

  // Load application count when component mounts (for owner's jobs)
  useEffect(() => {
    if (isOwner) {
      checkApplicationCount()
    }
  }, [isOwner, checkApplicationCount])

  const canEdit = isOwner && (applicationCount === null || applicationCount === 0)

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

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent card click
    setIsEditDialogOpen(true)
  }

  const handleJobUpdated = () => {
    setIsEditDialogOpen(false)
    onJobUpdated?.()
    toast.success(tSuccess('jobUpdated'))
  }

  return (
    <Card 
      className="hover:shadow-md transition-all duration-200 cursor-pointer border-border/40"
      onClick={handleViewDetails}
    >
      <CardContent className="p-4 sm:p-6">
        {/* Mobile-first responsive layout */}
        <div className="space-y-4">
          {/* Header Section - Company logo, title, and company name */}
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-lg bg-muted border flex items-center justify-center font-bold text-lg shrink-0">
              {formatClientName(job.company).charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg leading-tight mb-1">
                {job.title}
              </h3>
              <div className="flex items-center text-muted-foreground text-sm">
                <Building2 className="h-4 w-4 mr-1" />
                <span className="font-medium">{formatClientName(job.company)}</span>
              </div>
            </div>
          </div>
          
          {/* Description */}
          <div 
            className="text-sm text-muted-foreground line-clamp-2 leading-relaxed prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: job.description }}
          />
          
          {/* Badge Section - Better mobile spacing */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={getJobTypeBadgeVariant(job.type)} className="text-xs">
              {formatJobType(job.type)}
            </Badge>
            
            {job.category && (
              <Badge variant="secondary" className="text-xs">
                {locale === 'bs' ? job.category.name_bs || job.category.name : job.category.name_en || job.category.name}
              </Badge>
            )}
            
            <Badge variant="outline" className="text-xs">
              <MapPin className="h-3 w-3 mr-1" />
              {job.city?.name || tCommon('jobTypes.remote')}
            </Badge>
            
            {formatSalary(job) && (
              <Badge variant="outline" className="text-xs">
                <DollarSign className="h-3 w-3 mr-1" />
                {formatSalary(job)}
              </Badge>
            )}
            
            {job.transportation && (
              <Badge variant="outline" className="text-xs">
                <Car className="h-3 w-3 mr-1" />
                {formatTransportation(job.transportation, job.transportation_amount)}
              </Badge>
            )}
            
            <Badge variant="outline" className="text-xs">
              <Calendar className="h-3 w-3 mr-1" />
              {job.posted_at ? formatDate(job.posted_at) : ''}
            </Badge>
          </div>
          
          {/* Apply Button - Full width on mobile, auto width on larger screens */}
          <div className="pt-2">
            {isOwner ? (
              <div className="flex gap-2 w-full">
                {canEdit && (
                  <Button 
                    onClick={handleEdit}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit Job
                  </Button>
                )}
                <Button 
                  onClick={handleApply}
                  size="sm"
                  className="flex-1"
                >
                  View Details
                  <ExternalLink className="h-3 w-3 ml-1" />
                </Button>
              </div>
            ) : (
              <Button 
                onClick={handleApply}
                size="sm"
                className="w-full sm:w-auto"
              >
                {t('viewDetailsAndApply')}
                <ExternalLink className="h-3 w-3 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Job Posting</DialogTitle>
            <DialogDescription>
              Update the details of your job posting
            </DialogDescription>
          </DialogHeader>
          <MultiStepJobForm
            initialData={job}
            isEditMode={true}
            jobId={job.id}
            onJobPosted={handleJobUpdated}
          />
        </DialogContent>
      </Dialog>
    </Card>
  )
}
