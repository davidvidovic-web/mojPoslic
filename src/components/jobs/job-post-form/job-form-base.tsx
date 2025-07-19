'use client'

import { useTranslations } from 'next-intl'
import { CreateJobData } from '@/types/job'
import { useJobFormState } from './use-job-form-state'
import { useJobFormNavigation } from './use-job-form-navigation'
import { StepIndicator } from './step-indicator'
import { BasicDetailsStep } from './basic-details-step'
import { LocationTransportationCompensationStep } from './location-transportation-compensation-step'
import { ReviewStep } from './review-step'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronLeft, ChevronRight, Trash2 } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { useCallback } from 'react'

interface JobFormBaseProps {
  initialData?: Partial<CreateJobData>
  isEditMode?: boolean
  onSubmit: (formData: CreateJobData) => Promise<void>
  onCancel?: () => void
  submitButtonText?: string
  submittingText?: string
  showCard?: boolean
}

export function JobFormBase({
  initialData,
  isEditMode = false,
  onSubmit,
  onCancel,
  submitButtonText,
  submittingText,
  showCard = true
}: JobFormBaseProps) {
  const t = useTranslations('jobPost.validation')
  const tNav = useTranslations('jobPost.form.navigation')
  const { user } = useAuth()
  const {
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
  } = useJobFormState({ initialData, isEditMode })

  const {
    canGoPrevious,
    canGoNext,
    handleNext,
    handlePrevious,
    handleStepClick
  } = useJobFormNavigation({
    currentStep,
    setCurrentStep,
    completedSteps,
    setCompletedSteps,
    stepValidations,
    isEditMode
  })

  const handleFormSubmit = async () => {
    if (!isCurrentStepValid && currentStep !== 'review') return
    
    // Validate required fields before submitting
    const missingFields: string[] = []
    
    if (!formData.title?.trim()) {
      missingFields.push('Job Title')
    }
    if (!formData.description?.trim()) {
      missingFields.push('Job Description')
    }
    if (!formData.category_id) {
      missingFields.push('Job Category')
    }
    if (!formData.type) {
      missingFields.push('Job Type')
    }
    if (!formData.city_id) {
      missingFields.push('City')
    }
    if (!formData.start_date?.trim()) {
      missingFields.push('Start Date')
    }
    if (!formData.start_time?.trim()) {
      missingFields.push('Start Time')
    }
    
    // For companies, email is required
    const isCompany = user?.role === 'company'
    if (isCompany && !formData.email?.trim()) {
      missingFields.push('Contact Email')
    }
    
    if (missingFields.length > 0) {
      const fieldsList = missingFields.join(', ')
      const errorMessage = missingFields.length === 1 
        ? t('fillRequiredField', { field: fieldsList })
        : t('fillRequiredFields', { fields: fieldsList })
      
      // You'll need to import toast from sonner
      const { toast } = await import('sonner')
      toast.error(errorMessage)
      return
    }
    
    setIsSubmitting(true)
    try {
      await onSubmit(formData)
      // Clear saved form data on successful submit
      clearSavedDataOnSubmit()
    } catch (error) {
      console.error('Form submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFormDataUpdate = useCallback((updates: Partial<CreateJobData>) => {
    Object.entries(updates).forEach(([key, value]) => {
      updateFormData(key as keyof CreateJobData, value)
    })
  }, [updateFormData])

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'basic-details':
        return (
          <BasicDetailsStep
            formData={formData}
            onChange={handleFormDataUpdate}
            onValidation={handleBasicDetailsValidation}
          />
        )
      case 'location-compensation':
        return (
          <LocationTransportationCompensationStep
            formData={formData}
            onChange={handleFormDataUpdate}
            onValidation={handleLocationCompensationValidation}
          />
        )
      case 'review':
        return (
          <ReviewStep
            formData={formData}
            onValidation={handleReviewValidation}
            onChange={handleFormDataUpdate}
          />
        )
      default:
        return null
    }
  }

  const isLastStep = currentStep === 'review'

  const content = (
    <>
      <StepIndicator
        currentStep={currentStep}
        completedSteps={completedSteps}
        stepValidations={stepValidations}
        isEditMode={isEditMode}
        onStepClick={handleStepClick}
        formData={formData}
      />

      <div className="mt-8">
        {renderCurrentStep()}
      </div>

      <div className="relative flex items-center mt-8 pt-6 border-t gap-4">
        {/* Left buttons - only render if there are buttons to show */}
        {(canGoPrevious || onCancel) && (
          <div className="flex gap-2 justify-start">
            {canGoPrevious && (
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
                disabled={isSubmitting}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                {tNav('previous')}
              </Button>
            )}
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                {tNav('cancel')}
              </Button>
            )}
          </div>
        )}

        {/* Clear form button */}
        {!isEditMode && (
          <Button
            type="button"
            variant="destructive"
            onClick={clearForm}
            disabled={isSubmitting}
            className={(canGoPrevious || onCancel) ? "mx-auto" : "mr-auto"}
          >
            <Trash2 className="h-4 w-4 md:mr-2" />
            <span className="hidden md:inline">{tNav('clearForm')}</span>
          </Button>
        )}

        {/* Right buttons */}
        <div className="flex gap-2 ml-auto">
          {!isLastStep ? (
            <Button
              type="button"
              onClick={handleNext}
              disabled={!canGoNext || isSubmitting}
            >
              {tNav('next')}
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleFormSubmit}
              disabled={isSubmitting || (!isEditMode && !isCurrentStepValid)}
            >
              {isSubmitting ? (submittingText || tNav('saving')) : (submitButtonText || tNav('submit'))}
            </Button>
          )}
        </div>
      </div>
    </>
  )

  if (!showCard) {
    return (
      <div className="w-full">
        {content}
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {isEditMode ? t('form.editJobPosting') : t('form.createJobPosting')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {content}
        </CardContent>
      </Card>
    </div>
  )
}
