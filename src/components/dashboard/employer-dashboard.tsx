'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/prisma-auth-context'
import { Job } from '@/types/job'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { MultiStepJobForm } from '@/components/job-post-form/multi-step-job-form'
import { Briefcase, Plus, Edit, Trash2, Eye, MapPin, Calendar, DollarSign, Car } from 'lucide-react'
import { toast } from 'sonner'
import { formatJobType, formatTransportation } from '@/lib/job-utils'

export function EmployerDashboard() {
  const { user } = useAuth()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingJob, setEditingJob] = useState<Job | null>(null)
  const [jobApplicationCounts, setJobApplicationCounts] = useState<Record<string, number>>({})

  useEffect(() => {
    const fetchMyJobs = async () => {
      if (!user) return

      try {
        const response = await fetch('/api/jobs/my-jobs', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        setJobs(data || [])
        
        // Fetch application counts for each job
        if (data && Array.isArray(data)) {
          const counts: Record<string, number> = {}
          await Promise.all(
            data.map(async (job: Job) => {
              try {
                const appResponse = await fetch(`/api/jobs/${job.id}/applications`)
                if (appResponse.ok) {
                  const appData = await appResponse.json()
                  counts[job.id] = appData.applicationCount || 0
                }
              } catch (error) {
                console.error(`Error fetching applications for job ${job.id}:`, error)
                counts[job.id] = 0
              }
            })
          )
          setJobApplicationCounts(counts)
        }
      } catch (error) {
        console.error('Error fetching jobs:', {
          error,
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined
        })
        toast.error('Failed to load your jobs')
      } finally {
        setLoading(false)
      }
    }

    fetchMyJobs()
  }, [user])

  const handleJobPosted = () => {
    setIsDialogOpen(false)
    // Re-fetch jobs when a new job is posted
    const refetchJobs = async () => {
      if (!user) return
      try {
        const response = await fetch('/api/jobs/my-jobs')
        if (response.ok) {
          const data = await response.json()
          setJobs(data || [])
        }
      } catch (error) {
        console.error('Error refetching jobs after posting:', error)
      }
    }
    refetchJobs()
    toast.success('Job posted successfully!')
  }

  const handleEditJob = (job: Job) => {
    setEditingJob(job)
    setIsEditDialogOpen(true)
  }

  const handleEditComplete = () => {
    setIsEditDialogOpen(false)
    setEditingJob(null)
    // Refresh jobs list
    const fetchJobs = async () => {
      if (!user) return
      try {
        const response = await fetch('/api/jobs/my-jobs')
        if (response.ok) {
          const data = await response.json()
          setJobs(data || [])
        }
      } catch (error) {
        console.error('Error refreshing jobs:', error)
      }
    }
    fetchJobs()
  }

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job posting?')) return

    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      setJobs(jobs.filter(job => job.id !== jobId))
      toast.success('Job deleted successfully')
    } catch (error) {
      console.error('Error deleting job:', error)
      toast.error('Failed to delete job')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading your jobs...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Employer Dashboard
              </h1>
              <p className="text-muted-foreground mt-2">
                Welcome back, {user?.name}! Manage your job postings here.
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Post New Job
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Post a New Job</DialogTitle>
                </DialogHeader>
                <MultiStepJobForm onJobPosted={handleJobPosted} />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{jobs.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{jobs.length}</div>
              <p className="text-xs text-muted-foreground">All jobs are active</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {jobs.filter(job => 
                  new Date(job.created_at).getMonth() === new Date().getMonth()
                ).length}
              </div>
              <p className="text-xs text-muted-foreground">Jobs posted</p>
            </CardContent>
          </Card>
        </div>

        {/* Jobs List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Job Postings</CardTitle>
          </CardHeader>
          <CardContent>
            {jobs.length === 0 ? (
              <div className="text-center py-12">
                <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No jobs posted yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start building your team by posting your first job opportunity.
                </p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Post Your First Job
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {jobs.map((job) => (
                  <Card key={job.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold">{job.title}</h3>
                            <Badge variant="secondary">{formatJobType(job.type)}</Badge>
                            {job.transportation && (
                              <Badge variant="outline" className="text-xs">
                                <Car className="h-3 w-3 mr-1" />
                                {formatTransportation(job.transportation, job.transportation_amount)}
                              </Badge>
                            )}
                            {typeof jobApplicationCounts[job.id] === 'number' && (
                              <Badge 
                                variant={jobApplicationCounts[job.id] > 0 ? "default" : "outline"}
                                className="text-xs"
                              >
                                {jobApplicationCounts[job.id]} application{jobApplicationCounts[job.id] !== 1 ? 's' : ''}
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {job.description}
                          </p>
                          
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              {job.city?.name || 'Remote'}
                            </div>
                            {job.salary && (
                              <div className="flex items-center">
                                <DollarSign className="h-4 w-4 mr-1" />
                                {job.salary}
                              </div>
                            )}
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              Posted {formatDate(job.created_at)}
                            </div>
                          </div>
                          
                          {job.tags && job.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-3">
                              {job.tags.slice(0, 3).map((tag, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {job.tags.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{job.tags.length - 3} more
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
                          {jobApplicationCounts[job.id] === 0 ? (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditJob(job)}
                              title="Edit job posting"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button 
                              variant="outline" 
                              size="sm"
                              disabled
                              title={`Cannot edit - ${jobApplicationCounts[job.id]} application(s) received`}
                            >
                              <Edit className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          )}
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeleteJob(job.id)}
                            title="Delete job posting"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Job Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="hidden">
              Edit Job
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Job Posting</DialogTitle>
            </DialogHeader>
            {editingJob && (
              <MultiStepJobForm 
                initialData={{
                  title: editingJob.title,
                  description: editingJob.description,
                  type: editingJob.type,
                  city_id: editingJob.city_id,
                  category_id: editingJob.category_id || '',
                  salary: editingJob.salary || '',
                  salaryType: editingJob.salaryType,
                  salaryMin: editingJob.salaryMin,
                  salaryMax: editingJob.salaryMax,
                  website: editingJob.website || '',
                  email: editingJob.email,
                  contact_email: editingJob.email,
                  application_url: editingJob.website || '',
                  start_date: editingJob.start_date,
                  job_address: editingJob.job_address,
                  job_latitude: editingJob.job_latitude,
                  job_longitude: editingJob.job_longitude
                }}
                isEditMode={true}
                jobId={editingJob.id}
                onJobPosted={handleEditComplete}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
