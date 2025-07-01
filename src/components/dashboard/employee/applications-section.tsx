'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp } from 'lucide-react'
import { Job } from '@/types/job'
import { formatEmployerName } from '@/lib/job-utils'

interface JobApplication {
  id: string
  job_id: string
  applied_at: string
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected'
  job: Job
}

interface ApplicationsSectionProps {
  applications: JobApplication[]
}

export function ApplicationsSection({ applications }: ApplicationsSectionProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-muted text-muted-foreground border border-border'
      case 'reviewed': return 'bg-secondary text-secondary-foreground border border-border'
      case 'accepted': return 'bg-primary text-primary-foreground border border-border'
      case 'rejected': return 'bg-destructive/10 text-destructive border border-destructive/20'
      default: return 'bg-muted text-muted-foreground border border-border'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <TrendingUp className="h-5 w-5 mr-2" />
          Recent Applications
        </CardTitle>
      </CardHeader>
      <CardContent>
        {applications.length === 0 ? (
          <div className="text-center py-8">
            <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No applications yet</h3>
            <p className="text-muted-foreground">
              Start applying to jobs to track your progress here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((application) => (
              <div key={application.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold">{application.job.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {formatEmployerName(application.job.company)}
                    </p>
                  </div>
                  <Badge className={getStatusColor(application.status)}>
                    {application.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Applied {formatDate(application.applied_at)}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
