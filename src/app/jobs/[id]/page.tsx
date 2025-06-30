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
  Users
} from "lucide-react"
import { Job } from "@/types/job"
import { useAuth } from "@/contexts/prisma-auth-context"
import { toast } from "sonner"
import { formatJobType, getJobTypeBadgeVariant } from "@/lib/job-utils"

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
        const subject = `Application for ${job.title} at ${job.company}`
        const body = `Dear Hiring Manager,

I am interested in applying for the ${job.title} position at ${job.company}. 

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
                    {job.company.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h1 className="text-2xl font-bold">{job.title}</h1>
                        <p className="text-lg text-muted-foreground mt-1">{job.company}</p>
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
                      {job.salary && (
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          {job.salary}
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
                <div className="prose max-w-none">
                  <p className="whitespace-pre-wrap">{job.description}</p>
                </div>
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
                  <div className="prose max-w-none">
                    <p className="whitespace-pre-wrap">{job.requirements}</p>
                  </div>
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
                  <div className="prose max-w-none">
                    <p className="whitespace-pre-wrap">{job.benefits}</p>
                  </div>
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
                
                {job.contact_email && (
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
                
                {job.application_url && (
                  <div className="flex items-center gap-2 text-sm">
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    <a 
                      href={job.application_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Company Website
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
                
                <Separator />
                
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Posted</span>
                  <span className="text-sm">{formatDate(job.posted_at)}</span>
                </div>
                
                {job.expires_at && (
                  <>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Expires</span>
                      <span className="text-sm">{formatDate(job.expires_at)}</span>
                    </div>
                  </>
                )}
                
                {job.salary && (
                  <>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Salary</span>
                      <span className="text-sm font-medium">{job.salary}</span>
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
