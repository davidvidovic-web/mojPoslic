'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  useJobApplications, 
  useBulkApplicationActions
} from '@/hooks/use-applications'
import { ApplicationStatus, JobApplication } from '@/types/application'
import { 
  Users, 
  Search, 
  Eye, 
  MessageSquare, 
  Star, 
  CheckCircle2,
  XCircle,
  Filter
} from 'lucide-react'
// import { ApplicationDetailsModal } from './application-details-modal'
import { formatDistanceToNow } from 'date-fns'

interface ApplicationManagerProps {
  jobId: string
  jobTitle: string
}

export function ApplicationManager({ jobId, jobTitle }: ApplicationManagerProps) {
  const [activeTab, setActiveTab] = useState('all')
  const [selectedApplications, setSelectedApplications] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null)
  const [bulkFeedback, setBulkFeedback] = useState('')
  const [bulkNotes, setBulkNotes] = useState('')

  const { data: applications = [], isLoading } = useJobApplications(jobId, {
    search: searchQuery || undefined
  })

  const bulkActionMutation = useBulkApplicationActions()

  // Filter applications by status
  const filteredApplications = applications.filter(app => {
    if (activeTab === 'all') return true
    if (activeTab === 'pending') return app.status === ApplicationStatus.PENDING
    if (activeTab === 'reviewed') return app.status === ApplicationStatus.REVIEWED
    if (activeTab === 'shortlisted') return app.status === ApplicationStatus.SHORTLISTED
    if (activeTab === 'selected') return app.status === ApplicationStatus.SELECTED
    if (activeTab === 'rejected') return app.status === ApplicationStatus.REJECTED
    return true
  })

  // Calculate application counts by status
  const counts = {
    all: applications.length,
    pending: applications.filter(app => app.status === ApplicationStatus.PENDING).length,
    reviewed: applications.filter(app => app.status === ApplicationStatus.REVIEWED).length,
    shortlisted: applications.filter(app => app.status === ApplicationStatus.SHORTLISTED).length,
    selected: applications.filter(app => app.status === ApplicationStatus.SELECTED).length,
    rejected: applications.filter(app => app.status === ApplicationStatus.REJECTED).length,
  }

  const handleSelectApplication = (applicationId: string, checked: boolean) => {
    if (checked) {
      setSelectedApplications(prev => [...prev, applicationId])
    } else {
      setSelectedApplications(prev => prev.filter(id => id !== applicationId))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedApplications(filteredApplications.map(app => app.id))
    } else {
      setSelectedApplications([])
    }
  }

  const handleBulkAction = async (action: string, status?: ApplicationStatus) => {
    if (selectedApplications.length === 0) return

    try {
      await bulkActionMutation.mutateAsync({
        jobId,
        applicationIds: selectedApplications,
        action: action as 'review' | 'shortlist' | 'reject' | 'move_to_reviewed',
        status,
        feedback: bulkFeedback || undefined,
        clientNotes: bulkNotes || undefined
      })

      // Clear selections and feedback
      setSelectedApplications([])
      setBulkFeedback('')
      setBulkNotes('')
    } catch (error) {
      console.error('Bulk action error:', error)
    }
  }

  const getStatusBadge = (status: ApplicationStatus) => {
    const colors = {
      [ApplicationStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
      [ApplicationStatus.REVIEWED]: 'bg-blue-100 text-blue-800',
      [ApplicationStatus.SHORTLISTED]: 'bg-purple-100 text-purple-800',
      [ApplicationStatus.SELECTED]: 'bg-green-100 text-green-800',
      [ApplicationStatus.REJECTED]: 'bg-red-100 text-red-800',
      [ApplicationStatus.WITHDRAWN]: 'bg-gray-100 text-gray-800'
    }

    return (
      <Badge className={colors[status]}>
        {status.toLowerCase()}
      </Badge>
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Applications for {jobTitle}
            </CardTitle>
            <Badge variant="outline">
              {applications.length} total applications
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search applicants..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Tabs for different statuses */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({counts.pending})</TabsTrigger>
              <TabsTrigger value="reviewed">Reviewed ({counts.reviewed})</TabsTrigger>
              <TabsTrigger value="shortlisted">Shortlisted ({counts.shortlisted})</TabsTrigger>
              <TabsTrigger value="selected">Selected ({counts.selected})</TabsTrigger>
              <TabsTrigger value="rejected">Rejected ({counts.rejected})</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              {/* Bulk Actions */}
              {selectedApplications.length > 0 && (
                <Card className="mb-4 border-blue-200 bg-blue-50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="font-medium">
                        {selectedApplications.length} applications selected
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedApplications([])}
                      >
                        Clear selection
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="text-sm font-medium mb-1 block">
                          Feedback (optional)
                        </label>
                        <Textarea
                          placeholder="Add feedback for applicants..."
                          value={bulkFeedback}
                          onChange={(e) => setBulkFeedback(e.target.value)}
                          rows={2}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">
                          Internal Notes (optional)
                        </label>
                        <Textarea
                          placeholder="Add internal notes..."
                          value={bulkNotes}
                          onChange={(e) => setBulkNotes(e.target.value)}
                          rows={2}
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleBulkAction('move_to_reviewed')}
                        disabled={bulkActionMutation.isPending}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Mark as Reviewed
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleBulkAction('shortlist')}
                        disabled={bulkActionMutation.isPending}
                      >
                        <Star className="h-4 w-4 mr-1" />
                        Add to Shortlist
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleBulkAction('reject')}
                        disabled={bulkActionMutation.isPending}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Applications List */}
              {filteredApplications.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    {searchQuery 
                      ? 'No applications match your search'
                      : activeTab === 'all' 
                        ? 'No applications yet'
                        : `No ${activeTab} applications`
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Select All */}
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Checkbox
                      checked={
                        filteredApplications.length > 0 && 
                        selectedApplications.length === filteredApplications.length
                      }
                      onCheckedChange={handleSelectAll}
                    />
                    <span className="text-sm font-medium">
                      Select all {filteredApplications.length} applications
                    </span>
                  </div>

                  {/* Application Items */}
                  {filteredApplications.map((application) => (
                    <Card key={application.id} className="border border-gray-200">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <Checkbox
                            checked={selectedApplications.includes(application.id)}
                            onCheckedChange={(checked) => 
                              handleSelectApplication(application.id, checked as boolean)
                            }
                            className="mt-1"
                          />

                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-semibold text-lg">
                                  {application.user?.name}
                                </h3>
                                <p className="text-gray-600 text-sm">
                                  {application.user?.email}
                                </p>
                                {application.user?.location && (
                                  <p className="text-gray-500 text-sm">
                                    📍 {application.user.location}
                                  </p>
                                )}
                              </div>
                              <div className="text-right">
                                {getStatusBadge(application.status)}
                                <p className="text-xs text-gray-500 mt-1">
                                  Applied {formatDistanceToNow(new Date(application.appliedAt))} ago
                                </p>
                              </div>
                            </div>

                            {application.message && (
                              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm line-clamp-3">
                                  {application.message}
                                </p>
                              </div>
                            )}

                            {application.user?.skills && (
                              <div className="mt-3">
                                <p className="text-xs text-gray-500 mb-1">Skills:</p>
                                <p className="text-sm text-gray-700 line-clamp-2">
                                  {application.user.skills}
                                </p>
                              </div>
                            )}

                            <div className="flex items-center gap-2 mt-4">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedApplication(application)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View Details
                              </Button>
                              <Button size="sm" variant="outline">
                                <MessageSquare className="h-4 w-4 mr-1" />
                                Message
                              </Button>
                              {application.status === ApplicationStatus.PENDING && (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() => handleBulkAction('move_to_reviewed', ApplicationStatus.REVIEWED)}
                                  >
                                    <CheckCircle2 className="h-4 w-4 mr-1" />
                                    Review
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleBulkAction('shortlist')}
                                  >
                                    <Star className="h-4 w-4 mr-1" />
                                    Shortlist
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Application Details Modal */}
      {selectedApplication && (
        <div>
          {/* TODO: Implement ApplicationDetailsModal */}
          <p>Application details modal for {selectedApplication.user?.name}</p>
        </div>
      )}
    </div>
  )
}
