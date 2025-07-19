'use client'

import { useState, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { LocationPicker } from '@/components/ui/location-picker'
import { CitiesFilter } from '@/components/filters/cities-filter'
import { CreateJobData } from '@/types/job'
import { validateLocationInCity, cleanMapAddress } from '@/lib/location-utils'
import { CITY_COORDINATES } from '@/lib/city-coordinates'
import { MapPin as MapPinIcon } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { useData } from '@/hooks/use-data'
import { useTranslations } from 'next-intl'

interface LocationSectionProps {
  formData: CreateJobData
  onChange: (data: Partial<CreateJobData>) => void
  onLocationValidationChange: (error: string | null) => void
}

export function LocationSection({ formData, onChange, onLocationValidationChange }: LocationSectionProps) {
  const { user } = useAuth()
  const { cities } = useData()
  const t = useTranslations('jobPost.types.location')
  const [hasSpecificLocation, setHasSpecificLocation] = useState(!!formData.job_address)
  const [locationValidationError, setLocationValidationError] = useState<string | null>(null)
  
  // City coordinates for map centering
  const [selectedCityCoordinates, setSelectedCityCoordinates] = useState<{ lat: number; lng: number; name: string } | null>(null)
  const [selectedCityName, setSelectedCityName] = useState<string>('')

  // Auto-load user's city if not already set (based on location if available)
  useEffect(() => {
    if (!formData.city_id && user?.location && cities.length > 0) {
      // Try to match user's location to a city
      const userLocation = user.location.toLowerCase();
      // First try exact match with city key
      const cityByKey = cities.find(city => 
        city.key.toLowerCase() === userLocation
      );
      
      if (cityByKey) {
        onChange({ city_id: cityByKey.id });
        return;
      }
      
      // Then try to match by name
      const cityByName = cities.find(city => 
        userLocation.includes(city.name_en.toLowerCase()) || 
        userLocation.includes(city.name_bs.toLowerCase()) ||
        (city.name && userLocation.includes(city.name.toLowerCase()))
      );
      
      if (cityByName) {
        onChange({ city_id: cityByName.id });
        return;
      }
    }
  }, [user?.location, formData.city_id, onChange, cities])

  // Fetch city name and coordinates when city_id changes
  useEffect(() => {
    if (formData.city_id) {
      const city = cities.find(c => c.id === formData.city_id)
      
      if (city) {
        const cityName = city.name_en
        setSelectedCityName(cityName)
        
        // Look up coordinates from predefined mapping
        const coordinates = CITY_COORDINATES[city.key]
        if (coordinates) {
          setSelectedCityCoordinates({
            lat: coordinates.lat,
            lng: coordinates.lng,
            name: cityName
          })
          
          // If no specific address is set, automatically center map on the city
          if (!formData.job_address) {
            setHasSpecificLocation(true)
          }
        }
      }
    }
  }, [formData.city_id, cities, formData.job_address])

  // Enhanced location validation against selected city with script handling
  const validateLocation = (address: string) => {
    if (!address || !selectedCityName) {
      setLocationValidationError(null)
      onLocationValidationChange(null)
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
        const error = `⚠️ Location Mismatch: ${errorMessage}`
        setLocationValidationError(error)
        onLocationValidationChange(error)
      } else {
        const error = `⚠️ Possible Location Issue: ${errorMessage}`
        setLocationValidationError(error)
        onLocationValidationChange(error)
      }
    } else if (validation.confidence === 'low') {
      // Show warning but allow progression
      let warningMessage = validation.details
      if (validation.extractedCities && validation.extractedCities.length > 0) {
        warningMessage += `\n📍 Detected: ${validation.extractedCities.join(', ')}`
      }
      const warning = `⚠️ Please verify: ${warningMessage}`
      setLocationValidationError(warning)
      onLocationValidationChange(warning)
    } else {
      setLocationValidationError(null)
      onLocationValidationChange(null)
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <MapPinIcon className="h-5 w-5" />
        {t('title')}
      </h3>
      
      <div className="space-y-2">
        <Label htmlFor="city">{t('cityRequired')}</Label>
        <CitiesFilter
          value={formData.city_id || ''}
          onChange={(cityId: string) => {
            onChange({ city_id: cityId })
          }}
          placeholder={t('selectCity')}
          includeAllOption={false}
          className="w-full"
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
              } else {
                // Reset map to center of Banja Luka when enabling specific location
                const banjaLukaCoords = CITY_COORDINATES['banja-luka']
                if (banjaLukaCoords) {
                  setSelectedCityCoordinates({
                    lat: banjaLukaCoords.lat,
                    lng: banjaLukaCoords.lng,
                    name: banjaLukaCoords.name
                  })
                }
              }
            }}
          />
          <Label htmlFor="has-specific-location">{t('hasSpecificLocation')}</Label>
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
                
                // Update form data first
                onChange({
                  job_address: cleanedAddress,
                  job_latitude: location.latitude,
                  job_longitude: location.longitude
                })
                
                // Defer validation to avoid immediate re-renders during map interaction
                setTimeout(() => {
                  validateLocation(cleanedAddress)
                }, 0)
              }}
              placeholder={t('addressPlaceholder')}
              selectedCityCoordinates={selectedCityCoordinates}
            />
            {locationValidationError && (
              <div className={`text-sm p-4 rounded-lg border ${
                locationValidationError.includes('Location Mismatch:') 
                  ? 'text-red-600 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800' 
                  : 'text-amber-600 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800'
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
                        <p key={index} className={line.startsWith('📍') ? 'text-xs font-mono bg-card/60 p-2 rounded border' : ''}>
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
              {t('addressHelp')}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
