'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Globe } from 'lucide-react'
import { useCities } from '@/hooks/use-data'

interface CitiesFilterProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  includeAllOption?: boolean
}

export function CitiesFilter({ value, onChange, placeholder = "All locations", className, includeAllOption = true }: CitiesFilterProps) {
  const { isLoading, getSpecialCities, getActiveCities } = useCities()

  // Get special and regular active cities
  const specialCities = Array.isArray(getSpecialCities()) 
    ? getSpecialCities().filter(city => city.is_active !== false && city.isActive !== false) 
    : []
    
  const regularCities = Array.isArray(getActiveCities())
    ? getActiveCities().filter(city => !(city.is_special === true || city.isSpecial === true))
    : []

  return (
    <Select value={value} onValueChange={onChange} disabled={isLoading}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={isLoading ? "Loading locations..." : placeholder} />
      </SelectTrigger>
      <SelectContent>
        {includeAllOption && <SelectItem value="all">All locations</SelectItem>}
        
        {/* Special cities (major cities + remote) */}
        {Array.isArray(specialCities) && specialCities.length > 0 && (
          <>
            {specialCities.map((city) => (
              <SelectItem key={city.id} value={city.key}>
                <span className="flex items-center gap-2">
                  {city.key === 'remote' && <Globe className="h-4 w-4" />}
                  {city.name_en || city.nameEN}
                  {(city.name_bs || city.nameBS) !== (city.name_en || city.nameEN) && (
                    <span className="text-muted-foreground text-sm">({city.name_bs || city.nameBS})</span>
                  )}
                </span>
              </SelectItem>
            ))}
            
            {Array.isArray(regularCities) && regularCities.length > 0 && (
              <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground border-t">
                Other cities
              </div>
            )}
          </>
        )}
        
        {/* Regular cities */}
        {Array.isArray(regularCities) && regularCities.map((city) => (
          <SelectItem key={city.id} value={city.key}>
            <span className="flex items-center gap-2">
              {city.name_en || city.nameEN}
              {(city.name_bs || city.nameBS) !== (city.name_en || city.nameEN) && (
                <span className="text-muted-foreground text-sm">({city.name_bs || city.nameBS})</span>
              )}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
