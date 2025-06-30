'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  MapPin, 
  Calendar, 
  Building2, 
  DollarSign, 
  ExternalLink, 
  Mail, 
  ArrowLeft,
  Briefcase,
  Clock,
  Users,
  User,
  Tag,
  CheckCircle,
  AlertCircle,
  Car
} from "lucide-react"
import { Job } from "@/types/job"
import { useAuth } from "@/contexts/prisma-auth-context"
import { toast } from "sonner"
import { formatJobType, getJobTypeBadgeVariant, formatTransportation, formatEmployerName } from "@/lib/job-utils"
import { JobLocationMap } from "@/components/job-location-map"

export default function JobDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)

  useEffect(() => {
    const fetchJob = async (jobId: string) => {
      try {
        setLoading(true)
        const response = await fetch(`/api/jobs/${jobId}`)
        
        if (!response.ok) {
          const errorData = await response.json()
          console.error('Error fetching job:', errorData)
          toast.error('Job not found')
          router.push('/')
          return
        }

        const job = await response.json()
        setJob(job)
      } catch (error) {
        console.error('Error fetching job:', error)
        toast.error('Failed to load job details')
        router.push('/')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchJob(params.id as string)
    }
  }, [params.id, router])

  const handleApply = async () => {
    // Check if user is logged in
    if (!user) {
      // Redirect to login with return URL
      const returnUrl = `/jobs/${params.id}`
      router.push(`/login?returnUrl=${encodeURIComponent(returnUrl)}`)
      return
    }

    if (!job) return

    setApplying(true)
    
    try {
      // If there's an application URL, open it
      if (job.application_url) {
        window.open(job.application_url, '_blank')
        toast.success('Application page opened in new tab')
      } 
      // If there's a contact email, open email client
      else if (job.contact_email) {
        const subject = `Application for ${job.title} at ${formatEmployerName(job.company)}`
        const body = `Dear Hiring Manager,

I am interested in applying for the ${job.title} position at ${formatEmployerName(job.company)}. 

Please find my resume attached and let me know if you need any additional information.

Best regards,
${user.name || user.email}`
        
        const mailtoLink = `mailto:${job.contact_email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
        window.location.href = mailtoLink
        toast.success('Email client opened')
      } else {
        toast.error('No application method available for this job')
      }
    } catch (error) {
      console.error('Error applying to job:', error)
      toast.error('Failed to apply to job')
    } finally {
      setApplying(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffInDays === 0) return "Today"
    if (diffInDays === 1) return "Yesterday"
    if (diffInDays < 7) return `${diffInDays} days ago`
    return date.toLocaleDateString()
  }

  const formatSalary = (job: Job) => {
    // If we have structured salary data
    if (job.salaryMin && job.salaryMax && job.salaryType) {
      const min = job.salaryMin.toLocaleString()
      const max = job.salaryMax.toLocaleString()
      const type = job.salaryType === 'hourly' ? '/hr' : 
                   job.salaryType === 'daily' ? '/day' :
                   job.salaryType === 'weekly' ? '/week' :
                   job.salaryType === 'monthly' ? '/month' : ''
      return `${min} - ${max} BAM${type}`
    }
    
    // If we only have minimum salary
    if (job.salaryMin && job.salaryType) {
      const min = job.salaryMin.toLocaleString()
      const type = job.salaryType === 'hourly' ? '/hr' : 
                   job.salaryType === 'daily' ? '/day' :
                   job.salaryType === 'weekly' ? '/week' :
                   job.salaryType === 'monthly' ? '/month' : ''
      return `From ${min} BAM${type}`
    }
    
    // Fallback to legacy salary field
    return job.salary || null
  }

  const getTypeVariant = getJobTypeBadgeVariant

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Loading job details...</p>
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Job not found</p>
          <Button onClick={() => router.push('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Jobs
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => router.back()}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Header */}
            <Card>
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-xl bg-muted border flex items-center justify-center font-bold text-xl">
                    {formatEmployerName(job.company).charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h1 className="text-2xl font-bold">{job.title}</h1>
                        <p className="text-lg text-muted-foreground mt-1">{formatEmployerName(job.company)}</p>
                      </div>
                      <Badge variant={getTypeVariant(job.type)}>
                        {formatJobType(job.type)}
                      </Badge>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {job.city?.name || 'Remote'}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Posted {formatDate(job.posted_at)}
                      </div>
                      {job.category && (
                        <div className="flex items-center gap-1">
                          <Tag className="h-4 w-4" />
                          {job.category.name}
                        </div>
                      )}
                      {formatSalary(job) && (
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          {formatSalary(job)}
                        </div>
                      )}
                      {job.transportation && (
                        <div className="flex items-center gap-1">
                          <Car className="h-4 w-4" />
                          {formatTransportation(job.transportation, job.transportation_amount)}
                        </div>
                      )}
                      {job.posted_by && (
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          Posted by employer
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Job Description */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Job Description
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: job.description }}
                />
              </CardContent>
            </Card>

            {/* Requirements */}
            {job.requirements && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div 
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: job.requirements }}
                  />
                </CardContent>
              </Card>
            )}

            {/* Benefits */}
            {job.benefits && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Benefits
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div 
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: job.benefits }}
                  />
                </CardContent>
              </Card>
            )}

            {/* Tags */}
            {job.tags && job.tags.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Skills & Technologies</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {job.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Job Location */}
            {(job.job_address || (job.job_latitude && job.job_longitude)) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Job Location
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {job.job_address && (
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <p className="text-sm">{job.job_address}</p>
                    </div>
                  )}
                  
                  {job.job_latitude && job.job_longitude && (
                    <JobLocationMap
                      latitude={job.job_latitude}
                      longitude={job.job_longitude}
                      address={job.job_address}
                      jobTitle={job.title}
                      company={job.company}
                    />
                  )}
                </CardContent>
              </Card>
            )}

            {/* Job Timeline */}
            {(job.start_date || job.start_time || job.duration || job.expires_at) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Schedule & Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {job.start_date && (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="text-sm font-medium">Start Date</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(job.start_date).toLocaleDateString()}
                          {job.start_time && ` at ${new Date(`2000-01-01T${job.start_time}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {job.duration && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium">Expected Duration</p>
                        <p className="text-sm text-muted-foreground">
                          {job.duration.replace('_', ' ').replace(/(\d+)/, '$1 ').toLowerCase()}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {job.expires_at && (
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-600" />
                      <div>
                        <p className="text-sm font-medium">Application Deadline</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(job.expires_at)}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Apply Card */}
            <Card>
              <CardHeader>
                <CardTitle>Apply for this position</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={handleApply}
                  className="w-full"
                  disabled={applying || (!job.application_url && !job.contact_email)}
                  size="lg"
                >
                  {applying ? 'Opening...' : 'Apply Now'}
                  {job.application_url && <ExternalLink className="h-4 w-4 ml-2" />}
                  {!job.application_url && job.contact_email && <Mail className="h-4 w-4 ml-2" />}
                </Button>
                
                {!user && (
                  <p className="text-xs text-muted-foreground text-center">
                    You need to log in to apply for this job
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Company Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  About {job.company}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{job.city?.name || 'Remote'}</span>
                </div>
                
                {job.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a 
                      href={`mailto:${job.email}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {job.email}
                    </a>
                  </div>
                )}
                
                {job.contact_email && job.contact_email !== job.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a 
                      href={`mailto:${job.contact_email}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {job.contact_email}
                    </a>
                  </div>
                )}
                
                {job.website && (
                  <div className="flex items-center gap-2 text-sm">
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    <a 
                      href={job.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Company Website
                    </a>
                  </div>
                )}
                
                {job.application_url && job.application_url !== job.website && (
                  <div className="flex items-center gap-2 text-sm">
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    <a 
                      href={job.application_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Application Portal
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Job Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Job Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Job Type</span>
                  <Badge variant={getTypeVariant(job.type)}>{formatJobType(job.type)}</Badge>
                </div>
                
                {job.category && (
                  <>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Category</span>
                      <span className="text-sm font-medium">{job.category.name}</span>
                    </div>
                  </>
                )}
                
                <Separator />
                
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Posted</span>
                  <span className="text-sm">{formatDate(job.posted_at)}</span>
                </div>
                
                {job.start_date && (
                  <>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Start Date</span>
                      <span className="text-sm">{new Date(job.start_date).toLocaleDateString()}</span>
                    </div>
                  </>
                )}
                
                {job.expires_at && (
                  <>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Expires</span>
                      <span className="text-sm">{formatDate(job.expires_at)}</span>
                    </div>
                  </>
                )}
                
                {formatSalary(job) && (
                  <>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Salary</span>
                      <span className="text-sm font-medium">{formatSalary(job)}</span>
                    </div>
                  </>
                )}

                {job.transportation && (
                  <>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Transportation</span>
                      <span className="text-sm font-medium">{formatTransportation(job.transportation, job.transportation_amount)}</span>
                    </div>
                  </>
                )}

                {job.job_address && (
                  <>
                    <Separator />
                    <div className="flex justify-between items-start">
                      <span className="text-sm text-muted-foreground">Address</span>
                      <span className="text-sm text-right max-w-[200px]">{job.job_address}</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
    </div>
  )
}
