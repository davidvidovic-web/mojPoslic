'use client'

import { CreateJobData } from '@/types/job'
import { JobPostForm } from './job-post-form'

interface MultiStepJobFormProps {
  initialData?: Partial<CreateJobData>
  onJobPosted?: () => void
  onCancel?: () => void
  showCard?: boolean
}

export function MultiStepJobForm({ 
  initialData, 
  onJobPosted,
  onCancel,
  showCard = true
}: MultiStepJobFormProps) {
  return (
    <JobPostForm
      initialData={initialData}
      onJobPosted={onJobPosted}
      onCancel={onCancel}
      showCard={showCard}
    />
  )
}
