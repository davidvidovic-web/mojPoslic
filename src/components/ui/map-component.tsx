'use client'

import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet"
import { LatLngExpression, Icon } from "leaflet"
import { useEffect } from "react"

// Fix for default markers in react-leaflet
if (typeof window !== 'undefined') {
  delete (Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl
  Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  })
}

interface MapComponentProps {
  center: LatLngExpression
  zoom: number
  markerPosition: LatLngExpression | null
  onMapClick: (lat: number, lng: number) => void
}

function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e: { latlng: { lat: number; lng: number } }) => {
      onMapClick(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

function MapCenterHandler({ center, zoom }: { center: LatLngExpression; zoom: number }) {
  const map = useMap()
  
  useEffect(() => {
    map.setView(center, zoom)
    // Force map to invalidate size in case container changed
    setTimeout(() => {
      map.invalidateSize()
    }, 100)
  }, [center, zoom, map])
  
  return null
}

export function MapComponent({ center, zoom, markerPosition, onMapClick }: MapComponentProps) {
  useEffect(() => {
    // Load Leaflet CSS from CDN if not already loaded
    if (typeof window !== 'undefined' && !document.querySelector('link[href*="leaflet"]')) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/leaflet.css'
      document.head.appendChild(link)
    }
  }, [])

  return (
    <MapContainer 
      center={center} 
      zoom={zoom} 
      style={{ height: '100%', width: '100%', minHeight: '300px' }}
      className="rounded-lg z-0"
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapClickHandler onMapClick={onMapClick} />
      <MapCenterHandler center={center} zoom={zoom} />
      {markerPosition && (
        <Marker position={markerPosition}>
          <Popup>
            Selected location
          </Popup>
        </Marker>
      )}
    </MapContainer>
  )
}
