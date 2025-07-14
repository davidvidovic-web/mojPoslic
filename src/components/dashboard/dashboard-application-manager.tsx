'use client'

import React, { useState, useMemo } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useNotificationStore } from '@/stores/notification-store'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { toast } from 'sonner'
import {
  Search,
  Users,
  Star,
  Clock,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp
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
  status: 'PENDING' | 'REVIEWED' | 'SHORTLISTED' | 'INTERVIEW_SCHEDULED' | 'ACCEPTED' | 'REJECTED'
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
}

export function DashboardApplicationManager() {
  const { user } = useAuth()
  const { addNotification } = useNotificationStore()
  const [applications, setApplications] = useState<JobApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedApplications, setSelectedApplications] = useState<string[]>([])
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
        setApplications(data.applications || [])
      } catch (error) {
        console.error('Error fetching applications:', error)
        toast.error('Failed to load applications')
      } finally {
        setLoading(false)
      }
    }

    fetchApplications()
  }, [user])

  // Filter and sort applications
  const filteredAndSortedApplications = useMemo(() => {
    let filtered = applications

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(app =>
        app.user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.job.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === statusFilter)
    }

    // Filter by job
    if (jobFilter !== 'all') {
      filtered = filtered.filter(app => app.job_id === jobFilter)
    }

    // Sort applications
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case 'name':
          return (a.user.name || '').localeCompare(b.user.name || '')
        default:
          return 0
      }
    })

    return filtered
  }, [applications, searchTerm, statusFilter, jobFilter, sortBy])

  // Get unique jobs for filter dropdown
  const uniqueJobs = useMemo(() => {
    const jobMap = new Map()
    applications.forEach(app => {
      if (!jobMap.has(app.job_id)) {
        jobMap.set(app.job_id, app.job)
      }
    })
    return Array.from(jobMap.values())
  }, [applications])

  // Group applications by status
  const applicationsByStatus = useMemo(() => {
    const groups = {
      PENDING: filteredAndSortedApplications.filter(app => app.status === 'PENDING'),
      REVIEWED: filteredAndSortedApplications.filter(app => app.status === 'REVIEWED'),
      SHORTLISTED: filteredAndSortedApplications.filter(app => app.status === 'SHORTLISTED'),
      INTERVIEW_SCHEDULED: filteredAndSortedApplications.filter(app => app.status === 'INTERVIEW_SCHEDULED'),
      ACCEPTED: filteredAndSortedApplications.filter(app => app.status === 'ACCEPTED'),
      REJECTED: filteredAndSortedApplications.filter(app => app.status === 'REJECTED')
    }
    return groups
  }, [filteredAndSortedApplications])

  const handleApplicationUpdate = async (applicationId: string, newStatus: string, feedback?: string) => {
    try {
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          client_feedback: feedback
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update application')
      }

      await response.json()
      
      setApplications(prev => 
        prev.map(app => 
          app.id === applicationId 
            ? { ...app, status: newStatus as JobApplication['status'], client_feedback: feedback || null }
            : app
        )
      )

      // Send notification
      addNotification({
        type: 'success',
        title: 'Application Updated',
        message: `Application ${newStatus.toLowerCase().replace('_', ' ')} successfully`
      })

      toast.success(`Application ${newStatus.toLowerCase()}`)
    } catch (error) {
      console.error('Error updating application:', error)
      toast.error('Failed to update application')
    }
  }

  const handleBulkUpdate = async (applicationIds: string[], action: string, data?: { feedback?: string }) => {
    try {
      const response = await fetch('/api/applications/bulk', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicationIds,
          action,
          ...data
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update applications')
      }

      // Update local state
      setApplications(prev => 
        prev.map(app => 
          applicationIds.includes(app.id)
            ? { ...app, status: action as JobApplication['status'], client_feedback: data?.feedback || null }
            : app
        )
      )

      setSelectedApplications([])
      
      // Send notification  
      addNotification({
        type: 'success',
        title: 'Bulk Update Complete',
        message: `${applicationIds.length} applications updated successfully`
      })
      
      toast.success(`${applicationIds.length} applications updated`)
    } catch (error) {
      console.error('Error updating applications:', error)
      toast.error('Failed to update applications')
    }
  }

  const toggleApplicationExpansion = (applicationId: string) => {
    setExpandedApplications(prev => {
      const newSet = new Set(prev)
      if (newSet.has(applicationId)) {
        newSet.delete(applicationId)
      } else {
        newSet.add(applicationId)
      }
      return newSet
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'REVIEWED': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'SHORTLISTED': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'INTERVIEW_SCHEDULED': return 'bg-indigo-100 text-indigo-800 border-indigo-200'
      case 'ACCEPTED': return 'bg-green-100 text-green-800 border-green-200'
      case 'REJECTED': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const ApplicationCard = ({ application }: { application: JobApplication }) => {
    const isExpanded = expandedApplications.has(application.id)
    const isSelected = selectedApplications.includes(application.id)

    return (
      <Card className={`transition-all duration-200 ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedApplications(prev => [...prev, application.id])
                  } else {
                    setSelectedApplications(prev => prev.filter(id => id !== application.id))
                  }
                }}
                className="mt-1"
              />
              
              <Avatar className="h-10 w-10">
                <AvatarFallback>
                  {application.user.name?.split(' ').map(n => n[0]).join('') || 'U'}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-900 truncate">
                    {application.user.name || 'No name provided'}
                  </h3>
                  <Badge className={`ml-2 ${getStatusColor(application.status)}`}>
                    {application.status.replace('_', ' ')}
                  </Badge>
                </div>
                
                <p className="text-sm text-gray-500 truncate">{application.user.email}</p>
                <p className="text-sm text-gray-500 truncate">{application.job.title}</p>
                <p className="text-xs text-gray-400">
                  Applied {(() => {
                    const dateStr = application.createdAt || application.appliedAt
                    if (!dateStr) return 'recently'
                    try {
                      return formatDistanceToNow(new Date(dateStr), { addSuffix: true })
                    } catch {
                      return 'recently'
                    }
                  })()}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleApplicationExpansion(application.id)}
              >
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {isExpanded && (
            <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
              {application.cover_letter && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Cover Letter</h4>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                    {application.cover_letter}
                  </p>
                </div>
              )}

              {application.user.bio && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Bio</h4>
                  <p className="text-sm text-gray-600">{application.user.bio}</p>
                </div>
              )}

              {application.user.skills && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {application.user.skills.split(',').filter(Boolean).map((skill, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {skill.trim()}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-4 pt-2">
                <Button
                  size="sm"
                  onClick={() => handleApplicationUpdate(application.id, 'SHORTLISTED')}
                  disabled={application.status === 'SHORTLISTED'}
                >
                  <Star className="h-4 w-4 mr-1" />
                  Shortlist
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleApplicationUpdate(application.id, 'INTERVIEW_SCHEDULED')}
                  disabled={application.status === 'INTERVIEW_SCHEDULED'}
                >
                  <Clock className="h-4 w-4 mr-1" />
                  Schedule Interview
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  className="text-green-600 hover:text-green-700"
                  onClick={() => handleApplicationUpdate(application.id, 'ACCEPTED')}
                  disabled={application.status === 'ACCEPTED'}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Accept
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-600 hover:text-red-700"
                  onClick={() => handleApplicationUpdate(application.id, 'REJECTED')}
                  disabled={application.status === 'REJECTED'}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Reject
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading applications...</p>
        </div>
      </div>
    )
  }

  if (applications.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
        <p className="text-gray-500">
          Applications for your job postings will appear here.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by applicant name, email, or job title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="REVIEWED">Reviewed</SelectItem>
              <SelectItem value="SHORTLISTED">Shortlisted</SelectItem>
              <SelectItem value="INTERVIEW_SCHEDULED">Interview</SelectItem>
              <SelectItem value="ACCEPTED">Accepted</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
            </SelectContent>
          </Select>

          <Select value={jobFilter} onValueChange={setJobFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Job" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Jobs</SelectItem>
              {uniqueJobs.map((job) => (
                <SelectItem key={job.id} value={job.id}>
                  {job.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(value: 'newest' | 'oldest' | 'name') => setSortBy(value)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="name">Name</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedApplications.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-blue-900">
                  {selectedApplications.length} application(s) selected
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  onClick={() => handleBulkUpdate(selectedApplications, 'SHORTLISTED')}
                >
                  Shortlist All
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkUpdate(selectedApplications, 'REJECTED')}
                >
                  Reject All
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedApplications([])}
                >
                  Clear Selection
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Applications by Status */}
      <Tabs defaultValue="PENDING" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          {Object.entries(applicationsByStatus).map(([status, apps]) => (
            <TabsTrigger key={status} value={status} className="relative">
              {status.replace('_', ' ')}
              {apps.length > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 w-5 text-xs p-0 flex items-center justify-center">
                  {apps.length}
                </Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.entries(applicationsByStatus).map(([status, apps]) => (
          <TabsContent key={status} value={status} className="space-y-4">
            <div className="grid gap-4">
              {apps.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No applications in this status</p>
                </div>
              ) : (
                apps.map((application) => (
                  <ApplicationCard key={application.id} application={application} />
                ))
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
