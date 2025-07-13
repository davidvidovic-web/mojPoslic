"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarIcon, Clock, MapPin, Video, Phone, Users, Plus, Trash2, CheckCircle, AlertCircle } from 'lucide-react'
import { format, isSameDay, startOfDay } from 'date-fns'
import { toast } from 'sonner'
import { JobApplication } from '@/types/application'

interface Interview {
  id: string
  applicationId: string
  candidateName: string
  candidateEmail: string
  candidateAvatar?: string
  jobTitle: string
  scheduledAt: Date
  duration: number // in minutes
  type: 'video' | 'phone' | 'in_person'
  location?: string
  meetingLink?: string
  notes?: string
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
  interviewers: {
    id: string
    name: string
    email: string
    role: string
  }[]
  reminderSent: boolean
  createdAt: Date
  updatedAt: Date
}

interface InterviewSchedulingProps {
  applications: JobApplication[]
  jobId: string
  onScheduleInterview: (interview: Omit<Interview, 'id' | 'createdAt' | 'updatedAt'>) => void
  onUpdateInterview: (id: string, updates: Partial<Interview>) => void
  onCancelInterview: (id: string) => void
}

const interviewTypes = [
  { value: 'video', label: 'Video Call', icon: Video },
  { value: 'phone', label: 'Phone Call', icon: Phone },
  { value: 'in_person', label: 'In Person', icon: MapPin }
]

const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
]

const statusColors = {
  scheduled: 'bg-blue-100 text-blue-800',
  confirmed: 'bg-green-100 text-green-800',
  completed: 'bg-purple-100 text-purple-800',
  cancelled: 'bg-red-100 text-red-800',
  no_show: 'bg-gray-100 text-gray-800'
}

const statusIcons = {
  scheduled: Clock,
  confirmed: CheckCircle,
  completed: CheckCircle,
  cancelled: AlertCircle,
  no_show: AlertCircle
}

export function InterviewScheduling({ 
  applications, 
  onScheduleInterview, 
  onUpdateInterview, 
  onCancelInterview 
}: InterviewSchedulingProps) {
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null)
  const [view, setView] = useState<'calendar' | 'list'>('calendar')

  // Form state for scheduling interviews
  const [formData, setFormData] = useState({
    date: new Date(),
    time: '10:00',
    duration: 60,
    type: 'video' as Interview['type'],
    location: '',
    meetingLink: '',
    notes: '',
    interviewers: [] as { name: string; email: string; role: string }[]
  })

  const todaysInterviews = interviews.filter(interview => 
    isSameDay(interview.scheduledAt, new Date())
  )

  const selectedDateInterviews = interviews.filter(interview => 
    isSameDay(interview.scheduledAt, selectedDate)
  )

  const upcomingInterviews = interviews.filter(interview => 
    interview.scheduledAt > new Date() && interview.status !== 'cancelled'
  )

  const handleScheduleInterview = () => {
    if (!selectedApplication) return

    const scheduledAt = new Date(selectedDate)
    const [hours, minutes] = formData.time.split(':').map(Number)
    scheduledAt.setHours(hours, minutes, 0, 0)

    const newInterview: Omit<Interview, 'id' | 'createdAt' | 'updatedAt'> = {
      applicationId: selectedApplication.id,
      candidateName: selectedApplication.user?.name || 'Unknown',
      candidateEmail: selectedApplication.user?.email || '',
      candidateAvatar: selectedApplication.user?.avatarUrl,
      jobTitle: selectedApplication.job?.title || 'Unknown Position',
      scheduledAt,
      duration: formData.duration,
      type: formData.type,
      location: formData.location,
      meetingLink: formData.meetingLink,
      notes: formData.notes,
      status: 'scheduled',
      interviewers: formData.interviewers.map((interviewer, index) => ({
        id: `interviewer-${index}`,
        ...interviewer
      })),
      reminderSent: false
    }

    const interview: Interview = {
      ...newInterview,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    }

    setInterviews([...interviews, interview])
    onScheduleInterview(newInterview)
    setIsScheduleModalOpen(false)
    setSelectedApplication(null)
    resetForm()
    toast.success('Interview scheduled successfully')
  }

  const handleUpdateInterviewStatus = (id: string, status: Interview['status']) => {
    const interview = interviews.find(i => i.id === id)
    if (!interview) return

    const updatedInterview = { ...interview, status, updatedAt: new Date() }
    setInterviews(interviews.map(i => i.id === id ? updatedInterview : i))
    onUpdateInterview(id, { status })
    toast.success(`Interview ${status}`)
  }

  const handleCancelInterview = (id: string) => {
    setInterviews(interviews.map(i => 
      i.id === id ? { ...i, status: 'cancelled' as const, updatedAt: new Date() } : i
    ))
    onCancelInterview(id)
    toast.success('Interview cancelled')
  }

  const openScheduleModal = (application: JobApplication) => {
    setSelectedApplication(application)
    setIsScheduleModalOpen(true)
  }

  const resetForm = () => {
    setFormData({
      date: new Date(),
      time: '10:00',
      duration: 60,
      type: 'video',
      location: '',
      meetingLink: '',
      notes: '',
      interviewers: []
    })
  }

  const addInterviewer = () => {
    setFormData({
      ...formData,
      interviewers: [...formData.interviewers, { name: '', email: '', role: '' }]
    })
  }

  const updateInterviewer = (index: number, field: string, value: string) => {
    const updatedInterviewers = formData.interviewers.map((interviewer, i) => 
      i === index ? { ...interviewer, [field]: value } : interviewer
    )
    setFormData({ ...formData, interviewers: updatedInterviewers })
  }

  const removeInterviewer = (index: number) => {
    setFormData({
      ...formData,
      interviewers: formData.interviewers.filter((_, i) => i !== index)
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Interview Scheduling</h2>
          <p className="text-muted-foreground">
            Schedule and manage candidate interviews
          </p>
        </div>
        <div className="flex space-x-2">
          <Select value={view} onValueChange={(value) => setView(value as 'calendar' | 'list')}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="calendar">Calendar</SelectItem>
              <SelectItem value="list">List</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{todaysInterviews.length}</p>
                <p className="text-xs text-muted-foreground">Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CalendarIcon className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{upcomingInterviews.length}</p>
                <p className="text-xs text-muted-foreground">Upcoming</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">
                  {interviews.filter(i => i.status === 'completed').length}
                </p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{applications.length}</p>
                <p className="text-xs text-muted-foreground">Candidates</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Calendar/Schedule View */}
        <div className="lg:col-span-2">
          {view === 'calendar' ? (
            <Card>
              <CardHeader>
                <CardTitle>Calendar View</CardTitle>
                <CardDescription>Select a date to view scheduled interviews</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-4">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    className="rounded-md border"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium mb-3">
                      {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                    </h4>
                    {selectedDateInterviews.length === 0 ? (
                      <p className="text-muted-foreground">No interviews scheduled</p>
                    ) : (
                      <div className="space-y-2">
                        {selectedDateInterviews
                          .sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime())
                          .map((interview) => {
                            const TypeIcon = interviewTypes.find(t => t.value === interview.type)?.icon || Video
                            const StatusIcon = statusIcons[interview.status]
                            
                            return (
                              <Card key={interview.id} className="p-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3">
                                    <Avatar className="h-8 w-8">
                                      <AvatarImage src={interview.candidateAvatar} />
                                      <AvatarFallback>
                                        {interview.candidateName.split(' ').map(n => n[0]).join('')}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <p className="font-medium">{interview.candidateName}</p>
                                      <p className="text-sm text-muted-foreground">
                                        {format(interview.scheduledAt, 'HH:mm')} • {interview.duration}min
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <TypeIcon className="h-4 w-4 text-muted-foreground" />
                                    <Badge className={statusColors[interview.status]} variant="secondary">
                                      <StatusIcon className="mr-1 h-3 w-3" />
                                      {interview.status}
                                    </Badge>
                                  </div>
                                </div>
                              </Card>
                            )
                          })}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>All Interviews</CardTitle>
                <CardDescription>Manage all scheduled interviews</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {interviews.length === 0 ? (
                    <p className="text-muted-foreground">No interviews scheduled</p>
                  ) : (
                    interviews
                      .sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime())
                      .map((interview) => {
                        const TypeIcon = interviewTypes.find(t => t.value === interview.type)?.icon || Video
                        const StatusIcon = statusIcons[interview.status]
                        
                        return (
                          <Card key={interview.id} className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <Avatar>
                                  <AvatarImage src={interview.candidateAvatar} />
                                  <AvatarFallback>
                                    {interview.candidateName.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">{interview.candidateName}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {interview.jobTitle}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {format(interview.scheduledAt, 'MMM d, yyyy • HH:mm')} • {interview.duration}min
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <TypeIcon className="h-4 w-4 text-muted-foreground" />
                                <Badge className={statusColors[interview.status]} variant="secondary">
                                  <StatusIcon className="mr-1 h-3 w-3" />
                                  {interview.status}
                                </Badge>
                                <div className="flex space-x-1">
                                  {interview.status === 'scheduled' && (
                                    <>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleUpdateInterviewStatus(interview.id, 'confirmed')}
                                      >
                                        Confirm
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleCancelInterview(interview.id)}
                                      >
                                        Cancel
                                      </Button>
                                    </>
                                  )}
                                  {interview.status === 'confirmed' && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleUpdateInterviewStatus(interview.id, 'completed')}
                                    >
                                      Mark Complete
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </Card>
                        )
                      })
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Candidates List */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Schedule Interview</CardTitle>
              <CardDescription>Select a candidate to schedule an interview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {applications
                  .filter(app => app.status === 'SHORTLISTED' || app.status === 'REVIEWED')
                  .map((application) => (
                    <div key={application.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={application.user?.avatarUrl} />
                          <AvatarFallback>
                            {application.user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{application.user?.name || 'Unknown'}</p>
                          <p className="text-sm text-muted-foreground">
                            Applied {format(application.createdAt, 'MMM d')}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => openScheduleModal(application)}
                        disabled={interviews.some(i => i.applicationId === application.id && i.status !== 'cancelled')}
                      >
                        {interviews.some(i => i.applicationId === application.id && i.status !== 'cancelled') 
                          ? 'Scheduled' 
                          : 'Schedule'
                        }
                      </Button>
                    </div>
                  ))}
                
                {applications.filter(app => app.status === 'SHORTLISTED' || app.status === 'REVIEWED').length === 0 && (
                  <p className="text-sm text-muted-foreground">No candidates available for scheduling</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Schedule Interview Modal */}
      <Dialog open={isScheduleModalOpen} onOpenChange={setIsScheduleModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Schedule Interview</DialogTitle>
            <DialogDescription>
              Schedule an interview with {selectedApplication?.user?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(formData.date, 'PPP')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.date}
                      onSelect={(date) => date && setFormData({ ...formData, date })}
                      disabled={(date) => date < startOfDay(new Date())}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label>Time</Label>
                <Select value={formData.time} onValueChange={(value) => setFormData({ ...formData, time: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Duration (minutes)</Label>
                <Select 
                  value={formData.duration.toString()} 
                  onValueChange={(value) => setFormData({ ...formData, duration: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="90">1.5 hours</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Interview Type</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value as Interview['type'] })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {interviewTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center">
                          <type.icon className="mr-2 h-4 w-4" />
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.type === 'video' && (
              <div>
                <Label>Meeting Link</Label>
                <Input
                  value={formData.meetingLink}
                  onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                  placeholder="https://zoom.us/j/..."
                />
              </div>
            )}

            {formData.type === 'in_person' && (
              <div>
                <Label>Location</Label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Office address or meeting location"
                />
              </div>
            )}

            <div>
              <Label>Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes or instructions for the interview..."
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <Label>Interviewers</Label>
                <Button type="button" variant="outline" size="sm" onClick={addInterviewer}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Interviewer
                </Button>
              </div>
              <div className="space-y-3">
                {formData.interviewers.map((interviewer, index) => (
                  <div key={index} className="flex space-x-2">
                    <Input
                      placeholder="Name"
                      value={interviewer.name}
                      onChange={(e) => updateInterviewer(index, 'name', e.target.value)}
                    />
                    <Input
                      placeholder="Email"
                      value={interviewer.email}
                      onChange={(e) => updateInterviewer(index, 'email', e.target.value)}
                    />
                    <Input
                      placeholder="Role"
                      value={interviewer.role}
                      onChange={(e) => updateInterviewer(index, 'role', e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeInterviewer(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsScheduleModalOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleScheduleInterview}
                disabled={!selectedApplication || !formData.date || !formData.time}
              >
                Schedule Interview
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
