'use client'

import { CreateJobData } from '@/types/job'
import { useAuth } from '@/contexts/auth-context'
import { toast } from 'sonner'
import { JobFormBase } from './job-form-base'

interface JobPostFormProps {
  onJobPosted?: () => void
  initialData?: Partial<CreateJobData>
}

export function JobPostForm({ onJobPosted, initialData }: JobPostFormProps) {
  const { user } = useAuth()

  const handleSubmit = async (formData: CreateJobData) => {
    const response = await fetch('/api/jobs/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: formData.title,
        company: formData.company,
        description: formData.description,
        type: formData.type,
        cityId: formData.city_id,
        categoryId: formData.category_id || null,
        salaryType: formData.salaryType || null,
        salaryMin: formData.salaryMin || null,
        salaryMax: formData.salaryMax || null,
        website: formData.website || null,
        email: formData.email || user?.email,
        startDate: formData.start_date || null,
        startTime: formData.start_time || null,
        duration: formData.duration || null,
        transportation: formData.transportation || null,
        jobAddress: formData.job_address || null,
        jobLatitude: formData.job_latitude || null,
        jobLongitude: formData.job_longitude || null,
        requirements: formData.requirements || null,
        benefits: formData.benefits || null,
        application_url: formData.application_url || formData.website || null,
        contact_email: formData.contact_email || formData.email || user?.email,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to create job')
    }

    const data = await response.json()
    toast.success('Job posted successfully!')
    onJobPosted?.()
    
    return data
  }

  return (
    <JobFormBase
      initialData={initialData}
      isEditMode={false}
      onSubmit={handleSubmit}
      submitButtonText="Submit Job Posting"
      submittingText="Submitting..."
    />
  )
}
