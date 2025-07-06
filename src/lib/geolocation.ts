export interface GeolocationPosition {
  coords: {
    latitude: number
    longitude: number
    accuracy: number
  }
}

export interface GeolocationError {
  code: number
  message: string
}

export const GEOLOCATION_ERRORS = {
  PERMISSION_DENIED: 1,
  POSITION_UNAVAILABLE: 2,
  TIMEOUT: 3
} as const

export class GeolocationService {
  static isSupported(): boolean {
    return 'geolocation' in navigator
  }

  static async getCurrentPosition(options?: PositionOptions): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!this.isSupported()) {
        reject(new Error('Geolocation is not supported by this browser'))
        return
      }

      const defaultOptions: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
        ...options
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            coords: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy
            }
          })
        },
        (error) => {
          let message = 'Unable to retrieve your location'
          switch (error.code) {
            case GEOLOCATION_ERRORS.PERMISSION_DENIED:
              message = 'Location access denied by user'
              break
            case GEOLOCATION_ERRORS.POSITION_UNAVAILABLE:
              message = 'Location information is unavailable'
              break
            case GEOLOCATION_ERRORS.TIMEOUT:
              message = 'Location request timed out'
              break
          }
          reject({ code: error.code, message })
        },
        defaultOptions
      )
    })
  }

  static async reverseGeocode(lat: number, lng: number): Promise<string> {
    try {
      // Add headers to potentially reduce rate limiting
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'mojPoslic/1.0'
          }
        }
      )
      
      if (!response.ok) {
        // Handle rate limiting (429) and other HTTP errors
        if (response.status === 429) {
          console.warn('Reverse geocoding rate limited, falling back to coordinates')
        } else {
          console.warn(`Reverse geocoding failed with status ${response.status}`)
        }
        return `${lat.toFixed(6)}, ${lng.toFixed(6)}`
      }
      
      const data = await response.json()
      
      if (data && data.display_name) {
        return data.display_name
      }
      
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`
    } catch (error) {
      console.error('Reverse geocoding error:', error)
      // Gracefully fall back to coordinates when CORS or network errors occur
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`
    }
  }
}
