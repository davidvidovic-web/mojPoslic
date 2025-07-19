'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { loadGoogleMapsScript, isGoogleMapsLoaded } from '@/lib/google-maps-loader'

// Define container style for the map
const containerStyle = {
  width: '100%',
  height: '100%',
  minHeight: '300px',
  borderRadius: '0.5rem'
}

// Define center type for TypeScript
type MapProps = {
  center: { lat: number; lng: number }
  zoom: number
  markerPosition: { lat: number; lng: number } | null
  onMapClick: (lat: number, lng: number) => void
  enableScrollWheel?: boolean
  showFullscreenControl?: boolean
}

export function GoogleMapComponent({ 
  center, 
  zoom, 
  markerPosition, 
  onMapClick,
  enableScrollWheel = true,
  showFullscreenControl = false
}: MapProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<unknown>(null)
  const markerRef = useRef<unknown>(null)
  const clickListenerRef = useRef<unknown>(null)
  const initializedRef = useRef(false)

  // Memoize the click handler to prevent re-initialization
  const handleMapClick = useCallback((e: unknown) => {
    const event = e as { latLng?: { lat(): number; lng(): number } };
    if (event.latLng) {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      onMapClick(lat, lng);
    }
  }, [onMapClick]);

    // Initialize Google Maps (only once)
  useEffect(() => {
    if (initializedRef.current) return;
    
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    const initMap = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Check if API key is available
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
          throw new Error('Google Maps API key is missing');
        }

        // Set a timeout for the entire initialization process
        timeoutId = setTimeout(() => {
          if (mounted) {
            setError('Google Maps loading timed out');
            setIsLoading(false);
          }
        }, 15000); // 15 second timeout

        // Load Google Maps script
        await loadGoogleMapsScript();

        if (!mounted) return;

        // Verify Google Maps is loaded
        if (!isGoogleMapsLoaded()) {
          throw new Error('Google Maps failed to load');
        }

        // Wait a bit more for Google Maps to be fully ready
        await new Promise(resolve => setTimeout(resolve, 100));

        if (!mounted) return;

        // Wait for DOM element to be ready
        let retryCount = 0;
        const maxRetries = 10;
        
        while (!mapRef.current && retryCount < maxRetries && mounted) {
          await new Promise(resolve => setTimeout(resolve, 100));
          retryCount++;
        }

        if (!mounted) return;

        // Create map instance ONLY if it doesn't exist
        if (mapRef.current && !mapInstanceRef.current) {
          const win = window as unknown as { google: { maps: { Map: unknown } } };
          if (win.google && win.google.maps) {
            const MapConstructor = win.google.maps.Map as new (element: HTMLElement, options: Record<string, unknown>) => unknown;
            
            mapInstanceRef.current = new MapConstructor(mapRef.current, {
              center: center,
              zoom: zoom,
              streetViewControl: false,
              mapTypeControl: false,
              fullscreenControl: showFullscreenControl,
              zoomControl: true,
              scrollwheel: enableScrollWheel,
              disableDoubleClickZoom: false,
              clickableIcons: false,
              gestureHandling: 'cooperative'
            });
            
            // Trigger a resize to ensure the map renders properly
            setTimeout(() => {
              if (mapInstanceRef.current && mounted) {
                const win = window as unknown as { google: { maps: { event: { trigger: (instance: unknown, event: string) => void } } } };
                if (win.google?.maps?.event?.trigger) {
                  win.google.maps.event.trigger(mapInstanceRef.current, 'resize');
                }
              }
            }, 250);
            
            // Clear timeout only after successful map creation
            clearTimeout(timeoutId);
            setIsLoaded(true);
            setIsLoading(false);
            initializedRef.current = true;
            
          } else {
            throw new Error('Google Maps API not available on window object');
          }
        } else {
          throw new Error('Map container not available after retries');
        }
      } catch (err) {
        if (mounted) {
          console.error('Google Maps initialization error:', err);
          setError(err instanceof Error ? err.message : 'Failed to load Google Maps');
          setIsLoading(false);
        }
        clearTimeout(timeoutId);
      }
    };

    initMap();

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
    };
  }, [center, zoom, enableScrollWheel, showFullscreenControl]);

  // Update click listener when handler changes
  useEffect(() => {
    if (mapInstanceRef.current && isLoaded) {
      // Remove existing listener
      if (clickListenerRef.current) {
        const win = window as unknown as { google: { maps: { event: { removeListener: (listener: unknown) => void } } } };
        if (win.google && win.google.maps && win.google.maps.event) {
          win.google.maps.event.removeListener(clickListenerRef.current);
        }
      }
      
      // Add new listener
      const mapInstance = mapInstanceRef.current as { addListener: (event: string, handler: (e: unknown) => void) => unknown };
      clickListenerRef.current = mapInstance.addListener('click', handleMapClick);
    }
  }, [handleMapClick, isLoaded]);

  // Update map center when center prop changes
  useEffect(() => {
    if (mapInstanceRef.current && isLoaded) {
      const mapInstance = mapInstanceRef.current as { panTo: (center: { lat: number; lng: number }) => void; setZoom: (zoom: number) => void };
      mapInstance.panTo(center);
      mapInstance.setZoom(zoom);
    }
  }, [center, zoom, isLoaded]);

  // Handle marker updates
  useEffect(() => {
    if (mapInstanceRef.current && isLoaded) {
      // Remove existing marker
      if (markerRef.current) {
        const marker = markerRef.current as { setMap: (map: unknown) => void };
        marker.setMap(null);
        markerRef.current = null;
      }

      // Add new marker if position is provided
      if (markerPosition) {
        const win = window as unknown as { google: { maps: { Marker: unknown; Animation: { DROP: unknown } } } };
        if (win.google && win.google.maps) {
          const MarkerConstructor = win.google.maps.Marker as new (options: Record<string, unknown>) => unknown;
          markerRef.current = new MarkerConstructor({
            position: markerPosition,
            map: mapInstanceRef.current,
            animation: win.google.maps.Animation.DROP
          });
        }
      }
    }
  }, [markerPosition, isLoaded]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (markerRef.current) {
        const marker = markerRef.current as { setMap: (map: unknown) => void };
        marker.setMap(null);
        markerRef.current = null;
      }
      if (mapInstanceRef.current) {
        const win = window as unknown as { google: { maps: { event: { clearInstanceListeners: (instance: unknown) => void } } } };
        if (win.google && win.google.maps && win.google.maps.event) {
          win.google.maps.event.clearInstanceListeners(mapInstanceRef.current);
        }
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Show loading state
  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-muted rounded-lg" style={{ minHeight: '300px' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading Google Maps...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-muted rounded-lg p-4 text-center" style={{ minHeight: '300px' }}>
        <div>
          <p className="font-medium text-red-500 mb-2">Failed to load Google Maps</p>
          <p className="text-sm text-muted-foreground">{error}</p>
          {error.includes('API key') && (
            <p className="text-xs text-muted-foreground mt-2">
              Please add your Google Maps API key to .env file as NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full rounded-lg overflow-hidden" style={{ minHeight: '300px' }}>
      <div 
        ref={mapRef}
        style={{
          ...containerStyle,
          backgroundColor: '#f5f5f5', // Add background color to see if container is visible
          border: '1px solid #ddd' // Add border for debugging
        }}
        className="rounded-lg"
      />
      {/* Debug info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-2 left-2 bg-white p-2 text-xs rounded shadow z-10">
          Loaded: {isLoaded ? 'Yes' : 'No'} | 
          Map: {mapInstanceRef.current ? 'Created' : 'None'} | 
          Center: {center.lat.toFixed(4)}, {center.lng.toFixed(4)}
        </div>
      )}
    </div>
  );
}
