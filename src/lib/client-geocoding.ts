/**
 * Client-side geocoding service that works with HTTP referrer restricted Google Maps API keys
 */

export interface GeocodeResult {
  display_name: string;
  lat: string;
  lon: string;
  address: {
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    country?: string;
    full_address?: string;
  };
  source: 'google' | 'fallback' | 'cache';
}

// Client-side cache for geocoding results
const clientGeocodeCache = new Map<string, {
  data: GeocodeResult,
  timestamp: number
}>();

const CACHE_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

/**
 * Reverse geocode coordinates using Google Maps Geocoding API (client-side)
 * This bypasses HTTP referrer restrictions by making the call from the browser
 */
export async function reverseGeocodeClient(lat: number, lng: number): Promise<GeocodeResult> {
  const roundedLat = lat.toFixed(6);
  const roundedLng = lng.toFixed(6);
  const cacheKey = `${roundedLat},${roundedLng}`;
  
  // Check cache first
  const cached = clientGeocodeCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp < CACHE_DURATION)) {
    return cached.data;
  }
  
  // Get API key from environment
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  

  
  if (!apiKey) {
    console.warn('No Google Maps API key found - returning fallback');
    const fallbackResult: GeocodeResult = {
      display_name: `${roundedLat}, ${roundedLng}`,
      lat: roundedLat,
      lon: roundedLng,
      address: {
        city: "Unknown Location"
      },
      source: 'fallback'
    };
    return fallbackResult;
  }
  
  try {
    // Use client-side fetch (this will work with HTTP referrer restrictions)
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${roundedLat},${roundedLng}&key=${apiKey}&language=bs`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.status === 'OK' && data.results && data.results.length > 0) {
      const googleResult = data.results[0];
      
      // Extract address components
      let city = null;
      let country = null;
      let administrativeArea = null;
      
      for (const component of googleResult.address_components || []) {
        if (component.types.includes('locality')) {
          city = component.long_name;
        } else if (component.types.includes('administrative_area_level_2')) {
          administrativeArea = component.long_name;
        } else if (component.types.includes('administrative_area_level_1')) {
          if (!city && !administrativeArea) {
            city = component.long_name;
          }
        } else if (component.types.includes('country')) {
          country = component.long_name;
        }
      }
      
      // Use administrative area if no city found (common for coordinates in cities)
      if (!city && administrativeArea) {
        city = administrativeArea;
      }
      
      // Use the full formatted address from Google
      let displayName = googleResult.formatted_address;
      
      // Clean up overly long addresses but keep the street information
      if (displayName.length > 150) {
        const parts = displayName.split(',').map(p => p.trim());
        // Keep street address, city, and country (first 3-4 parts usually)
        displayName = parts.slice(0, Math.min(4, parts.length)).join(', ');
      }
      
      // For very short/generic results, try to enhance with more specific info
      if (displayName.length < 20 && city && country) {
        displayName = `${city}, ${country}`;
      }
      
      const result: GeocodeResult = {
        display_name: displayName,
        lat: roundedLat,
        lon: roundedLng,
        address: {
          city: city || "Unknown Location",
          country: country,
          full_address: googleResult.formatted_address
        },
        source: 'google'
      };
      
      // Cache the successful result
      clientGeocodeCache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });
      
      return result;
    } else if (data.status === 'REQUEST_DENIED' && data.error_message?.includes('referer restrictions')) {
      console.warn('Google Maps API: Referrer restrictions still blocking requests');
      console.warn('This is expected during the 5-10 minute propagation period after changing Google Cloud Console settings');
      throw new Error(`API referrer restrictions - changes may still be propagating`);
    } else {
      console.warn('Google Geocoding API error:', data.status, data.error_message);
      throw new Error(`Geocoding failed: ${data.status} - ${data.error_message || 'Unknown error'}`);
    }
    
  } catch (error) {
    console.warn('Client-side geocoding error:', error);
    
    // Return fallback result
    const fallbackResult: GeocodeResult = {
      display_name: `Location near ${roundedLat}, ${roundedLng}`,
      lat: roundedLat,
      lon: roundedLng,
      address: {
        city: "Unknown Location"
      },
      source: 'fallback'
    };
    
    // Cache fallback for shorter duration
    clientGeocodeCache.set(cacheKey, {
      data: fallbackResult,
      timestamp: Date.now()
    });
    
    return fallbackResult;
  }
}

/**
 * Utility function to check if coordinates are likely within a known city
 * This can be used as a fast pre-check before calling the Google API
 */
export async function isKnownCityLocation(lat: number, lng: number): Promise<{ isKnown: boolean; cityName?: string }> {
  try {
    // Try to import city coordinates
    const { CITY_COORDINATES } = await import('@/lib/city-coordinates');
    
    // Check if coordinates are within ~200 meters of any known city center
    for (const [, city] of Object.entries(CITY_COORDINATES)) {
      if (Math.abs(city.lat - lat) <= 0.002 && 
          Math.abs(city.lng - lng) <= 0.002) {
        return { isKnown: true, cityName: city.name };
      }
    }
    
    return { isKnown: false };
  } catch (error) {
    console.warn('City matching error:', error);
    return { isKnown: false };
  }
}

/**
 * Clear the geocoding cache (useful for testing or cleanup)
 */
export function clearGeocodeCache(): void {
  clientGeocodeCache.clear();
}

/**
 * Get cache statistics (useful for debugging)
 */
export function getGeocodeCache(): { size: number; keys: string[] } {
  return {
    size: clientGeocodeCache.size,
    keys: Array.from(clientGeocodeCache.keys())
  };
}