/**
 * Job form state management hook
 */

import { useState, useCallback } from 'react'
import { CreateJobData } from '@/types/job'
import { useAuth } from '@/contexts/prisma-auth-context'
import { JobFormStep } from './types'

export interface UseJobFormStateProps {
  initialData?: Partial<CreateJobData>
  isEditMode?: boolean
}

export function useJobFormState({ initialData, isEditMode = false }: UseJobFormStateProps) {
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState<JobFormStep>('basic-details')
  const [completedSteps, setCompletedSteps] = useState<Set<JobFormStep>>(new Set())
  const [stepValidations, setStepValidations] = useState<Record<JobFormStep, boolean>>({
    'basic-details': false,
    'location-compensation': false,
    'review': true // Always valid
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [formData, setFormData] = useState<CreateJobData>({
    title: initialData?.title || '',
    city_id: initialData?.city_id || '',
    category_id: initialData?.category_id || '',
    type: initialData?.type || 'full_time',
    description: initialData?.description || '',
    requirements: initialData?.requirements || '',
    benefits: initialData?.benefits || '',
    salary: initialData?.salary || '',
    salaryType: initialData?.salaryType || 'fixed',
    salaryMin: initialData?.salaryMin || 0,
    salaryMax: initialData?.salaryMax || 0,
    website: initialData?.website || '',
    email: initialData?.email || user?.email || '',
    start_date: initialData?.start_date || '',
    start_time: initialData?.start_time || '',
    duration: initialData?.duration || '',
    transportation: initialData?.transportation || 'not_provided',
    transportation_amount: initialData?.transportation_amount || 0,
    job_address: initialData?.job_address || '',
    job_latitude: initialData?.job_latitude || undefined,
    job_longitude: initialData?.job_longitude || undefined,
    contact_email: initialData?.contact_email || user?.email || '',
    application_url: initialData?.application_url || '',
    tags: initialData?.tags || []
  })

  const updateFormData = (field: keyof CreateJobData, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleStepValidation = useCallback((step: JobFormStep, isValid: boolean) => {
    setStepValidations(prev => ({ ...prev, [step]: isValid }))
  }, [])

  const handleBasicDetailsValidation = useCallback((isValid: boolean) => {
    handleStepValidation('basic-details', isValid)
  }, [handleStepValidation])

  const handleLocationCompensationValidation = useCallback((isValid: boolean) => {
    handleStepValidation('location-compensation', isValid)
  }, [handleStepValidation])

  const handleReviewValidation = useCallback((isValid: boolean) => {
    handleStepValidation('review', isValid)
  }, [handleStepValidation])

  const isCurrentStepValid = stepValidations[currentStep]

  return {
    currentStep,
    setCurrentStep,
    completedSteps,
    setCompletedSteps,
    stepValidations,
    isSubmitting,
    setIsSubmitting,
    formData,
    updateFormData,
    handleBasicDetailsValidation,
    handleLocationCompensationValidation,
    handleReviewValidation,
    isCurrentStepValid
  }
}
