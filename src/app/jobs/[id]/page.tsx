'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { ArrowLeft, Briefcase } from "lucide-react"
import { Job } from "@/types/job"
import { useAuth } from "@/contexts/prisma-auth-context"
import { toast } from "sonner"
import { formatEmployerName } from "@/lib/job-utils"
import { JobHeader } from "@/components/job/job-header"
import { JobContent } from "@/components/job/job-content"
import { JobLocation } from "@/components/job/job-location"
import { JobTimeline } from "@/components/job/job-timeline"
import { JobApplicationSidebar } from "@/components/job/job-application-sidebar"
import { JobDetailsSidebar } from "@/components/job/job-details-sidebar"

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
            <JobHeader job={job} formatDate={formatDate} formatSalary={formatSalary} />

            {/* Job Content */}
            <JobContent job={job} />

            {/* Job Location */}
            <JobLocation job={job} />

            {/* Job Timeline */}
            <JobTimeline job={job} formatDate={formatDate} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <JobApplicationSidebar 
              job={job} 
              user={user} 
              applying={applying} 
              handleApply={handleApply} 
            />
            <JobDetailsSidebar 
              job={job} 
              formatDate={formatDate} 
              formatSalary={formatSalary} 
            />
          </div>
        </div>
    </div>
  )
}
