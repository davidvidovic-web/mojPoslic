'use client'

import { Progress } from '@/components/ui/progress'
import { JobFormStep, getStepIndex } from './types'
import { cn } from '@/lib/utils'
import { Check, FileText, Search, MapPin, DollarSign, Mail, CheckCircle, AlertCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { CreateJobData } from '@/types/job'
import { useAuth } from '@/contexts/auth-context'

function getStepIcon(iconName: string, size: 'sm' | 'md' = 'md') {
  const iconMap = {
    'FileText': FileText,
    'Search': Search,
    'MapPin': MapPin,
    'DollarSign': DollarSign,
    'Mail': Mail,
    'CheckCircle': CheckCircle
  }
  const IconComponent = iconMap[iconName as keyof typeof iconMap] || FileText
  const sizeClass = size === 'sm' ? 'h-4 w-4' : 'h-6 w-6'
  return <IconComponent className={sizeClass} />
}

interface StepIndicatorProps {
  currentStep: JobFormStep
  stepValidations?: Partial<Record<JobFormStep, boolean>>
  onStepClick?: (step: JobFormStep) => void
  formData?: CreateJobData
  canClickStep?: (step: JobFormStep) => boolean
}

export function StepIndicator({ currentStep, stepValidations = {}, onStepClick, formData, canClickStep }: StepIndicatorProps) {
  const t = useTranslations('jobPost.form.steps')
  const tNavigation = useTranslations('jobPost.form.navigation')
  const { user } = useAuth()
  
  // Calculate progress based on completed required fields
  const calculateFieldProgress = (): number => {
    if (!formData) {
      // Fallback to step-based progress if formData is not available
      const currentIndex = getStepIndex(currentStep)
      return ((currentIndex) / (JOB_FORM_STEPS.length - 1)) * 100
    }
    
    const requiredFields = [
      'title',
      'description', 
      'category_id',
      'city_id',
      'start_date',
      'start_time'
    ]
    
    // Job type is not counted in progress since it's prefilled for clients
    // and automatically handled for other user types
    
    // Add email as required for companies
    if (user?.role === 'company') {
      requiredFields.push('email')
    }
    
    const completedFields = requiredFields.filter(field => {
      const value = formData[field as keyof CreateJobData]
      return value !== null && value !== undefined && value !== ''
    })
    
    return Math.round((completedFields.length / requiredFields.length) * 100)
  }
  
  // Create translated steps array
  const JOB_FORM_STEPS = [
    {
      id: 'basic-details' as JobFormStep,
      title: t('basicDetails.title'),
      description: t('basicDetails.description'),
      icon: 'FileText'
    },
    {
      id: 'location-compensation' as JobFormStep,
      title: t('locationCompensation.title'),
      description: t('locationCompensation.description'),
      icon: 'MapPin'
    },
    {
      id: 'review' as JobFormStep,
      title: t('review.title'),
      description: t('review.description'),
      icon: 'CheckCircle'
    }
  ]
  
  const currentIndex = getStepIndex(currentStep)
  const progress = calculateFieldProgress()

  return (
    <div className="w-full mb-8">
      {/* Desktop Step Navigation */}
      <div className="hidden md:flex gap-[10px] mb-4">
        {JOB_FORM_STEPS.map((step, index) => {
          const isCurrent = step.id === currentStep
          const isValid = stepValidations[step.id] === true
          // Disable validation issues in edit mode entirely to ensure clean appearance
          const hasValidationIssue = false

          // Use the canClickStep function if provided, otherwise fall back to default logic
          const isClickable = canClickStep ? canClickStep(step.id) : (isValid || index <= currentIndex)

          return (
            <button
              key={step.id}
              onClick={() => isClickable && onStepClick?.(step.id)}
              disabled={!isClickable}
              className={cn(
                "flex flex-col items-center text-center space-y-2 flex-1 py-3 px-2 rounded-[var(--radius)] transition-colors min-h-[80px]",
                isCurrent && "bg-primary/10",
                hasValidationIssue && "bg-destructive/5",
                isClickable ? "hover:bg-secondary cursor-pointer" : "cursor-not-allowed opacity-50"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2",
                isCurrent && isValid ? "bg-green-500 text-white border-green-500" :
                isCurrent ? "bg-primary text-primary-foreground border-primary" :
                isValid ? "bg-green-500 text-white border-green-500" :
                hasValidationIssue ? "bg-destructive/10 border-destructive text-destructive" :
                "bg-background border-border"
              )}>
                {isValid ? <Check className="h-4 w-4" /> : 
                 hasValidationIssue ? <AlertCircle className="h-4 w-4" /> : 
                 index + 1}
              </div>
              <div className="space-y-1">
                <div className={cn(
                  "text-xs font-medium",
                  isCurrent && isValid ? "text-green-600 dark:text-green-400" :
                  isCurrent ? "text-primary" : 
                  isValid ? "text-green-600 dark:text-green-400" : 
                  hasValidationIssue ? "text-destructive" :
                  "text-muted-foreground"
                )}>
                  {step.title}
                </div>
                <div className="text-xs text-muted-foreground hidden lg:block">
                  {step.description}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Mobile Current Step Display */}
      <div className="md:hidden mb-4">
        <div className="flex items-center space-x-3 p-3 bg-secondary/50 rounded-[var(--radius)]">
          <div className="flex-shrink-0">{getStepIcon(JOB_FORM_STEPS[currentIndex].icon)}</div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm truncate">{JOB_FORM_STEPS[currentIndex].title}</div>
            <div className="text-xs text-muted-foreground truncate">{JOB_FORM_STEPS[currentIndex].description}</div>
          </div>
          {/* <Badge variant="secondary" className="flex-shrink-0 whitespace-nowrap">
            {tNavigation('stepOf', { current: currentIndex + 1, total: JOB_FORM_STEPS.length })}
          </Badge> */}
        </div>
      </div>

      <div className="mb-4">
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>{tNavigation('stepOf', { current: currentIndex + 1, total: JOB_FORM_STEPS.length })}</span>
          <span>{tNavigation('percentComplete', { percent: Math.round(progress) })}</span>
        </div>
      </div>
    </div>
  )
}
