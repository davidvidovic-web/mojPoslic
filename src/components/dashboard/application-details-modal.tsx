'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  FileText, 
  Download,
  MessageSquare,
  Star,
  CheckCircle2,
  XCircle,
  Eye
} from 'lucide-react'
import { JobApplication, ApplicationStatus } from '@/types/application'
import { useUpdateApplicationStatus } from '@/hooks/use-applications'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'

interface ApplicationDetailsModalProps {
  application: JobApplication | null
  isOpen: boolean
  onClose: () => void
  onMessage?: (userId: string) => void
}

export function ApplicationDetailsModal({ 
  application, 
  isOpen, 
  onClose,
  onMessage 
}: ApplicationDetailsModalProps) {
  const [feedback, setFeedback] = useState('')
  const [clientNotes, setClientNotes] = useState(application?.clientNotes || '')
  const [activeTab, setActiveTab] = useState('profile')

  const updateStatusMutation = useUpdateApplicationStatus()

  if (!application) return null

  const handleStatusUpdate = async (status: ApplicationStatus, includeFeedback = false) => {
    try {
      await updateStatusMutation.mutateAsync({
        applicationId: application.id,
        status,
        feedback: includeFeedback ? feedback : undefined,
        clientNotes: clientNotes || undefined
      })
      
      toast.success(`Application ${status.toLowerCase()} successfully`)
      if (includeFeedback) setFeedback('')
    } catch (error) {
      console.error('Failed to update application status:', error)
    }
  }

  const getStatusColor = (status: ApplicationStatus) => {
    const colors = {
      [ApplicationStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
      [ApplicationStatus.REVIEWED]: 'bg-blue-100 text-blue-800',
      [ApplicationStatus.SHORTLISTED]: 'bg-purple-100 text-purple-800',
      [ApplicationStatus.SELECTED]: 'bg-green-100 text-green-800',
      [ApplicationStatus.REJECTED]: 'bg-red-100 text-red-800',
      [ApplicationStatus.WITHDRAWN]: 'bg-gray-100 text-gray-800'
    }
    return colors[status]
  }

  const downloadResume = () => {
    if (application.resume) {
      // Implementation for resume download
      window.open(application.resume, '_blank')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={application.user?.avatarUrl} />
                <AvatarFallback>
                  {application.user?.name?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-semibold">{application.user?.name || 'Unknown User'}</h2>
                <p className="text-sm text-muted-foreground">
                  Applied for {application.job?.title}
                </p>
              </div>
            </DialogTitle>
            <Badge className={getStatusColor(application.status)}>
              {application.status.toLowerCase()}
            </Badge>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="application">Application</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{application.user?.email}</span>
                  </div>
                  {application.user?.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{application.user.phone}</span>
                    </div>
                  )}
                  {application.user?.location && (
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{application.user.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      Applied {formatDistanceToNow(new Date(application.appliedAt))} ago
                    </span>
                  </div>
                </div>

                {application.user?.bio && (
                  <div>
                    <Label className="text-sm font-medium">Bio</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {application.user.bio}
                    </p>
                  </div>
                )}

                {application.user?.skills && (
                  <div>
                    <Label className="text-sm font-medium">Skills</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {application.user.skills}
                    </p>
                  </div>
                )}

                {application.user?.experience && (
                  <div>
                    <Label className="text-sm font-medium">Experience</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {application.user.experience}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="application" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Cover Letter
                </CardTitle>
              </CardHeader>
              <CardContent>
                {application.message ? (
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{application.message}</p>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No cover letter provided</p>
                )}
              </CardContent>
            </Card>

            {application.resume && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Resume
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-blue-600" />
                      <div>
                        <p className="font-medium">Resume.pdf</p>
                        <p className="text-sm text-muted-foreground">Click to download</p>
                      </div>
                    </div>
                    <Button onClick={downloadResume} variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Internal Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Add internal notes about this candidate..."
                  value={clientNotes}
                  onChange={(e) => setClientNotes(e.target.value)}
                  rows={4}
                />
                <Button 
                  onClick={() => handleStatusUpdate(application.status)}
                  className="mt-2"
                  size="sm"
                  disabled={updateStatusMutation.isPending}
                >
                  Save Notes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timeline" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Application Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                    <div>
                      <p className="font-medium text-sm">Application Submitted</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(application.appliedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {application.reviewedAt && (
                    <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                      <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                      <div>
                        <p className="font-medium text-sm">Application Reviewed</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(application.reviewedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}

                  {application.shortlistedAt && (
                    <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                      <div className="w-3 h-3 bg-yellow-600 rounded-full"></div>
                      <div>
                        <p className="font-medium text-sm">Added to Shortlist</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(application.shortlistedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}

                  {application.selectedAt && (
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                      <div>
                        <p className="font-medium text-sm">Selected for Position</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(application.selectedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}

                  {application.rejectedAt && (
                    <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                      <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                      <div>
                        <p className="font-medium text-sm">Application Rejected</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(application.rejectedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="actions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Application Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-3">
                  {application.status === ApplicationStatus.PENDING && (
                    <>
                      <Button
                        onClick={() => handleStatusUpdate(ApplicationStatus.REVIEWED)}
                        disabled={updateStatusMutation.isPending}
                        className="w-full"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Mark as Reviewed
                      </Button>
                      <Button
                        onClick={() => handleStatusUpdate(ApplicationStatus.SHORTLISTED)}
                        disabled={updateStatusMutation.isPending}
                        variant="outline"
                        className="w-full"
                      >
                        <Star className="h-4 w-4 mr-2" />
                        Add to Shortlist
                      </Button>
                    </>
                  )}

                  {application.status === ApplicationStatus.REVIEWED && (
                    <Button
                      onClick={() => handleStatusUpdate(ApplicationStatus.SHORTLISTED)}
                      disabled={updateStatusMutation.isPending}
                      className="w-full"
                    >
                      <Star className="h-4 w-4 mr-2" />
                      Add to Shortlist
                    </Button>
                  )}

                  {application.status === ApplicationStatus.SHORTLISTED && (
                    <Button
                      onClick={() => handleStatusUpdate(ApplicationStatus.SELECTED)}
                      disabled={updateStatusMutation.isPending}
                      className="w-full"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Select Candidate
                    </Button>
                  )}

                  {onMessage && (
                    <Button
                      onClick={() => onMessage(application.user?.id || '')}
                      variant="outline"
                      className="w-full"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Send Message
                    </Button>
                  )}
                </div>

                {/* Rejection with Feedback */}
                {application.status !== ApplicationStatus.REJECTED && 
                 application.status !== ApplicationStatus.SELECTED && (
                  <div className="space-y-3 pt-4 border-t">
                    <Label>Rejection Feedback (optional)</Label>
                    <Textarea
                      placeholder="Provide feedback for the candidate..."
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      rows={3}
                    />
                    <Button
                      onClick={() => handleStatusUpdate(ApplicationStatus.REJECTED, true)}
                      disabled={updateStatusMutation.isPending}
                      variant="destructive"
                      className="w-full"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject Application
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
