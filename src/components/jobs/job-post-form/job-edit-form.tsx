'use client'

import { CreateJobData } from '@/types/job'
import { useAuth } from '@/contexts/auth-context'
import { toast } from 'sonner'
import { JobFormBase } from './job-form-base'
import { formatClientName } from '@/lib/job-utils'
import { useTranslations } from 'next-intl'

interface JobEditFormProps {
  jobId: string
  initialData: Partial<CreateJobData>
  onJobUpdated?: () => void
  onCancel?: () => void
}

export function JobEditForm({ jobId, initialData, onJobUpdated, onCancel }: JobEditFormProps) {
  const { user } = useAuth()
  const t = useTranslations('jobs.review')

  const handleSubmit = async (formData: CreateJobData) => {
    // Use formatted client name, same as job creation
    const companyName = formatClientName(user?.name || 'Unknown Client')
    
    const response = await fetch(`/api/jobs/${jobId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: formData.title,
        company: companyName, // Use formatted client name
        description: formData.description,
        type: formData.type,
        cityId: formData.city_id, // Fixed: API expects cityId, not city_id
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
        tags: formData.tags && Array.isArray(formData.tags) && formData.tags.length > 0 
          ? formData.tags.join(',') 
          : null,
        transportation_amount: formData.transportation_amount || null,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to update job')
    }

    const data = await response.json()
    toast.success('Job updated successfully!')
    onJobUpdated?.()
    
    return data
  }

  return (
    <JobFormBase
      initialData={initialData}
      isEditMode={true}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      submitButtonText={t('updateJobPosting')}
      submittingText={t('submitting')}
    />
  )
}
