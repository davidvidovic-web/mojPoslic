/**
 * Utility functions for handling location validation and text normalization
 */

// Cyrillic to Latin character mapping for common mixed characters
const cyrillicToLatinMap: Record<string, string> = {
  'а': 'a', 'А': 'A',
  'е': 'e', 'Е': 'E', 
  'о': 'o', 'О': 'O',
  'р': 'r', 'Р': 'R',
  'с': 's', 'С': 'S',
  'у': 'u', 'У': 'U',
  'х': 'h', 'Х': 'H',
  'н': 'n', 'Н': 'N',
  'к': 'k', 'К': 'K',
  'м': 'm', 'М': 'M',
  'т': 't', 'Т': 'T',
  'б': 'b', 'Б': 'B',
  'в': 'v', 'В': 'V',
  'г': 'g', 'Г': 'G',
  'д': 'd', 'Д': 'D',
  'ж': 'z', 'Ж': 'Z',
  'з': 'z', 'З': 'Z',
  'и': 'i', 'И': 'I',
  'ј': 'j', 'Ј': 'J',
  'л': 'l', 'Л': 'L',
  'љ': 'lj', 'Љ': 'Lj',
  'њ': 'nj', 'Њ': 'Nj',
  'п': 'p', 'П': 'P',
  'ф': 'f', 'Ф': 'F',
  'ц': 'c', 'Ц': 'C',
  'ч': 'c', 'Ч': 'C',
  'џ': 'dz', 'Џ': 'Dz',
  'ш': 's', 'Ш': 'S',
  'ћ': 'c', 'Ћ': 'C',
  'ђ': 'dj', 'Ђ': 'Dj'
}

// Latin to Cyrillic character mapping
const latinToCyrillicMap: Record<string, string> = {}
Object.entries(cyrillicToLatinMap).forEach(([cyrillic, latin]) => {
  latinToCyrillicMap[latin] = cyrillic
})

/**
 * Converts mixed Cyrillic characters to Latin
 */
export function cyrillicToLatin(text: string): string {
  return text.replace(/[а-яА-Я]/g, (char) => cyrillicToLatinMap[char] || char)
}

/**
 * Converts mixed Latin characters to Cyrillic
 */
export function latinToCyrillic(text: string): string {
  return text.replace(/[a-zA-Z]/g, (char) => latinToCyrillicMap[char] || char)
}

/**
 * Normalizes text by converting to lowercase and handling mixed scripts
 */
export function normalizeText(text: string): {
  latin: string
  cyrillic: string
  original: string
} {
  const latinVersion = cyrillicToLatin(text.toLowerCase())
  const cyrillicVersion = latinToCyrillic(text.toLowerCase())
  return { latin: latinVersion, cyrillic: cyrillicVersion, original: text.toLowerCase() }
}

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

/**
 * Enhanced location validation that handles complex map addresses
 */
export function validateLocationInCity(address: string, cityName: string): {
  isValid: boolean
  confidence: 'high' | 'medium' | 'low'
  details: string
  extractedCities?: string[]
} {
  if (!address || !cityName) {
    return { isValid: true, confidence: 'high', details: 'No validation needed' }
  }

  // Clean and normalize the address
  const cleanedAddress = cleanMapAddress(address)
  const normalizedAddress = normalizeText(cleanedAddress)
  const normalizedCity = normalizeText(cityName)
  
  // Extract potential cities from the map address
  const extractedCities = extractCityFromMapAddress(address)
  
  // Normalize extracted cities for comparison
  const normalizedExtractedCities = extractedCities.map(city => normalizeText(city))

  // Check various combinations for the selected city
  const directMatches = [
    // Direct matches in original address
    normalizedAddress.original.includes(normalizedCity.original),
    normalizedAddress.latin.includes(normalizedCity.latin),
    normalizedAddress.cyrillic.includes(normalizedCity.cyrillic),
    
    // Cross-script matches
    normalizedAddress.latin.includes(normalizedCity.cyrillic),
    normalizedAddress.cyrillic.includes(normalizedCity.latin),
  ]
  
  // Check if any extracted cities match the selected city
  const extractedCityMatches = normalizedExtractedCities.some(extractedCity => {
    return [
      extractedCity.original === normalizedCity.original,
      extractedCity.latin === normalizedCity.latin,
      extractedCity.cyrillic === normalizedCity.cyrillic,
      extractedCity.latin === normalizedCity.cyrillic,
      extractedCity.cyrillic === normalizedCity.latin,
      // Partial matches for compound names
      extractedCity.original.includes(normalizedCity.original) || normalizedCity.original.includes(extractedCity.original),
      extractedCity.latin.includes(normalizedCity.latin) || normalizedCity.latin.includes(extractedCity.latin)
    ].some(Boolean)
  })
  
  // Check for partial matches in city name parts
  const cityParts = normalizedCity.original.split(/[\s-]/).filter(part => part.length > 2)
  const partialMatches = cityParts.some(part => 
    normalizedAddress.original.includes(part) ||
    normalizedExtractedCities.some(extractedCity => 
      extractedCity.original.includes(part) || extractedCity.latin.includes(part)
    )
  )

  const directMatchCount = directMatches.filter(Boolean).length
  
  // High confidence: Direct match found or extracted city matches
  if (directMatchCount >= 2 || extractedCityMatches) {
    return { 
      isValid: true, 
      confidence: 'high', 
      details: 'Location confirmed - city match found in address',
      extractedCities
    }
  }
  
  // Medium confidence: Partial matches
  if (directMatchCount >= 1 || partialMatches) {
    return { 
      isValid: true, 
      confidence: 'medium', 
      details: 'Location appears correct - partial match found',
      extractedCities
    }
  }

  // Check if there are other cities mentioned in the extracted cities
  if (extractedCities.length > 0) {
    const otherCities = extractedCities.filter((city) => {
      const normalizedExtractedCity = normalizeText(city)
      return ![
        normalizedExtractedCity.original === normalizedCity.original,
        normalizedExtractedCity.latin === normalizedCity.latin,
        normalizedExtractedCity.original.includes(normalizedCity.original),
        normalizedCity.original.includes(normalizedExtractedCity.original),
        normalizedExtractedCity.latin.includes(normalizedCity.latin),
        normalizedCity.latin.includes(normalizedExtractedCity.latin)
      ].some(Boolean)
    })
    
    if (otherCities.length > 0) {
      return {
        isValid: false,
        confidence: 'high',
        details: `Location mismatch detected. The selected address appears to be in "${otherCities[0]}" but you have selected "${cityName}". These locations don't seem to be close to one another.`,
        extractedCities
      }
    }
  }

  // Special handling for common map address patterns
  const commonPatterns = [
    /bosnia and herzegovina/i,
    /bosnia/i,
    /hercegov/i,
    /ba\s*\d{5}/i, // Postal codes
    /\d{5}\s*ba/i,
  ]

  const hasBosnianContext = commonPatterns.some(pattern => pattern.test(address))
  
  if (hasBosnianContext) {
    return {
      isValid: false,
      confidence: 'medium',
      details: `Address appears to be in Bosnia but doesn't clearly indicate "${cityName}". Please verify the specific location matches your selected city.`,
      extractedCities
    }
  }

  return {
    isValid: false,
    confidence: 'high',
    details: `Address "${cleanedAddress}" does not appear to be in "${cityName}". Please verify the location matches your selected city.`,
    extractedCities
  }
}

/**
 * Clean map-returned address for better display
 */
export function cleanMapAddress(address: string): string {
  // Convert mixed scripts to consistent Latin
  let cleaned = cyrillicToLatin(address)
  
  // Remove redundant country information
  cleaned = cleaned.replace(/,?\s*(bosnia and herzegovina|ba)\s*$/i, '')
  
  // Clean up extra commas and spaces
  cleaned = cleaned.replace(/,\s*,/g, ',').replace(/\s+/g, ' ').trim()
  
  return cleaned
}
