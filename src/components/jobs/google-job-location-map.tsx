'use client'

import { GoogleMapsWrapper } from '@/components/ui/google-maps-wrapper'

interface GoogleJobLocationMapProps {
  latitude: number
  longitude: number
}

export function GoogleJobLocationMap({ 
  latitude, 
  longitude
}: GoogleJobLocationMapProps) {
  return (
    <div className="w-full h-[250px] rounded-[var(--radius)] border border-border overflow-hidden">
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
