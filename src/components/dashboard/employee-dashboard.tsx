'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/prisma-auth-context'
import { supabase } from '@/lib/supabase'
import { Job } from '@/types/job'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { JobCard } from '@/components/job-card'
import { Search, Bookmark, TrendingUp, Clock, Heart } from 'lucide-react'
import { formatJobType, formatEmployerName } from '@/lib/job-utils'

interface JobApplication {
  id: string
  job_id: string
  applied_at: string
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected'
  job: Job
}

export function EmployeeDashboard() {
  const { user } = useAuth()
  const [applications, setApplications] = useState<JobApplication[]>([])
  const [savedJobs, setSavedJobs] = useState<Job[]>([])
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([])
  const [loading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const fetchApplications = async () => {
      if (!user) return

      try {
        // For now, we'll simulate applications since we haven't created the applications table yet
        // In a real app, you would fetch from a job_applications table
        const { data: jobs, error } = await supabase
          .from('job_listings')
          .select(`
            *,
            city:cities(*)
          `)
          .limit(3) // Simulate some applied jobs

        if (error) throw error
        
        // Simulate applications data
        const mockApplications: JobApplication[] = (jobs || []).map((job, index) => ({
          id: `app-${index}`,
          job_id: job.id,
          user_id: user.id,
          status: ['pending', 'reviewed', 'accepted'][index % 3] as 'pending' | 'reviewed' | 'accepted',
          applied_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
          job: {
            id: job.id,
            title: job.title,
            company: job.company,
            city_id: job.city?.id || '',
            city: job.city,
            type: job.type,
            description: job.description,
            salary: job.salary,
            created_at: job.created_at,
            posted_at: job.created_at,
            email: job.email || '',
            website: job.website
          }
        }))

        setApplications(mockApplications)
      } catch (error) {
        console.error('Error fetching applications:', error)
      }
    }

    const fetchSavedJobs = async () => {
      // Simulate saved jobs for now
      try {
        const { data: jobs, error } = await supabase
          .from('job_listings')
          .select(`
            *,
            city:cities(*)
          `)
          .eq('type', 'full_time')
          .limit(5)

        if (error) throw error
        
        const formattedJobs: Job[] = (jobs || []).map(job => ({
          id: job.id,
          title: job.title,
          company: job.company,
          city_id: job.city?.id || '',
          city: job.city,
          type: job.type,
          description: job.description,
          salary: job.salary,
          created_at: job.created_at,
          posted_at: job.created_at,
          email: job.email || '',
          website: job.website
        }))

        setSavedJobs(formattedJobs.slice(0, 3)) // Show only 3 for demo
      } catch (error) {
        console.error('Error fetching saved jobs:', error)
      }
    }

    const fetchRecommendedJobs = async () => {
      try {
        const { data: jobs, error } = await supabase
          .from('job_listings')
          .select(`
            *,
            city:cities(*)
          `)
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(5)

        if (error) throw error
        
        const formattedJobs: Job[] = (jobs || []).map(job => ({
          id: job.id,
          title: job.title,
          company: job.company,
          city_id: job.city?.id || '',
          city: job.city,
          type: job.type,
          description: job.description,
          salary: job.salary,
          created_at: job.created_at,
          posted_at: job.created_at,
          email: job.email || '',
          website: job.website
        }))

        setRecommendedJobs(formattedJobs.slice(0, 3)) // Show only 3 for demo
      } catch (error) {
        console.error('Error fetching recommended jobs:', error)
      }
    }

    const loadData = async () => {
      await Promise.all([
        fetchApplications(),
        fetchSavedJobs(),
        fetchRecommendedJobs()
      ])
    }
    loadData()
  }, [user])

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

  const filteredJobs = recommendedJobs.filter(job =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.company.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading your dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Employee Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Welcome back, {user?.name}! Track your applications and discover new opportunities.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Applications</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{applications.length}</div>
              <p className="text-xs text-muted-foreground">Total sent</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {applications.filter(app => app.status === 'pending').length}
              </div>
              <p className="text-xs text-muted-foreground">Awaiting response</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saved Jobs</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{savedJobs.length}</div>
              <p className="text-xs text-muted-foreground">Bookmarked</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profile Views</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Applications Section */}
          <div className="space-y-6">
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

            {/* Saved Jobs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bookmark className="h-5 w-5 mr-2" />
                  Saved Jobs
                </CardTitle>
              </CardHeader>
              <CardContent>
                {savedJobs.length === 0 ? (
                  <div className="text-center py-8">
                    <Bookmark className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No saved jobs</h3>
                    <p className="text-muted-foreground">
                      Save interesting jobs to apply later.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {savedJobs.map((job) => (
                      <div key={job.id} className="border rounded-lg p-4">
                        <h4 className="font-semibold mb-1">{job.title}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{formatEmployerName(job.company)}</p>
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary">{formatJobType(job.type)}</Badge>
                          <Button size="sm">Apply Now</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recommended Jobs */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Search className="h-5 w-5 mr-2" />
                  Recommended Jobs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Input
                    placeholder="Search recommended jobs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                {filteredJobs.length === 0 ? (
                  <div className="text-center py-8">
                    <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No jobs found</h3>
                    <p className="text-muted-foreground">
                      Try adjusting your search terms.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[600px] overflow-y-auto">
                    {filteredJobs.map((job) => (
                      <JobCard key={job.id} job={job} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
