'use client'

import { CreateJobData, Job } from '@/types/job'
import { useAuth } from '@/contexts/auth-context'
import { toast } from 'sonner'
import { JobFormBase } from './job-form-base'
import { useTranslations } from 'next-intl'
import { useData } from '@/hooks/use-data'
import { mapFormDataToCreateAPI } from '@/lib/job-form-mappers'

interface JobEditFormProps {
  job: Job
  onJobUpdated?: () => void
  onCancel?: () => void
  showCard?: boolean
}

// Helper function to map Job to CreateJobData
function mapJobToFormData(job: Job): Partial<CreateJobData> {
  return {
    title: job.title,
    company: job.company,
    description: job.description,
    type: job.type,
    city_id: job.city_id,
    category_id: job.category_id,
    salary: job.salary,
    salaryType: job.salaryType,
    salaryMin: job.salaryMin,
    salaryMax: job.salaryMax,
    email: job.email,
    website: job.website,
    tags: job.tags,
    // Handle special cases for start_date and start_time
    // If they're null/undefined/empty, it means "I don't know exact date/time" was selected
    start_date: job.start_date && job.start_date !== '' ? job.start_date : 'negotiable',
    start_time: job.start_time && job.start_time !== '' ? job.start_time : 'negotiable',
    duration: job.duration,
    transportation: job.transportation,
    transportation_amount: job.transportation_amount,
    has_parking: job.has_parking,
    public_transport_info: job.public_transport_info,
    job_address: job.job_address,
    job_latitude: job.job_latitude,
    job_longitude: job.job_longitude,
    requirements: job.requirements,
    benefits: job.benefits,
    contact_email: job.contact_email,
    application_url: job.application_url,
    is_featured: job.is_featured
  }
}

export function JobEditForm({ 
  job,
  onJobUpdated, 
  onCancel,
  showCard = true
}: JobEditFormProps) {
  const { user } = useAuth()
  const { cities } = useData()
  const t = useTranslations('jobs.review')

  const handleSubmit = async (formData: CreateJobData) => {
    // For edit mode, we need to convert city_id to city key
    const selectedCity = formData.city_id ? cities.find(c => c.id === formData.city_id) : null
    const cityKey = selectedCity?.key
    
    if (!cityKey) {
      toast.error('Please select a valid city')
      return
    }
    
    const requestData = mapFormDataToCreateAPI(formData, user?.email || '', cityKey)

    // Make the API request to update the job
    const response = await fetch(`/api/jobs/${job.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to update job')
    }

    const data = await response.json()
    
    // Show success message
    toast.success(t('jobUpdated') || 'Job updated successfully')
    
    // Add a small delay to ensure backend transaction is complete
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('refresh-connections'))
      window.dispatchEvent(new CustomEvent('refresh-job-cost'))
    }, 500)
    
    onJobUpdated?.()
    
    return data
  }

  const initialData = mapJobToFormData(job)

  return (
    <JobFormBase
      initialData={initialData}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      submitButtonText={t('updateJobPosting') || 'Update Job Posting'}
      submittingText={t('updating') || 'Updating...'}
      showCard={showCard}
    />
  )
}
