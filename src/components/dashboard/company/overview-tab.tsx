'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ClipboardList,
  TrendingUp,
  Plus,
  MapPin,
  Calendar,
  Eye,
  UserCheck
} from 'lucide-react'

interface CompanyJob {
  id: string
  title: string
  description: string
  type: string
  salary?: string
  location: string
  createdAt: string
  status: 'active' | 'inactive' | 'featured'
  applicationsCount: number
  viewsCount: number
}

interface OverviewTabProps {
  jobs: CompanyJob[]
}

export function OverviewTab({ jobs }: OverviewTabProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ClipboardList className="h-5 w-5 mr-2" />
            Recent Job Postings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {jobs.slice(0, 5).map((job) => (
              <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium">{job.title}</h4>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <MapPin className="h-3 w-3" />
                    {job.location}
                    <Calendar className="h-3 w-3 ml-2" />
                    {new Date(job.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={job.status === 'active' ? 'default' : 'secondary'}>
                    {job.status}
                  </Badge>
                  <div className="text-sm text-muted-foreground">
                    {job.applicationsCount} applications
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button className="w-full justify-start">
              <Plus className="h-4 w-4 mr-2" />
              Post New Job
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Eye className="h-4 w-4 mr-2" />
              View Company Profile
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <UserCheck className="h-4 w-4 mr-2" />
              Manage Applications
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <TrendingUp className="h-4 w-4 mr-2" />
              Upgrade to Premium
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
