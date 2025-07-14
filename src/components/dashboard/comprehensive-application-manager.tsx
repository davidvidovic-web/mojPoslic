'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Clock, 
  CheckCircle, 
  Star, 
  XCircle, 
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Search,
  Eye,
  MessageSquare,
  UserCheck,
  UserX,
  Users,
  Briefcase,
  Globe,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'

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
  status: 'PENDING' | 'REVIEWED' | 'SHORTLISTED' | 'SELECTED' | 'REJECTED' | 'WITHDRAWN'
  message?: string
  resume?: string
  clientNotes?: string
  feedback?: string
  appliedAt?: string
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
  jobId: string
  applications: JobApplication[]
  onApplicationUpdate?: (applicationId: string, newStatus: string) => void
  onBulkUpdate?: (applicationIds: string[], action: string, data?: { feedback?: string; clientNotes?: string }) => void
}

export function ApplicationManager({ 
  jobId, 
  applications, 
  onApplicationUpdate, 
  onBulkUpdate 
}: ApplicationManagerProps) {
  const [selectedApplications, setSelectedApplications] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name'>('newest')
  const [expandedApplications, setExpandedApplications] = useState<Set<string>>(new Set())
  const [bulkAction, setBulkAction] = useState<string>('')
  const [feedback, setFeedback] = useState('')
  const [clientNotes, setClientNotes] = useState('')
  const [showBulkDialog, setShowBulkDialog] = useState(false)

  // Filter and sort applications
  const filteredApplications = useMemo(() => {
    let filtered = applications

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(app => 
        app.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.user.skills?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.user.location?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === statusFilter)
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case 'name':
          return a.user.name.localeCompare(b.user.name)
        default:
          return 0
      }
    })

    return filtered
  }, [applications, searchTerm, statusFilter, sortBy])

  // Group applications by status
  const applicationsByStatus = useMemo(() => {
    const groups = {
      PENDING: applications.filter(app => app.status === 'PENDING'),
      REVIEWED: applications.filter(app => app.status === 'REVIEWED'),
      SHORTLISTED: applications.filter(app => app.status === 'SHORTLISTED'),
      SELECTED: applications.filter(app => app.status === 'SELECTED'),
      REJECTED: applications.filter(app => app.status === 'REJECTED')
    }
    return groups
  }, [applications])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-500/10 text-yellow-600 border border-yellow-500/20'
      case 'REVIEWED': return 'bg-blue-500/10 text-blue-600 border border-blue-500/20'
      case 'SHORTLISTED': return 'bg-purple-500/10 text-purple-600 border border-purple-500/20'
      case 'SELECTED': return 'bg-green-500/10 text-green-600 border border-green-500/20'
      case 'REJECTED': return 'bg-red-500/10 text-red-600 border border-red-500/20'
      default: return 'bg-muted text-muted-foreground'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="h-4 w-4" />
      case 'REVIEWED': return <Eye className="h-4 w-4" />
      case 'SHORTLISTED': return <Star className="h-4 w-4" />
      case 'SELECTED': return <CheckCircle className="h-4 w-4" />
      case 'REJECTED': return <XCircle className="h-4 w-4" />
      default: return <User className="h-4 w-4" />
    }
  }

  const getUserRating = (user: User) => {
    if (!user.reviewsReceived || user.reviewsReceived.length === 0) return null
    const avgRating = user.reviewsReceived.reduce((sum, review) => sum + review.rating, 0) / user.reviewsReceived.length
    return Math.round(avgRating * 10) / 10
  }

  const handleSelectApplication = (applicationId: string, checked: boolean) => {
    if (checked) {
      setSelectedApplications(prev => [...prev, applicationId])
    } else {
      setSelectedApplications(prev => prev.filter(id => id !== applicationId))
    }
  }

  const handleSelectAll = (applications: JobApplication[], checked: boolean) => {
    if (checked) {
      const allIds = applications.map(app => app.id)
      setSelectedApplications(prev => [...new Set([...prev, ...allIds])])
    } else {
      const idsToRemove = applications.map(app => app.id)
      setSelectedApplications(prev => prev.filter(id => !idsToRemove.includes(id)))
    }
  }

  const handleSingleAction = async (applicationId: string, action: string) => {
    try {
      const response = await fetch(`/api/jobs/${jobId}/applications/${applicationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      })

      if (response.ok) {
        const data = await response.json()
        toast.success(`Application ${action.toLowerCase()}ed successfully`)
        onApplicationUpdate?.(applicationId, data.application.status)
      } else {
        throw new Error('Failed to update application')
      }
    } catch (error) {
      toast.error('Failed to update application')
      console.error('Error updating application:', error)
    }
  }

  const handleBulkAction = async () => {
    if (selectedApplications.length === 0) {
      toast.error('Please select applications to update')
      return
    }

    if (!bulkAction) {
      toast.error('Please select an action')
      return
    }

    try {
      const response = await fetch(`/api/jobs/${jobId}/applications/bulk`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationIds: selectedApplications,
          action: bulkAction,
          feedback: feedback || undefined,
          clientNotes: clientNotes || undefined
        })
      })

      if (response.ok) {
        const data = await response.json()
        toast.success(`${data.updated} applications updated successfully`)
        onBulkUpdate?.(selectedApplications, bulkAction, { feedback, clientNotes })
        setSelectedApplications([])
        setShowBulkDialog(false)
        setBulkAction('')
        setFeedback('')
        setClientNotes('')
      } else {
        throw new Error('Failed to update applications')
      }
    } catch (error) {
      toast.error('Failed to update applications')
      console.error('Error updating applications:', error)
    }
  }

  const toggleExpanded = (applicationId: string) => {
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

  const ApplicationCard = ({ application }: { application: JobApplication }) => {
    const isExpanded = expandedApplications.has(application.id)
    const isSelected = selectedApplications.includes(application.id)
    const rating = getUserRating(application.user)
    
    return (
      <Card className={`transition-all ${isSelected ? 'ring-2 ring-primary' : ''}`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <Checkbox
              checked={isSelected}
              onCheckedChange={(checked) => handleSelectApplication(application.id, !!checked)}
              className="mt-1"
            />
            
            <Avatar className="h-12 w-12 flex-shrink-0">
              <AvatarImage src={application.user.avatarUrl} />
              <AvatarFallback>
                {application.user.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-semibold text-lg">{application.user.name}</h4>
                  {application.user.position && (
                    <p className="text-sm text-muted-foreground">{application.user.position}</p>
                  )}
                  {rating && (
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{rating}</span>
                      <span className="text-xs text-muted-foreground">
                        ({application.user.reviewsReceived?.length} reviews)
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(application.status)}>
                    {getStatusIcon(application.status)}
                    <span className="ml-1">{application.status}</span>
                  </Badge>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleExpanded(application.id)}
                  >
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                <div className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {application.user.email}
                </div>
                {application.user.phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {application.user.phone}
                  </div>
                )}
                {application.user.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {application.user.location}
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Applied {formatDistanceToNow(new Date(application.createdAt), { addSuffix: true })}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-2 mb-3">
                {application.status === 'PENDING' && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSingleAction(application.id, 'REVIEW')}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Mark Reviewed
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleSingleAction(application.id, 'SHORTLIST')}
                    >
                      <Star className="h-3 w-3 mr-1" />
                      Shortlist
                    </Button>
                  </>
                )}
                
                {(application.status === 'REVIEWED' || application.status === 'SHORTLISTED') && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => handleSingleAction(application.id, 'SELECT')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <UserCheck className="h-3 w-3 mr-1" />
                      Hire
                    </Button>
                    {application.status === 'REVIEWED' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSingleAction(application.id, 'SHORTLIST')}
                      >
                        <Star className="h-3 w-3 mr-1" />
                        Shortlist
                      </Button>
                    )}
                  </>
                )}
                
                {application.status !== 'REJECTED' && application.status !== 'SELECTED' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSingleAction(application.id, 'REJECT')}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <UserX className="h-3 w-3 mr-1" />
                    Reject
                  </Button>
                )}

                <Button size="sm" variant="outline">
                  <MessageSquare className="h-3 w-3 mr-1" />
                  Message
                </Button>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="border-t pt-3 space-y-3">
                  {application.user.bio && (
                    <div>
                      <Label className="text-sm font-medium">Bio</Label>
                      <p className="text-sm text-muted-foreground mt-1">{application.user.bio}</p>
                    </div>
                  )}
                  
                  {application.user.skills && (
                    <div>
                      <Label className="text-sm font-medium">Skills</Label>
                      <p className="text-sm text-muted-foreground mt-1">{application.user.skills}</p>
                    </div>
                  )}
                  
                  {application.user.experience && (
                    <div>
                      <Label className="text-sm font-medium">Experience</Label>
                      <p className="text-sm text-muted-foreground mt-1">{application.user.experience}</p>
                    </div>
                  )}

                  {application.message && (
                    <div>
                      <Label className="text-sm font-medium">Application Message</Label>
                      <p className="text-sm text-muted-foreground mt-1 bg-muted/50 rounded p-2">
                        {application.message}
                      </p>
                    </div>
                  )}

                  {application.clientNotes && (
                    <div>
                      <Label className="text-sm font-medium">Your Notes</Label>
                      <p className="text-sm text-muted-foreground mt-1 bg-blue-50 dark:bg-blue-950/20 rounded p-2">
                        {application.clientNotes}
                      </p>
                    </div>
                  )}

                  {application.feedback && (
                    <div>
                      <Label className="text-sm font-medium">Feedback Given</Label>
                      <p className="text-sm text-muted-foreground mt-1 bg-green-50 dark:bg-green-950/20 rounded p-2">
                        {application.feedback}
                      </p>
                    </div>
                  )}

                  {application.user.website && (
                    <div>
                      <Label className="text-sm font-medium">Website/Portfolio</Label>
                      <a 
                        href={application.user.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline mt-1 flex items-center gap-1"
                      >
                        <Globe className="h-3 w-3" />
                        {application.user.website}
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Application Manager</h2>
          <p className="text-muted-foreground">
            {applications.length} total applications
          </p>
        </div>
        
        {selectedApplications.length > 0 && (
          <Dialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
            <DialogTrigger asChild>
              <Button>
                <Users className="h-4 w-4 mr-2" />
                Bulk Actions ({selectedApplications.length})
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Bulk Update Applications</DialogTitle>
                <DialogDescription>
                  Update {selectedApplications.length} selected applications
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="bulk-action">Action</Label>
                  <Select value={bulkAction} onValueChange={setBulkAction}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select action" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="move_to_reviewed">Mark as Reviewed</SelectItem>
                      <SelectItem value="shortlist">Move to Shortlist</SelectItem>
                      <SelectItem value="reject">Reject Applications</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {(bulkAction === 'reject') && (
                  <div>
                    <Label htmlFor="feedback">Feedback (optional)</Label>
                    <Textarea
                      id="feedback"
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Provide feedback to applicants..."
                    />
                  </div>
                )}
                
                <div>
                  <Label htmlFor="client-notes">Internal Notes (optional)</Label>
                  <Textarea
                    id="client-notes"
                    value={clientNotes}
                    onChange={(e) => setClientNotes(e.target.value)}
                    placeholder="Internal notes for your team..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowBulkDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleBulkAction}>
                  Update Applications
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by name, email, skills, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
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
            
            <Select value={sortBy} onValueChange={setSortBy as (value: string) => void}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="name">Name A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {Object.entries(applicationsByStatus).map(([status, apps]) => (
          <Card key={status}>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{apps.length}</div>
              <div className="text-sm text-muted-foreground capitalize">
                {status.toLowerCase()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Applications Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">All ({applications.length})</TabsTrigger>
          <TabsTrigger value="PENDING">Pending ({applicationsByStatus.PENDING.length})</TabsTrigger>
          <TabsTrigger value="REVIEWED">Reviewed ({applicationsByStatus.REVIEWED.length})</TabsTrigger>
          <TabsTrigger value="SHORTLISTED">Shortlisted ({applicationsByStatus.SHORTLISTED.length})</TabsTrigger>
          <TabsTrigger value="SELECTED">Selected ({applicationsByStatus.SELECTED.length})</TabsTrigger>
          <TabsTrigger value="REJECTED">Rejected ({applicationsByStatus.REJECTED.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="space-y-4">
            {filteredApplications.length > 0 && (
              <div className="flex items-center gap-2 pb-2 border-b">
                <Checkbox
                  checked={filteredApplications.every(app => selectedApplications.includes(app.id))}
                  onCheckedChange={(checked) => handleSelectAll(filteredApplications, !!checked)}
                />
                <span className="text-sm text-muted-foreground">
                  Select all visible applications
                </span>
              </div>
            )}
            
            {filteredApplications.length === 0 ? (
              <div className="text-center py-12">
                <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No applications found</h3>
                <p className="text-sm text-muted-foreground">
                  Try adjusting your search or filter criteria.
                </p>
              </div>
            ) : (
              filteredApplications.map((application) => (
                <ApplicationCard key={application.id} application={application} />
              ))
            )}
          </div>
        </TabsContent>

        {Object.entries(applicationsByStatus).map(([status, statusApps]) => (
          <TabsContent key={status} value={status} className="mt-6">
            <div className="space-y-4">
              {statusApps.length > 0 && (
                <div className="flex items-center gap-2 pb-2 border-b">
                  <Checkbox
                    checked={statusApps.every(app => selectedApplications.includes(app.id))}
                    onCheckedChange={(checked) => handleSelectAll(statusApps, !!checked)}
                  />
                  <span className="text-sm text-muted-foreground">
                    Select all {status.toLowerCase()} applications
                  </span>
                </div>
              )}
              
              {statusApps.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">{getStatusIcon(status)}</div>
                  <h3 className="text-lg font-semibold mb-2">No {status.toLowerCase()} applications</h3>
                  <p className="text-sm text-muted-foreground">
                    Applications with this status will appear here.
                  </p>
                </div>
              ) : (
                statusApps.map((application) => (
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
