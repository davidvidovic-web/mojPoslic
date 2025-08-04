import { geocodeCache } from './geocode-cache';

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
    // Round coordinates to 6 decimal places for consistent cache keys
    const roundedLat = parseFloat(lat.toFixed(6));
    const roundedLng = parseFloat(lng.toFixed(6));
    
    // Check cache first
    const cached = geocodeCache.get(roundedLat, roundedLng);
    if (cached) {
      return cached;
    }
    
    // First check if these are city coordinates (avoid API call)
    try {
      const { CITY_COORDINATES } = await import('@/lib/city-coordinates');
      
      // Check if within ~100 meters of a city center
      for (const [, city] of Object.entries(CITY_COORDINATES)) {
        if (Math.abs(city.lat - roundedLat) <= 0.001 && 
            Math.abs(city.lng - roundedLng) <= 0.001) {
          
          // Cache and return the city name
          geocodeCache.set(roundedLat, roundedLng, city.name, 'city');
          return city.name;
        }
      }
    } catch (cityError) {
      console.warn('City lookup error:', cityError);
      // Continue to API lookup
    }
    
    // Try to get address via our proxy API
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      try {
        const response = await fetch(`/api/geocode?lat=${roundedLat}&lng=${roundedLng}`, {
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          const data = await response.json();
          
          if (data && data.display_name) {
            // Cache and return the address
            geocodeCache.set(roundedLat, roundedLng, data.display_name, 'google');
            return data.display_name;
          }
        }
      } catch (error) {
        console.warn('Geocoding API error:', error);
      } finally {
        clearTimeout(timeoutId);
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }
    
    // Fallback to coordinate string if everything else fails
    const fallbackAddress = `${roundedLat}, ${roundedLng}`;
    geocodeCache.set(roundedLat, roundedLng, fallbackAddress, 'fallback');
    return fallbackAddress;
  }

  // Enhanced reverse geocoding that extracts city information
  static async reverseGeocodeDetailed(lat: number, lng: number): Promise<{
    address: string;
    city?: string;
    cityKey?: string;
  }> {
    const roundedLat = parseFloat(lat.toFixed(6));
    const roundedLng = parseFloat(lng.toFixed(6));
    
    // First check if these are city coordinates
    try {
      const { CITY_COORDINATES } = await import('@/lib/city-coordinates');
      
      // Check if within ~500 meters of a city center for detailed matching
      for (const [cityKey, city] of Object.entries(CITY_COORDINATES)) {
        if (Math.abs(city.lat - roundedLat) <= 0.005 && 
            Math.abs(city.lng - roundedLng) <= 0.005) {
          
          return {
            address: city.name,
            city: city.name,
            cityKey: cityKey
          };
        }
      }
    } catch (cityError) {
      console.warn('City lookup error:', cityError);
    }
    
    // Try to get detailed address via our proxy API first for better address formatting
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // Increased timeout for better results
      
      try {
        const response = await fetch(`/api/geocode?lat=${roundedLat}&lng=${roundedLng}`, {
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache'
          }
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          const data = await response.json();
          
          if (data && data.display_name) {
            const result = {
              address: data.display_name,
              city: data.address?.city || data.address?.town || data.address?.village,
              cityKey: undefined as string | undefined
            };
            
            // Try to match the found city to our city list
            if (result.city) {
              try {
                const { CITY_COORDINATES } = await import('@/lib/city-coordinates');
                for (const [cityKey, cityData] of Object.entries(CITY_COORDINATES)) {
                  if (cityData.name.toLowerCase().includes(result.city.toLowerCase()) ||
                      result.city.toLowerCase().includes(cityData.name.toLowerCase())) {
                    result.cityKey = cityKey;
                    break;
                  }
                }
              } catch (error) {
                console.warn('City matching error:', error);
              }
            }
            
            return result;
          }
        }
      } catch (error) {
        console.warn('Detailed geocoding API error:', error);
      } finally {
        clearTimeout(timeoutId);
      }
    } catch (error) {
      console.error('Detailed geocoding error:', error);
    }
    
    // Fallback to basic reverse geocoding
    try {
      const basicAddress = await this.reverseGeocode(roundedLat, roundedLng);
      if (basicAddress && basicAddress !== `${roundedLat}, ${roundedLng}`) {
        return {
          address: basicAddress
        };
      }
    } catch (error) {
      console.warn('Basic reverse geocoding failed:', error);
    }
    
    // Final fallback to coordinates
    return {
      address: `${roundedLat}, ${roundedLng}`
    };
  }
}
