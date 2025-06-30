'use client'

import { useState, useEffect } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Globe } from 'lucide-react'

interface City {
  id: string
  key: string
  nameBS: string
  nameEN: string
  isSpecial?: boolean
  sortOrder: number
}

interface CitiesFilterProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  includeAllOption?: boolean
}

export function CitiesFilter({ value, onChange, placeholder = "All locations", className, includeAllOption = true }: CitiesFilterProps) {
  const [cities, setCities] = useState<City[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCities()
  }, [])

  const fetchCities = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/cities')
      if (!response.ok) {
        throw new Error('Failed to fetch cities')
      }
      const data = await response.json()
      // Handle both old format (direct array) and new format (nested in cities property)
      const citiesArray = Array.isArray(data) ? data : (data.cities || [])
      setCities(citiesArray)
    } catch (error) {
      console.error('Error fetching cities:', error)
    } finally {
      setLoading(false)
    }
  }

  // Group cities by special and regular
  const specialCities = cities.filter(city => city.isSpecial)
  const regularCities = cities.filter(city => !city.isSpecial)

  return (
    <Select value={value} onValueChange={onChange} disabled={loading}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={loading ? "Loading locations..." : placeholder} />
      </SelectTrigger>
      <SelectContent>
        {includeAllOption && <SelectItem value="all">All locations</SelectItem>}
        
        {/* Special cities (major cities + remote) */}
        {specialCities.length > 0 && (
          <>
            {specialCities.map((city) => (
              <SelectItem key={city.id} value={city.key}>
                <span className="flex items-center gap-2">
                  {city.key === 'remote' && <Globe className="h-4 w-4" />}
                  {city.nameEN}
                  {city.nameBS !== city.nameEN && (
                    <span className="text-muted-foreground text-sm">({city.nameBS})</span>
                  )}
                </span>
              </SelectItem>
            ))}
            
            {regularCities.length > 0 && (
              <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground border-t">
                Other cities
              </div>
            )}
          </>
        )}
        
        {/* Regular cities */}
        {regularCities.map((city) => (
          <SelectItem key={city.id} value={city.key}>
            <span className="flex items-center gap-2">
              {city.nameEN}
              {city.nameBS !== city.nameEN && (
                <span className="text-muted-foreground text-sm">({city.nameBS})</span>
              )}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
