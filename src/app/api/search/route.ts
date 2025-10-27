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

// Type for Google Geocoding API result
interface GoogleGeocodeResult {
  place_id: string;
  formatted_address: string;
  geometry: {
    location: {
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


    // Google Places API (if API key is available)
    if (GOOGLE_MAPS_API_KEY) {
      try {
        // Set a reasonable timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        let googleResults = null;
        
        try {
          // Strategy 1: Broad search with just Bosnia region (no specific types to avoid filtering out results)
          const googleUrl1 = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${GOOGLE_MAPS_API_KEY}&language=bs&region=ba`;
          
          
          const response1 = await fetch(googleUrl1, {
            signal: controller.signal
          });
          
          
          if (response1.ok) {
            const data1 = await response1.json();
            
            if (data1.status === 'OK' && data1.results && data1.results.length > 0) {
              googleResults = data1;
            } else if (data1.status === 'ZERO_RESULTS') {
            } else if (data1.error_message) {
              console.warn('Strategy 1 API error:', data1.error_message);
            }
          }
          
          // Strategy 2: Search with Bosnia Herzegovina suffix for more context
          if (!googleResults || !googleResults.results?.length) {
            
            const googleUrl2 = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query + ' Bosnia Herzegovina')}&key=${GOOGLE_MAPS_API_KEY}&language=bs&region=ba`;
            
            
            const response2 = await fetch(googleUrl2, {
              signal: controller.signal
            });
            
            if (response2.ok) {
              const data2 = await response2.json();
              
              if (data2.status === 'OK' && data2.results && data2.results.length > 0) {
                googleResults = data2;
              }
            }
          }
          
          // Strategy 3: Partial/fuzzy matching by searching individual words
          if (!googleResults || !googleResults.results?.length) {
            
            // Split query into words and try searching with each major word
            const words = query.toLowerCase().split(/\s+/).filter(word => word.length > 2);
            
            for (const word of words) {
              const googleUrl3 = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(word + ' street Bosnia')}&key=${GOOGLE_MAPS_API_KEY}&language=bs&region=ba`;
              
              
              const response3 = await fetch(googleUrl3, {
                signal: controller.signal
              });
              
              if (response3.ok) {
                const data3 = await response3.json();
                
                if (data3.status === 'OK' && data3.results && data3.results.length > 0) {
                  googleResults = data3;
                  break; // Found results with this word
                }
              }
            }
          }
          
          // Strategy 4: Try with major cities for specific street searches
          if (!googleResults || !googleResults.results?.length) {
            
            const commonCities = ['Sarajevo', 'Banja Luka', 'Tuzla', 'Zenica', 'Mostar', 'Bijeljina', 'Prijedor', 'Trebinje', 'Bihac', 'Doboj'];
            
            for (const city of commonCities) {
              const googleUrl4 = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query + ' ' + city)}&key=${GOOGLE_MAPS_API_KEY}&language=bs&region=ba`;
              
              
              const response4 = await fetch(googleUrl4, {
                signal: controller.signal
              });
              
              if (response4.ok) {
                const data4 = await response4.json();
                
                if (data4.status === 'OK' && data4.results && data4.results.length > 0) {
                  googleResults = data4;
                  break; // Found results, stop trying other cities
                }
              }
            }
          }
          
          // Strategy 5: Try Geocoding API with multiple variations
          if (!googleResults || !googleResults.results?.length) {
            
            const geocodeQueries = [
              query + ', Bosnia and Herzegovina',
              query + ', Bosnia',
              query + ', Sarajevo, Bosnia and Herzegovina',
              query + ', Banja Luka, Bosnia and Herzegovina'
            ];
            
            for (const geocodeQuery of geocodeQueries) {
              const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(geocodeQuery)}&key=${GOOGLE_MAPS_API_KEY}&language=bs&region=ba&components=country:BA`;
              
              
              const geocodeResponse = await fetch(geocodeUrl, {
                signal: controller.signal
              });
              
              if (geocodeResponse.ok) {
                const geocodeData = await geocodeResponse.json();
                
                if (geocodeData.status === 'OK' && geocodeData.results && geocodeData.results.length > 0) {
                  // Convert Geocoding API results to Places API format
                  const convertedResults = geocodeData.results.map((result: GoogleGeocodeResult) => ({
                    place_id: result.place_id,
                    name: result.formatted_address,
                    formatted_address: result.formatted_address,
                    geometry: {
                      location: result.geometry.location
                    }
                  }));
                  
                  googleResults = {
                    status: 'OK',
                    results: convertedResults
                  };
                  break; // Found results, stop trying other variations
                }
              }
            }
          }
          
          // Process results if found
          if (googleResults && googleResults.results && googleResults.results.length > 0) {
            
            // Format Google results to match our expected format
            const formattedResults: SearchResult[] = googleResults.results.slice(0, parseInt(limit)).map((place: GooglePlaceResult, index: number) => {
              // Extract city from formatted_address or use place name as fallback
              let cityName = place.name;
              if (place.formatted_address) {
                // Try to extract city from address components
                const addressParts = place.formatted_address.split(',').map(part => part.trim());
                // Look for a city name in the address parts (usually the second or third part)
                for (let i = 1; i < addressParts.length; i++) {
                  const part = addressParts[i];
                  if (part && !part.match(/^\d/) && part !== 'Bosnia and Herzegovina' && part !== 'Bosnia' && part !== 'Herzegovina') {
                    cityName = part;
                    break;
                  }
                }
              }
              
              return {
                place_id: place.place_id || `google-${index}`,
                osm_type: 'node',
                display_name: place.formatted_address || place.name,
                lat: place.geometry?.location?.lat.toString() || '0',
                lon: place.geometry?.location?.lng.toString() || '0',
                address: {
                  city: cityName,
                  country: 'Bosnia and Herzegovina',
                  country_code: 'ba'
                }
              };
            });
            
            
            return NextResponse.json(formattedResults);
          } else {
          }

          clearTimeout(timeoutId);
        } catch (error) {
          clearTimeout(timeoutId);
          console.error('Google Places API error:', error);
        }
      } catch (googleError) {
        console.error('Google Places error:', googleError);
      }
    } else {
      console.warn('Google Maps API key not configured, falling back to static data');
    }
    
    // Enhanced static fallback with fuzzy street matching
    try {
      // Dynamically import to avoid circular dependencies
      const { CITY_COORDINATES } = await import('@/lib/city-coordinates');
      
      const lowerQuery = query.toLowerCase();
      const matches = [];
      
      
      // Check if the query matches any city name first
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
      
      // Enhanced street name search with common Bosnian streets and fuzzy matching
      if (matches.length === 0) {
        
        // Common Bosnian street names (expanded list)
        const commonStreets = [
          'vase pelagica', 'vase pelagića', 'vase miskina', 'vase miškina',
          'mehmeda spaha', 'branilaca sarajeva', 'alipašina', 'ferhadija',
          'marsala tita', 'kralja tomislava', 'zmaja od bosne', 'patriotske lige',
          'fra anđela zvizdovića', 'grbavička', 'hamdije kreševljakovića',
          'bistrik', 'logavina', 'baščaršija', 'ćemaluša', 'safvet-bega bašagića',
          'vilsonovo šetalište', 'obala kulina bana', 'džemala bijedića',
          'ante starčevića', 'ive andrića', 'mula mustafe bašeskije',
          'koševo', 'dolac malta', 'augusta brauna', 'titova', 'tita',
          'omladinska', 'studentska', 'univerzitetska', 'akademska',
          'bulevar', 'trg', 'ulica', 'put', 'cesta'
        ];
        
        // Fuzzy matching function
        const fuzzyMatch = (street: string, query: string): number => {
          const streetWords = street.toLowerCase().split(/\s+/);
          const queryWords = query.toLowerCase().split(/\s+/);
          
          let score = 0;
          for (const qWord of queryWords) {
            for (const sWord of streetWords) {
              if (sWord.includes(qWord) || qWord.includes(sWord)) {
                score += 1;
              }
              // Check for character similarity
              const longer = qWord.length > sWord.length ? qWord : sWord;
              const shorter = qWord.length > sWord.length ? sWord : qWord;
              if (longer.includes(shorter) && shorter.length > 2) {
                score += 0.5;
              }
            }
          }
          return score;
        };
        
        // Find matching streets with scoring
        const streetMatches = commonStreets
          .map(street => ({ street, score: fuzzyMatch(street, lowerQuery) }))
          .filter(match => match.score > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, 3); // Top 3 matches
        
        
        if (streetMatches.length > 0) {
          // Generate results for major cities where these streets might exist
          const majorCities = ['sarajevo', 'banja-luka', 'tuzla', 'zenica', 'mostar'];
          
          streetMatches.forEach((match, streetIndex) => {
            majorCities.forEach((cityKey, cityIndex) => {
              const city = CITY_COORDINATES[cityKey];
              if (city && matches.length < parseInt(limit)) {
                // Add some reasonable offset to simulate different locations within the city
                const latOffset = (cityIndex * 0.01) + (streetIndex * 0.005);
                const lngOffset = (cityIndex * 0.01) + (streetIndex * 0.005);
                
                matches.push({
                  place_id: `${cityKey}-${match.street.replace(/\s+/g, '-')}-${streetIndex}-${cityIndex}`,
                  osm_type: 'way',
                  display_name: `${match.street.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}, ${city.name}, Bosnia and Herzegovina`,
                  lat: (city.lat + latOffset).toString(),
                  lon: (city.lng + lngOffset).toString(),
                  address: {
                    city: city.name,
                    country: 'Bosnia and Herzegovina',
                    country_code: 'ba'
                  }
                });
              }
            });
          });
        }
      }
      
      if (matches.length > 0) {
        // Limit to requested number
        const limitedMatches = matches.slice(0, parseInt(limit));
        
        return NextResponse.json(limitedMatches);
      }
    } catch (cityError) {
      console.warn('Enhanced static fallback error:', cityError);
    }
    
    // If all else fails, return empty array
    return NextResponse.json([]);
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json([]);
  }
}
