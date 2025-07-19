'use client'

import { useState, useEffect, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Search } from "lucide-react"
import { GeolocationService } from "@/lib/geolocation"
import { useTranslations } from 'next-intl'
import { GoogleMapsWrapper } from '@/components/ui/google-maps-wrapper'

interface LocationData {
  address: string
  latitude: number
  longitude: number
  city?: string
  country?: string
}

interface LocationPickerProps {
  value?: LocationData
  onChange?: (location: LocationData) => void
  placeholder?: string
  className?: string
  selectedCityCoordinates?: { lat: number; lng: number; name: string } | null
}

export function LocationPicker({
  value,
  onChange,
  placeholder = "Enter job location address",
  className = "",
  selectedCityCoordinates
}: LocationPickerProps) {
  const t = useTranslations('common')
  const [searchQuery, setSearchQuery] = useState(value?.address || "")
  const [isSearching, setIsSearching] = useState(false)
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [locationWarning, setLocationWarning] = useState<string | null>(null)
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>(() => {
    // Set initial map center based on selected city or default to Sarajevo
    if (selectedCityCoordinates) {
      return { lat: selectedCityCoordinates.lat, lng: selectedCityCoordinates.lng }
    }
    return value ? { lat: value.latitude, lng: value.longitude } : { lat: 43.8563, lng: 18.4131 } // Sarajevo default
  })
  const [markerPosition, setMarkerPosition] = useState<{ lat: number; lng: number } | null>(
    value ? { lat: value.latitude, lng: value.longitude } : null
  )
  const [isInternalUpdate, setIsInternalUpdate] = useState(false)

  // Update map center when selectedCityCoordinates changes
  useEffect(() => {
    if (selectedCityCoordinates && !value) {
      setMapCenter({ lat: selectedCityCoordinates.lat, lng: selectedCityCoordinates.lng })
    }
  }, [selectedCityCoordinates, value])

  // Update states when value prop changes from external source (not from map clicks)
  useEffect(() => {
    if (isInternalUpdate) {
      // For internal updates (map clicks, current location), don't do anything 
      // except reset the flag - we already have the correct state
      setIsInternalUpdate(false)
      return
    }
    
    if (value) {
      // Always update search query for external updates
      setSearchQuery(value.address)
      
      // Only update map center and marker if we don't have a marker or if this is truly a new external location
      const currentLat = markerPosition?.lat
      const currentLng = markerPosition?.lng
      
      // If we don't have a marker, or the new position is significantly different, update it
      if (!markerPosition || 
          Math.abs(value.latitude - currentLat!) > 0.01 || 
          Math.abs(value.longitude - currentLng!) > 0.01) {
        setMapCenter({ lat: value.latitude, lng: value.longitude })
        setMarkerPosition({ lat: value.latitude, lng: value.longitude })
      }
    }
  }, [value, isInternalUpdate, markerPosition])

  // Search for address (only called on submit/enter)
  const handleSearch = async (query: string) => {
    if (!query.trim()) return

    setIsSearching(true)
    setLocationWarning(null)
    
    try {
      // Use our server-side proxy to avoid exposing API keys and prevent CORS issues
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(query)}&limit=1`,
        {
          cache: 'no-cache' // Don't cache for better real-time results
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        const result = data[0];
        const location: LocationData = {
          address: result.display_name,
          latitude: parseFloat(result.lat),
          longitude: parseFloat(result.lon),
          city: result.address?.city || result.address?.town || result.address?.village,
          country: result.address?.country
        };
        
        // Check if location is outside Bosnia & Herzegovina
        if (!isInBosniaHerzegovina(location.latitude, location.longitude)) {
          setLocationWarning(t('locationPicker.outsideBosniaWarning'))
        }
        
        setMapCenter({ lat: location.latitude, lng: location.longitude });
        setMarkerPosition({ lat: location.latitude, lng: location.longitude });
        setSearchQuery(location.address);
        onChange?.(location);
      } else {
        console.log('No location found for query:', query);
      }
    } catch (error) {
      console.error('Address search error:', error);
      // For network errors, we still allow manual map clicking
    } finally {
      setIsSearching(false);
    }
  }

  // Function to check if coordinates are approximately in Bosnia & Herzegovina
  const isInBosniaHerzegovina = useCallback((lat: number, lng: number): boolean => {
    // Approximate bounding box for Bosnia & Herzegovina
    const minLat = 42.5;
    const maxLat = 45.3;
    const minLng = 15.7;
    const maxLng = 19.7;
    
    return lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng;
  }, [])

  // Reverse geocoding function to get address from coordinates
  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    try {
      // Check if location is in Bosnia & Herzegovina
      if (!isInBosniaHerzegovina(lat, lng)) {
        setLocationWarning(t('locationPicker.outsideBosniaWarning'))
        // Still allow the selection but show a warning
        const fallbackLocation: LocationData = {
          address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
          latitude: lat,
          longitude: lng
        };
        // Update search query immediately for internal updates
        setSearchQuery(fallbackLocation.address)
        onChange?.(fallbackLocation);
        return;
      } else {
        setLocationWarning(null)
      }

      // Use our geocoding service which now supports Google Maps
      const address = await GeolocationService.reverseGeocode(lat, lng);
      
      // Create location data object
      const location: LocationData = {
        address,
        latitude: lat,
        longitude: lng
      };
      
      // Update search query immediately for internal updates
      setSearchQuery(location.address)
      onChange?.(location);
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      // Fallback to coordinates when reverse geocoding fails
      const fallbackLocation: LocationData = {
        address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        latitude: lat,
        longitude: lng
      };
      // Update search query immediately for internal updates
      setSearchQuery(fallbackLocation.address)
      onChange?.(fallbackLocation);
    }
  }, [onChange, t, isInBosniaHerzegovina]) // Dependencies: onChange callback, translations, and boundary check

  const handleMapClick = useCallback((lat: number, lng: number) => {
    // Update marker position immediately for visual feedback
    setMarkerPosition({ lat, lng })
    setIsInternalUpdate(true) // Mark this as an internal update
    // Don't update map center - user clicked on visible area
    reverseGeocode(lat, lng)
  }, [reverseGeocode])

  // Function to get user's current location
  const getCurrentLocation = async () => {
    if (!GeolocationService.isSupported()) {
      console.error('Geolocation is not supported');
      return;
    }

    setIsGettingLocation(true);
    setLocationWarning(null)
    
    try {
      const position = await GeolocationService.getCurrentPosition();
      const { latitude, longitude } = position.coords;
      
      // Check if current location is in Bosnia & Herzegovina
      if (!isInBosniaHerzegovina(latitude, longitude)) {
        setLocationWarning(t('locationPicker.outsideBosniaWarning'))
      }
      
      // Update map center and marker position
      setMapCenter({ lat: latitude, lng: longitude });
      setMarkerPosition({ lat: latitude, lng: longitude });
      setIsInternalUpdate(true); // Mark this as an internal update
      
      // Get address for these coordinates
      await reverseGeocode(latitude, longitude);
    } catch (error) {
      console.error('Error getting current location:', error);
    } finally {
      setIsGettingLocation(false);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Input */}
      <div className="space-y-2 relative">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 relative">
            <Input
              type="text"
              placeholder={placeholder}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleSearch(searchQuery)
                }
              }}
              className="w-full"
            />
          </div>
          <div className="flex gap-2">
            <Button 
              type="button" 
              onClick={() => handleSearch(searchQuery)} 
              disabled={isSearching}
              variant="outline"
              className="flex-1 sm:flex-none px-3"
            >
              {isSearching ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
              ) : (
                <>
                  <Search className="h-4 w-4 sm:mr-0 mr-2" />
                  <span className="sm:hidden">Search</span>
                </>
              )}
            </Button>
            <Button 
              type="button" 
              onClick={getCurrentLocation} 
              disabled={isGettingLocation || !GeolocationService.isSupported()}
              variant="outline"
              className="flex-1 sm:flex-none px-3 whitespace-nowrap"
              title={t('locationPicker.findMyLocation')}
            >
              {isGettingLocation ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                  {t('locationPicker.findingLocation')}
                </>
              ) : (
                t('locationPicker.findMyLocation')
              )}
            </Button>
          </div>
        </div>
        
        {/* Location Warning */}
        {locationWarning && (
          <div className="text-sm p-3 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-200">
            <div className="flex items-start gap-2">
              <div className="flex-shrink-0">
                <svg className="h-4 w-4 mt-0.5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="font-medium">{locationWarning}</p>
              </div>
            </div>
          </div>
        )}
        
        <p className="text-xs text-muted-foreground">
          {t('locationPicker.helpText')}
        </p>
      </div>

      {/* Map */}
      <Card>
        <CardContent className="p-0">
          <div className="h-80 w-full relative rounded-lg overflow-hidden">
            <GoogleMapsWrapper
              center={mapCenter}
              zoom={15}
              markerPosition={markerPosition}
              onMapClick={handleMapClick}
              enableScrollWheel={true}
              className="h-full w-full"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
