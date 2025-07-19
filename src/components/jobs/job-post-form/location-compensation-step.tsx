'use client'

import { useState, useEffect } from 'react'
import { CreateJobData } from '@/types/job'
import { LocationSection } from './location-section'
import { ScheduleSection } from './schedule-section'
import { CompensationSection } from './compensation-section'
import { ContactInformationSection } from './contact-information-section'

interface LocationCompensationStepProps {
  formData: CreateJobData
  onChange: (data: Partial<CreateJobData>) => void
  onValidation: (isValid: boolean) => void
}

export function LocationCompensationStep({ formData, onChange, onValidation }: LocationCompensationStepProps) {
  const [locationValidationError, setLocationValidationError] = useState<string | null>(null)

  // Validation - email is required, only block on high-confidence location errors, start_date and start_time are required
  useEffect(() => {
    const hasBlockingLocationError = locationValidationError && 
      locationValidationError.includes('Location Mismatch:')
    
    const isValid = !!(formData.email?.trim()) && 
                   !hasBlockingLocationError &&
                   !!(formData.start_date?.trim()) &&
                   !!(formData.start_time?.trim())
    onValidation(isValid)
  }, [formData.email, formData.start_date, formData.start_time, locationValidationError, onValidation])

  const handleLocationValidationChange = (error: string | null) => {
    setLocationValidationError(error)
  }

  return (
    <div className="space-y-6">
      <LocationSection 
        formData={formData} 
        onChange={onChange} 
        onLocationValidationChange={handleLocationValidationChange}
      />
      
      <ScheduleSection 
        formData={formData} 
        onChange={onChange} 
      />
      
      <CompensationSection 
        formData={formData} 
        onChange={onChange} 
      />
      
      <ContactInformationSection 
        formData={formData} 
        onChange={onChange} 
      />
    </div>
  )
}
