import { NextRequest, NextResponse } from 'next/server'

// Cache management
const CACHE_DURATION = 30 * 24 * 60 * 60; // 30 days in seconds

// Type-safe cache interface
interface GeocodingResult {
  display_name: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    country?: string;
  };
  lat: string;
  lon: string;
}

// Simple in-memory cache for geocoding results
const geocodeCache = new Map<string, {
  data: GeocodingResult,
  timestamp: number
}>();

// Google Maps API Key
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const lat = url.searchParams.get('lat');
    const lng = url.searchParams.get('lng');
    
    // Basic validation
    if (!lat || !lng) {
      return NextResponse.json({ 
        display_name: "Invalid location", 
        error: 'Missing coordinates'
      }, { status: 200 }); // Always return 200 to avoid breaking client
    }
    
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    
    if (isNaN(latNum) || isNaN(lngNum)) {
      return NextResponse.json({ 
        display_name: "Invalid location format", 
        error: 'Invalid coordinates format'
      }, { status: 200 });
    }
    
    // Normalize coordinates for consistent caching
    const roundedLat = latNum.toFixed(6);
    const roundedLng = lngNum.toFixed(6);
    const cacheKey = `${roundedLat},${roundedLng}`;
    
    // Check cache first
    const cached = geocodeCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < CACHE_DURATION * 1000)) {
      return NextResponse.json(cached.data, {
        headers: { 'Cache-Control': `public, max-age=${CACHE_DURATION}` }
      });
    }
    
    // Try to get city data from our static data first (fastest method)
    try {
      // Dynamically import to avoid circular dependencies
      const { CITY_COORDINATES } = await import('@/lib/city-coordinates');
      
      // Check if these coordinates match any known city center (within ~200 meters)
      for (const [, city] of Object.entries(CITY_COORDINATES)) {
        if (Math.abs(city.lat - latNum) <= 0.002 && 
            Math.abs(city.lng - lngNum) <= 0.002) {
          
          // It's a city center match - create a city-based response
          const cityResult: GeocodingResult = {
            display_name: city.name,
            lat: city.lat.toString(),
            lon: city.lng.toString(),
            address: {
              city: city.name
            }
          };
          
          // Cache city result for longer (1 year)
          geocodeCache.set(cacheKey, {
            data: cityResult,
            timestamp: Date.now()
          });
          
          return NextResponse.json(cityResult, {
            headers: { 'Cache-Control': 'public, max-age=31536000' } // 1 year
          });
        }
      }
    } catch (cityError) {
      console.warn('City matching error:', cityError);
      // Continue to Google API call
    }
    
    // Google Maps Geocoding (if API key is available)
    if (GOOGLE_MAPS_API_KEY) {
      try {
        // Set a reasonable timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        try {
          const googleUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${roundedLat},${roundedLng}&key=${GOOGLE_MAPS_API_KEY}&language=bs`;
          
          const response = await fetch(googleUrl, {
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          
          if (response.ok) {
            const data = await response.json();
            
            if (data.status === 'OK' && data.results && data.results.length > 0) {
              // Process Google Maps result to match our expected format
              const googleResult = data.results[0];
              
              // Extract city from address components
              let city = null;
              for (const component of googleResult.address_components || []) {
                if (component.types.includes('locality') || 
                    component.types.includes('administrative_area_level_1')) {
                  city = component.long_name;
                  break;
                }
              }
              
              const formattedResult: GeocodingResult = {
                display_name: googleResult.formatted_address || `${roundedLat}, ${roundedLng}`,
                lat: roundedLat,
                lon: roundedLng,
                address: {
                  city: city || "Unknown Location"
                }
              };
              
              // Cache the successful result
              geocodeCache.set(cacheKey, {
                data: formattedResult,
                timestamp: Date.now()
              });
              
              return NextResponse.json(formattedResult, {
                headers: { 'Cache-Control': `public, max-age=${CACHE_DURATION}` }
              });
            }
          }
        } catch (error) {
          clearTimeout(timeoutId);
          console.warn('Google Maps API error:', error);
        }
      } catch (googleError) {
        console.warn('Google Maps error:', googleError);
      }
    } else {
      console.warn('Google Maps API key not configured, skipping Google geocoding');
    }
    
    // Fallback response - just use the coordinates
    const fallbackResult: GeocodingResult = {
      display_name: `${roundedLat}, ${roundedLng}`,
      lat: roundedLat,
      lon: roundedLng,
      address: {
        city: "Unknown Location"
      }
    };
    
    // Cache fallback too (for 1 day)
    geocodeCache.set(cacheKey, {
      data: fallbackResult,
      timestamp: Date.now()
    });
    
    return NextResponse.json(fallbackResult, {
      headers: { 'Cache-Control': `public, max-age=${24 * 60 * 60}` }
    });
    
  } catch (error) {
    console.error('Geocoding proxy error:', error);
    
    // Even if everything fails, return something usable
    return NextResponse.json({
      display_name: "Location unavailable",
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 200 }); // Still return 200 to avoid breaking the UI
  }
}
