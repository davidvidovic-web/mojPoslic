'use client'

import React, { useState, useMemo } from 'react'
import { useApplicationManager } from '@/hooks/useQueryManagers'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Search,
  Users,
  ChevronDown,
  ChevronUp,
  ThumbsUp,
  ThumbsDown,
  MessageCircle
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useTranslations } from 'next-intl'
import { useDialogStore } from '@/stores/dialog-store'
import { useSupabaseAuth } from '@/contexts/supabase-auth-context'
import { supabase } from '@/lib/supabase'

interface ClientApplicationManagerProps {
  showOnlyActive?: boolean
  title?: string
  description?: string
}

export function ClientApplicationManager({ 
  showOnlyActive = false, 
  title = "Application Management",
  description = "Manage applications to your job postings"
}: ClientApplicationManagerProps) {
  const tDashboard = useTranslations('dashboard')
  const t = useTranslations('dashboard.applicationManagement')
  const { user } = useSupabaseAuth()
  const { openMessagingDialog } = useDialogStore()
  // Use Supabase hooks instead of manual state management
  const { applications, isLoading, updateApplication } = useApplicationManager()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [jobFilter, setJobFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name'>('newest')
  const [expandedApplications, setExpandedApplications] = useState<Set<string>>(new Set())

  // Filter and sort applications
  const filteredAndSortedApplications = useMemo(() => {
    // Filter for active applications if requested
    let filtered = showOnlyActive 
      ? applications.filter(app => 
          app.status && ['PENDING', 'SHORTLISTED', 'REVIEWED'].includes(app.status)
        )
      : applications

    // Apply search and filter criteria
    filtered = filtered.filter(app => {
      const matchesSearch = searchTerm === '' || 
        app.applicant_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.applicant_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.job?.title?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' || app.status === statusFilter
      const matchesJob = jobFilter === 'all' || app.job?.id === jobFilter
      
      return matchesSearch && matchesStatus && matchesJob
    })

    // Sort applications
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.applied_at || '').getTime() - new Date(b.applied_at || '').getTime()
        case 'name':
          return (a.applicant_name || '').localeCompare(b.applicant_name || '')
        case 'newest':
        default:
          return new Date(b.applied_at || '').getTime() - new Date(a.applied_at || '').getTime()
      }
    })

    return filtered
  }, [applications, searchTerm, statusFilter, jobFilter, sortBy, showOnlyActive])

  // Get unique jobs for filter
  const uniqueJobs = useMemo(() => {
    const jobs = applications.map(app => app.job).filter(job => job !== null)
    return jobs.filter((job, index, self) => 
      self.findIndex(j => j?.id === job?.id) === index
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

  const getStatusBadge = (status: string) => {
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

  const handleMessage = async (application: { id: string; user_id: string | null; job_id?: string | null; job?: { title?: string } | null }) => {
    if (!user || !application.user_id) return
    
    try {
      // Check if a conversation already exists for this application
      const { data: existingConversation, error: fetchError } = await supabase
        .from('conversations')
        .select('id')
        .eq('application_id', application.id)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        // PGRST116 means no rows returned, which is expected if no conversation exists
        console.error('Error checking for existing conversation:', fetchError)
        openMessagingDialog()
        return
      }

      if (existingConversation) {
        // Open existing conversation
        openMessagingDialog(existingConversation.id)
        return
      }

      // Create new conversation if none exists
      const { data: newConversation, error: createError } = await supabase
        .from('conversations')
        .insert({
          application_id: application.id,
          job_id: application.job_id,
          created_by_id: user.id,
          title: `Application Discussion - ${application.job?.title || 'Job'}`,
          is_active: true
        })
        .select('id')
        .single()

      if (createError) {
        console.error('Error creating conversation:', createError)
        openMessagingDialog()
        return
      }

      if (newConversation) {
        // Add participants to the conversation - Note: conversation_participants might not exist in current schema
        // For now, conversations are created and participants are managed differently
        
        // Open the newly created conversation
        openMessagingDialog(newConversation.id)
      } else {
        // Fallback to general messaging
        openMessagingDialog()
      }
    } catch (error) {
      console.error('Error handling message:', error)
      // Fallback to general messaging
      openMessagingDialog()
    }
  }

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{tDashboard('applications.loading')}</p>
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
                        {application.applicant_name ? application.applicant_name.charAt(0).toUpperCase() : 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {application.applicant_name || 'Unknown User'}
                        </h3>
                        {getStatusBadge(application.status || 'PENDING')}
                      </div>
                      <p className="text-sm text-gray-600">{application.applicant_email}</p>
                      <p className="text-sm font-medium text-gray-900">{application.job?.title}</p>
                      <p className="text-xs text-gray-500">
                        Applied {formatDistanceToNow(new Date(application.applied_at || ''), { addSuffix: true })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Application Actions */}
                    {application.status === 'PENDING' && (
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-600 hover:text-green-700"
                          onClick={() => updateApplication({ 
                            applicationId: application.id, 
                            updates: { status: 'SHORTLISTED' }
                          })}
                        >
                          <ThumbsUp className="h-4 w-4 mr-1" />
                          Shortlist
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-600 hover:text-green-700"
                          onClick={() => handleMessage(application)}
                        >
                          <MessageCircle className="h-4 w-4 mr-1" />
                          {t('message')}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => updateApplication({ 
                            applicationId: application.id, 
                            updates: { status: 'REJECTED' }
                          })}
                        >
                          <ThumbsDown className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}

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



                    {application.applicant_location && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-1">Location</h4>
                        <p className="text-sm text-gray-600">{application.applicant_location}</p>
                      </div>
                    )}

                    {application.cover_letter && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-1">Cover Letter</h4>
                        <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{application.cover_letter}</p>
                      </div>
                    )}

                    {application.client_notes && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-1">Client Notes</h4>
                        <p className="text-sm text-gray-600 bg-blue-50 p-2 rounded">{application.client_notes}</p>
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
