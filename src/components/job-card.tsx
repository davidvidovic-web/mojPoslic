'use client'

import { useRouter } from "next/navigation"
import { useState, useEffect, useCallback } from "react"
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { MapPin, Calendar, ExternalLink, DollarSign, Eye, Edit, Car } from "lucide-react"
import { Job } from "@/types/job"
import { formatJobType, getJobTypeBadgeVariant, formatTransportation, formatEmployerName } from "@/lib/job-utils"
import { useAuth } from "@/contexts/prisma-auth-context"
import { MultiStepJobForm } from "@/components/job-post-form/multi-step-job-form"
import { toast } from "sonner"

interface JobCardProps {
  job: Job
  onJobUpdated?: () => void
}

export function JobCard({ job, onJobUpdated }: JobCardProps) {
  const router = useRouter()
  const { user } = useAuth()
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
      return `From ${min} BAM${type}`
    }
    
    // Fallback to legacy salary field
    return job.salary || null
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffInDays === 0) return "Today"
    if (diffInDays === 1) return "Yesterday"
    if (diffInDays < 7) return `${diffInDays} days ago`
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
    toast.success('Job updated successfully!')
  }

  return (
    <Card 
      className="h-full flex flex-col hover:shadow-lg transition-shadow cursor-pointer border-border/40"
      onClick={handleViewDetails}
    >
      <CardHeader className="flex-row items-start gap-4 p-6">
        <div className="w-12 h-12 rounded-lg bg-muted border flex items-center justify-center font-bold text-lg">
          {formatEmployerName(job.company).charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg leading-tight truncate">
                {job.title}
              </h3>
              <p className="text-muted-foreground mt-1">{formatEmployerName(job.company)}</p>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 space-y-4 pt-0 px-6">
        <div>
          <div 
            className="text-sm line-clamp-3 text-muted-foreground prose prose-sm dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: job.description }}
          />
        </div>

        <div className="space-y-3">
          {/* Badge section - all items styled consistently */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={getJobTypeBadgeVariant(job.type)}>
              {formatJobType(job.type)}
            </Badge>
            
            {job.category && (
              <Badge variant="secondary">
                {job.category.name}
              </Badge>
            )}
            
            <Badge variant="outline" className="text-xs">
              <MapPin className="h-3 w-3 mr-1" />
              {job.city?.name || 'Remote'}
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
          </div>

          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 mr-2" />
            <span>{formatDate(job.posted_at)}</span>
          </div>
        </div>

        <Separator className="my-4" />
        
        <div className="flex items-center text-xs text-muted-foreground">
          <Eye className="h-3 w-3 mr-2" />
          <span>Posted {formatDate(job.posted_at)}</span>
        </div>
      </CardContent>

      <CardFooter className="p-6 pt-0">
        {isOwner ? (
          <div className="flex gap-2 w-full">
            {canEdit && (
              <Button 
                onClick={handleEdit}
                variant="outline"
                className="flex-1"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Job
              </Button>
            )}
            <Button 
              onClick={handleApply}
              className="flex-1"
            >
              View Details
              <ExternalLink className="h-4 w-4 ml-2" />
            </Button>
          </div>
        ) : (
          <Button 
            onClick={handleApply}
            className="w-full"
          >
            View Details & Apply
            <ExternalLink className="h-4 w-4 ml-2" />
          </Button>
        )}
      </CardFooter>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Job Posting</DialogTitle>
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
