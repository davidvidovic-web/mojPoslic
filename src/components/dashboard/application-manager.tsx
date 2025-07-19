'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  Star, 
  XCircle, 
  User,
  Search,
  Filter,
  Eye,
  Users,
  CheckCircle2,
  Clock,
  MoreHorizontal,
  FileText
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ApplicationStatus } from '@prisma/client'

interface User {
  id: string
  name: string
  email: string
  avatarUrl?: string
  phone?: string
  location?: string
  bio?: string
  skills?: string
  experience?: string
  position?: string
  website?: string
  createdAt: string
  reviewsReceived?: { rating: number }[]
}

interface JobApplication {
  id: string
  status: ApplicationStatus
  message?: string
  resume?: string
  clientNotes?: string
  feedback?: string
  appliedAt: string
  reviewedAt?: string
  shortlistedAt?: string
  selectedAt?: string
  rejectedAt?: string
  withdrawnAt?: string
  createdAt: string
  updatedAt: string
  user: User
}

interface ApplicationManagerProps {
  jobTitle: string
  applications: JobApplication[]
  onApplicationUpdate: (applicationId: string, status: ApplicationStatus) => void
  onBulkStatusUpdate: (applicationIds: string[], status: ApplicationStatus) => void
}

export default function ApplicationManager({ 
  jobTitle,
  applications, 
  onApplicationUpdate, 
  onBulkStatusUpdate 
}: ApplicationManagerProps) {
  const [activeTab, setActiveTab] = useState('all')
  const [selectedApplications, setSelectedApplications] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [bulkFeedback, setBulkFeedback] = useState('')
  const [bulkNotes, setBulkNotes] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Mock bulk action mutation - this should be replaced with actual implementation
  const bulkActionMutation = {
    mutateAsync: async (data: { applicationIds: string[], status: ApplicationStatus }) => {
      setIsLoading(true)
      try {
        await onBulkStatusUpdate(data.applicationIds, data.status)
      } finally {
        setIsLoading(false)
      }
    },
    isPending: isLoading
  }

  // Use passed applications prop only, remove data fetching
  // const { data: fetchedApplications = [], isLoading } = useJobApplications(jobId, {
  //   search: searchQuery || undefined
  // })

  // const bulkActionMutation = useBulkApplicationActions()

  // Use either prop applications or fetched applications
  const allApplications = applications || []

  // Filter applications by status
  const filteredApplications = allApplications.filter(app => {
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
    all: allApplications.length,
    pending: allApplications.filter(app => app.status === ApplicationStatus.PENDING).length,
    reviewed: allApplications.filter(app => app.status === ApplicationStatus.REVIEWED).length,
    shortlisted: allApplications.filter(app => app.status === ApplicationStatus.SHORTLISTED).length,
    selected: allApplications.filter(app => app.status === ApplicationStatus.SELECTED).length,
    rejected: allApplications.filter(app => app.status === ApplicationStatus.REJECTED).length,
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
    if (!status) return

    try {
      await bulkActionMutation.mutateAsync({
        applicationIds: selectedApplications,
        status
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
      [ApplicationStatus.WITHDRAWN]: 'bg-gray-100 text-gray-800',
    }
    
    return (
      <Badge className={colors[status]}>
        {status.toLowerCase()}
      </Badge>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading applications...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Applications for {jobTitle}
            </div>
            <Badge variant="outline">{counts.all} total</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="all" className="flex items-center gap-2">
                All
                <Badge variant="secondary">{counts.all}</Badge>
              </TabsTrigger>
              <TabsTrigger value="pending" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Pending
                <Badge variant="secondary">{counts.pending}</Badge>
              </TabsTrigger>
              <TabsTrigger value="reviewed" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Reviewed
                <Badge variant="secondary">{counts.reviewed}</Badge>
              </TabsTrigger>
              <TabsTrigger value="shortlisted" className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                Shortlisted
                <Badge variant="secondary">{counts.shortlisted}</Badge>
              </TabsTrigger>
              <TabsTrigger value="selected" className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Selected
                <Badge variant="secondary">{counts.selected}</Badge>
              </TabsTrigger>
              <TabsTrigger value="rejected" className="flex items-center gap-2">
                <XCircle className="h-4 w-4" />
                Rejected
                <Badge variant="secondary">{counts.rejected}</Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6 space-y-4">
              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search applications..."
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

              {/* Bulk Actions */}
              {selectedApplications.length > 0 && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600">
                        {selectedApplications.length} application(s) selected
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Bulk Feedback</label>
                          <Textarea
                            placeholder="Enter feedback for selected applications..."
                            value={bulkFeedback}
                            onChange={(e) => setBulkFeedback(e.target.value)}
                            rows={2}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Client Notes</label>
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
                          onClick={() => handleBulkAction('move_to_reviewed', ApplicationStatus.REVIEWED)}
                          disabled={bulkActionMutation.isPending}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Mark as Reviewed
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleBulkAction('shortlist', ApplicationStatus.SHORTLISTED)}
                          disabled={bulkActionMutation.isPending}
                        >
                          <Star className="h-4 w-4 mr-1" />
                          Add to Shortlist
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleBulkAction('reject', ApplicationStatus.REJECTED)}
                          disabled={bulkActionMutation.isPending}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Applications List */}
              {filteredApplications.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No applications</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    No applications found for the current filter.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Select All */}
                  <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg">
                    <Checkbox
                      checked={selectedApplications.length === filteredApplications.length && filteredApplications.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                    <span className="text-sm font-medium">
                      Select all ({filteredApplications.length})
                    </span>
                  </div>

                  {filteredApplications.map((application) => (
                    <Card key={application.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <Checkbox
                            checked={selectedApplications.includes(application.id)}
                            onCheckedChange={(checked) => 
                              handleSelectApplication(application.id, checked as boolean)
                            }
                          />
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                  <User className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                  <h3 className="font-medium text-gray-900">{application.user.name}</h3>
                                  <p className="text-sm text-gray-500">{application.user.email}</p>
                                  {application.user.location && (
                                    <p className="text-sm text-gray-500">{application.user.location}</p>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                {getStatusBadge(application.status)}
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>

                            {application.message && (
                              <div className="mt-3">
                                <p className="text-sm text-gray-600 line-clamp-2">
                                  {application.message}
                                </p>
                              </div>
                            )}

                            <div className="flex items-center justify-between mt-4">
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span>Applied {formatDistanceToNow(new Date(application.appliedAt))} ago</span>
                                {application.resume && (
                                  <span className="flex items-center gap-1">
                                    <FileText className="h-3 w-3" />
                                    Resume attached
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => onApplicationUpdate(application.id, ApplicationStatus.REVIEWED)}
                                >
                                  <CheckCircle2 className="h-4 w-4 mr-1" />
                                  Review
                                </Button>
                              </div>
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
    </div>
  )
}
