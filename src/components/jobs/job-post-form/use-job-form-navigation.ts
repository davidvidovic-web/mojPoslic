/**
 * Job form navigation utilities
 */

import { JobFormStep, getNextStep, getPreviousStep, getStepIndex } from './types'
import { CreateJobData } from '@/types/job'

export interface UseJobFormNavigationProps {
  currentStep: JobFormStep
  setCurrentStep: (step: JobFormStep) => void
  completedSteps: Set<JobFormStep>
  setCompletedSteps: (steps: Set<JobFormStep>) => void
  stepValidations: Record<JobFormStep, boolean>
  isEditMode: boolean
  formData?: CreateJobData
}

// Check if a step can be accessed based on saved form data
function canAccessStepWithData(step: JobFormStep, formData?: CreateJobData): boolean {
  if (!formData) return false
  
  switch (step) {
    case 'basic-details':
      return true // Always accessible
      
    case 'location-compensation':
      // Can access if basic details are filled
      return !!(
        formData.title?.trim() &&
        formData.description?.trim() &&
        formData.category_id?.trim() &&
        formData.type
      )
      
    case 'review':
      // Can access if location-compensation requirements are met
      return !!(
        formData.title?.trim() &&
        formData.description?.trim() &&
        formData.category_id?.trim() &&
        formData.type &&
        formData.city_id?.trim() &&
        formData.start_date?.trim() &&
        formData.email?.trim()
      )
      
    default:
      return false
  }
}

export function useJobFormNavigation({
  currentStep,
  setCurrentStep,
  completedSteps,
  setCompletedSteps,
  stepValidations,
  isEditMode,
  formData
}: UseJobFormNavigationProps) {
  
  const isCurrentStepValid = stepValidations[currentStep] || false
  const canGoPrevious = getPreviousStep(currentStep) !== null
  const canGoNext = isEditMode || isCurrentStepValid

  const scrollToTop = () => {
    // Try multiple approaches to ensure scrolling works
    // 1. Scroll window to top
    window.scrollTo({ top: 0, behavior: 'smooth' })
    
    // 2. Also try scrolling the document element
    setTimeout(() => {
      document.documentElement.scrollTo({ top: 0, behavior: 'smooth' })
      // 3. Fallback: immediate scroll without smooth behavior
      if (window.pageYOffset > 0) {
        window.scrollTo(0, 0)
      }
    }, 50)
  }

  const handleNext = () => {
    // In edit mode, allow navigation without validation
    if (isEditMode) {
      const nextStep = getNextStep(currentStep)
      if (nextStep) {
        setCurrentStep(nextStep)
        scrollToTop()
      }
      return
    }
    
    // In create mode, require validation
    if (!isCurrentStepValid) return
    
    const nextStep = getNextStep(currentStep)
    if (nextStep) {
      setCompletedSteps(new Set([...completedSteps, currentStep]))
      setCurrentStep(nextStep)
      scrollToTop()
    }
  }

  const handlePrevious = () => {
    const previousStep = getPreviousStep(currentStep)
    if (previousStep) {
      setCurrentStep(previousStep)
      scrollToTop()
    }
  }

  const handleStepClick = (step: JobFormStep) => {
    // In edit mode, allow unrestricted navigation between steps
    if (isEditMode) {
      setCurrentStep(step)
      scrollToTop()
      return
    }
    
    // Use the canClickStep function to determine if step is accessible
    if (canClickStep(step)) {
      setCurrentStep(step)
      scrollToTop()
    }
  }

  // Helper function to check if a step can be clicked
  const canClickStep = (step: JobFormStep): boolean => {
    if (isEditMode) return true
    
    const stepIndex = getStepIndex(step)
    const currentIndex = getStepIndex(currentStep)
    
    // Always allow clicking on current and previous steps
    if (stepIndex <= currentIndex) return true
    
    // For future steps, check if they're accessible based on data
    // But don't require current step to be valid (more permissive)
    return canAccessStepWithData(step, formData)
  }

  return {
    canGoPrevious,
    canGoNext,
    handleNext,
    handlePrevious,
    handleStepClick,
    canClickStep
  }
}
