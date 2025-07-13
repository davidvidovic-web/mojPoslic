'use client'

import { useEffect, useRef, useState } from 'react'

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
  const mapInstanceRef = useRef<unknown>(null)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient || !mapRef.current || mapInstanceRef.current) return

    const initializeMap = async () => {
      // Dynamic import of Leaflet
      const L = await import('leaflet')
      
      // Import CSS dynamically for client-side only
      if (typeof window !== 'undefined') {
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
        document.head.appendChild(link)
      }

      // Fix for default markers in Leaflet with Next.js
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      })

      // Initialize map
      const map = L.map(mapRef.current!).setView([latitude, longitude], 13)

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
    }

    initializeMap()

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (mapInstanceRef.current as any).remove()
        mapInstanceRef.current = null
      }
    }
  }, [isClient, latitude, longitude, address, jobTitle, company])

  if (!isClient) {
    return (
      <div className="w-full h-[250px] rounded-lg border border-border overflow-hidden bg-muted flex items-center justify-center">
        <p className="text-muted-foreground">Loading map...</p>
      </div>
    )
  }

  return (
    <div 
      ref={mapRef} 
      className="w-full h-[250px] rounded-lg border border-border overflow-hidden"
      style={{ zIndex: 1 }}
    />
  )
}
