'use client'

import { useTranslations } from 'next-intl'
import { GoogleMapsWrapper } from '@/components/ui/google-maps-wrapper'

interface GoogleJobLocationMapProps {
  latitude: number
  longitude: number
  address?: string
  jobTitle: string
  company: string
}

export function GoogleJobLocationMap({ 
  latitude, 
  longitude, 
  address, 
  jobTitle, 
  company 
}: GoogleJobLocationMapProps) {
  const t = useTranslations('jobLocationMap')

  return (
    <div className="w-full h-[250px] rounded-lg border border-border overflow-hidden">
      <GoogleMapsWrapper
        center={{ lat: latitude, lng: longitude }}
        zoom={15}
        markerPosition={{ lat: latitude, lng: longitude }}
        enableScrollWheel={false}
        className="h-full w-full"
      />
    </div>
  )
}
