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

  const formatSalary = (salary?: string) => {
    if (!salary) return null
    return salary
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
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* Company Logo */}
          <div className="w-12 h-12 rounded-lg bg-muted border flex items-center justify-center font-bold text-lg shrink-0">
            {job.company.charAt(0).toUpperCase()}
          </div>
          
          {/* Job Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg leading-tight mb-1">
                  {job.title}
                </h3>
                <div className="flex items-center text-muted-foreground text-sm mb-2">
                  <Building2 className="h-4 w-4 mr-1" />
                  <span className="font-medium">{job.company}</span>
                </div>
              </div>
            </div>
            
            {/* Description */}
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {job.description}
            </p>
            
            {/* Badge Section */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
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
              
              {formatSalary(job.salary) && (
                <Badge variant="outline" className="text-xs">
                  <DollarSign className="h-3 w-3 mr-1" />
                  {formatSalary(job.salary)}
                </Badge>
              )}
              
              <Badge variant="outline" className="text-xs">
                <Calendar className="h-3 w-3 mr-1" />
                {formatDate(job.posted_at)}
              </Badge>
            </div>
          </div>
          
          {/* Apply Button */}
          <div className="shrink-0">
            <Button 
              onClick={handleApply}
              size="sm"
              className="whitespace-nowrap"
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
