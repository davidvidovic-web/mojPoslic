'use client'

import { CreateJobData } from '@/types/job'
import { JobPostForm } from './job-post-form'
import { JobEditForm } from './job-edit-form'

interface MultiStepJobFormProps {
  initialData?: Partial<CreateJobData>
  isEditMode?: boolean
  jobId?: string
  onJobPosted?: () => void
  onCancel?: () => void
  showCard?: boolean
}

export function MultiStepJobForm({ 
  initialData, 
  isEditMode = false, 
  jobId, 
  onJobPosted,
  onCancel,
  showCard = true
}: MultiStepJobFormProps) {
  if (isEditMode && jobId && initialData) {
    return (
      <JobEditForm
        jobId={jobId}
        initialData={initialData}
        onJobUpdated={onJobPosted}
        onCancel={onCancel}
      />
    )
  }

  return (
    <JobPostForm
      initialData={initialData}
      onJobPosted={onJobPosted}
      showCard={showCard}
    />
  )
}
