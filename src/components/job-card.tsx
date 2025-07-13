'use client'

import { Job } from "@/types/job"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Briefcase, Star, CheckCircle } from "lucide-react"
import Link from "next/link"

interface JobCardProps {
  job: Job
  viewMode?: 'grid' | 'list'
  hasApplied?: boolean
}

export function JobCard({ job, viewMode = 'grid', hasApplied = false }: JobCardProps) {
  // Get relative time string for job posting date
  const getRelativeTimeString = (date: string) => {
    const now = new Date()
    const postDate = new Date(date)
    const diffInDays = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffInDays === 0) return 'Today'
    if (diffInDays === 1) return 'Yesterday'
    if (diffInDays < 7) return `${diffInDays} days ago`
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`
    return `${Math.floor(diffInDays / 30)} months ago`
  }
  
  // Format job type for display
  const formatJobType = (type: string) => {
    switch(type) {
      case 'quick_job': return 'Quick Job'
      case 'full_time': return 'Full Time'
      case 'part_time': return 'Part Time'
      case 'remote': return 'Remote'
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
      <div className="bg-card rounded-xl p-5 shadow-sm border border-border/40 hover:border-primary/20 hover:shadow-md transition-all flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold mb-1">
            <Link href={`/jobs/${job.id}`} className="hover:text-primary hover:underline">
              {job.title}
            </Link>
          </h3>
          <div className="mb-3 text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-sm">
            <span className="flex items-center">
              <Briefcase className="h-3.5 w-3.5 mr-1" />
              {job.company}
            </span>
            {job.city && (
              <span className="flex items-center">
                <MapPin className="h-3.5 w-3.5 mr-1" />
                {job.city.name}
              </span>
            )}
            <span className="flex items-center">
              <Calendar className="h-3.5 w-3.5 mr-1" />
              {getRelativeTimeString(job.posted_at || job.created_at)}
            </span>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {truncateDescription(job.description, 160)}
          </p>
        </div>
        <div className="flex flex-col justify-between md:items-end gap-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{formatJobType(job.type)}</Badge>
            {job.is_featured && (
              <Badge variant="default" className="bg-yellow-500 hover:bg-yellow-600 text-xs flex items-center gap-1">
                <Star className="h-3 w-3 fill-current" />
                Featured
              </Badge>
            )}
            {hasApplied && (
              <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-xs flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Applied
              </Badge>
            )}
          </div>
          <Button asChild variant={hasApplied ? "outline" : "default"}>
            <Link href={`/jobs/${job.id}`}>
              {hasApplied ? "View Application" : "View Job"}
            </Link>
          </Button>
        </div>
      </div>
    )
  }
  
  // Grid view layout (default)
  return (
    <div className="bg-card rounded-xl p-5 shadow-sm border border-border/40 hover:border-primary/20 hover:shadow-md transition-all flex flex-col h-full">
      <div className="flex items-center justify-between mb-2">
        <Badge variant="outline">{formatJobType(job.type)}</Badge>
        <span className="text-xs text-muted-foreground">
          {getRelativeTimeString(job.posted_at || job.created_at)}
        </span>
      </div>
      
      <h3 className="text-lg font-semibold mb-1 line-clamp-2">
        <Link href={`/jobs/${job.id}`} className="hover:text-primary hover:underline">
          {job.title}
        </Link>
      </h3>
      
      <div className="mb-3 text-muted-foreground text-sm flex flex-wrap gap-1">
        <span className="flex items-center">
          <Briefcase className="h-3.5 w-3.5 mr-1" />
          {job.company}
        </span>
        {job.city && (
          <span className="flex items-center ml-3">
            <MapPin className="h-3.5 w-3.5 mr-1" />
            {job.city.name}
          </span>
        )}
      </div>
      
      <p className="text-sm text-muted-foreground mb-4 flex-1 line-clamp-3">
        {truncateDescription(job.description, 120)}
      </p>
      
      <div className="flex flex-wrap gap-2 mb-4">
        {job.is_featured && (
          <Badge variant="default" className="bg-yellow-500 hover:bg-yellow-600 text-xs flex items-center gap-1">
            <Star className="h-3 w-3 fill-current" />
            Featured
          </Badge>
        )}
        {hasApplied && (
          <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-xs flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Applied
          </Badge>
        )}
        {job.category && <Badge variant="secondary">{job.category.name}</Badge>}
      </div>
      
      <Button asChild className="w-full mt-auto" variant={hasApplied ? "outline" : "default"}>
        <Link href={`/jobs/${job.id}`}>
          {hasApplied ? "View Application" : "View Details"}
        </Link>
      </Button>
    </div>
  )
}
