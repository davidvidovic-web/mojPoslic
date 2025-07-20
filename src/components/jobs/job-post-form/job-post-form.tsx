'use client'

import { CreateJobData } from '@/types/job'
import { useAuth } from '@/contexts/auth-context'
import { toast } from 'sonner'
import { JobFormBase } from './job-form-base'
import { useTranslations } from 'next-intl'
import { useData } from '@/hooks/use-data'
import { mapFormDataToCreateAPI } from '@/lib/job-form-mappers'

interface JobPostFormProps {
  onJobPosted?: () => void
  onCancel?: () => void
  initialData?: Partial<CreateJobData>
  showCard?: boolean
}

export function JobPostForm({ 
  onJobPosted, 
  onCancel,
  initialData, 
  showCard = true
}: JobPostFormProps) {
  const { user } = useAuth()
  const { cities } = useData()
  const t = useTranslations('jobs.review')

  const handleSubmit = async (formData: CreateJobData) => {
    // For create mode, we need to convert city_id to city key
    const selectedCity = formData.city_id ? cities.find(c => c.id === formData.city_id) : null
    const cityKey = selectedCity?.key
    
    if (!cityKey) {
      toast.error('Please select a valid city')
      return
    }
    
    const requestData = mapFormDataToCreateAPI(formData, user?.email || '', cityKey)

    // Make the API request
    const response = await fetch('/api/jobs/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to create job')
    }

    const data = await response.json()
    
    // Show success message
    toast.success(t('jobPosted'))
    
    // Add a small delay to ensure backend transaction is complete
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('refresh-connections'))
      window.dispatchEvent(new CustomEvent('refresh-job-cost'))
    }, 500)
    
    onJobPosted?.()
    
    return data
  }

  return (
    <JobFormBase
      initialData={initialData}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      submitButtonText={t('submitJobPosting')}
      submittingText={t('submitting')}
      showCard={showCard}
    />
  )
}
