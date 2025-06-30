'use client'

import { useState, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { DateTimePicker } from '@/components/ui/date-time-picker'
import { TimePicker } from '@/components/ui/time-picker'
import { DurationPicker } from '@/components/ui/duration-picker'
import { LocationPicker } from '@/components/ui/location-picker'
import { CitiesFilter } from '@/components/cities-filter'
import { CreateJobData } from '@/types/job'
import { useAuth } from '@/contexts/prisma-auth-context'
import { validateLocationInCity, cleanMapAddress } from '@/lib/location-utils'
import { Lightbulb, Target, DollarSign, Mail, Calendar, Clock, MapPin as MapPinIcon, Car } from 'lucide-react'

// Helper function to get payment suggestions based on duration
function getPaymentSuggestion(duration: string): string {
  const suggestions: Record<string, string> = {
    '1_hour': '💡 Perfect for "Per Hour" payment - ideal for short tasks',
    '2_hours': '💡 Perfect for "Per Hour" payment - great for quick jobs',
    '3_hours': '💡 Perfect for "Per Hour" payment - best for hourly work',
    '4_hours': '💡 Perfect for "Per Hour" payment - standard hourly rate',
    '6_hours': '💡 Consider "Per Hour" payment for precise time tracking',
    '8_hours': '💡 Perfect for "Per Day" payment - matches a full work day',
    '1_day': '💡 Perfect for "Per Day" payment - ideal for day-based work',
    '2_days': '💡 Perfect for "Per Day" payment - great for multi-day projects',
    '3_days': '💡 Perfect for "Per Day" payment - excellent for short-term work',
    '1_week': '💡 Perfect for "Per Week" payment - ideal for weekly contracts',
    '2_weeks': '💡 Perfect for "Per Week" payment - great for bi-weekly work',
    '1_month': '💡 Perfect for "Per Month" payment - ideal for monthly contracts',
    '2_months': '💡 Perfect for "Per Month" payment - great for extended projects',
    '3_months': '💡 Perfect for "Per Month" payment - excellent for long-term work',
    'ongoing': '💡 Consider "Per Month" payment for ongoing relationships',
    'negotiable': '💡 Consider "Fixed Price" for flexible project scope'
  }
  
  return suggestions[duration] || '💡 Choose the payment structure that works best for your specific job requirements'
}

// Helper function to calculate total payment based on duration
function calculateTotalPayment(
  salaryType: string, 
  salaryMin: number, 
  salaryMax?: number, 
  duration?: string
): string {
  if (!duration || salaryType === 'fixed') {
    const amount = salaryMax && salaryMax !== salaryMin ? 
      `${salaryMin} - ${salaryMax} BAM` : 
      `${salaryMin} BAM`
    return salaryType === 'fixed' ? `Total: ${amount}` : amount
  }

  // Duration mappings with smart payment type suggestions
  const durationMap: Record<string, { 
    hours?: number; 
    days?: number; 
    weeks?: number; 
    months?: number;
    suggestedType: string;
    description: string;
  }> = {
    '1_hour': { hours: 1, suggestedType: 'hourly', description: '1 hour' },
    '2_hours': { hours: 2, suggestedType: 'hourly', description: '2 hours' },
    '3_hours': { hours: 3, suggestedType: 'hourly', description: '3 hours' },
    '4_hours': { hours: 4, suggestedType: 'hourly', description: '4 hours' },
    '6_hours': { hours: 6, suggestedType: 'hourly', description: '6 hours' },
    '8_hours': { hours: 8, days: 1, suggestedType: 'daily', description: '8 hours (1 day)' },
    '1_day': { days: 1, suggestedType: 'daily', description: '1 day' },
    '2_days': { days: 2, suggestedType: 'daily', description: '2 days' },
    '3_days': { days: 3, suggestedType: 'daily', description: '3 days' },
    '1_week': { weeks: 1, suggestedType: 'weekly', description: '1 week' },
    '2_weeks': { weeks: 2, suggestedType: 'weekly', description: '2 weeks' },
    '1_month': { months: 1, suggestedType: 'monthly', description: '1 month' },
    '2_months': { months: 2, suggestedType: 'monthly', description: '2 months' },
    '3_months': { months: 3, suggestedType: 'monthly', description: '3 months' }
  }

  const durationInfo = durationMap[duration]
  if (!durationInfo) {
    return 'Total payment depends on final agreement'
  }

  let totalMin = salaryMin
  let totalMax = salaryMax || salaryMin
  let calculationDetails = ''

  // Calculate based on the selected payment type
  if (salaryType === 'hourly' && durationInfo.hours) {
    totalMin = salaryMin * durationInfo.hours
    totalMax = (salaryMax || salaryMin) * durationInfo.hours
    calculationDetails = `${salaryMin}${salaryMax ? `-${salaryMax}` : ''} BAM/hour × ${durationInfo.hours} hours`
  } else if (salaryType === 'daily' && durationInfo.days) {
    totalMin = salaryMin * durationInfo.days
    totalMax = (salaryMax || salaryMin) * durationInfo.days
    calculationDetails = `${salaryMin}${salaryMax ? `-${salaryMax}` : ''} BAM/day × ${durationInfo.days} days`
  } else if (salaryType === 'weekly' && durationInfo.weeks) {
    totalMin = salaryMin * durationInfo.weeks
    totalMax = (salaryMax || salaryMin) * durationInfo.weeks
    calculationDetails = `${salaryMin}${salaryMax ? `-${salaryMax}` : ''} BAM/week × ${durationInfo.weeks} weeks`
  } else if (salaryType === 'monthly' && durationInfo.months) {
    totalMin = salaryMin * durationInfo.months
    totalMax = (salaryMax || salaryMin) * durationInfo.months
    calculationDetails = `${salaryMin}${salaryMax ? `-${salaryMax}` : ''} BAM/month × ${durationInfo.months} months`
  } else {
    // Conversion needed - show warning and estimate
    let conversionFactor = 1
    let fromUnit = ''
    let toUnit = ''
    
    if (salaryType === 'hourly') {
      fromUnit = 'hour'
      if (durationInfo.days) {
        conversionFactor = durationInfo.days * 8 // 8 hours per day
        toUnit = `${durationInfo.days} days (estimated 8 hrs/day)`
      } else if (durationInfo.weeks) {
        conversionFactor = durationInfo.weeks * 40 // 40 hours per week
        toUnit = `${durationInfo.weeks} weeks (estimated 40 hrs/week)`
      } else if (durationInfo.months) {
        conversionFactor = durationInfo.months * 160 // 160 hours per month
        toUnit = `${durationInfo.months} months (estimated 160 hrs/month)`
      }
    } else if (salaryType === 'daily') {
      fromUnit = 'day'
      if (durationInfo.hours) {
        conversionFactor = Math.ceil(durationInfo.hours / 8)
        toUnit = `${durationInfo.hours} hours (≈${conversionFactor} days)`
      } else if (durationInfo.weeks) {
        conversionFactor = durationInfo.weeks * 5 // 5 days per week
        toUnit = `${durationInfo.weeks} weeks (estimated 5 days/week)`
      } else if (durationInfo.months) {
        conversionFactor = durationInfo.months * 22 // 22 working days per month
        toUnit = `${durationInfo.months} months (estimated 22 days/month)`
      }
    } else if (salaryType === 'weekly') {
      fromUnit = 'week'
      if (durationInfo.hours) {
        conversionFactor = Math.ceil(durationInfo.hours / 40)
        toUnit = `${durationInfo.hours} hours (≈${conversionFactor} weeks)`
      } else if (durationInfo.days) {
        conversionFactor = Math.ceil(durationInfo.days / 5)
        toUnit = `${durationInfo.days} days (≈${conversionFactor} weeks)`
      } else if (durationInfo.months) {
        conversionFactor = durationInfo.months * 4.33 // ~4.33 weeks per month
        toUnit = `${durationInfo.months} months (≈${conversionFactor.toFixed(1)} weeks)`
      }
    } else if (salaryType === 'monthly') {
      fromUnit = 'month'
      if (durationInfo.hours) {
        conversionFactor = Math.ceil(durationInfo.hours / 160)
        toUnit = `${durationInfo.hours} hours (≈${conversionFactor} months)`
      } else if (durationInfo.days) {
        conversionFactor = Math.ceil(durationInfo.days / 22)
        toUnit = `${durationInfo.days} days (≈${conversionFactor} months)`
      } else if (durationInfo.weeks) {
        conversionFactor = Math.ceil(durationInfo.weeks / 4.33)
        toUnit = `${durationInfo.weeks} weeks (≈${conversionFactor} months)`
      }
    }
    
    totalMin = salaryMin * conversionFactor
    totalMax = (salaryMax || salaryMin) * conversionFactor
    calculationDetails = `${salaryMin}${salaryMax ? `-${salaryMax}` : ''} BAM/${fromUnit} × ${conversionFactor} (converted for ${toUnit})`
  }

  const totalRange = totalMax !== totalMin ? 
    `${totalMin.toFixed(0)} - ${totalMax.toFixed(0)} BAM` : 
    `${totalMin.toFixed(0)} BAM`

  // Check if payment type is optimal for duration
  const isOptimalPayment = salaryType === durationInfo.suggestedType
  
  if (isOptimalPayment) {
    return `💰 Estimated total: ${totalRange} (${calculationDetails})`
  } else {
    return `⚠️ Estimated total: ${totalRange} (${calculationDetails})\n💡 Consider switching to "${durationInfo.suggestedType}" payment for better accuracy`
  }
}

interface LocationTransportationCompensationStepProps {
  formData: CreateJobData
  onChange: (data: Partial<CreateJobData>) => void
  onValidation: (isValid: boolean) => void
}

export function LocationTransportationCompensationStep({ formData, onChange, onValidation }: LocationTransportationCompensationStepProps) {
  const { user } = useAuth()
  const [hasSpecificStartDate, setHasSpecificStartDate] = useState(!!formData.start_date)
  const [hasSpecificLocation, setHasSpecificLocation] = useState(!!formData.job_address)
  const [locationValidationError, setLocationValidationError] = useState<string | null>(null)
  
  // City coordinates for map centering
  const [selectedCityCoordinates, setSelectedCityCoordinates] = useState<{ lat: number; lng: number; name: string } | null>(null)
  const [selectedCityName, setSelectedCityName] = useState<string>('')

  // Fetch city name and coordinates when city_id changes
  useEffect(() => {
    if (formData.city_id) {
      const fetchCityData = async () => {
        try {
          const response = await fetch('/api/cities')
          const data = await response.json()
          const city = data.cities?.find((c: { 
            id: string; 
            nameEN?: string; 
            name_en?: string; 
            name?: string;
            latitude?: number;
            longitude?: number;
          }) => c.id === formData.city_id)
          
          if (city) {
            const cityName = city.nameEN || city.name_en || city.name || ''
            setSelectedCityName(cityName)
            
            // Update city coordinates for map centering if available
            if (city.latitude && city.longitude) {
              // This will be used by the LocationPicker component
              setSelectedCityCoordinates({
                lat: city.latitude,
                lng: city.longitude,
                name: cityName
              })
            }
          }
        } catch (error) {
          console.error('Error fetching city:', error)
        }
      }
      fetchCityData()
    }
  }, [formData.city_id])

  // Enhanced location validation against selected city with script handling
  const validateLocation = (address: string) => {
    if (!address || !selectedCityName) {
      setLocationValidationError(null)
      return
    }

    // Clean the address from map inconsistencies
    const cleanAddress = cleanMapAddress(address)
    
    // Use enhanced validation
    const validation = validateLocationInCity(cleanAddress, selectedCityName)
    
    if (!validation.isValid) {
      let errorMessage = validation.details
      
      // Add extracted cities information for debugging
      if (validation.extractedCities && validation.extractedCities.length > 0) {
        errorMessage += `\n\n📍 Cities detected in address: ${validation.extractedCities.join(', ')}`
      }
      
      // Format the message based on confidence level
      if (validation.confidence === 'high') {
        setLocationValidationError(`⚠️ Location Mismatch: ${errorMessage}`)
      } else {
        setLocationValidationError(`⚠️ Possible Location Issue: ${errorMessage}`)
      }
    } else if (validation.confidence === 'low') {
      // Show warning but allow progression
      let warningMessage = validation.details
      if (validation.extractedCities && validation.extractedCities.length > 0) {
        warningMessage += `\n📍 Detected: ${validation.extractedCities.join(', ')}`
      }
      setLocationValidationError(`⚠️ Please verify: ${warningMessage}`)
    } else {
      setLocationValidationError(null)
    }
  }

  // Initialize contact email with user's email if not set
  useEffect(() => {
    if (!formData.email && user?.email) {
      onChange({ 
        email: user.email,
        contact_email: user.email 
      })
    }
  }, [user?.email, formData.email, onChange])

  // Validation - email is required, only block on high-confidence location errors
  useEffect(() => {
    const hasBlockingLocationError = locationValidationError && 
      locationValidationError.includes('Location Mismatch:')
    
    const isValid = !!(formData.email?.trim()) && !hasBlockingLocationError
    onValidation(isValid)
  }, [formData.email, locationValidationError, onValidation])

  return (
    <div className="space-y-6">
      {/* Location */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <MapPinIcon className="h-5 w-5" />
          Location
        </h3>
        
        <div className="space-y-2">
          <Label htmlFor="city">City *</Label>
          <CitiesFilter
            value={formData.city_id || ''}
            onChange={(cityId: string) => {
              onChange({ city_id: cityId })
              // Note: You can add city coordinate lookup here in the future
            }}
            placeholder="Select a city"
            includeAllOption={false}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="has-specific-location"
              checked={hasSpecificLocation}
              onCheckedChange={(checked) => {
                setHasSpecificLocation(!!checked)
                if (!checked) {
                  onChange({ 
                    job_address: '',
                    job_latitude: undefined,
                    job_longitude: undefined
                  })
                }
              }}
            />
            <Label htmlFor="has-specific-location">This job has a specific address</Label>
          </div>
          
          {hasSpecificLocation && (
            <div className="space-y-4">
              <LocationPicker
                value={formData.job_address ? {
                  address: formData.job_address,
                  latitude: formData.job_latitude || 0,
                  longitude: formData.job_longitude || 0
                } : undefined}
                onChange={(location) => {
                  // Clean the address to handle mixed scripts and redundant info
                  const cleanedAddress = cleanMapAddress(location.address)
                  
                  onChange({
                    job_address: cleanedAddress,
                    job_latitude: location.latitude,
                    job_longitude: location.longitude
                  })
                  
                  // Validate the cleaned location against selected city
                  validateLocation(cleanedAddress)
                }}
                placeholder="Enter the specific job address"
                selectedCityCoordinates={selectedCityCoordinates}
              />
              {locationValidationError && (
                <div className={`text-sm p-4 rounded-lg border ${
                  locationValidationError.includes('Location Mismatch:') 
                    ? 'text-red-600 bg-red-50 border-red-200' 
                    : 'text-amber-600 bg-amber-50 border-amber-200'
                }`}>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <svg className={`h-5 w-5 mt-0.5 ${
                        locationValidationError.includes('Location Mismatch:') ? 'text-red-500' : 'text-amber-500'
                      }`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-medium mb-2 ${
                        locationValidationError.includes('Location Mismatch:') ? 'text-red-800' : 'text-amber-800'
                      }`}>
                        {locationValidationError.includes('Location Mismatch:') ? 'Location Validation Error' : 'Location Warning'}
                      </h4>
                      <div className={`space-y-2 ${locationValidationError.includes('Location Mismatch:') ? 'text-red-700' : 'text-amber-700'}`}>
                        {locationValidationError.split('\n').map((line, index) => (
                          <p key={index} className={line.startsWith('📍') ? 'text-xs font-mono bg-white/60 p-2 rounded border' : ''}>
                            {line}
                          </p>
                        ))}
                      </div>
                      {!locationValidationError.includes('Location Mismatch:') && (
                        <p className="text-xs mt-3 text-amber-600 font-medium">
                          💡 You can proceed, but double-check that the location is correct
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Provide the specific address where the work will be performed. This helps candidates plan their commute and makes your job more discoverable.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Transportation */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Car className="h-5 w-5" />
          Transportation
        </h3>
        
        <div className="space-y-2">
          <Label htmlFor="transportation">Who handles transportation to the job location?</Label>
          <Select 
            value={formData.transportation || ''} 
            onValueChange={(value) => onChange({ 
              transportation: value as 'employer_provided' | 'employee_responsibility' 
            })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select transportation arrangement (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="employer_provided">Employer provides transportation</SelectItem>
              <SelectItem value="employee_responsibility">Employee handles own transportation</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Clarify who is responsible for getting to and from the job location.
          </p>
        </div>

        <div className="p-4 bg-secondary/50 rounded-lg">
          <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
            <Car className="h-4 w-4" />
            Transportation Tips
          </h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Clear transportation arrangements increase application rates</li>
            <li>• Consider offering transportation for remote job locations</li>
            <li>• Mention if parking is available for employees who drive</li>
            <li>• Include public transport accessibility information if relevant</li>
          </ul>
        </div>
      </div>

      {/* Schedule */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Schedule
        </h3>
        
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="has-start-date"
            checked={hasSpecificStartDate}
            onCheckedChange={(checked) => {
              setHasSpecificStartDate(!!checked)
              if (!checked) {
                onChange({ 
                  start_date: undefined,
                  start_time: undefined
                })
              }
            }}
          />
          <Label htmlFor="has-start-date">This job has a specific start date and time</Label>
        </div>

        {hasSpecificStartDate && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <DateTimePicker
                value={formData.start_date ? new Date(formData.start_date) : undefined}
                onChange={(date) => onChange({ 
                  start_date: date ? date.toISOString().split('T')[0] : undefined 
                })}
                placeholder="Select start date"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="start-time">Start Time</Label>
              <TimePicker
                value={formData.start_time}
                onChange={(time) => onChange({ start_time: time })}
                placeholder="Select start time"
              />
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="duration">
            Expected Duration <span className="text-muted-foreground">(Optional)</span>
          </Label>
          <DurationPicker
            value={formData.duration}
            onChange={(duration) => onChange({ duration })}
            placeholder="How long will this job take?"
          />
          <p className="text-xs text-muted-foreground">
            Helps candidates understand the time commitment and plan accordingly.
          </p>
        </div>

        <div className="p-4 bg-secondary/50 rounded-lg">
          <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
            <Clock className="h-4 w-4" />
            Scheduling Tips
          </h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Clear scheduling helps candidates plan and increases application rates</li>
            <li>• If flexible, mention &quot;Negotiable&quot; in the duration field</li>
            <li>• For ongoing work, select &quot;Ongoing&quot; duration option</li>
            <li>• Include buffer time for setup and cleanup</li>
          </ul>
        </div>
      </div>

      {/* Compensation */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Payment Options</h3>
        
        <div className="space-y-2">
          <Label htmlFor="salary-type">Payment Structure</Label>
          <Select 
            value={formData.salaryType || ''} 
            onValueChange={(value) => {
              onChange({ salaryType: value as 'fixed' | 'hourly' | 'daily' | 'weekly' | 'monthly' })
              // Clear min/max when switching to fixed
              if (value === 'fixed') {
                onChange({ salaryMax: undefined })
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select payment structure (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fixed">Fixed Price</SelectItem>
              <SelectItem value="hourly">Per Hour</SelectItem>
              <SelectItem value="daily">Per Day</SelectItem>
              <SelectItem value="weekly">Per Week</SelectItem>
              <SelectItem value="monthly">Per Month</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Smart payment calculator hint */}
          {formData.duration && (
            <div className="text-xs text-muted-foreground bg-blue-50 p-3 rounded-lg border border-blue-200">
              <div className="flex items-start gap-2">
                <Lightbulb className="h-4 w-4 mt-0.5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-800">Smart Payment Suggestion</p>
                  <p className="text-blue-700">
                    {getPaymentSuggestion(formData.duration)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {formData.salaryType && (
          <div className={formData.salaryType === 'fixed' ? "space-y-2" : "grid grid-cols-2 gap-4"}>
            {formData.salaryType === 'fixed' ? (
            <div className="space-y-2">
              <Label htmlFor="salary-fixed">
                Total Project Price <span className="text-muted-foreground">(BAM)</span>
              </Label>
              <Input
                id="salary-fixed"
                type="number"
                placeholder="e.g. 500"
                value={formData.salaryMin || ''}
                onChange={(e) => onChange({ 
                  salaryMin: e.target.value ? Number(e.target.value) : undefined,
                  salaryMax: undefined // Clear max for fixed price
                })}
              />
              <p className="text-xs text-muted-foreground">
                Enter the total amount you&apos;re willing to pay for the complete project.
              </p>
            </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="salary-min">
                    Minimum Rate <span className="text-muted-foreground">(BAM)</span>
                  </Label>
                  <Input
                    id="salary-min"
                    type="number"
                    placeholder="e.g. 20"
                    value={formData.salaryMin || ''}
                    onChange={(e) => onChange({ 
                      salaryMin: e.target.value ? Number(e.target.value) : undefined 
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salary-max">
                    Maximum Rate <span className="text-muted-foreground">(BAM, Optional)</span>
                  </Label>
                  <Input
                    id="salary-max"
                    type="number"
                    placeholder="e.g. 25"
                    value={formData.salaryMax || ''}
                    onChange={(e) => onChange({ 
                      salaryMax: e.target.value ? Number(e.target.value) : undefined 
                    })}
                  />
                </div>
              </>
            )}
          </div>
        )}

        {/* Payment calculation display */}
        {formData.salaryType && formData.salaryMin && formData.duration && (
          <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
            <h4 className="text-sm font-medium text-green-800 mb-3 flex items-center gap-1">
              <DollarSign className="h-5 w-5" />
              Smart Payment Calculation
            </h4>
            <div className="space-y-2">
              <div className="text-sm text-green-700 whitespace-pre-line font-mono bg-white/60 p-3 rounded border">
                {calculateTotalPayment(formData.salaryType, formData.salaryMin, formData.salaryMax, formData.duration)}
              </div>
              {formData.salaryType !== 'fixed' && (
                <p className="text-xs text-blue-600">
                  💡 This calculation automatically adjusts based on your selected duration and payment type
                </p>
              )}
            </div>
          </div>
        )}

        {formData.salaryType && (
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <DollarSign className="h-4 w-4" />
            Tip: Including salary information can increase application rates by up to 30%.
          </p>
        )}

        <div className="space-y-2">
          <Label htmlFor="legacy-salary">
            Additional Salary Notes <span className="text-muted-foreground">(Optional)</span>
          </Label>
          <Textarea
            id="legacy-salary"
            placeholder="e.g. Negotiable based on experience, Performance bonuses available..."
            value={formData.salary || ''}
            onChange={(e) => onChange({ salary: e.target.value })}
            className="min-h-[60px] resize-none"
          />
          <p className="text-xs text-muted-foreground">
            Add any additional context about compensation, benefits, or negotiability.
          </p>
        </div>

        <div className="p-4 bg-secondary/50 rounded-lg">
          <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
            <Target className="h-4 w-4" />
            Salary Best Practices
          </h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Be transparent about compensation to attract serious candidates</li>
            <li>• Use ranges for flexibility in negotiations</li>
            <li>• Include information about benefits or perks</li>
            <li>• Consider local market rates for the position</li>
          </ul>
        </div>
      </div>

      {/* Contact Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Contact Information</h3>
        
        <div className="space-y-2">
          <Label htmlFor="contact-email">Contact Email *</Label>
          <Input
            id="contact-email"
            type="email"
            placeholder="email@company.com"
            value={formData.email || ''}
            onChange={(e) => onChange({ 
              email: e.target.value,
              contact_email: e.target.value 
            })}
          />
          <p className="text-xs text-muted-foreground">
            This email will be shown to candidates for job applications and inquiries.
          </p>
          {user?.email && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Lightbulb className="h-4 w-4" />
              We&apos;ve pre-filled this with your account email ({user.email}).
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="website">
            Company Website or Application URL <span className="text-muted-foreground">(Optional)</span>
          </Label>
          <Input
            id="website"
            type="url"
            placeholder="https://company.com/careers"
            value={formData.website || ''}
            onChange={(e) => onChange({ website: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">
            If provided, candidates will see an &quot;Apply&quot; button linking to this URL.
          </p>
        </div>

        <div className="p-4 bg-secondary/50 rounded-lg">
          <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
            <Mail className="h-4 w-4" />
            Application Process
          </h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Candidates will contact you at the email address above</li>
            <li>• If you provide a website, it will be shown as an &quot;Apply&quot; button</li>
            <li>• You can change these details anytime after posting</li>
            <li>• Make sure to check your email regularly for applications</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
