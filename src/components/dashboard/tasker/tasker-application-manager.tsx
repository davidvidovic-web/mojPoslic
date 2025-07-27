'use client'

import React, { useState, useMemo } from 'react'
import { useApplicationManager } from '@/hooks/useQueryManagers'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Search,
  Briefcase,
  Clock,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  ExternalLink
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useRouter } from 'next/navigation'

interface TaskerApplicationManagerProps {
  showOnlyHistorical?: boolean // If true, only show completed/rejected applications
  title?: string
  description?: string
}

export function TaskerApplicationManager({ 
  showOnlyHistorical = false,
  title = "My Applications",
  description = "Track your job applications"
}: TaskerApplicationManagerProps) {
  // Use Supabase hooks instead of manual state management
  const { applications, isLoading, isError, error } = useApplicationManager()
  const router = useRouter()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'company'>('newest')
  const [expandedApplications, setExpandedApplications] = useState<Set<string>>(new Set())

  // Helper function to check if work is completed (this would need to be enhanced with actual job assignment data)
  const hasCompletedWork = (app: { status: string | null; applied_at: string | null; updated_at?: string | null }): boolean => {
    // This is a placeholder - in reality, you'd check job assignment status
    // For now, assume all SELECTED applications that are older than 30 days are completed
    if (app.status === 'SELECTED') {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      return new Date(app.applied_at || '').getTime() < thirtyDaysAgo.getTime()
    }
    return false
  }

  // Filter and sort applications
  const filteredAndSortedApplications = useMemo(() => {
    // Filter applications based on props first
    let filtered = showOnlyHistorical 
      ? applications.filter(app => 
          ['REJECTED', 'WITHDRAWN'].includes(app.status || '') || 
          (app.status === 'SELECTED' && hasCompletedWork(app))
        )
      : applications.filter(app => 
          ['PENDING', 'REVIEWED', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'SELECTED'].includes(app.status || '') &&
          !hasCompletedWork(app)
        )

    // Apply search and status filters
    filtered = filtered.filter(app => {
      const matchesSearch = searchTerm === '' || 
        app.job?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.job?.description?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' || app.status === statusFilter
      
      return matchesSearch && matchesStatus
    })

    // Sort applications
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.applied_at || '').getTime() - new Date(b.applied_at || '').getTime()
        case 'company':
          return (a.job?.title || '').localeCompare(b.job?.title || '')
        case 'newest':
        default:
          return new Date(b.applied_at || '').getTime() - new Date(a.applied_at || '').getTime()
      }
    })

    return filtered
  }, [applications, searchTerm, statusFilter, sortBy, showOnlyHistorical])

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
        return <Badge className="bg-yellow-100 dark:bg-yellow-950/30 text-yellow-800 dark:text-yellow-400 border-0 rounded-xl px-3 py-1">Pending</Badge>
      case 'REVIEWED':
        return <Badge className="bg-blue-100 dark:bg-blue-950/30 text-blue-800 dark:text-blue-400 border-0 rounded-xl px-3 py-1">Reviewed</Badge>
      case 'SHORTLISTED':
        return <Badge className="bg-purple-100 dark:bg-purple-950/30 text-purple-800 dark:text-purple-400 border-0 rounded-xl px-3 py-1">Shortlisted</Badge>
      case 'INTERVIEW_SCHEDULED':
        return <Badge className="bg-indigo-100 dark:bg-indigo-950/30 text-indigo-800 dark:text-indigo-400 border-0 rounded-xl px-3 py-1">Interview Scheduled</Badge>
      case 'SELECTED':
        return <Badge className="bg-green-100 dark:bg-green-950/30 text-green-800 dark:text-green-400 border-0 rounded-xl px-3 py-1">Selected</Badge>
      case 'REJECTED':
        return <Badge className="bg-red-100 dark:bg-red-950/30 text-red-800 dark:text-red-400 border-0 rounded-xl px-3 py-1">Rejected</Badge>
      case 'WITHDRAWN':
        return <Badge className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-400 border-0 rounded-xl px-3 py-1">Withdrawn</Badge>
      default:
        return <Badge className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-400 border-0 rounded-xl px-3 py-1">{status}</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SELECTED':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'REJECTED':
      case 'WITHDRAWN':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'SHORTLISTED':
      case 'INTERVIEW_SCHEDULED':
        return <Clock className="h-4 w-4 text-purple-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

    const formatSalary = (job: { salary_min?: number | null; salary_max?: number | null; salary_type?: string | null } | null) => {
    if (!job?.salary_min) return ''
    const max = job.salary_max || job.salary_min
    const salaryType = job.salary_type || ''
    return `${job.salary_min}-${max} EUR${salaryType ? ` (${salaryType})` : ''}`
  }

  // Handle error state
  if (isError) {
    return (
      <div className="text-center py-16 px-6">
        <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950/20 flex items-center justify-center mx-auto mb-4">
          <XCircle className="h-8 w-8 text-red-500" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Error Loading Applications</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
          {error?.message || 'Failed to load applications'}
        </p>
        <Button 
          variant="outline"
          className="rounded-xl" 
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="text-center py-16 px-6">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
        </div>
        <p className="text-gray-600 dark:text-gray-400 font-medium">Loading applications...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center lg:text-left">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">{title}</h2>
        <p className="text-gray-600 dark:text-gray-400 text-lg">{description}</p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-950 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by job title or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-11 h-12 rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:bg-white dark:focus:bg-gray-900"
              />
            </div>
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full lg:w-48 h-12 rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">All Status</SelectItem>
              {!showOnlyHistorical && (
                <>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="REVIEWED">Reviewed</SelectItem>
                  <SelectItem value="SHORTLISTED">Shortlisted</SelectItem>
                  <SelectItem value="INTERVIEW_SCHEDULED">Interview Scheduled</SelectItem>
                  <SelectItem value="SELECTED">Selected</SelectItem>
                </>
              )}
              {showOnlyHistorical && (
                <>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                  <SelectItem value="WITHDRAWN">Withdrawn</SelectItem>
                  <SelectItem value="SELECTED">Completed</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(value: 'newest' | 'oldest' | 'company') => setSortBy(value)}>
            <SelectTrigger className="w-full lg:w-48 h-12 rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="company">Company A-Z</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      {/* Applications List */}
      <div className="space-y-4">
        {filteredAndSortedApplications.length === 0 ? (
          <div className="text-center py-16 px-6">
            <div className="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-gray-900/50 flex items-center justify-center mx-auto mb-4">
              <Briefcase className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No applications found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
              {showOnlyHistorical 
                ? "No historical applications to show."
                : "No active applications match your current filters."
              }
            </p>
            {!showOnlyHistorical && (
              <Button 
                className="rounded-xl" 
                onClick={() => router.push('/jobs')}
              >
                Browse Jobs
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredAndSortedApplications.map((application) => (
              <div key={application.id} className="bg-white dark:bg-gray-950 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group">
                <div className="space-y-6">
                  {/* Header Row */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center ring-1 ring-primary/10 shrink-0">
                        {getStatusIcon(application.status || 'PENDING')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 group-hover:text-primary transition-colors">
                            {application.job?.title || 'Job Title Not Available'}
                          </h3>
                          {getStatusBadge(application.status || 'PENDING')}
                        </div>
                        <p className="text-base font-medium text-gray-600 dark:text-gray-400 mb-1">
                          Posted by: {application.job?.posted_by_id || 'Unknown'}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                          <span className="font-medium">{formatSalary(application.job)}</span>
                          <span>•</span>
                          <span>Applied {formatDistanceToNow(new Date(application.applied_at || ''), { addSuffix: true })}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/jobs/${application.job?.id}`)}
                        className="rounded-xl"
                        disabled={!application.job?.id}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpanded(application.id)}
                        className="rounded-xl"
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
                    <div className="pt-6 border-t border-gray-100 dark:border-gray-800 space-y-6">
                      {application.cover_letter && (
                        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-4">
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                            <div className="w-5 h-5 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                              <span className="text-xs text-blue-600">📝</span>
                            </div>
                            Your Application Message
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                            {application.cover_letter}
                          </p>
                        </div>
                      )}

                      {application.job?.city_id && (
                        <div className="flex items-start gap-3">
                          <div className="w-5 h-5 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mt-0.5">
                            <span className="text-xs text-purple-600">📍</span>
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">Location</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{application.job.exact_location || application.job.city_id}</p>
                          </div>
                        </div>
                      )}

                      {application.job?.description && (
                        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-4">
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                            <div className="w-5 h-5 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                              <span className="text-xs text-green-600">📄</span>
                            </div>
                            Job Description
                          </h4>
                          <div 
                            className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-3 prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{ __html: application.job.description }}
                          />
                        </div>
                      )}

                      {application.client_notes && (
                        <div className="bg-blue-50 dark:bg-blue-950/30 rounded-2xl p-4 border border-blue-200 dark:border-blue-800">
                          <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
                            <div className="w-5 h-5 rounded-lg bg-blue-200 dark:bg-blue-800 flex items-center justify-center">
                              <span className="text-xs text-blue-700">💬</span>
                            </div>
                            Client Notes
                          </h4>
                          <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
                            {application.client_notes}
                          </p>
                        </div>
                      )}

                      {application.applied_at && (
                        <div className="flex items-start gap-3">
                          <div className="w-5 h-5 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mt-0.5">
                            <span className="text-xs text-yellow-600">⏰</span>
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Timeline</h4>
                            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                              <p>Applied: {formatDistanceToNow(new Date(application.applied_at), { addSuffix: true })}</p>
                              {application.updated_at && application.updated_at !== application.applied_at && (
                                <p>Last Updated: {formatDistanceToNow(new Date(application.updated_at), { addSuffix: true })}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
              </div>
            </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
