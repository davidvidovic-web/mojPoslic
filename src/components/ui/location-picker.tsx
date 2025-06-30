'use client'

import { useState, useEffect } from "react"
import dynamic from 'next/dynamic'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Search } from "lucide-react"

// Import leaflet types
import type { LatLngExpression } from "leaflet"

// Dynamically import the map component to avoid SSR issues
const MapComponent = dynamic(
  () => import('./map-component').then((mod) => ({ default: mod.MapComponent })),
  { 
    ssr: false,
    loading: () => <div className="h-[300px] w-full bg-muted rounded-lg flex items-center justify-center">Loading map...</div>
  }
)

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
  const [searchQuery, setSearchQuery] = useState(value?.address || "")
  const [isSearching, setIsSearching] = useState(false)
  const [mapCenter, setMapCenter] = useState<LatLngExpression>(() => {
    // Set initial map center based on selected city or default to Sarajevo
    if (selectedCityCoordinates) {
      return [selectedCityCoordinates.lat, selectedCityCoordinates.lng]
    }
    return value ? [value.latitude, value.longitude] : [43.8563, 18.4131] // Sarajevo default
  })
  const [markerPosition, setMarkerPosition] = useState<LatLngExpression | null>(
    value ? [value.latitude, value.longitude] : null
  )

  // Update map center when selectedCityCoordinates changes
  useEffect(() => {
    if (selectedCityCoordinates) {
      setMapCenter([selectedCityCoordinates.lat, selectedCityCoordinates.lng])
      // Clear any existing marker when switching cities (unless there's a specific location set)
      if (!value) {
        setMarkerPosition(null)
      }
    }
  }, [selectedCityCoordinates, value])

  // Geocoding function using Nominatim (OpenStreetMap)
  const searchLocation = async (query: string) => {
    if (!query.trim()) return

    setIsSearching(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&countrycodes=ba&addressdetails=1`
      )
      const data = await response.json()
      
      if (data && data.length > 0) {
        const result = data[0]
        const location: LocationData = {
          address: result.display_name,
          latitude: parseFloat(result.lat),
          longitude: parseFloat(result.lon),
          city: result.address?.city || result.address?.town || result.address?.village,
          country: result.address?.country
        }
        
        setMapCenter([location.latitude, location.longitude])
        setMarkerPosition([location.latitude, location.longitude])
        setSearchQuery(location.address)
        onChange?.(location)
      }
    } catch (error) {
      console.error('Geocoding error:', error)
    } finally {
      setIsSearching(false)
    }
  }

  // Reverse geocoding function
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
      )
      const data = await response.json()
      
      if (data) {
        const location: LocationData = {
          address: data.display_name,
          latitude: lat,
          longitude: lng,
          city: data.address?.city || data.address?.town || data.address?.village,
          country: data.address?.country
        }
        
        setSearchQuery(location.address)
        onChange?.(location)
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error)
    }
  }

  const handleMapClick = (lat: number, lng: number) => {
    setMarkerPosition([lat, lng])
    reverseGeocode(lat, lng)
  }

  const handleSearch = (e?: React.FormEvent | React.MouseEvent) => {
    e?.preventDefault()
    searchLocation(searchQuery)
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Address Search */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <Input
            id="address-search"
            type="text"
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleSearch()
              }
            }}
          />
          <Button 
            type="button" 
            onClick={handleSearch} 
            disabled={isSearching} 
            className="px-3"
          >
            {isSearching ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Search for a specific address or click on the map to select a precise location within the selected city
        </p>
      </div>

      {/* Map */}
      <Card>
        <CardContent className="p-0">
          <div className="h-80 w-full relative rounded-lg overflow-hidden">
            <MapComponent
              center={mapCenter}
              zoom={13}
              markerPosition={markerPosition}
              onMapClick={handleMapClick}
            />
          </div>
        </CardContent>
      </Card>

      {/* Selected Location Info */}
      {value && (
        <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Selected Location:</p>
              <p className="text-xs">{value.address}</p>
              <p className="text-xs opacity-75">
                Coordinates: {value.latitude.toFixed(6)}, {value.longitude.toFixed(6)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
