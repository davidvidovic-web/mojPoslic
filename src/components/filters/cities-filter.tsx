'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Globe } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'
import { useCities } from '@/hooks/use-static-data'

interface CitiesFilterProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  includeAllOption?: boolean
}

export function CitiesFilter({ value, onChange, placeholder, className, includeAllOption = true }: CitiesFilterProps) {
  const { cities, loading } = useCities()
  const t = useTranslations('filters')
  const locale = useLocale()
  
  const defaultPlaceholder = placeholder || t('allLocations')

  // Get special and regular active cities
  const specialCities = Array.isArray(cities) 
    ? cities.filter(city => city.is_active !== false && city.is_special === true) 
    : []
    
  const regularCities = Array.isArray(cities)
    ? cities.filter(city => city.is_active !== false && !(city.is_special === true))
    : []

  // Helper function to get city name based on locale
  const getCityName = (city: {
    name_bs?: string
    name_en?: string
    name?: string
  }) => {
    if (locale === 'bs') {
      return city.name_bs || city.name_en || city.name
    } else {
      return city.name_en || city.name_bs || city.name
    }
  }

  return (
    <Select value={value} onValueChange={onChange} disabled={loading}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={loading ? t('loadingLocations') : defaultPlaceholder} />
      </SelectTrigger>
      <SelectContent>
        {includeAllOption && <SelectItem value="all">{t('allLocations')}</SelectItem>}
        
        {/* Special cities (major cities + remote) */}
        {Array.isArray(specialCities) && specialCities.length > 0 && (
          <>
            {specialCities.map((city) => (
              <SelectItem key={city.id} value={city.key}>
                <span className="flex items-center gap-2">
                  {city.key === 'remote' && <Globe className="h-4 w-4" />}
                  {getCityName(city)}
                  {locale === 'en' && city.name_bs !== city.name_en && (
                    <span className="text-muted-foreground text-sm">({city.name_bs})</span>
                  )}
                  {locale === 'bs' && city.name_en !== city.name_bs && (
                    <span className="text-muted-foreground text-sm">({city.name_en})</span>
                  )}
                </span>
              </SelectItem>
            ))}
            
            {Array.isArray(regularCities) && regularCities.length > 0 && (
              <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground border-t">
                {t('otherCities')}
              </div>
            )}
          </>
        )}
        
        {/* Regular cities */}
        {Array.isArray(regularCities) && regularCities.map((city) => (
          <SelectItem key={city.id} value={city.key}>
            <span className="flex items-center gap-2">
              {getCityName(city)}
              {locale === 'en' && city.name_bs !== city.name_en && (
                <span className="text-muted-foreground text-sm">({city.name_bs})</span>
              )}
              {locale === 'bs' && city.name_en !== city.name_bs && (
                <span className="text-muted-foreground text-sm">({city.name_en})</span>
              )}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
