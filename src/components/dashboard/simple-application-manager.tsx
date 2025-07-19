'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Star, XCircle, User, Eye, MessageSquare } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface User {
  id: string
  name: string
  email: string
}

interface JobApplication {
  id: string
  status: string
  appliedAt?: string
  user: User
}

interface ApplicationManagerProps {
  applications: JobApplication[]
  onApplicationUpdate?: (applicationId: string, newStatus: string) => void
}

export function ApplicationManager({ 
  applications = [],
  onApplicationUpdate
}: ApplicationManagerProps) {
  const [activeTab, setActiveTab] = useState('all')

  // Filter applications by status
  const filteredApplications = applications.filter(app => {
    if (activeTab === 'all') return true
    if (activeTab === 'pending') return app.status === 'PENDING'
    if (activeTab === 'reviewed') return app.status === 'REVIEWED'
    if (activeTab === 'shortlisted') return app.status === 'SHORTLISTED'
    if (activeTab === 'selected') return app.status === 'SELECTED'
    if (activeTab === 'rejected') return app.status === 'REJECTED'
    return true
  })

  // Calculate application counts by status
  const counts = {
    all: applications.length,
    pending: applications.filter(app => app.status === 'PENDING').length,
    reviewed: applications.filter(app => app.status === 'REVIEWED').length,
    shortlisted: applications.filter(app => app.status === 'SHORTLISTED').length,
    selected: applications.filter(app => app.status === 'SELECTED').length,
    rejected: applications.filter(app => app.status === 'REJECTED').length,
  }

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'REVIEWED': 'bg-blue-100 text-blue-800',
      'SHORTLISTED': 'bg-purple-100 text-purple-800',
      'SELECTED': 'bg-green-100 text-green-800',
      'REJECTED': 'bg-red-100 text-red-800',
      'WITHDRAWN': 'bg-gray-100 text-gray-800'
    }

    return (
      <Badge className={statusClasses[status as keyof typeof statusClasses] || 'bg-gray-100 text-gray-800'}>
        {status}
      </Badge>
    )
  }

  const handleStatusUpdate = (applicationId: string, newStatus: string) => {
    if (onApplicationUpdate) {
      onApplicationUpdate(applicationId, newStatus)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Job Applications</CardTitle>
        </CardHeader>
        <CardContent>
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
              <div className="space-y-4">
                {filteredApplications.length === 0 ? (
                  <div className="text-center py-8">
                    <User className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600">No applications found for this status.</p>
                  </div>
                ) : (
                  filteredApplications.map((application) => (
                    <Card key={application.id} className="border border-gray-200">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <Avatar>
                              <AvatarFallback>
                                {application.user.name?.split(' ').map(n => n[0]).join('') || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-medium">{application.user.name}</h3>
                              <p className="text-sm text-gray-600">{application.user.email}</p>
                              {application.appliedAt && (
                                <p className="text-xs text-gray-500">
                                  Applied {formatDistanceToNow(new Date(application.appliedAt))} ago
                                </p>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {getStatusBadge(application.status)}
                            
                            <div className="flex space-x-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {/* View application details */}}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              
                              <Button
                                variant="outline"
                                size="sm"
                              >
                                <MessageSquare className="h-4 w-4" />
                              </Button>

                              {application.status === 'PENDING' && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleStatusUpdate(application.id, 'REVIEWED')}
                                  >
                                    <Star className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleStatusUpdate(application.id, 'REJECTED')}
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
