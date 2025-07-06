'use client'

import { MapPin } from 'lucide-react'
import { formatLocation } from '@/lib/location-format'

interface LocationDisplayProps {
  location?: string | null
  className?: string
  showIcon?: boolean
  variant?: 'text' | 'badge' | 'with-icon'
}

export function LocationDisplay({ 
  location, 
  className = "",
  showIcon = true,
  variant = 'with-icon'
}: LocationDisplayProps) {
  if (!location) return null

  const formattedLocation = formatLocation(location)
  
  if (!formattedLocation) return null

  if (variant === 'text') {
    return (
      <span className={`text-sm text-muted-foreground ${className}`}>
        {formattedLocation}
      </span>
    )
  }

  if (variant === 'badge') {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 bg-secondary/20 text-xs text-muted-foreground rounded-md ${className}`}>
        {showIcon && <MapPin className="h-3 w-3" />}
        {formattedLocation}
      </span>
    )
  }

  // with-icon variant (default)
  return (
    <div className={`flex items-center gap-1 text-sm text-muted-foreground ${className}`}>
      {showIcon && <MapPin className="h-4 w-4" />}
      <span>{formattedLocation}</span>
    </div>
  )
}
