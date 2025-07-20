'use client'

import { CreateJobData } from '@/types/job'
import { useAuth } from '@/contexts/auth-context'
import { toast } from 'sonner'
import { JobFormBase } from './job-form-base'
import { useTranslations } from 'next-intl'

interface JobPostFormProps {
  onJobPosted?: () => void
  initialData?: Partial<CreateJobData>
  showCard?: boolean
}

export function JobPostForm({ onJobPosted, initialData, showCard = true }: JobPostFormProps) {
  const { user } = useAuth()
  const t = useTranslations('jobs.review')

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
        city_id: formData.city_id,
        category_id: formData.category_id || null,
        salaryType: formData.salaryType || null,
        salaryMin: formData.salaryMin || null,
        salaryMax: formData.salaryMax || null,
        website: formData.website || null,
        email: formData.email || user?.email,
        start_date: formData.start_date || null,
        start_time: formData.start_time || null,
        duration: formData.duration || null,
        transportation: formData.transportation || null,
        job_address: formData.job_address || null,
        job_latitude: formData.job_latitude || null,
        job_longitude: formData.job_longitude || null,
        requirements: formData.requirements || null,
        benefits: formData.benefits || null,
        application_url: formData.application_url || formData.website || null,
        contact_email: formData.contact_email || formData.email || user?.email,
        is_featured: formData.is_featured || false,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to create job')
    }

    const data = await response.json()
    
    // Show success message
    toast.success('Job posted successfully!')
    
    // Dispatch events to refresh connection count and job cost info
    // Add a small delay to ensure backend transaction is complete
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('refresh-connections'))
      window.dispatchEvent(new CustomEvent('refresh-job-cost'))
    }, 500)
    
    onJobPosted?.()
    
    return data
  }

  return (
    <div className="space-y-4">
      <JobFormBase
        initialData={initialData}
        isEditMode={false}
        onSubmit={handleSubmit}
        submitButtonText={t('submitJobPosting')}
        submittingText={t('submitting')}
        showCard={showCard}
      />
    </div>
  )
}
