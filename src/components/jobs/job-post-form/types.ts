export type JobFormStep = 
  | 'basic-details'
  | 'location-compensation'
  | 'review'

// Step order for navigation
const STEP_ORDER: JobFormStep[] = ['basic-details', 'location-compensation', 'review']

export function getStepIndex(step: JobFormStep): number {
  return STEP_ORDER.findIndex(s => s === step)
}

export function getNextStep(currentStep: JobFormStep): JobFormStep | null {
  const currentIndex = getStepIndex(currentStep)
  const nextIndex = currentIndex + 1
  return nextIndex < STEP_ORDER.length ? STEP_ORDER[nextIndex] : null
}

export function getPreviousStep(currentStep: JobFormStep): JobFormStep | null {
  const currentIndex = getStepIndex(currentStep)
  const prevIndex = currentIndex - 1
  return prevIndex >= 0 ? STEP_ORDER[prevIndex] : null
}
