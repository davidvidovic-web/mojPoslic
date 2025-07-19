import { NextRequest, NextResponse } from 'next/server';

// Type for Google Places API result
interface GooglePlaceResult {
  place_id: string;
  name: string;
  formatted_address?: string;
  geometry?: {
    location?: {
      lat: number;
      lng: number;
    };
  };
}

// Type for our API response
interface SearchResult {
  place_id: string;
  osm_type: string;
  display_name: string;
  lat: string;
  lon: string;
  address: {
    city?: string;
    country?: string;
    country_code?: string;
  };
}

// Google Maps API Key
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const limit = searchParams.get('limit') || '5';

    // Validate input
    if (!query) {
      return NextResponse.json([], { status: 200 });
    }

    console.log('Search API called with query:', query);

    // Google Places API (if API key is available)
    if (GOOGLE_MAPS_API_KEY) {
      try {
        // Set a reasonable timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        try {
          // Search without any restrictions
          const googleUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${GOOGLE_MAPS_API_KEY}&language=bs`;
          
          console.log('Trying Google Places API with URL:', googleUrl.replace(GOOGLE_MAPS_API_KEY, 'API_KEY_HIDDEN'));
          
          const response = await fetch(googleUrl, {
            signal: controller.signal
          });
          
          console.log('Google Places API response status:', response.status);
          
          if (response.ok) {
            const data = await response.json();
            
            console.log('Google Places API response:', {
              status: data.status,
              resultsCount: data.results?.length || 0,
              error: data.error_message
            });
            
            if (data.status === 'OK' && data.results && data.results.length > 0) {
              // Format Google results to match our expected format
              const formattedResults: SearchResult[] = data.results.slice(0, parseInt(limit)).map((place: GooglePlaceResult) => ({
                place_id: place.place_id,
                osm_type: 'node',
                display_name: place.formatted_address || place.name,
                lat: place.geometry?.location?.lat.toString() || '0',
                lon: place.geometry?.location?.lng.toString() || '0',
                address: {
                  city: place.name,
                  country: place.formatted_address?.includes('Bosnia') || place.formatted_address?.includes('Herzegovina') ? 'Bosnia and Herzegovina' : 'Unknown',
                  country_code: place.formatted_address?.includes('Bosnia') || place.formatted_address?.includes('Herzegovina') ? 'ba' : 'unknown'
                }
              }));
              
              console.log('Found results, returning:', formattedResults.length, 'results');
              
              return NextResponse.json(formattedResults);
            }
          }

          clearTimeout(timeoutId);
        } catch (error) {
          clearTimeout(timeoutId);
          console.warn('Google Places API error:', error);
        }
      } catch (googleError) {
        console.warn('Google Places error:', googleError);
      }
    } else {
      console.warn('Google Maps API key not configured, falling back to static data');
    }
    
    // Static city data fallback
    try {
      // Dynamically import to avoid circular dependencies
      const { CITY_COORDINATES } = await import('@/lib/city-coordinates');
      
      const lowerQuery = query.toLowerCase();
      const matches = [];
      
      // Check if the query matches any city name
      for (const [key, city] of Object.entries(CITY_COORDINATES)) {
        if (city.name.toLowerCase().includes(lowerQuery)) {
          matches.push({
            place_id: key,
            osm_type: 'node',
            display_name: city.name + ', Bosnia and Herzegovina',
            lat: city.lat.toString(),
            lon: city.lng.toString(),
            address: {
              city: city.name,
              country: 'Bosnia and Herzegovina',
              country_code: 'ba'
            }
          });
        }
      }
      
      if (matches.length > 0) {
        // Limit to requested number
        const limitedMatches = matches.slice(0, parseInt(limit));
        
        return NextResponse.json(limitedMatches);
      }
    } catch (cityError) {
      console.warn('City matching error:', cityError);
    }
    
    // If all else fails, return empty array
    console.log('No results found for query:', query, '- returning empty array');
    return NextResponse.json([]);
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json([]);
  }
}
