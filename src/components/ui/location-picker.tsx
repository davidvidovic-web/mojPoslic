'use client'

import { useState, useEffect, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Search, MapPin, Target } from "lucide-react"
import { GeolocationService } from "@/lib/geolocation"
import { useTranslations } from 'next-intl'
import { GoogleMapsWrapper } from '@/components/ui/google-maps-wrapper'
import { useConfirmationDialog } from '@/hooks/use-confirmation-dialog'
import { CITY_COORDINATES } from '@/lib/city-coordinates'

interface LocationData {
  address: string
  latitude: number
  longitude: number
  city?: string
  country?: string
  cityKey?: string // Add cityKey to identify matching cities in our system
}

interface SearchResult {
  place_id: string
  osm_type: string
  display_name: string
  lat: string
  lon: string
  address: {
    city?: string
    country?: string
    country_code?: string
  }
}

interface LocationPickerProps {
  value?: LocationData
  onChange?: (location: LocationData, isConfirmedCrossCity?: boolean) => void
  onCrossCityConfirmation?: () => void // New callback for when user confirms cross-city location
  placeholder?: string
  className?: string
  selectedCityCoordinates?: { lat: number; lng: number; name: string } | null
  selectedCityName?: string // Add this to know which city is currently selected
}

export function LocationPicker({
  value,
  onChange,
  onCrossCityConfirmation,
  placeholder = "Enter job location address",
  className = "",
  selectedCityCoordinates,
  selectedCityName
}: LocationPickerProps) {
  const t = useTranslations('common')
  const { showConfirmation, ConfirmationDialog } = useConfirmationDialog()
  const [searchQuery, setSearchQuery] = useState(value?.address || "")
  const [isSearching, setIsSearching] = useState(false)
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [locationWarning, setLocationWarning] = useState<string | null>(null)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [showResults, setShowResults] = useState(false)
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

  // Search for address - now returns multiple results
  const handleSearch = async (query: string) => {
    if (!query.trim()) return

    setIsSearching(true)
    setLocationWarning(null)
    setShowResults(false)
    
    try {
      // Use our server-side proxy to get multiple results
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(query)}&limit=5`, // Get up to 5 results
        {
          cache: 'no-cache' // Don't cache for better real-time results
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        setSearchResults(data);
        setShowResults(true);
      } else {
        setLocationWarning(t('locationPicker.noResults'));
        setSearchResults([]);
        setShowResults(false);
      }
    } catch (error) {
      console.error('Search error:', error);
      setLocationWarning(t('locationPicker.searchError'));
      setSearchResults([]);
      setShowResults(false);
    } finally {
      setIsSearching(false);
    }
  }

  // Function to handle selecting a search result
  const handleSelectResult = async (result: SearchResult) => {
    const latitude = parseFloat(result.lat);
    const longitude = parseFloat(result.lon);
    
    // Hide results dropdown
    setShowResults(false);
    setSearchQuery(result.display_name);

    // Check if location is outside Bosnia & Herzegovina
    if (!isInBosniaHerzegovina(latitude, longitude)) {
      showConfirmation({
        title: t('locationPicker.outsideBosniaTitle'),
        message: t('locationPicker.outsideBosniaMessage'),
        confirmText: t('locationPicker.understood'),
        cancelText: t('general.ok')
      }, () => {
        // User acknowledged, but don't update location
      });
      return;
    }

    // Check if searched location matches selected city
    if (selectedCityName) {
      const currentCityKey = findCityFromCoordinates(latitude, longitude);
      const selectedCityKey = selectedCityName.toLowerCase().replace(/\s+/g, '-');
      
      if (currentCityKey && currentCityKey !== selectedCityKey) {
        // Different city detected, ask for confirmation
        const currentCityName = Object.entries(CITY_COORDINATES).find(
          ([key]) => key === currentCityKey
        )?.[0]?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown City';
        
        showConfirmation({
          title: t('locationPicker.cityMismatchTitle'),
          message: t('locationPicker.cityMismatchMessage', { 
            selectedCity: selectedCityName, 
            currentCity: currentCityName 
          }),
          confirmText: t('locationPicker.confirmLocation'),
          cancelText: t('locationPicker.keepSelected')
        }, () => {
          // User confirmed cross-city location
          updateLocationData(result.display_name, latitude, longitude, true);
          onCrossCityConfirmation?.();
        });
        return;
      }
    }

    // Location is valid, update
    updateLocationData(result.display_name, latitude, longitude);
  }

  const updateLocationData = (address: string, latitude: number, longitude: number, isConfirmedCrossCity = false) => {
    // Update map center and marker position
    setMapCenter({ lat: latitude, lng: longitude });
    setMarkerPosition({ lat: latitude, lng: longitude });
    setIsInternalUpdate(true);

    // Get city info for the location
    const cityKey = findCityFromCoordinates(latitude, longitude);
    const cityInfo = cityKey ? CITY_COORDINATES[cityKey] : null;
    
    const locationData: LocationData = {
      address,
      latitude,
      longitude,
      city: cityInfo?.name || "Unknown",
      country: "Bosnia and Herzegovina",
      cityKey: cityKey || undefined
    };

    onChange?.(locationData, isConfirmedCrossCity);
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

  // Function to find which city the coordinates belong to
  const findCityFromCoordinates = useCallback((lat: number, lng: number): string | null => {
    // Check against known city coordinates
    for (const [cityKey, coords] of Object.entries(CITY_COORDINATES)) {
      const distance = Math.sqrt(
        Math.pow(lat - coords.lat, 2) + Math.pow(lng - coords.lng, 2)
      );
      // If within ~10km radius (rough approximation)
      if (distance < 0.1) {
        return cityKey;
      }
    }
    return null;
  }, [])

  // Function to get user's current location with confirmations
  const getCurrentLocation = async () => {
    if (!GeolocationService.isSupported()) {
      console.error('Geolocation is not supported');
      return;
    }

    const performLocationUpdate = async (latitude: number, longitude: number, isConfirmedCrossCity = false) => {
      // Update map center and marker position
      setMapCenter({ lat: latitude, lng: longitude });
      setMarkerPosition({ lat: latitude, lng: longitude });
      setIsInternalUpdate(true); // Mark this as an internal update
      
      // Get address for these coordinates
      await reverseGeocode(latitude, longitude, isConfirmedCrossCity);
    };

    setIsGettingLocation(true);
    setLocationWarning(null)
    
    try {
      const position = await GeolocationService.getCurrentPosition();
      const { latitude, longitude } = position.coords;
      
      // Check if current location is in Bosnia & Herzegovina
      if (!isInBosniaHerzegovina(latitude, longitude)) {
        setIsGettingLocation(false);
        showConfirmation({
          title: t('locationPicker.outsideBosniaTitle'),
          message: t('locationPicker.outsideBosniaMessage'),
          confirmText: t('locationPicker.understood'),
          cancelText: t('general.ok')
        }, () => {
          // User acknowledged, but don't update location
        });
        return;
      }

      // Check if current location matches selected city
      if (selectedCityName) {
        const currentCityKey = findCityFromCoordinates(latitude, longitude);
        const selectedCityKey = selectedCityName.toLowerCase().replace(/\s+/g, '-');
        
        if (currentCityKey && currentCityKey !== selectedCityKey) {
          // Different city detected, ask for confirmation
          const currentCityName = Object.entries(CITY_COORDINATES).find(
            ([key]) => key === currentCityKey
          )?.[0]?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown City';
          
          setIsGettingLocation(false);
          showConfirmation({
            title: t('locationPicker.cityMismatchTitle'),
            message: t('locationPicker.cityMismatchMessage', { 
              selectedCity: selectedCityName, 
              currentCity: currentCityName 
            }),
            confirmText: t('locationPicker.confirmLocation'),
            cancelText: t('locationPicker.keepSelected')
          }, () => {
            // User confirmed, signal cross-city confirmation and update location with flag
            onCrossCityConfirmation?.()
            performLocationUpdate(latitude, longitude, true); // true = isConfirmedCrossCity
          });
          return;
        }
      }
      
      // No conflicts, proceed with location update
      await performLocationUpdate(latitude, longitude);
    } catch (error) {
      console.error('Error getting current location:', error);
    } finally {
      setIsGettingLocation(false);
    }
  };

  // Reverse geocoding function to get address from coordinates
  const reverseGeocode = useCallback(async (lat: number, lng: number, isConfirmedCrossCity = false) => {
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
        onChange?.(fallbackLocation, isConfirmedCrossCity);
        return;
      } else {
        setLocationWarning(null)
      }

      // Use enhanced geocoding service to get detailed location info immediately
      // This will prioritize getting a readable address rather than just coordinates
      const locationData = await GeolocationService.reverseGeocodeDetailed(lat, lng);
      
      // Create location data object with city information
      const location: LocationData = {
        address: locationData.address,
        latitude: lat,
        longitude: lng,
        city: locationData.city,
        country: "Bosnia and Herzegovina",
        cityKey: locationData.cityKey || undefined
      };
      
      // Update search query immediately for internal updates
      setSearchQuery(location.address)
      onChange?.(location, isConfirmedCrossCity);
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
      onChange?.(fallbackLocation, isConfirmedCrossCity);
    }
  }, [onChange, t, isInBosniaHerzegovina]) // Dependencies: onChange callback, translations, and boundary check

  const handleMapClick = useCallback((lat: number, lng: number) => {
    // Update marker position immediately for visual feedback
    setMarkerPosition({ lat, lng })
    setIsInternalUpdate(true) // Mark this as an internal update
    // Don't update map center - user clicked on visible area
    reverseGeocode(lat, lng)
  }, [reverseGeocode])

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
                // Hide results when user starts typing
                if (showResults) {
                  setShowResults(false)
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleSearch(searchQuery)
                }
                if (e.key === 'Escape') {
                  setShowResults(false)
                }
              }}
              onFocus={() => {
                // Show results again if we have search results when focusing
                if (searchResults.length > 0) {
                  setShowResults(true)
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
                <>
                  <Target className="h-4 w-4 mr-2" />
                  {t('locationPicker.findMyLocation')}
                </>
              )}
            </Button>
          </div>
        </div>
        
        {/* Search Results Dropdown */}
        {showResults && searchResults.length > 0 && (
          <div className="relative">
            <Card className="absolute top-0 left-0 right-0 z-10 max-h-64 overflow-y-auto border border-gray-200 shadow-lg thin-scrollbar">
              <CardContent className="p-2">
                <div className="space-y-1">
                  {searchResults.map((result, index) => (
                    <button
                      key={result.place_id || index}
                      onClick={() => handleSelectResult(result)}
                      className="w-full text-left p-3 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-none bg-transparent"
                    >
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 mt-0.5 text-gray-500 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                            {result.display_name}
                          </p>
                          {result.address?.city && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {result.address.city}, {result.address.country || 'Bosnia and Herzegovina'}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2">
                  <button
                    onClick={() => setShowResults(false)}
                    className="w-full text-center text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 py-1"
                  >
                    {t('general.close')}
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
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
      
      {/* Confirmation Dialog */}
      <ConfirmationDialog />
    </div>
  )
}
