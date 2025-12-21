/**
 * City extraction utilities for map addresses
 */

/**
 * Extract city information from detailed map addresses
 * Handles complex address formats like: "Street, District, City, Municipality, Canton, etc."
 */
export function extractCityFromMapAddress(address: string): string[] {
  if (!address) return []
  
  // Split by commas and clean each part
  const parts = address.split(',').map(part => part.trim())
  
  // Common patterns for administrative divisions in Bosnian addresses
  const adminIndicators = [
    /Municipality/i,
    /Canton/i,
    /City of/i,
    /Federation of/i,
    /Republic of/i,
    /Bosnia and Herzegovina/i,  // Full country name first
    /Bosna i Hercegovina/i,     // Local language version
    /Bosnia/i,
    /Herzegovina/i,
    /Republika Srpska/i,
    /Brčko District/i
  ]
  
  // Street/address indicators to skip
  const streetIndicators = [
    /ulica/i,        // street
    /šetalište/i,    // promenade
    /trg/i,          // square
    /bulevar/i,      // boulevard
    /put/i,          // road
    /cesta/i,        // road (Croatian)
    /bb$/i,          // building number indicator
    /\d+/,           // contains numbers (likely address)
    /^ul\./i,        // abbreviated street
    /^tr\./i,        // abbreviated square
    /^bul\./i        // abbreviated boulevard
  ]
  
  // Extract potential city names (usually before municipality/canton indicators)
  const potentialCities: string[] = []
  
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]
    
    // Skip postal codes
    if (/^\d{5}$/.test(part)) continue
    
    // Skip parts that are clearly administrative divisions
    if (adminIndicators.some(pattern => pattern.test(part))) {
      // If this contains "City of X", extract X
      const cityOfMatch = part.match(/City of (.+)/i)
      if (cityOfMatch) {
        potentialCities.push(cityOfMatch[1].trim())
      }
      continue
    }
    
    // Skip street addresses and similar
    if (streetIndicators.some(pattern => pattern.test(part))) continue
    
    // Skip very short parts (likely abbreviations)
    if (part.length < 3) continue
    
    // Skip parts that start with numbers (likely addresses)
    if (/^\d+/.test(part)) continue
    
    // Common Bosnian city names and patterns
    const knownCityPatterns = [
      /^sarajevo/i,
      /^banja luka/i,
      /^tuzla/i,
      /^zenica/i,
      /^mostar/i,
      /^bijeljina/i,
      /^brcko/i,
      /^doboj/i,
      /^travnik/i,
      /^cazin/i,
      /^velika kladusa/i,
      /novo sarajevo/i,
      /stari grad/i,
      /novi grad/i
    ]
    
    // Add if it matches known city patterns or looks like a city name
    if (knownCityPatterns.some(pattern => pattern.test(part)) || 
        (part.length >= 4 && !/\d/.test(part) && !/^\W/.test(part))) {
      potentialCities.push(part)
    }
    
    // Special handling for "Banja Luka" in mixed scripts
    if (/banja.*luka/i.test(part) || /banja/i.test(part)) {
      potentialCities.push(part)
    }
  }
  
  // Remove duplicates and return
  return [...new Set(potentialCities)]
}
