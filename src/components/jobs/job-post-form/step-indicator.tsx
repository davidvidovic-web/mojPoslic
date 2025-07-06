'use client'

import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { JobFormStep, JOB_FORM_STEPS, getStepIndex } from './types'
import { cn } from '@/lib/utils'
import { Check, FileText, Search, MapPin, DollarSign, Mail, CheckCircle, AlertCircle } from 'lucide-react'

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
}

export function StepIndicator({ currentStep, completedSteps, stepValidations = {}, isEditMode = false, onStepClick }: StepIndicatorProps) {
  const currentIndex = getStepIndex(currentStep)
  const progress = ((currentIndex) / (JOB_FORM_STEPS.length - 1)) * 100

  return (
    <div className="w-full mb-8">
      <div className="mb-4">
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>Step {currentIndex + 1} of {JOB_FORM_STEPS.length}</span>
          <span>{Math.round(progress)}% complete</span>
        </div>
      </div>

      {/* Desktop Step Navigation */}
      <div className="hidden md:flex justify-between items-center">
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
                isCompleted ? "bg-green-500 text-white border-green-500" :
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
      <div className="md:hidden">
        <div className="flex items-center space-x-3 p-3 bg-secondary/50 rounded-lg">
          <div>{getStepIcon(JOB_FORM_STEPS[currentIndex].icon)}</div>
          <div>
            <div className="font-medium text-sm">{JOB_FORM_STEPS[currentIndex].title}</div>
            <div className="text-xs text-muted-foreground">{JOB_FORM_STEPS[currentIndex].description}</div>
          </div>
          <Badge variant="secondary" className="ml-auto">
            {currentIndex + 1}/{JOB_FORM_STEPS.length}
          </Badge>
        </div>
      </div>
    </div>
  )
}
