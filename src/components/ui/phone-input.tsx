'use client'

import React from 'react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { BA } from 'country-flag-icons/react/3x2'

interface PhoneInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  id?: string
  required?: boolean
}

export function PhoneInput({ 
  value, 
  onChange, 
  placeholder = "XX 123 456", 
  className,
  id,
  required 
}: PhoneInputProps) {
  // Remove any non-digit characters except spaces and dashes for display
  const formatPhoneNumber = (input: string) => {
    // Remove all non-digits
    const digits = input.replace(/\D/g, '')
    
    // Limit to 8 digits (typical Bosnian mobile number length: 61 XXX XXX or 62 XXX XXX)
    const limitedDigits = digits.slice(0, 8)
    
    // Format as XX XXX XXX
    if (limitedDigits.length <= 2) {
      return limitedDigits
    } else if (limitedDigits.length <= 5) {
      return `${limitedDigits.slice(0, 2)} ${limitedDigits.slice(2)}`
    } else {
      return `${limitedDigits.slice(0, 2)} ${limitedDigits.slice(2, 5)} ${limitedDigits.slice(5)}`
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value)
    onChange(formatted)
  }

  // Get the full international number for validation/storage
  const getFullNumber = () => {
    const digits = value.replace(/\D/g, '')
    return digits ? `+387${digits}` : ''
  }

  // Validate Bosnia phone number format
  const isValidBosnianNumber = () => {
    const digits = value.replace(/\D/g, '')
    // Bosnia mobile numbers typically start with 6 and are 8 digits total
    return digits.length === 8 && digits.startsWith('6')
  }

  return (
    <div className="relative">
      <div className="flex">
        {/* Country Code Display */}
        <div className={cn(
          "flex items-center px-3 border border-r-0 border-input bg-background rounded-l-md",
          value && !isValidBosnianNumber() && "border-red-500"
        )}>
          <div className="flex items-center gap-2">
            {/* Bosnia and Herzegovina Flag */}
            <div className="w-6 h-4 rounded-sm overflow-hidden border border-gray-200">
              <BA className="w-full h-full object-cover" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">+387</span>
          </div>
        </div>
        
        {/* Phone Number Input */}
        <Input
          id={id}
          type="tel"
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          className={cn(
            "rounded-l-none border-l-0 focus-visible:ring-offset-0",
            value && !isValidBosnianNumber() && "border-red-500 focus-visible:ring-red-500",
            className
          )}
          required={required}
        />
      </div>
      
      {/* Hidden input for form submission with full number */}
      <input 
        type="hidden" 
        name="fullPhoneNumber" 
        value={getFullNumber()}
      />
      
      {/* Helper text */}
      {value && (
        <div className="mt-1 space-y-1">
          <p className="text-xs text-muted-foreground">
            Puni broj: {getFullNumber()}
          </p>
          {!isValidBosnianNumber() && (
            <p className="text-xs text-red-500">
              Broj telefona treba da počinje sa 6 i ima 8 cifara (npr. 61 234 567)
            </p>
          )}
        </div>
      )}
    </div>
  )
}
