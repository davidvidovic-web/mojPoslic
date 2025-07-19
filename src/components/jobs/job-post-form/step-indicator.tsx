'use client'

import { Progress } from '@/components/ui/progress'
import { JobFormStep, getStepIndex } from './types'
import { cn } from '@/lib/utils'
import { Check, FileText, Search, MapPin, DollarSign, Mail, CheckCircle, AlertCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { CreateJobData } from '@/types/job'
import { useAuth } from '@/contexts/auth-context'

function getStepIcon(iconName: string) {
  const iconMap = {
    'FileText': FileText,
    'Search': Search,
    'MapPin': MapPin,
    'DollarSign': DollarSign,
    'Mail': Mail,
    'CheckCircle': CheckCircle
  }
  const IconComponent = iconMap[iconName as keyof typeof iconMap] || FileText
  return <IconComponent className="h-6 w-6" />
}

interface StepIndicatorProps {
  currentStep: JobFormStep
  completedSteps: Set<JobFormStep>
  stepValidations?: Partial<Record<JobFormStep, boolean>>
  isEditMode?: boolean
  onStepClick?: (step: JobFormStep) => void
  formData?: CreateJobData
}

export function StepIndicator({ currentStep, completedSteps, stepValidations = {}, isEditMode = false, onStepClick, formData }: StepIndicatorProps) {
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
      <div className="hidden md:flex justify-between items-center mb-4">
        {JOB_FORM_STEPS.map((step, index) => {
          const isCompleted = completedSteps.has(step.id)
          const isCurrent = step.id === currentStep
          const hasValidationIssue = isEditMode && stepValidations[step.id] === false
          const isClickable = isEditMode || isCompleted || index <= currentIndex

          return (
            <button
              key={step.id}
              onClick={() => isClickable && onStepClick?.(step.id)}
              disabled={!isClickable}
              className={cn(
                "flex flex-col items-center text-center space-y-2 flex-1 py-2 px-1 rounded-lg transition-colors",
                isCurrent && "bg-primary/10",
                hasValidationIssue && "bg-destructive/5",
                isClickable ? "hover:bg-secondary cursor-pointer" : "cursor-not-allowed opacity-50"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2",
                isCurrent ? "bg-primary text-primary-foreground border-primary" :
                isCompleted ? "bg-blue-500 text-primary-foreground border-blue-500" :
                hasValidationIssue ? "bg-destructive/10 border-destructive text-destructive" :
                "bg-background border-border"
              )}>
                {isCompleted ? <Check className="h-4 w-4" /> : 
                 hasValidationIssue ? <AlertCircle className="h-4 w-4" /> : 
                 index + 1}
              </div>
              <div className="space-y-1">
                <div className={cn(
                  "text-xs font-medium",
                  isCurrent ? "text-primary" : 
                  isCompleted ? "text-green-600" : 
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
        <div className="flex items-center space-x-3 p-3 bg-secondary/50 rounded-lg">
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
