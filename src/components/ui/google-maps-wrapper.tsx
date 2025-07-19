'use client'

import { Wrapper, Status } from '@googlemaps/react-wrapper'
import { useEffect, useRef } from 'react'

interface GoogleMapProps {
  center: { lat: number; lng: number }
  zoom: number
  markerPosition?: { lat: number; lng: number } | null
  onMapClick?: (lat: number, lng: number) => void
  enableScrollWheel?: boolean
  showFullscreenControl?: boolean
  className?: string
}

function MapComponent({ 
  center, 
  zoom, 
  markerPosition, 
  onMapClick,
  enableScrollWheel = true,
  showFullscreenControl = false,
  className = "h-[300px] w-full"
}: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<unknown>(null)
  const markerInstance = useRef<unknown>(null)
  const clickListenerRef = useRef<unknown>(null)

  // Initialize map only once
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return

    const win = window as { google?: { maps?: { Map: unknown; Marker: unknown; Animation?: { DROP: unknown } } } }
    if (!win.google?.maps) return

    const MapConstructor = win.google.maps.Map as new (element: HTMLElement, options: Record<string, unknown>) => unknown
    mapInstance.current = new MapConstructor(mapRef.current, {
      center,
      zoom,
      streetViewControl: false,
      mapTypeControl: false,
      fullscreenControl: showFullscreenControl,
      zoomControl: true,
      scrollwheel: enableScrollWheel,
      disableDoubleClickZoom: false,
      clickableIcons: true,
      mapId: 'DEMO_MAP_ID' // Required for Advanced Markers
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run once when component mounts - initial options are captured

  // Update click listener when onMapClick changes
  useEffect(() => {
    if (!mapInstance.current) return

    const win = window as { google?: { maps?: { event?: { removeListener: (listener: unknown) => void } } } }
    
    // Remove previous click listener
    if (clickListenerRef.current && win.google?.maps?.event?.removeListener) {
      win.google.maps.event.removeListener(clickListenerRef.current)
    }

    // Add new click listener
    if (onMapClick) {
      const mapWithListener = mapInstance.current as { addListener: (event: string, handler: (e: { latLng?: { lat(): number; lng(): number } }) => void) => unknown }
      clickListenerRef.current = mapWithListener.addListener('click', (e: { latLng?: { lat(): number; lng(): number } }) => {
        if (e.latLng) {
          onMapClick(e.latLng.lat(), e.latLng.lng())
        }
      })
    }
  }, [onMapClick])

  // Update map options when they change
  useEffect(() => {
    if (!mapInstance.current) return

    const map = mapInstance.current as { setOptions: (options: Record<string, unknown>) => void }
    map.setOptions({
      scrollwheel: enableScrollWheel,
      fullscreenControl: showFullscreenControl,
      zoomControl: true
    })
  }, [enableScrollWheel, showFullscreenControl])

  // Update center and zoom when props change
  useEffect(() => {
    if (mapInstance.current) {
      const map = mapInstance.current as { setCenter: (center: { lat: number; lng: number }) => void; setZoom: (zoom: number) => void }
      map.setCenter(center)
      map.setZoom(zoom)
    }
  }, [center, zoom])

  // Handle marker updates
  useEffect(() => {
    if (!mapInstance.current) return

    const win = window as { 
      google?: { 
        maps?: { 
          Marker: unknown; 
          marker?: { 
            AdvancedMarkerElement: unknown;
            PinElement: unknown;
          };
          Animation?: { DROP: unknown } 
        } 
      } 
    }
    if (!win.google?.maps) return

    // Remove existing marker
    if (markerInstance.current) {
      const marker = markerInstance.current as { map: unknown }
      marker.map = null
      markerInstance.current = null
    }

    // Add new marker if position is provided
    if (markerPosition) {
      // Try to use AdvancedMarkerElement if available, fallback to classic Marker
      if (win.google.maps.marker?.AdvancedMarkerElement) {
        const AdvancedMarkerConstructor = win.google.maps.marker.AdvancedMarkerElement as new (options: Record<string, unknown>) => unknown
        markerInstance.current = new AdvancedMarkerConstructor({
          position: markerPosition,
          map: mapInstance.current,
          title: 'Selected location'
        })
      } else {
        // Fallback to classic marker (with deprecation warning)
        const MarkerConstructor = win.google.maps.Marker as new (options: Record<string, unknown>) => unknown
        markerInstance.current = new MarkerConstructor({
          position: markerPosition,
          map: mapInstance.current,
          animation: win.google.maps.Animation?.DROP
        })
      }
    }
  }, [markerPosition])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Cleanup click listener
      if (clickListenerRef.current) {
        const win = window as { google?: { maps?: { event?: { removeListener: (listener: unknown) => void } } } }
        if (win.google?.maps?.event?.removeListener) {
          win.google.maps.event.removeListener(clickListenerRef.current)
        }
      }
      
      // Cleanup marker
      if (markerInstance.current) {
        // Handle both AdvancedMarkerElement and classic Marker cleanup
        const marker = markerInstance.current as { map?: unknown; setMap?: (map: null) => void }
        if (marker.setMap) {
          marker.setMap(null)
        } else if (marker.map !== undefined) {
          marker.map = null
        }
      }
      
      // Cleanup map
      if (mapInstance.current) {
        const win = window as { google?: { maps?: { event?: { clearInstanceListeners: (instance: unknown) => void } } } }
        if (win.google?.maps?.event?.clearInstanceListeners) {
          win.google.maps.event.clearInstanceListeners(mapInstance.current)
        }
      }
    }
  }, [])

  return <div ref={mapRef} className={className} />
}

export function GoogleMapsWrapper(props: GoogleMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  if (!apiKey) {
    return (
      <div className="h-[300px] w-full flex items-center justify-center bg-muted rounded-lg p-4 text-center">
        <div>
          <p className="font-medium text-red-500 mb-2">Google Maps API Key Missing</p>
          <p className="text-sm text-muted-foreground">
            Please add your Google Maps API key to .env file as NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
          </p>
        </div>
      </div>
    )
  }

  const render = (status: Status) => {
    switch (status) {
      case Status.LOADING:
        return (
          <div className="h-[300px] w-full flex items-center justify-center bg-muted rounded-lg">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Loading Google Maps...</p>
            </div>
          </div>
        )
      case Status.FAILURE:
        return (
          <div className="h-[300px] w-full flex items-center justify-center bg-muted rounded-lg p-4 text-center">
            <div>
              <p className="font-medium text-red-500 mb-2">Failed to load Google Maps</p>
              <p className="text-sm text-muted-foreground">Please check your internet connection and API key</p>
            </div>
          </div>
        )
      case Status.SUCCESS:
        return <MapComponent {...props} />
    }
  }

  return (
    <Wrapper 
      apiKey={apiKey} 
      render={render}
      libraries={['places', 'marker']}
    >
      <MapComponent {...props} />
    </Wrapper>
  )
}
