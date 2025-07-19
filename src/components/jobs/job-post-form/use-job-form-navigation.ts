/**
 * Job form navigation utilities
 */

import { JobFormStep, getNextStep, getPreviousStep, getStepIndex } from './types'

export interface UseJobFormNavigationProps {
  currentStep: JobFormStep
  setCurrentStep: (step: JobFormStep) => void
  completedSteps: Set<JobFormStep>
  setCompletedSteps: (steps: Set<JobFormStep>) => void
  stepValidations: Record<JobFormStep, boolean>
  isEditMode: boolean
}

export function useJobFormNavigation({
  currentStep,
  setCurrentStep,
  completedSteps,
  setCompletedSteps,
  stepValidations,
  isEditMode
}: UseJobFormNavigationProps) {
  
  const isCurrentStepValid = stepValidations[currentStep]
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
    
    // In create mode, only allow clicking on completed steps or the next immediate step
    const stepIndex = getStepIndex(step)
    const currentIndex = getStepIndex(currentStep)
    
    if (completedSteps.has(step) || stepIndex <= currentIndex) {
      setCurrentStep(step)
      scrollToTop()
    }
  }

  return {
    canGoPrevious,
    canGoNext,
    handleNext,
    handlePrevious,
    handleStepClick
  }
}
