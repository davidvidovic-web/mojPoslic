'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default markers in Leaflet with Next.js
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

interface JobLocationMapProps {
  latitude: number
  longitude: number
  address?: string
  jobTitle: string
  company: string
}

export function JobLocationMap({ 
  latitude, 
  longitude, 
  address, 
  jobTitle, 
  company 
}: JobLocationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    // Initialize map
    const map = L.map(mapRef.current).setView([latitude, longitude], 13)

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map)

    // Add marker
    const marker = L.marker([latitude, longitude]).addTo(map)
    
    // Add popup with job information
    const popupContent = `
      <div class="text-center">
        <h3 class="font-semibold text-sm">${jobTitle}</h3>
        <p class="text-xs text-foreground/80">${company}</p>
        ${address ? `<p class="text-xs text-muted-foreground mt-1">${address}</p>` : ''}
      </div>
    `
    marker.bindPopup(popupContent).openPopup()

    mapInstanceRef.current = map

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [latitude, longitude, address, jobTitle, company])

  return (
    <div 
      ref={mapRef} 
      className="w-full h-[250px] rounded-lg border border-border overflow-hidden"
      style={{ zIndex: 1 }}
    />
  )
}
