/**
 * Job form state management hook
 */

import { useState, useCallback } from 'react'
import { CreateJobData } from '@/types/job'
import { useAuth } from '@/hooks/useAuth'
import { JobFormStep } from './types'

export interface UseJobFormStateProps {
  initialData?: Partial<CreateJobData>
  isEditMode?: boolean
}

const FORM_STORAGE_KEY = 'job-form-draft'

export function useJobFormState({ initialData, isEditMode = false }: UseJobFormStateProps) {
  const { user } = useAuth()
  
  // Check if user can post all job types (companies and admins)
  const canPostAllJobTypes = user?.role === 'company' || user?.role === 'admin'
  
  // Set default job type based on user role
  const defaultJobType = canPostAllJobTypes ? (initialData?.type || 'quick_job') : 'quick_job'
  
  // Load saved form data from localStorage
  const loadSavedFormData = useCallback(() => {
    if (typeof window === 'undefined') return null
    try {
      const saved = localStorage.getItem(FORM_STORAGE_KEY)
      return saved ? JSON.parse(saved) : null
    } catch (error) {
      console.error('Error loading saved form data:', error)
      return null
    }
  }, [])

  // Save form data to localStorage
  const saveFormData = useCallback((data: CreateJobData) => {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(data))
    } catch (error) {
      console.error('Error saving form data:', error)
    }
  }, [])

  // Clear saved form data
  const clearSavedFormData = useCallback(() => {
    if (typeof window === 'undefined') return
    try {
      localStorage.removeItem(FORM_STORAGE_KEY)
    } catch (error) {
      console.error('Error clearing saved form data:', error)
    }
  }, [])

  const [currentStep, setCurrentStep] = useState<JobFormStep>('basic-details')
  const [completedSteps, setCompletedSteps] = useState<Set<JobFormStep>>(new Set())
  const [stepValidations, setStepValidations] = useState<Record<JobFormStep, boolean>>({
    'basic-details': false,
    'location-compensation': false,
    'review': true // Always valid
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Initialize form data with saved data or defaults
  const [formData, setFormData] = useState<CreateJobData>(() => {
    const savedData = loadSavedFormData()
    
    // Prefer initialData (for edit mode), then saved data, then defaults
    const baseData = {
      title: '',
      city_id: '',
      category_id: '',
      type: defaultJobType,
      description: '',
      requirements: '',
      benefits: '',
      salary: '',
      salaryType: 'fixed' as const,
      salaryMin: 0,
      salaryMax: 0,
      website: '',
      email: user?.email || '',
      start_date: '',
      start_time: '',
      duration: '',
      transportation: 'not_provided' as const,
      transportation_amount: 0,
      job_address: '',
      job_latitude: undefined,
      job_longitude: undefined,
      contact_email: user?.email || '',
      application_url: '',
      tags: []
    }

    return {
      ...baseData,
      ...(savedData || {}),
      ...(initialData || {}),
    }
  })

  const updateFormData = useCallback((field: keyof CreateJobData, value: unknown) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value }
      // Auto-save to localStorage (but not in edit mode)
      if (!isEditMode) {
        saveFormData(newData)
      }
      return newData
    })
  }, [saveFormData, isEditMode])

  // Clear form and saved data
  const clearForm = useCallback(() => {
    const defaultData = {
      title: '',
      city_id: '',
      category_id: '',
      type: defaultJobType,
      description: '',
      requirements: '',
      benefits: '',
      salary: '',
      salaryType: 'fixed' as const,
      salaryMin: 0,
      salaryMax: 0,
      website: '',
      email: user?.email || '',
      start_date: '',
      start_time: '',
      duration: '',
      transportation: 'not_provided' as const,
      transportation_amount: 0,
      job_address: '',
      job_latitude: undefined,
      job_longitude: undefined,
      contact_email: user?.email || '',
      application_url: '',
      tags: []
    }
    setFormData(defaultData)
    clearSavedFormData()
    setCurrentStep('basic-details')
    setCompletedSteps(new Set())
  }, [defaultJobType, user?.email, clearSavedFormData])

  // Clear saved data on successful submit
  const clearSavedDataOnSubmit = useCallback(() => {
    clearSavedFormData()
  }, [clearSavedFormData])

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
    isCurrentStepValid,
    clearForm,
    clearSavedDataOnSubmit
  }
}
