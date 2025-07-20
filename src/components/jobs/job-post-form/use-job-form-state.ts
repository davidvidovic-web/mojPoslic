/**
 * Job form state management hook
 */

import { useState, useCallback } from 'react'
import { CreateJobData } from '@/types/job'
import { useAuth } from '@/hooks/useAuth'
import { JobFormStep } from './types'

export interface UseJobFormStateProps {
  initialData?: Partial<CreateJobData>
}

const FORM_STORAGE_KEY = 'job-form-draft'

export function useJobFormState({ initialData }: UseJobFormStateProps) {
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

  const [currentStep, setCurrentStep] = useState<JobFormStep>(() => {
    // Determine initial step based on form data completeness
    if (typeof window === 'undefined') return 'basic-details'
    
    let savedData = null
    try {
      const saved = localStorage.getItem(FORM_STORAGE_KEY)
      savedData = saved ? JSON.parse(saved) : null
    } catch (error) {
      console.error('Error loading saved form data for step calculation:', error)
    }
    
    const data = { ...initialData, ...savedData }
    
    if (!data || Object.keys(data).length === 0) {
      return 'basic-details'
    }
    
    // Check basic details completion
    const hasBasicDetails = !!(
      data.title?.trim() &&
      data.description?.trim() &&
      data.category_id?.trim() &&
      data.type
    )
    
    if (!hasBasicDetails) {
      return 'basic-details'
    }
    
    // Check location-compensation completion
    const hasLocationCompensation = !!(
      data.city_id?.trim() &&
      data.start_date?.trim() &&
      data.email?.trim()
    )
    
    if (!hasLocationCompensation) {
      return 'location-compensation'
    }
    
    // If we have all required data, go to review
    return 'review'
  })
  
  const [completedSteps, setCompletedSteps] = useState<Set<JobFormStep>>(() => {
    // Determine completed steps based on form data
    if (typeof window === 'undefined') return new Set()
    
    let savedData = null
    try {
      const saved = localStorage.getItem(FORM_STORAGE_KEY)
      savedData = saved ? JSON.parse(saved) : null
    } catch (error) {
      console.error('Error loading saved form data for completed steps:', error)
    }
    
    const data = { ...initialData, ...savedData }
    const completed = new Set<JobFormStep>()
    
    if (!data || Object.keys(data).length === 0) {
      return completed
    }
    
    // Check basic details completion
    const hasBasicDetails = !!(
      data.title?.trim() &&
      data.description?.trim() &&
      data.category_id?.trim() &&
      data.type
    )
    
    if (hasBasicDetails) {
      completed.add('basic-details')
    }
    
    // Check location-compensation completion
    const hasLocationCompensation = !!(
      data.city_id?.trim() &&
      data.start_date?.trim() &&
      data.email?.trim()
    )
    
    if (hasLocationCompensation) {
      completed.add('location-compensation')
    }
    
    return completed
  })
  const [stepValidations, setStepValidations] = useState<Record<JobFormStep, boolean>>(() => {
    // Get saved data from localStorage
    let savedData = null
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(FORM_STORAGE_KEY)
        savedData = saved ? JSON.parse(saved) : null
      } catch (error) {
        console.error('Error loading saved form data for validation:', error)
      }
    }
    
    // Get combined data from initialData and savedData
    const combinedData = { ...savedData, ...initialData }
    
    // Initialize validations based on existing data (either initial or saved)
    if (combinedData && Object.keys(combinedData).length > 0) {
      const hasBasicDetails = !!(
        combinedData.title?.trim() &&
        combinedData.description?.trim() &&
        combinedData.category_id?.trim() &&
        combinedData.type
      )
      
      const hasLocationCompensation = !!(
        combinedData.city_id?.trim() &&
        combinedData.start_date?.trim() &&
        (combinedData.email?.trim() || user?.email?.trim())
      )
      
      return {
        'basic-details': hasBasicDetails,
        'location-compensation': hasLocationCompensation,
        'review': hasBasicDetails && hasLocationCompensation
      }
    }
    
    // Start with all false (will be validated by each step component)
    return {
      'basic-details': false,
      'location-compensation': false,
      'review': false
    }
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
      salaryMin: undefined, // Changed from 0 to undefined
      salaryMax: undefined, // Changed from 0 to undefined
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
      // Auto-save to localStorage
      saveFormData(newData)
      return newData
    })
  }, [saveFormData])

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
