export type JobFormStep = 
  | 'basic-details'
  | 'location-compensation'
  | 'review'

export const JOB_FORM_STEPS: Array<{
  id: JobFormStep
  title: string
  description: string
  icon: string
}> = [
  {
    id: 'basic-details',
    title: 'Job Details',
    description: 'Title, description, category, and requirements',
    icon: 'FileText'
  },
  {
    id: 'location-compensation',
    title: 'Location, Transportation & Pay',
    description: 'Location, transportation, schedule, salary, and contact info',
    icon: 'MapPin'
  },
  {
    id: 'review',
    title: 'Review & Submit',
    description: 'Review your job posting',
    icon: 'CheckCircle'
  }
]

export function getStepIndex(step: JobFormStep): number {
  return JOB_FORM_STEPS.findIndex(s => s.id === step)
}

export function getNextStep(currentStep: JobFormStep): JobFormStep | null {
  const currentIndex = getStepIndex(currentStep)
  const nextIndex = currentIndex + 1
  return nextIndex < JOB_FORM_STEPS.length ? JOB_FORM_STEPS[nextIndex].id : null
}

export function getPreviousStep(currentStep: JobFormStep): JobFormStep | null {
  const currentIndex = getStepIndex(currentStep)
  const prevIndex = currentIndex - 1
  return prevIndex >= 0 ? JOB_FORM_STEPS[prevIndex].id : null
}
