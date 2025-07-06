'use client'

import { useState, useCallback } from 'react'
import { GeolocationService, GeolocationPosition, GeolocationError } from '@/lib/geolocation'

export interface UseGeolocationReturn {
  position: GeolocationPosition | null
  error: GeolocationError | null
  loading: boolean
  getCurrentLocation: () => Promise<void>
  clearError: () => void
}

export function useGeolocation(): UseGeolocationReturn {
  const [position, setPosition] = useState<GeolocationPosition | null>(null)
  const [error, setError] = useState<GeolocationError | null>(null)
  const [loading, setLoading] = useState(false)

  const getCurrentLocation = useCallback(async () => {
    if (!GeolocationService.isSupported()) {
      setError({ code: 0, message: 'Geolocation is not supported by this browser' })
      return
    }

    setLoading(true)
    setError(null)

    try {
      const pos = await GeolocationService.getCurrentPosition()
      setPosition(pos)
    } catch (err) {
      setError(err as GeolocationError)
    } finally {
      setLoading(false)
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    position,
    error,
    loading,
    getCurrentLocation,
    clearError
  }
}
