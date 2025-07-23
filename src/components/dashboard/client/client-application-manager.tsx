'use client'

import React, { useState, useMemo } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useTranslations } from 'next-intl'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { toast } from 'sonner'
import {
  Search,
  Users,
  ChevronDown,
  ChevronUp,
  ThumbsUp
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface User {
  id: string
  name: string | null
  email: string
  phone: string | null
  location: string | null
  bio: string | null
  skills: string | null
  experience: string | null
  position: string | null
  website: string | null
}

interface Job {
  id: string
  title: string
  company: string | null
  type: string
  status: string
  postedById: string
}

interface JobApplication {
  id: string
  job_id: string
  user_id: string
  status: 'PENDING' | 'REVIEWED' | 'SHORTLISTED' | 'INTERVIEW_SCHEDULED' | 'SELECTED' | 'ACCEPTED' | 'REJECTED'
  cover_letter: string | null
  resume_url: string | null
  application_date: string
  client_notes: string | null
  client_feedback: string | null
  createdAt: string
  updatedAt: string
  appliedAt: string
  user: User
  job: Job
  jobAssignment?: {
    id: string
    contractStatus: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'WORK_COMPLETED' | 'CONFIRMED_COMPLETED' | 'COMPLETED'
    workCompletedAt?: string
    clientConfirmedAt?: string
    completedAt?: string
    completionNotes?: string
    clientNotes?: string
  }
}

interface ClientApplicationManagerProps {
  showOnlyActive?: boolean // If true, only show applications with active job assignments
  title?: string
  description?: string
}

export function ClientApplicationManager({ 
  showOnlyActive = false, 
  title = "Application Management",
  description = "Manage applications to your job postings"
}: ClientApplicationManagerProps) {
  const { user } = useAuth()
  const tErrors = useTranslations('errors')
  const [applications, setApplications] = useState<JobApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [jobFilter, setJobFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name'>('newest')
  const [expandedApplications, setExpandedApplications] = useState<Set<string>>(new Set())

  // Fetch applications on component mount
  React.useEffect(() => {
    const fetchApplications = async () => {
      if (!user) return

      try {
        setLoading(true)
        const response = await fetch('/api/client/applications')
        
        if (!response.ok) {
          throw new Error('Failed to fetch applications')
        }

        const data = await response.json()
        
        // Map the response to include proper typing
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- API response may have different property names
        const mappedApplications = data.applications.map((app: any) => ({
          ...app,
          job_id: app.job_id || app.jobId,
          user_id: app.user_id || app.userId,
          application_date: app.application_date || app.appliedAt,
          cover_letter: app.cover_letter || app.message,
          client_notes: app.client_notes || app.clientNotes,
          client_feedback: app.client_feedback || app.feedback
        }))

        // Filter for active applications if requested
        const filteredApplications = showOnlyActive 
          ? mappedApplications.filter((app: JobApplication) => 
              app.jobAssignment && 
              ['PENDING', 'ACCEPTED', 'WORK_COMPLETED'].includes(app.jobAssignment.contractStatus)
            )
          : mappedApplications

        setApplications(filteredApplications)
      } catch (error) {
        console.error('Error fetching applications:', error)
        toast.error(tErrors('failedToLoad.applications'))
      } finally {
        setLoading(false)
      }
    }

    fetchApplications()
  }, [user, showOnlyActive, tErrors])

  const handleConfirmCompletion = async (applicationId: string, jobAssignmentId?: string) => {
    if (!jobAssignmentId) {
      toast.error('Job assignment not found')
      return
    }

    try {
      const response = await fetch(`/api/job-assignments/${jobAssignmentId}/confirm-completion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientNotes: '' // Could be expanded to include notes
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to confirm work completion')
      }

      await response.json()
      
      toast.success('Work completion confirmed! The job is now completed.')
      
      // Refresh applications to get updated status
      window.location.reload()
      
    } catch (error) {
      console.error('Error confirming work completion:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to confirm work completion')
    }
  }

  // Filter and sort applications
  const filteredAndSortedApplications = useMemo(() => {
    const filtered = applications.filter(app => {
      const matchesSearch = searchTerm === '' || 
        app.user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.job.title.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' || app.status === statusFilter
      const matchesJob = jobFilter === 'all' || app.job.id === jobFilter
      
      return matchesSearch && matchesStatus && matchesJob
    })

    // Sort applications
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.application_date).getTime() - new Date(b.application_date).getTime()
        case 'name':
          return (a.user.name || '').localeCompare(b.user.name || '')
        case 'newest':
        default:
          return new Date(b.application_date).getTime() - new Date(a.application_date).getTime()
      }
    })

    return filtered
  }, [applications, searchTerm, statusFilter, jobFilter, sortBy])

  // Get unique jobs for filter
  const uniqueJobs = useMemo(() => {
    const jobs = applications.map(app => app.job)
    return jobs.filter((job, index, self) => 
      self.findIndex(j => j.id === job.id) === index
    )
  }, [applications])

  const toggleExpanded = (applicationId: string) => {
    const newExpanded = new Set(expandedApplications)
    if (newExpanded.has(applicationId)) {
      newExpanded.delete(applicationId)
    } else {
      newExpanded.add(applicationId)
    }
    setExpandedApplications(newExpanded)
  }

  const getStatusBadge = (status: string, jobAssignment?: JobApplication['jobAssignment']) => {
    // If there's a job assignment, show its status instead
    if (jobAssignment) {
      switch (jobAssignment.contractStatus) {
        case 'PENDING':
          return <Badge className="bg-blue-100 text-blue-800">Work Starting</Badge>
        case 'ACCEPTED':
          return <Badge className="bg-green-100 text-green-800">In Progress</Badge>
        case 'WORK_COMPLETED':
          return <Badge className="bg-yellow-100 text-yellow-800">Awaiting Confirmation</Badge>
        case 'COMPLETED':
          return <Badge className="bg-green-100 text-green-800">Completed</Badge>
        default:
          return <Badge className="bg-gray-100 text-gray-800">Assigned</Badge>
      }
    }

    // Regular application status
    switch (status) {
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case 'REVIEWED':
        return <Badge className="bg-blue-100 text-blue-800">Reviewed</Badge>
      case 'SHORTLISTED':
        return <Badge className="bg-purple-100 text-purple-800">Shortlisted</Badge>
      case 'INTERVIEW_SCHEDULED':
        return <Badge className="bg-indigo-100 text-indigo-800">Interview Scheduled</Badge>
      case 'SELECTED':
        return <Badge className="bg-green-100 text-green-800">Selected</Badge>
      case 'REJECTED':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading applications...</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">{title}</h2>
        <p className="text-muted-foreground">{description}</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by name, email, or job title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="REVIEWED">Reviewed</SelectItem>
            <SelectItem value="SHORTLISTED">Shortlisted</SelectItem>
            <SelectItem value="SELECTED">Selected</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
          </SelectContent>
        </Select>

        {!showOnlyActive && (
          <Select value={jobFilter} onValueChange={setJobFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by job" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Jobs</SelectItem>
              {uniqueJobs.map(job => (
                <SelectItem key={job.id} value={job.id}>
                  {job.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Select value={sortBy} onValueChange={(value: 'newest' | 'oldest' | 'name') => setSortBy(value)}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="name">Name A-Z</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {filteredAndSortedApplications.length === 0 ? (
          <Card className="p-8 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
            <p className="text-gray-500">
              {showOnlyActive 
                ? "No active job assignments at the moment."
                : "No applications match your current filters."
              }
            </p>
          </Card>
        ) : (
          filteredAndSortedApplications.map((application) => (
            <Card key={application.id} className="p-6 hover:shadow-md transition-shadow">
              <div className="space-y-4">
                {/* Header Row */}
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback>
                        {application.user.name ? application.user.name.charAt(0).toUpperCase() : 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {application.user.name || 'Unknown User'}
                        </h3>
                        {getStatusBadge(application.status, application.jobAssignment)}
                      </div>
                      <p className="text-sm text-gray-600">{application.user.email}</p>
                      <p className="text-sm font-medium text-gray-900">{application.job.title}</p>
                      <p className="text-xs text-gray-500">
                        Applied {formatDistanceToNow(new Date(application.application_date), { addSuffix: true })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Job Completion Workflow Buttons */}
                    {application.status === 'SELECTED' || application.status === 'ACCEPTED' ? (
                      <div className="flex items-center space-x-2 ml-4 pl-4 border-l border-gray-300">
                        {application.jobAssignment ? (
                          <>
                            {/* Client can confirm completion when tasker marks work complete */}
                            {application.jobAssignment.contractStatus === 'WORK_COMPLETED' && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-green-600 hover:text-green-700"
                                onClick={() => handleConfirmCompletion(application.id, application.jobAssignment?.id)}
                              >
                                <ThumbsUp className="h-4 w-4 mr-1" />
                                Confirm Complete
                              </Button>
                            )}
                          </>
                        ) : (
                          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                            Job Assigned
                          </Badge>
                        )}
                      </div>
                    ) : null}

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleExpanded(application.id)}
                    >
                      {expandedApplications.has(application.id) ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedApplications.has(application.id) && (
                  <div className="border-t pt-4 space-y-3">
                    {application.cover_letter && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-1">Cover Letter</h4>
                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                          {application.cover_letter}
                        </p>
                      </div>
                    )}

                    {application.user.skills && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-1">Skills</h4>
                        <p className="text-sm text-gray-600">{application.user.skills}</p>
                      </div>
                    )}

                    {application.user.location && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-1">Location</h4>
                        <p className="text-sm text-gray-600">{application.user.location}</p>
                      </div>
                    )}

                    {application.jobAssignment && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-1">Job Status</h4>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>Contract Status: {application.jobAssignment.contractStatus}</p>
                          {application.jobAssignment.workCompletedAt && (
                            <p>Work Completed: {formatDistanceToNow(new Date(application.jobAssignment.workCompletedAt), { addSuffix: true })}</p>
                          )}
                          {application.jobAssignment.completionNotes && (
                            <div className="mt-2">
                              <span className="font-medium">Completion Notes:</span>
                              <p className="bg-gray-50 p-2 rounded mt-1">{application.jobAssignment.completionNotes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
