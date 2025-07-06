'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Globe } from 'lucide-react'
import { useCities } from '@/contexts/data-context'

interface CitiesFilterProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  includeAllOption?: boolean
}

export function CitiesFilter({ value, onChange, placeholder = "All locations", className, includeAllOption = true }: CitiesFilterProps) {
  const { cities, loading } = useCities()

  // Ensure cities is always an array and handle loading state
  const citiesArray = Array.isArray(cities) ? cities : []

  // Group cities by special and regular
  const specialCities = citiesArray.filter(city => city.is_special)
  const regularCities = citiesArray.filter(city => !city.is_special)

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
                  {city.name_en}
                  {city.name_bs !== city.name_en && (
                    <span className="text-muted-foreground text-sm">({city.name_bs})</span>
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
              {city.name_en}
              {city.name_bs !== city.name_en && (
                <span className="text-muted-foreground text-sm">({city.name_bs})</span>
              )}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
