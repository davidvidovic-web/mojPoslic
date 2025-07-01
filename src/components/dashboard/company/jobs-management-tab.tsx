'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Briefcase,
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

interface JobsManagementTabProps {
  jobs: CompanyJob[]
}

export function JobsManagementTab({ jobs }: JobsManagementTabProps) {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.location.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Briefcase className="h-5 w-5 mr-2" />
            Job Listings Management
          </CardTitle>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Job
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search jobs by title or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </div>
          
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{job.title}</h4>
                    <Badge variant={job.status === 'featured' ? 'default' : 'secondary'}>
                      {job.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {job.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(job.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <UserCheck className="h-3 w-3" />
                      {job.applicationsCount} applications
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {job.viewsCount} views
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
