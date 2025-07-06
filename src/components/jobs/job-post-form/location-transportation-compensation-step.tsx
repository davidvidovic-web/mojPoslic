'use client'

import { useState, useEffect } from 'react'
import { CreateJobData } from '@/types/job'
import { LocationSection } from './location-section'
import { TransportationSection } from './transportation-section'
import { ScheduleSection } from './schedule-section'
import { CompensationSection } from './compensation-section'
import { ContactInformationSection } from './contact-information-section'
import { useAuth } from '@/contexts/auth-context'



interface LocationTransportationCompensationStepProps {
  formData: CreateJobData
  onChange: (data: Partial<CreateJobData>) => void
  onValidation: (isValid: boolean) => void
}

export function LocationTransportationCompensationStep({ formData, onChange, onValidation }: LocationTransportationCompensationStepProps) {
  const { user } = useAuth()
  const [locationValidationError, setLocationValidationError] = useState<string | null>(null)

  const isCompany = user?.role === 'company'

  // Validation - email is required for companies, only block on high-confidence location errors
  useEffect(() => {
    const hasBlockingLocationError = locationValidationError && 
      locationValidationError.includes('Location Mismatch:')
    
    // For companies, email is required; for clients, auto-set email
    let emailValid = true
    if (isCompany) {
      emailValid = !!(formData.email?.trim())
    } else if (!formData.email && user?.email) {
      // Auto-set email for non-company users
      onChange({ email: user.email })
    }
    
    const isValid = emailValid && !hasBlockingLocationError
    onValidation(isValid)
  }, [formData.email, locationValidationError, onValidation, isCompany, user?.email, onChange])

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
      
      {isCompany && (
        <ContactInformationSection 
          formData={formData} 
          onChange={onChange} 
        />
      )}
    </div>
  )
}
