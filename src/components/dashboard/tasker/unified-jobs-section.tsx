'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Briefcase, 
  Star, 
  Heart,
  Search,
  MapPin,
  DollarSign,
  Clock,
  Building,
  Eye,
  MessageSquare,
  CalendarIcon,
  CheckCircle,
  XCircle,
  AlertCircle,
  BookmarkIcon
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Job } from '@/types/job'
import Link from 'next/link'

interface JobApplication {
  id: string
  job_id: string
  appliedAt: string
  status: 'PENDING' | 'REVIEWED' | 'SHORTLISTED' | 'INTERVIEW_SCHEDULED' | 'SELECTED' | 'REJECTED' | 'WITHDRAWN'
  job: Job
  message?: string
  feedback?: string
  clientNotes?: string
  shortlistedAt?: string
  interviewDate?: string
}

interface UnifiedJobsSectionProps {
  applications: JobApplication[]
  shortlistedApplications: JobApplication[]
  savedJobs: Job[]
  recommendedJobs: Job[]
  savedJobIds: Set<string>
  onSaveToggle: (jobId: string, isSaved: boolean) => void
  loading?: boolean
}

export function UnifiedJobsSection({ 
  applications,
  shortlistedApplications,
  savedJobs,
  recommendedJobs,
  savedJobIds,
  onSaveToggle,
  loading = false
}: UnifiedJobsSectionProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')

  // Filter applications based on search and filters
  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.job.company.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter
    const matchesType = typeFilter === 'all' || app.job.type === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  // Filter recommended jobs
  const filteredRecommendedJobs = recommendedJobs.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.company.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Filter saved jobs
  const filteredSavedJobs = savedJobs.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.company.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'REVIEWED':
        return <Eye className="h-4 w-4 text-blue-600" />
      case 'SHORTLISTED':
        return <Star className="h-4 w-4 text-yellow-600" />
      case 'INTERVIEW_SCHEDULED':
        return <CalendarIcon className="h-4 w-4 text-purple-600" />
      case 'SELECTED':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'REJECTED':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'WITHDRAWN':
        return <AlertCircle className="h-4 w-4 text-gray-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'REVIEWED':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
      case 'SHORTLISTED':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'INTERVIEW_SCHEDULED':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
      case 'SELECTED':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'REJECTED':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      case 'WITHDRAWN':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  const formatSalary = (job: Job) => {
    if (job.salaryMin && job.salaryMax) {
      return `$${job.salaryMin} - $${job.salaryMax}`
    } else if (job.salaryMin) {
      return `From $${job.salaryMin}`
    } else if (job.salary) {
      return job.salary
    }
    return 'Salary not specified'
  }

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true })
    } catch {
      return 'recently'
    }
  }

  const ApplicationCard = ({ application }: { application: JobApplication }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                {application.job.title}
              </h3>
              <Badge className={getStatusColor(application.status)}>
                <div className="flex items-center gap-1">
                  {getStatusIcon(application.status)}
                  {application.status.replace('_', ' ')}
                </div>
              </Badge>
            </div>
            <p className="text-gray-600 dark:text-gray-400 font-medium mb-2">
              {application.job.company}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <MapPin className="h-4 w-4" />
            <span>{application.job.job_address || 'Location not specified'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <DollarSign className="h-4 w-4" />
            <span>{formatSalary(application.job)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Clock className="h-4 w-4" />
            <span>Applied {formatDate(application.appliedAt)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Badge variant="outline" className="text-xs">
              {application.job.type}
            </Badge>
          </div>
        </div>

        {application.message && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>Your message:</strong> {application.message}
            </p>
          </div>
        )}

        {application.feedback && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>Feedback:</strong> {application.feedback}
            </p>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href={`/jobs/${application.job.id}`}>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-1" />
                View Job
              </Button>
            </Link>
            {application.status === 'SHORTLISTED' && (
              <Button variant="outline" size="sm">
                <MessageSquare className="h-4 w-4 mr-1" />
                Message
              </Button>
            )}
          </div>
          {application.interviewDate && (
            <div className="text-sm text-purple-600 dark:text-purple-400">
              Interview: {new Date(application.interviewDate).toLocaleDateString()}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )

  const JobCard = ({ job, isSaved = false }: { job: Job; isSaved?: boolean }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-1">
              {job.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 font-medium">
              {job.company}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSaveToggle(job.id, !isSaved)}
            className={isSaved ? 'text-red-600 hover:text-red-700' : 'text-gray-600 hover:text-red-600'}
          >
            <Heart className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <MapPin className="h-4 w-4" />
            <span>{job.job_address || 'Location not specified'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <DollarSign className="h-4 w-4" />
            <span>{formatSalary(job)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Clock className="h-4 w-4" />
            <span>Posted {formatDate(job.createdAt)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Badge variant="outline" className="text-xs">
              {job.type}
            </Badge>
          </div>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
          {job.description}
        </p>

        <div className="flex items-center justify-between">
          <Link href={`/jobs/${job.id}`}>
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-1" />
              View Details
            </Button>
          </Link>
          <Link href={`/jobs/${job.id}/apply`}>
            <Button size="sm">
              Apply Now
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading jobs...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search jobs or companies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:border-gray-600"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-800 dark:border-gray-600"
              >
                <option value="all">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="REVIEWED">Reviewed</option>
                <option value="SHORTLISTED">Shortlisted</option>
                <option value="INTERVIEW_SCHEDULED">Interview</option>
                <option value="SELECTED">Selected</option>
                <option value="REJECTED">Rejected</option>
              </select>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-800 dark:border-gray-600"
              >
                <option value="all">All Types</option>
                <option value="quick_job">Quick Job</option>
                <option value="full_time">Full Time</option>
                <option value="part_time">Part Time</option>
                <option value="remote">Remote</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Jobs Tabs */}
      <Tabs defaultValue="applications" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="applications" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            <span className="hidden sm:inline">My Applications</span>
            <span className="sm:hidden">Apps</span>
            <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
              {filteredApplications.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="shortlisted" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            <span className="hidden sm:inline">Shortlisted</span>
            <span className="sm:hidden">Star</span>
            <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
              {shortlistedApplications.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="saved" className="flex items-center gap-2">
            <BookmarkIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Saved Jobs</span>
            <span className="sm:hidden">Saved</span>
            <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
              {filteredSavedJobs.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="recommended" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">Recommended</span>
            <span className="sm:hidden">Rec</span>
            <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
              {filteredRecommendedJobs.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="applications" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">My Applications</h2>
            <p className="text-sm text-muted-foreground">
              {filteredApplications.length} application{filteredApplications.length !== 1 ? 's' : ''}
            </p>
          </div>
          {filteredApplications.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  No applications found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                    ? "No applications match your search criteria."
                    : "You haven't applied to any jobs yet. Start exploring opportunities!"}
                </p>
                <Link href="/jobs">
                  <Button>
                    <Search className="h-4 w-4 mr-2" />
                    Browse Jobs
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredApplications.map((application) => (
                <ApplicationCard key={application.id} application={application} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="shortlisted" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Shortlisted Opportunities</h2>
            <p className="text-sm text-muted-foreground">
              {shortlistedApplications.length} shortlisted
            </p>
          </div>
          {shortlistedApplications.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  No shortlisted applications yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  When employers are interested in your profile, your applications will appear here.
                </p>
                <Link href="/jobs">
                  <Button>
                    <Search className="h-4 w-4 mr-2" />
                    Apply to More Jobs
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {shortlistedApplications.map((application) => (
                <div key={application.id} className="border rounded-lg p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border-yellow-200 dark:border-yellow-800">
                  <ApplicationCard application={application} />
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="saved" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Saved Jobs</h2>
            <p className="text-sm text-muted-foreground">
              {filteredSavedJobs.length} saved job{filteredSavedJobs.length !== 1 ? 's' : ''}
            </p>
          </div>
          {filteredSavedJobs.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <BookmarkIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  No saved jobs yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Save interesting jobs to easily find them later and apply when you&apos;re ready.
                </p>
                <Link href="/jobs">
                  <Button>
                    <Search className="h-4 w-4 mr-2" />
                    Browse Jobs
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredSavedJobs.map((job) => (
                <JobCard key={job.id} job={job} isSaved={true} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="recommended" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recommended for You</h2>
            <p className="text-sm text-muted-foreground">
              {filteredRecommendedJobs.length} recommendation{filteredRecommendedJobs.length !== 1 ? 's' : ''}
            </p>
          </div>
          {filteredRecommendedJobs.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  No recommendations available
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Complete your profile to get personalized job recommendations.
                </p>
                <Link href="/profile-setup">
                  <Button>
                    <Building className="h-4 w-4 mr-2" />
                    Complete Profile
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredRecommendedJobs.map((job) => (
                <JobCard 
                  key={job.id} 
                  job={job} 
                  isSaved={savedJobIds.has(job.id)} 
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
