import { geocodeCache } from './geocode-cache';
import { reverseGeocodeClient } from './client-geocoding';

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
  private static _lastErrorLogged: number | null = null

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
              message = 'Location access denied by user or blocked by browser policy'
              break
            case GEOLOCATION_ERRORS.POSITION_UNAVAILABLE:
              message = 'Location information is unavailable'
              break
            case GEOLOCATION_ERRORS.TIMEOUT:
              message = 'Location request timed out'
              break
          }
          // Only log the error once per session to avoid spam
          if (!this._lastErrorLogged || this._lastErrorLogged !== error.code) {
            console.warn('Geolocation error:', message, error);
            this._lastErrorLogged = error.code;
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
    
    // Use client-side geocoding for best results
    try {
      const { reverseGeocodeClient } = await import('@/lib/client-geocoding');
      const geocodeResult = await reverseGeocodeClient(roundedLat, roundedLng);
      
      if (geocodeResult && geocodeResult.display_name) {
        // Cache and return the address
        const cacheSource = geocodeResult.source === 'google' ? 'google' : 'fallback';
        geocodeCache.set(roundedLat, roundedLng, geocodeResult.display_name, cacheSource);
        return geocodeResult.display_name;
      }
    } catch (error) {
      console.warn('Client-side geocoding error:', error);
    }
    
    // Enhanced fallback: try to estimate city based on proximity to known cities
    try {
      const { CITY_COORDINATES } = await import('@/lib/city-coordinates');
      
      // Find the closest city (within 30km for reasonable approximation)
      let closestCity = null;
      let minDistance = Infinity;
      
      for (const [, city] of Object.entries(CITY_COORDINATES)) {
        // More accurate distance calculation using Haversine approximation
        const latDiff = city.lat - roundedLat;
        const lngDiff = city.lng - roundedLng;
        
        // Simple distance calculation in km (rough approximation for small distances)
        const a = Math.sin(latDiff * Math.PI / 180 / 2) ** 2 + 
                  Math.cos(roundedLat * Math.PI / 180) * Math.cos(city.lat * Math.PI / 180) *
                  Math.sin(lngDiff * Math.PI / 180 / 2) ** 2;
        const distance = 2 * 6371 * Math.asin(Math.sqrt(a)); // Distance in km
        
        if (distance < minDistance && distance < 30) { // 30km radius
          minDistance = distance;
          closestCity = city;
        }
      }
      
      if (closestCity) {
        // If very close (within 2km), just use the city name
        // Otherwise, show "near" the city
        const approximateAddress = minDistance < 2 
          ? `${closestCity.name}, Bosnia and Herzegovina`
          : `Near ${closestCity.name}, Bosnia and Herzegovina`;
        geocodeCache.set(roundedLat, roundedLng, approximateAddress, 'fallback');
        return approximateAddress;
      }
    } catch (error) {
      console.warn('City approximation error:', error);
    }
    
    // Final fallback to coordinate string with better formatting
    const fallbackAddress = `Location: ${roundedLat}°N, ${roundedLng}°E`;
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
    
    // Use client-side geocoding for best results (bypasses referrer restrictions)
    try {
      const geocodeResult = await reverseGeocodeClient(roundedLat, roundedLng);
      
      if (geocodeResult && geocodeResult.display_name) {
        const result = {
          address: geocodeResult.display_name,
          city: geocodeResult.address?.city || geocodeResult.address?.town || geocodeResult.address?.village,
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
    } catch (error) {
      console.warn('Client-side geocoding error:', error);
    }
    
    // Fallback to server-side API (may have limited functionality due to referrer restrictions)
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // Shorter timeout for fallback
      
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
        console.warn('Server-side geocoding API error:', error);
      } finally {
        clearTimeout(timeoutId);
      }
    } catch (error) {
      console.error('Fallback geocoding error:', error);
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
    
    // Enhanced fallback: try to find nearest city
    try {
      const { CITY_COORDINATES } = await import('@/lib/city-coordinates');
      
      // Find the closest city within a reasonable distance
      let closestCity = null;
      let minDistance = Infinity;
      
      for (const [cityKey, city] of Object.entries(CITY_COORDINATES)) {
        // More accurate distance calculation using Haversine approximation
        const latDiff = city.lat - roundedLat;
        const lngDiff = city.lng - roundedLng;
        
        // Simple distance calculation in km (rough approximation for small distances)
        const a = Math.sin(latDiff * Math.PI / 180 / 2) ** 2 + 
                  Math.cos(roundedLat * Math.PI / 180) * Math.cos(city.lat * Math.PI / 180) *
                  Math.sin(lngDiff * Math.PI / 180 / 2) ** 2;
        const distance = 2 * 6371 * Math.asin(Math.sqrt(a)); // Distance in km
        
        if (distance < minDistance) {
          minDistance = distance;
          closestCity = { ...city, cityKey };
        }
      }
      
      // If within 30km, provide a meaningful address
      if (closestCity && minDistance < 30) {
        const approximateAddress = minDistance < 2
          ? `${closestCity.name}, Bosnia and Herzegovina` // Very close to city center
          : `Near ${closestCity.name}, Bosnia and Herzegovina`; // Nearby
          
        return {
          address: approximateAddress,
          city: closestCity.name,
          cityKey: closestCity.cityKey
        };
      }
    } catch (error) {
      console.warn('City approximation error in detailed geocoding:', error);
    }
    
    // Final fallback - better formatted coordinates with Bosnia context
    return {
      address: `Location in Bosnia and Herzegovina (${roundedLat}°N, ${roundedLng}°E)`
    };
  }
}
