'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Users, 
  Clock, 
  CheckCircle, 
  Star,
  XCircle, 
  Search, 
  Filter,
  Eye,
  MessageSquare,
  User,
  Calendar,
  MapPin,
  Mail,
  Phone,
  FileText,
  Download,
  MoreHorizontal,
  UserCheck,
  UserX,
  Archive,
  Award,
  Briefcase
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'

interface ApplicationUser {
  id: string
  name: string
  email: string
  username?: string
  avatarUrl?: string
  bio?: string
  skills?: string
  experience?: string
  location?: string
}

interface JobApplication {
  id: string
  jobId: string
  userId: string
  status: 'PENDING' | 'REVIEWED' | 'SHORTLISTED' | 'SELECTED' | 'REJECTED' | 'WITHDRAWN'
  message?: string
  resume?: string
  feedback?: string
  clientNotes?: string
  appliedAt: string
  reviewedAt?: string
  shortlistedAt?: string
  selectedAt?: string
  rejectedAt?: string
  withdrawnAt?: string
  user: ApplicationUser
}

interface ClientApplicationManagerProps {
  jobId: string
  jobTitle: string
  applications: JobApplication[]
  onUpdate: () => void
}

export function ClientApplicationManager({ jobId, jobTitle, applications, onUpdate }: ClientApplicationManagerProps) {
  const [selectedApplications, setSelectedApplications] = useState<string[]>([])
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [bulkAction, setBulkAction] = useState('')
  const [bulkFeedback, setBulkFeedback] = useState('')
  const [bulkNotes, setBulkNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedApp, setSelectedApp] = useState<JobApplication | null>(null)

  // Filter applications based on active tab and filters
  const filteredApplications = applications.filter(app => {
    // Filter by tab
    if (activeTab === 'pending') {
      if (app.status !== 'PENDING') return false
    } else if (activeTab === 'reviewed') {
      if (app.status !== 'REVIEWED') return false
    } else if (activeTab === 'shortlisted') {
      if (app.status !== 'SHORTLISTED') return false
    } else if (activeTab === 'selected') {
      if (app.status !== 'SELECTED') return false
    } else if (activeTab === 'rejected') {
      if (app.status !== 'REJECTED') return false
    }

    // Filter by status
    if (filterStatus !== 'all' && app.status !== filterStatus) return false

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      return (
        app.user.name.toLowerCase().includes(searchLower) ||
        app.user.email.toLowerCase().includes(searchLower) ||
        app.user.skills?.toLowerCase().includes(searchLower) ||
        app.message?.toLowerCase().includes(searchLower)
      )
    }

    return true
  })

  // Get application counts for tabs
  const counts = {
    all: applications.length,
    pending: applications.filter(app => app.status === 'PENDING').length,
    reviewed: applications.filter(app => app.status === 'REVIEWED').length,
    shortlisted: applications.filter(app => app.status === 'SHORTLISTED').length,
    selected: applications.filter(app => app.status === 'SELECTED').length,
    rejected: applications.filter(app => app.status === 'REJECTED').length,
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-500/10 text-yellow-600 border border-yellow-500/20'
      case 'REVIEWED': return 'bg-blue-500/10 text-blue-600 border border-blue-500/20'
      case 'SHORTLISTED': return 'bg-purple-500/10 text-purple-600 border border-purple-500/20'
      case 'SELECTED': return 'bg-green-500/10 text-green-600 border border-green-500/20'
      case 'REJECTED': return 'bg-red-500/10 text-red-600 border border-red-500/20'
      case 'WITHDRAWN': return 'bg-gray-500/10 text-gray-600 border border-gray-500/20'
      default: return 'bg-muted text-muted-foreground border border-border'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="h-4 w-4" />
      case 'REVIEWED': return <Eye className="h-4 w-4" />
      case 'SHORTLISTED': return <Star className="h-4 w-4" />
      case 'SELECTED': return <CheckCircle className="h-4 w-4" />
      case 'REJECTED': return <XCircle className="h-4 w-4" />
      case 'WITHDRAWN': return <Archive className="h-4 w-4" />
      default: return <User className="h-4 w-4" />
    }
  }

  const handleBulkAction = async () => {
    if (!bulkAction || selectedApplications.length === 0) {
      toast.error('Please select applications and choose an action')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/jobs/${jobId}/applications/bulk`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationIds: selectedApplications,
          action: bulkAction,
          feedback: bulkFeedback || undefined,
          clientNotes: bulkNotes || undefined
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update applications')
      }

      const result = await response.json()
      toast.success(`Successfully updated ${result.updated} applications`)
      
      // Reset form
      setSelectedApplications([])
      setBulkAction('')
      setBulkFeedback('')
      setBulkNotes('')
      
      // Refresh applications
      onUpdate()
    } catch (error) {
      toast.error('Failed to update applications')
      console.error('Bulk action error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectAll = () => {
    if (selectedApplications.length === filteredApplications.length) {
      setSelectedApplications([])
    } else {
      setSelectedApplications(filteredApplications.map(app => app.id))
    }
  }

  const formatDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true })
  }

  const handleQuickAction = async (applicationId: string, action: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/jobs/${jobId}/applications/bulk`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationIds: [applicationId],
          action: action
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update application')
      }

      toast.success('Application updated successfully')
      onUpdate()
    } catch (error) {
      toast.error('Failed to update application')
      console.error('Quick action error:', error)
    } finally {
      setLoading(false)
    }
  }

  const renderApplicationCard = (application: JobApplication) => (
    <div key={application.id} className="border rounded-lg p-6 hover:bg-muted/50 transition-colors">
      <div className="flex items-start gap-4">
        {/* Selection checkbox */}
        <Checkbox
          checked={selectedApplications.includes(application.id)}
          onCheckedChange={(checked) => {
            if (checked) {
              setSelectedApplications([...selectedApplications, application.id])
            } else {
              setSelectedApplications(selectedApplications.filter(id => id !== application.id))
            }
          }}
          className="mt-1"
        />

        {/* Avatar */}
        <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
          {application.user.avatarUrl ? (
            <img 
              src={application.user.avatarUrl} 
              alt={application.user.name}
              className="w-14 h-14 rounded-full object-cover"
            />
          ) : (
            <User className="h-7 w-7 text-muted-foreground" />
          )}
        </div>

        {/* Main content */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h4 className="font-semibold text-lg">{application.user.name}</h4>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-3 w-3" />
                {application.user.email}
              </div>
              {application.user.location && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                  <MapPin className="h-3 w-3" />
                  {application.user.location}
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(application.status)}>
                {getStatusIcon(application.status)}
                <span className="ml-1 capitalize">{application.status.toLowerCase()}</span>
              </Badge>
            </div>
          </div>

          {/* User details */}
          {application.user.bio && (
            <div className="mb-3">
              <p className="text-sm font-medium mb-1">About</p>
              <p className="text-sm text-muted-foreground line-clamp-2">{application.user.bio}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            {application.user.skills && (
              <div>
                <p className="text-sm font-medium mb-1 flex items-center gap-1">
                  <Award className="h-3 w-3" />
                  Skills
                </p>
                <p className="text-sm text-muted-foreground">{application.user.skills}</p>
              </div>
            )}

            {application.user.experience && (
              <div>
                <p className="text-sm font-medium mb-1 flex items-center gap-1">
                  <Briefcase className="h-3 w-3" />
                  Experience
                </p>
                <p className="text-sm text-muted-foreground">{application.user.experience}</p>
              </div>
            )}
          </div>

          {/* Application message */}
          {application.message && (
            <div className="bg-muted/50 rounded-md p-3 mb-3">
              <p className="text-sm font-medium mb-1 flex items-center gap-1">
                <FileText className="h-3 w-3" />
                Application Message
              </p>
              <p className="text-sm text-muted-foreground">{application.message}</p>
            </div>
          )}

          {/* Client feedback */}
          {application.feedback && (
            <div className="bg-blue-50 dark:bg-blue-950/20 rounded-md p-3 mb-3">
              <p className="text-sm text-blue-600 dark:text-blue-400 mb-1 font-medium">Your Feedback</p>
              <p className="text-sm text-blue-700 dark:text-blue-300">{application.feedback}</p>
            </div>
          )}

          {/* Client notes */}
          {application.clientNotes && (
            <div className="bg-amber-50 dark:bg-amber-950/20 rounded-md p-3 mb-3">
              <p className="text-sm text-amber-600 dark:text-amber-400 mb-1 font-medium">Private Notes</p>
              <p className="text-sm text-amber-700 dark:text-amber-300">{application.clientNotes}</p>
            </div>
          )}

          {/* Application metadata */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Applied {formatDate(application.appliedAt)}
            </div>
            {application.reviewedAt && (
              <div className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                Reviewed {formatDate(application.reviewedAt)}
              </div>
            )}
            {application.shortlistedAt && (
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3" />
                Shortlisted {formatDate(application.shortlistedAt)}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Quick actions based on status */}
            {application.status === 'PENDING' && (
              <>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleQuickAction(application.id, 'move_to_reviewed')}
                  disabled={loading}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Mark Reviewed
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleQuickAction(application.id, 'shortlist')}
                  disabled={loading}
                >
                  <Star className="h-3 w-3 mr-1" />
                  Shortlist
                </Button>
              </>
            )}
            
            {application.status === 'REVIEWED' && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleQuickAction(application.id, 'shortlist')}
                disabled={loading}
              >
                <Star className="h-3 w-3 mr-1" />
                Add to Shortlist
              </Button>
            )}

            {application.status === 'SHORTLISTED' && (
              <Button 
                variant="default" 
                size="sm"
                onClick={() => handleQuickAction(application.id, 'review')}
                disabled={loading}
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Select Candidate
              </Button>
            )}

            {/* Common actions */}
            <Button variant="outline" size="sm" onClick={() => setSelectedApp(application)}>
              <Eye className="h-3 w-3 mr-1" />
              View Details
            </Button>
            
            <Button variant="outline" size="sm">
              <MessageSquare className="h-3 w-3 mr-1" />
              Message
            </Button>
            
            {application.resume && (
              <Button variant="outline" size="sm">
                <Download className="h-3 w-3 mr-1" />
                Resume
              </Button>
            )}

            {(application.status === 'PENDING' || application.status === 'REVIEWED') && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleQuickAction(application.id, 'reject')}
                disabled={loading}
                className="text-red-600 hover:text-red-700"
              >
                <XCircle className="h-3 w-3 mr-1" />
                Reject
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Applications for "{jobTitle}"
          <Badge variant="secondary">{applications.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search and Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[200px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="REVIEWED">Reviewed</SelectItem>
              <SelectItem value="SHORTLISTED">Shortlisted</SelectItem>
              <SelectItem value="SELECTED">Selected</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Bulk Actions */}
        {selectedApplications.length > 0 && (
          <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
            <CardContent className="pt-4">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">
                    {selectedApplications.length} application{selectedApplications.length > 1 ? 's' : ''} selected
                  </p>
                  <Button variant="outline" size="sm" onClick={() => setSelectedApplications([])}>
                    Clear Selection
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Select value={bulkAction} onValueChange={setBulkAction}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose action" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="move_to_reviewed">Move to Reviewed</SelectItem>
                      <SelectItem value="shortlist">Add to Shortlist</SelectItem>
                      <SelectItem value="reject">Reject Applications</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Input
                    placeholder="Feedback (optional)"
                    value={bulkFeedback}
                    onChange={(e) => setBulkFeedback(e.target.value)}
                  />
                  
                  <Input
                    placeholder="Private notes (optional)"
                    value={bulkNotes}
                    onChange={(e) => setBulkNotes(e.target.value)}
                  />
                  
                  <Button onClick={handleBulkAction} disabled={loading || !bulkAction}>
                    {loading ? 'Processing...' : 'Apply Action'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Application Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all" className="flex items-center gap-1 text-xs">
              All ({counts.all})
            </TabsTrigger>
            <TabsTrigger value="pending" className="flex items-center gap-1 text-xs">
              <Clock className="h-3 w-3" />
              Pending ({counts.pending})
            </TabsTrigger>
            <TabsTrigger value="reviewed" className="flex items-center gap-1 text-xs">
              <Eye className="h-3 w-3" />
              Reviewed ({counts.reviewed})
            </TabsTrigger>
            <TabsTrigger value="shortlisted" className="flex items-center gap-1 text-xs">
              <Star className="h-3 w-3" />
              Shortlisted ({counts.shortlisted})
            </TabsTrigger>
            <TabsTrigger value="selected" className="flex items-center gap-1 text-xs">
              <UserCheck className="h-3 w-3" />
              Selected ({counts.selected})
            </TabsTrigger>
            <TabsTrigger value="rejected" className="flex items-center gap-1 text-xs">
              <UserX className="h-3 w-3" />
              Rejected ({counts.rejected})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {/* Select All */}
            {filteredApplications.length > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <Checkbox
                  checked={selectedApplications.length === filteredApplications.length}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm">
                  Select all {filteredApplications.length} application{filteredApplications.length > 1 ? 's' : ''}
                </span>
              </div>
            )}

            {/* Applications List */}
            {filteredApplications.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No applications found</h3>
                <p className="text-sm text-muted-foreground">
                  {searchTerm || filterStatus !== 'all' 
                    ? 'Try adjusting your search or filters' 
                    : 'No applications have been submitted for this job yet.'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredApplications.map(renderApplicationCard)}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
