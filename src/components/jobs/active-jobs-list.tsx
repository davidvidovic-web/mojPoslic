'use client'

import { useEffect } from 'react'
import { useJobAcceptance, type ActiveJob } from '@/hooks/use-job-acceptance'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { 
  Briefcase, 
  MapPin, 
  Calendar, 
  Clock, 
  DollarSign, 
  User, 
  Mail,
  Building,
  FileText,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { format } from 'date-fns'

function ActiveJobCard({ job }: { job: ActiveJob }) {

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'DECLINED':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <AlertCircle className="h-4 w-4" />
      case 'ACCEPTED':
        return <CheckCircle className="h-4 w-4" />
      default:
        return <Briefcase className="h-4 w-4" />
    }
  }

  const formatSalary = () => {
    if (job.agreedSalary) {
      return `${job.agreedSalary} KM`
    }
    if (job.salary) {
      return job.salary
    }
    if (job.salaryMin && job.salaryMax) {
      return `${job.salaryMin} - ${job.salaryMax} KM`
    }
    return 'Not specified'
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-lg">{job.title}</CardTitle>
            <CardDescription className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              {job.company}
            </CardDescription>
          </div>
          <Badge className={getStatusColor(job.contractStatus)}>
            {getStatusIcon(job.contractStatus)}
            {job.contractStatus}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Job Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Salary:</span>
            <span>{formatSalary()}</span>
          </div>

          {job.startDate && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Start Date:</span>
              <span>{format(new Date(job.startDate), 'MMM dd, yyyy')}</span>
            </div>
          )}

          {job.startTime && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Start Time:</span>
              <span>{job.startTime}</span>
            </div>
          )}

          {job.duration && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Duration:</span>
              <span>{job.duration}</span>
            </div>
          )}

          {job.jobAddress && (
            <div className="flex items-center gap-2 md:col-span-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Location:</span>
              <span>{job.jobAddress}</span>
            </div>
          )}
        </div>

        <Separator />

        {/* Client Information */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Client Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>{job.client.name || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{job.client.email}</span>
            </div>
          </div>
        </div>

        {/* Assignment Details */}
        {(job.notes || job.applicationMessage) && (
          <>
            <Separator />
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Additional Information</h4>
              {job.notes && (
                <div className="text-sm">
                  <p className="font-medium mb-1">Assignment Notes:</p>
                  <p className="text-muted-foreground bg-muted p-2 rounded text-xs">
                    {job.notes}
                  </p>
                </div>
              )}
              {job.applicationMessage && (
                <div className="text-sm">
                  <p className="font-medium mb-1">Your Application Message:</p>
                  <p className="text-muted-foreground bg-muted p-2 rounded text-xs">
                    {job.applicationMessage}
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Timeline */}
        <Separator />
        <div className="space-y-1 text-xs text-muted-foreground">
          <div>Applied: {format(new Date(job.appliedAt), 'MMM dd, yyyy HH:mm')}</div>
          {job.selectedAt && (
            <div>Selected: {format(new Date(job.selectedAt), 'MMM dd, yyyy HH:mm')}</div>
          )}
          <div>Assigned: {format(new Date(job.assignedAt), 'MMM dd, yyyy HH:mm')}</div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.location.href = `/dashboard?jobId=${job.jobId}`}
          >
            <Mail className="h-4 w-4 mr-1" />
            Message Client
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.location.href = `/jobs/${job.jobId}`}
          >
            <FileText className="h-4 w-4 mr-1" />
            View Job Details
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export function ActiveJobsList() {
  const { activeJobs, isLoadingActiveJobs, fetchActiveJobs } = useJobAcceptance()

  useEffect(() => {
    fetchActiveJobs()
  }, [fetchActiveJobs])

  if (isLoadingActiveJobs) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Active Jobs</h2>
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="animate-pulse space-y-2">
                  <div className="h-5 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-muted rounded w-full"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Active Jobs</h2>
          <p className="text-muted-foreground">
            Jobs you&apos;ve been accepted for and are currently working on
          </p>
        </div>
        <Button onClick={fetchActiveJobs} variant="outline" size="sm">
          Refresh
        </Button>
      </div>

      {activeJobs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Active Jobs</h3>
            <p className="text-muted-foreground mb-4">
              You don&apos;t have any active job assignments at the moment.
            </p>
            <Button onClick={() => window.location.href = '/jobs'} variant="outline">
              Browse Available Jobs
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {activeJobs.map((job) => (
            <ActiveJobCard key={job.assignmentId} job={job} />
          ))}
        </div>
      )}
    </div>
  )
}
