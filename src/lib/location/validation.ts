/**
 * Location validation utilities
 */

import { normalizeText } from './text-normalization'
import { extractCityFromMapAddress } from './city-extraction'
import { cyrillicToLatin } from './character-mapping'

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
    /bosna i hercegovina/i,
    /bosnia/i,
    /hercegov/i,
    /ba\s*\d{5}/i, // Postal codes
    /\d{5}\s*ba/i,
  ]

  const hasBosnianContext = commonPatterns.some(pattern => pattern.test(address))
  
  // If the address only contains country-level information and no specific city match,
  // consider it as insufficient location detail rather than a mismatch
  if (hasBosnianContext && extractedCities.length > 0) {
    // Check if the only extracted "city" is actually the country name
    const isOnlyCountryName = extractedCities.every(city => 
      /bosnia|hercegovina|bosna/i.test(city)
    )
    
    if (isOnlyCountryName) {
      return {
        isValid: false,
        confidence: 'medium',
        details: `Please provide a more specific address within ${cityName}. The current address only indicates the country level.`,
        extractedCities
      }
    }
  }
  
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
