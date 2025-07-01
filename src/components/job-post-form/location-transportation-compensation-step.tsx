'use client'

import { useState, useEffect } from 'react'
import { CreateJobData } from '@/types/job'
import { LocationSection } from './location-section'
import { TransportationSection } from './transportation-section'
import { ScheduleSection } from './schedule-section'
import { CompensationSection } from './compensation-section'
import { ContactInformationSection } from './contact-information-section'



interface LocationTransportationCompensationStepProps {
  formData: CreateJobData
  onChange: (data: Partial<CreateJobData>) => void
  onValidation: (isValid: boolean) => void
}

export function LocationTransportationCompensationStep({ formData, onChange, onValidation }: LocationTransportationCompensationStepProps) {
  const [locationValidationError, setLocationValidationError] = useState<string | null>(null)

  // Validation - email is required, only block on high-confidence location errors
  useEffect(() => {
    const hasBlockingLocationError = locationValidationError && 
      locationValidationError.includes('Location Mismatch:')
    
    const isValid = !!(formData.email?.trim()) && !hasBlockingLocationError
    onValidation(isValid)
  }, [formData.email, locationValidationError, onValidation])

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
      
      <TransportationSection 
        formData={formData} 
        onChange={onChange} 
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
