'use client'

import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Calendar, ExternalLink, DollarSign, Building2 } from "lucide-react"
import { Job } from "@/types/job"
import { formatJobType, getJobTypeBadgeVariant } from "@/lib/job-utils"

interface JobCardListProps {
  job: Job
}

export function JobCardList({ job }: JobCardListProps) {
  const router = useRouter()

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
              {job.company.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg leading-tight mb-1">
                {job.title}
              </h3>
              <div className="flex items-center text-muted-foreground text-sm">
                <Building2 className="h-4 w-4 mr-1" />
                <span className="font-medium">{job.company}</span>
              </div>
            </div>
          </div>
          
          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {job.description}
          </p>
          
          {/* Badge Section - Better mobile spacing */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={getJobTypeBadgeVariant(job.type)} className="text-xs">
              {formatJobType(job.type)}
            </Badge>
            
            {job.category && (
              <Badge variant="secondary" className="text-xs">
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
            
            <Badge variant="outline" className="text-xs">
              <Calendar className="h-3 w-3 mr-1" />
              {formatDate(job.posted_at)}
            </Badge>
          </div>
          
          {/* Apply Button - Full width on mobile, auto width on larger screens */}
          <div className="pt-2">
            <Button 
              onClick={handleApply}
              size="sm"
              className="w-full sm:w-auto"
            >
              View Details
              <ExternalLink className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
