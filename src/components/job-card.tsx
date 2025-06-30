'use client'

import { useRouter } from "next/navigation"
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { MapPin, Calendar, ExternalLink, DollarSign, Eye } from "lucide-react"
import { Job } from "@/types/job"
import { formatJobType, getJobTypeBadgeVariant } from "@/lib/job-utils"

interface JobCardProps {
  job: Job
}

export function JobCard({ job }: JobCardProps) {
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
      className="h-full flex flex-col hover:shadow-lg transition-shadow cursor-pointer border-border/40"
      onClick={handleViewDetails}
    >
      <CardHeader className="flex-row items-start gap-4 p-6">
        <div className="w-12 h-12 rounded-lg bg-muted border flex items-center justify-center font-bold text-lg">
          {job.company.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg leading-tight truncate">
                {job.title}
              </h3>
              <p className="text-muted-foreground mt-1">{job.company}</p>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 space-y-4 pt-0 px-6">
        <div>
          <p className="text-sm line-clamp-3 text-muted-foreground">
            {job.description}
          </p>
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
        <Button 
          onClick={handleApply}
          className="w-full"
        >
          View Details & Apply
          <ExternalLink className="h-4 w-4 ml-2" />
        </Button>
      </CardFooter>
    </Card>
  )
}
