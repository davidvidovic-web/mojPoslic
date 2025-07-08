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
import { formatJobType, formatTransportation } from '@/lib/job-utils'
import { 
  useDeleteAdminJob, 
  useUpdateJobStatus, 
  useUpdateJobFeatured,
  type AdminJob 
} from '@/hooks/use-admin'

interface JobManagementTabProps {
  jobs: AdminJob[]
}

export function JobManagementTab({ jobs }: JobManagementTabProps) {
  const [jobSearchTerm, setJobSearchTerm] = useState('')
  const [jobPage, setJobPage] = useState(1)
  const itemsPerPage = 10

  // TanStack Query mutations
  const deleteJobMutation = useDeleteAdminJob()
  const updateStatusMutation = useUpdateJobStatus()
  const updateFeaturedMutation = useUpdateJobFeatured()

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job?')) return
    deleteJobMutation.mutate(jobId)
  }

  const handleToggleJobStatus = async (jobId: string, isActive: boolean) => {
    updateStatusMutation.mutate({ jobId, isActive })
  }

  const handleToggleFeatured = async (jobId: string, isFeatured: boolean) => {
    updateFeaturedMutation.mutate({ jobId, isFeatured })
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
    <Card className="w-full max-w-none">
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
                        {formatTransportation(job.transportation)}
                      </Badge>
                    )}
                    <Badge variant={job.isActive ? 'default' : 'secondary'} className="text-xs">
                      {job.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    {job.isFeatured && (
                      <Badge variant="destructive" className="text-xs flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        Featured
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Company and location */}
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p><span className="font-medium">Company:</span> {job.company}</p>
                  {job.city && (
                    <p><span className="font-medium">Location:</span> {job.city.name}</p>
                  )}
                  {job.category && (
                    <p><span className="font-medium">Category:</span> {job.category.name}</p>
                  )}
                  {job.salary && (
                    <p><span className="font-medium">Salary:</span> {job.salary}</p>
                  )}
                </div>

                {/* Posted by info */}
                <div className="text-sm text-muted-foreground">
                  <p><span className="font-medium">Posted by:</span> {job.postedBy.name} ({job.postedBy.email})</p>
                  <p><span className="font-medium">Created:</span> {formatDate(job.createdAt)}</p>
                </div>

                {/* Action buttons */}
                <div className="flex flex-wrap gap-2 pt-2 border-t">
                  <Button
                    variant={job.isActive ? 'outline' : 'default'}
                    size="sm"
                    onClick={() => handleToggleJobStatus(job.id, !job.isActive)}
                    disabled={updateStatusMutation.isPending}
                    className="text-xs"
                  >
                    {job.isActive ? (
                      <>
                        <EyeOff className="h-3 w-3 mr-1" />
                        Deactivate
                      </>
                    ) : (
                      <>
                        <Eye className="h-3 w-3 mr-1" />
                        Activate
                      </>
                    )}
                  </Button>
                  
                  <Button
                    variant={job.isFeatured ? 'outline' : 'default'}
                    size="sm"
                    onClick={() => handleToggleFeatured(job.id, !job.isFeatured)}
                    disabled={updateFeaturedMutation.isPending}
                    className="text-xs"
                  >
                    <Star className="h-3 w-3 mr-1" />
                    {job.isFeatured ? 'Unfeature' : 'Feature'}
                  </Button>
                  
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteJob(job.id)}
                    disabled={deleteJobMutation.isPending}
                    className="text-xs"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {filteredJobs.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No jobs found matching your search.</p>
            </div>
          )}

          {/* Pagination */}
          {totalJobPages > 1 && (
            <div className="flex justify-center pt-4">
              <Pagination
                currentPage={jobPage}
                totalPages={totalJobPages}
                onPageChange={setJobPage}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Adding a default export that re-exports the named export
export default JobManagementTab
