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

  const handleNext = () => {
    // In edit mode, allow navigation without validation
    if (isEditMode) {
      const nextStep = getNextStep(currentStep)
      if (nextStep) {
        setCurrentStep(nextStep)
      }
      return
    }
    
    // In create mode, require validation
    if (!isCurrentStepValid) return
    
    const nextStep = getNextStep(currentStep)
    if (nextStep) {
      setCompletedSteps(new Set([...completedSteps, currentStep]))
      setCurrentStep(nextStep)
    }
  }

  const handlePrevious = () => {
    const previousStep = getPreviousStep(currentStep)
    if (previousStep) {
      setCurrentStep(previousStep)
    }
  }

  const handleStepClick = (step: JobFormStep) => {
    // In edit mode, allow unrestricted navigation between steps
    if (isEditMode) {
      setCurrentStep(step)
      return
    }
    
    // In create mode, only allow clicking on completed steps or the next immediate step
    const stepIndex = getStepIndex(step)
    const currentIndex = getStepIndex(currentStep)
    
    if (completedSteps.has(step) || stepIndex <= currentIndex) {
      setCurrentStep(step)
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
