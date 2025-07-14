'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, Clock, CheckCircle, Briefcase, XCircle, Search } from 'lucide-react'
import { Job } from '@/types/job'
import { formatClientName } from '@/lib/job-utils'
import Link from 'next/link'

interface JobApplication {
  id: string
  job_id: string
  appliedAt: string
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected' | 'completed'
  job: Job
}

interface ApplicationsSectionProps {
  applications: JobApplication[]
}

export function ApplicationsSection({ applications }: ApplicationsSectionProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/10 text-yellow-600 border border-yellow-500/20'
      case 'reviewed': return 'bg-blue-500/10 text-blue-600 border border-blue-500/20'
      case 'accepted': return 'bg-green-500/10 text-green-600 border border-green-500/20'
      case 'completed': return 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
      case 'rejected': return 'bg-red-500/10 text-red-600 border border-red-500/20'
      default: return 'bg-muted text-muted-foreground border border-border'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />
      case 'accepted': return <Briefcase className="h-4 w-4" />
      case 'completed': return <CheckCircle className="h-4 w-4" />
      case 'rejected': return <XCircle className="h-4 w-4" />
      default: return <TrendingUp className="h-4 w-4" />
    }
  }

  // Filter to only show active applications (pending, reviewed, accepted)
  const activeApplications = applications.filter(app => 
    app.status === 'pending' || app.status === 'reviewed' || app.status === 'accepted'
  )

  const renderApplicationList = (apps: JobApplication[]) => {
    if (apps.length === 0) {
      return (
        <div className="text-center py-8">
          <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold">No active applications</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Start applying to jobs to track your progress here.
          </p>
          <Link href="/">
            <Button>
              <Search className="h-4 w-4 mr-2" />
              Find Jobs
            </Button>
          </Link>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {apps.map((application) => (
          <div key={application.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h4 className="font-semibold flex items-center gap-2">
                  {getStatusIcon(application.status)}
                  {application.job.title}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {formatClientName(application.job.company)}
                </p>
                {application.job.city && (
                  <p className="text-xs text-muted-foreground">
                    {application.job.city.name}
                  </p>
                )}
              </div>
              <Badge className={getStatusColor(application.status)}>
                {application.status === 'pending' ? 'Pending Review' : 
                 application.status === 'reviewed' ? 'Under Review' :
                 application.status === 'accepted' ? 'Active' :
                 application.status}
              </Badge>
            </div>
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span>Applied {formatDate(application.appliedAt)}</span>
              {(application.job.salaryMin || application.job.salary) && (
                <span className="text-foreground font-medium">
                  {application.job.salary || 
                   (application.job.salaryMin && application.job.salaryMax 
                     ? `${application.job.salaryMin}-${application.job.salaryMax} BAM`
                     : `${application.job.salaryMin} BAM`)}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <TrendingUp className="h-5 w-5 mr-2" />
          Active Applications
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {renderApplicationList(activeApplications)}
      </CardContent>
    </Card>
  )
}
