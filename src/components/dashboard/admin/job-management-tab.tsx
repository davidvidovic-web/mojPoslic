'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Pagination } from '@/components/ui/pagination'
import { 
  Briefcase, 
  Search, 
  Trash2, 
  Eye,
  EyeOff,
  Star,
  Car
} from 'lucide-react'
import { toast } from 'sonner'
import { formatJobType, formatTransportation } from '@/lib/job-utils'

interface AdminJob {
  id: string
  title: string
  company: string
  description: string
  type: string
  salary?: string
  transportation?: string
  transportation_amount?: number
  email: string
  website?: string
  isActive: boolean
  isFeatured: boolean
  createdAt: string
  updatedAt: string
  city?: {
    id: string
    name: string
    name_en: string
    name_bs: string
  }
  category?: {
    id: string
    name: string
    name_en: string
    name_bs: string
  }
  postedBy: {
    id: string
    name: string
    email: string
    companyName?: string
  }
}

interface JobManagementTabProps {
  jobs: AdminJob[]
  setJobs: React.Dispatch<React.SetStateAction<AdminJob[]>>
}

export function JobManagementTab({ jobs, setJobs }: JobManagementTabProps) {
  const [jobSearchTerm, setJobSearchTerm] = useState('')
  const [jobPage, setJobPage] = useState(1)
  const itemsPerPage = 10

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job?')) return

    try {
      const response = await fetch('/api/admin/jobs', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ jobId }),
      })

      if (!response.ok) {
        throw new Error('Failed to delete job')
      }

      setJobs(jobs.filter(job => job.id !== jobId))
      toast.success('Job deleted successfully')
    } catch (error) {
      console.error('Error deleting job:', error)
      toast.error('Failed to delete job')
    }
  }

  const handleToggleJobStatus = async (jobId: string, isActive: boolean) => {
    try {
      const response = await fetch('/api/admin/jobs', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ jobId, isActive }),
      })

      if (!response.ok) {
        throw new Error('Failed to update job status')
      }

      setJobs(jobs.map(job => job.id === jobId ? { ...job, isActive } : job))
      toast.success(`Job ${isActive ? 'activated' : 'deactivated'} successfully`)
    } catch (error) {
      console.error('Error updating job status:', error)
      toast.error('Failed to update job status')
    }
  }

  const handleToggleJobFeatured = async (jobId: string, isFeatured: boolean) => {
    try {
      const response = await fetch('/api/admin/jobs', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ jobId, isFeatured }),
      })

      if (!response.ok) {
        throw new Error('Failed to update featured status')
      }

      setJobs(jobs.map(job => job.id === jobId ? { ...job, isFeatured } : job))
      toast.success(`Job ${isFeatured ? 'featured' : 'unfeatured'} successfully`)
    } catch (error) {
      console.error('Error updating featured status:', error)
      toast.error('Failed to update featured status')
    }
  }

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(jobSearchTerm.toLowerCase()) ||
    job.company.toLowerCase().includes(jobSearchTerm.toLowerCase())
  )

  const paginatedJobs = filteredJobs.slice(
    (jobPage - 1) * itemsPerPage,
    jobPage * itemsPerPage
  )

  const totalJobPages = Math.ceil(filteredJobs.length / itemsPerPage)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <Card>
      <CardHeader>
        <div className="space-y-4">
          <CardTitle className="flex items-center">
            <Briefcase className="h-5 w-5 mr-2" />
            Job Management
          </CardTitle>
          
          {/* Mobile-responsive search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search jobs..."
              value={jobSearchTerm}
              onChange={(e) => setJobSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {paginatedJobs.map((job) => (
            <div key={job.id} className="border rounded-lg p-4">
              {/* Mobile-friendly layout */}
              <div className="space-y-3">
                {/* Job title and badges */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-base leading-tight">{job.title}</h4>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="text-xs">{formatJobType(job.type)}</Badge>
                    {job.transportation && (
                      <Badge variant="outline" className="text-xs flex items-center gap-1">
                        <Car className="h-3 w-3" />
                        {formatTransportation(job.transportation, job.transportation_amount)}
                      </Badge>
                    )}
                    <Badge variant={job.isActive ? "default" : "secondary"} className="text-xs">
                      {job.isActive ? "Active" : "Inactive"}
                    </Badge>
                    {job.isFeatured && (
                      <Badge variant="outline" className="text-xs">Featured</Badge>
                    )}
                  </div>
                </div>
                
                {/* Company and location */}
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{job.company}</p>
                  <p className="text-sm text-muted-foreground">{job.city?.name || 'Remote'}</p>
                </div>
                
                {/* Meta info */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs text-muted-foreground">
                  <span>Posted {formatDate(job.createdAt)}</span>
                  {job.postedBy && (
                    <span className="sm:before:content-['•'] sm:before:mx-2">by {job.postedBy.name}</span>
                  )}
                </div>
                
                {/* Action buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/40">
                  <Button
                    variant={job.isActive ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleToggleJobStatus(job.id, !job.isActive)}
                    className="flex items-center gap-2"
                  >
                    {job.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    <span className="hidden sm:inline">
                      {job.isActive ? "Hide" : "Show"}
                    </span>
                  </Button>
                  <Button
                    variant={job.isFeatured ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleToggleJobFeatured(job.id, !job.isFeatured)}
                    className="flex items-center gap-2"
                  >
                    <Star className="h-4 w-4" />
                    <span className="hidden sm:inline">
                      {job.isFeatured ? "Unfeature" : "Feature"}
                    </span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteJob(job.id)}
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                    <span className="hidden sm:inline">Delete</span>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <Pagination
          currentPage={jobPage}
          totalPages={totalJobPages}
          onPageChange={setJobPage}
          className="mt-6"
        />
      </CardContent>
    </Card>
  )
}
