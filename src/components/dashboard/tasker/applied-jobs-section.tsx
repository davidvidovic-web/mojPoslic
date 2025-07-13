'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Clock, 
  CheckCircle, 
  Briefcase, 
  XCircle, 
  Search, 
  Star,
  MapPin,
  Calendar,
  User,
  MessageSquare,
  Eye
} from 'lucide-react'
import { Job } from '@/types/job'
import { formatClientName } from '@/lib/job-utils'
import Link from 'next/link'

interface JobApplication {
  id: string
  job_id: string
  applied_at: string
  status: 'PENDING' | 'REVIEWED' | 'SHORTLISTED' | 'SELECTED' | 'REJECTED' | 'WITHDRAWN'
  job: Job
  message?: string
  feedback?: string
}

interface AppliedJobsSectionProps {
  applications: JobApplication[]
}

export function AppliedJobsSection({ applications }: AppliedJobsSectionProps) {
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
      case 'WITHDRAWN': return <XCircle className="h-4 w-4" />
      default: return <Briefcase className="h-4 w-4" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  // Separate applications into categories
  const appliedJobs = applications.filter(app => 
    ['PENDING', 'REVIEWED', 'REJECTED', 'WITHDRAWN'].includes(app.status)
  )
  
  const activeJobs = applications.filter(app => 
    ['SHORTLISTED', 'SELECTED'].includes(app.status)
  )

  const renderJobCard = (application: JobApplication) => (
    <div key={application.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <h4 className="font-semibold text-lg mb-1">
                <Link 
                  href={`/jobs/${application.job.id}`}
                  className="hover:text-primary transition-colors"
                >
                  {application.job.title}
                </Link>
              </h4>
              <p className="text-muted-foreground text-sm mb-2">
                {formatClientName(application.job.company)}
              </p>
              
              {/* Job details */}
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-3">
                {application.job.city && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {application.job.city.name || application.job.city.name_en}
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Applied {formatDate(application.applied_at)}
                </div>
                {application.job.salary && (
                  <div className="font-medium text-foreground">
                    {application.job.salary}
                  </div>
                )}
              </div>

              {/* Application message preview */}
              {application.message && (
                <div className="bg-muted/50 rounded-md p-3 mb-3">
                  <p className="text-sm text-muted-foreground mb-1">Your application message:</p>
                  <p className="text-sm line-clamp-2">{application.message}</p>
                </div>
              )}

              {/* Client feedback */}
              {application.feedback && (
                <div className="bg-blue-50 dark:bg-blue-950/20 rounded-md p-3 mb-3">
                  <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">Client feedback:</p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">{application.feedback}</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-2 ml-4">
          <Badge className={getStatusColor(application.status)}>
            {getStatusIcon(application.status)}
            <span className="ml-1 capitalize">{application.status}</span>
          </Badge>
          
          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/jobs/${application.job.id}`}>
                <Eye className="h-3 w-3 mr-1" />
                View Job
              </Link>
            </Button>
            
            {(application.status === 'SHORTLISTED' || application.status === 'SELECTED') && (
              <Button variant="outline" size="sm">
                <MessageSquare className="h-3 w-3 mr-1" />
                Message
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  const renderEmptyState = (type: 'applied' | 'active') => (
    <div className="text-center py-12">
      <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-lg font-semibold mb-2">
        {type === 'applied' ? 'No applications yet' : 'No active jobs'}
      </h3>
      <p className="text-sm text-muted-foreground mb-4">
        {type === 'applied' 
          ? 'Start applying to jobs to track your applications here.'
          : 'Once clients accept your applications, those jobs will appear here.'
        }
      </p>
      {type === 'applied' && (
        <Link href="/">
          <Button>
            <Search className="h-4 w-4 mr-2" />
            Find Jobs
          </Button>
        </Link>
      )}
    </div>
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          My Job Applications
          <Badge variant="secondary">{applications.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="applied" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="applied" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Applied Jobs ({appliedJobs.length})
            </TabsTrigger>
            <TabsTrigger value="active" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              Active Jobs ({activeJobs.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="applied" className="mt-6">
            {appliedJobs.length === 0 ? (
              renderEmptyState('applied')
            ) : (
              <div className="space-y-4">
                {appliedJobs.map(renderJobCard)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="active" className="mt-6">
            {activeJobs.length === 0 ? (
              renderEmptyState('active')
            ) : (
              <div className="space-y-4">
                {activeJobs.map(renderJobCard)}
                
                {/* Success message for active jobs */}
                {activeJobs.length > 0 && (
                  <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4 mt-6">
                    <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-medium">Congratulations!</span>
                    </div>
                    <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                      You have {activeJobs.length} active job{activeJobs.length > 1 ? 's' : ''} where clients have accepted your application. 
                      Keep checking for updates and respond promptly to messages.
                    </p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
