import { CITY_COORDINATES } from './city-coordinates'

/**
 * Format a city slug to a proper display name
 * @param citySlug - City slug like 'banja-luka' or 'sarajevo'
 * @returns Properly formatted city name like 'Banja Luka' or 'Sarajevo'
 */
export function formatCityName(citySlug: string): string {
  if (!citySlug) return ''
  
  // Check if we have this city in our coordinates mapping
  const cityData = CITY_COORDINATES[citySlug.toLowerCase()]
  if (cityData) {
    return cityData.name
  }
  
  // Fallback: Convert kebab-case to Title Case
  return citySlug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

/**
 * Format a location string that might contain city and other location info
 * @param location - Location string like 'banja-luka' or 'banja-luka, bosnia'
 * @returns Formatted location string
 */
export function formatLocation(location: string): string {
  if (!location) return ''
  
  // Split by comma to handle cases like 'banja-luka, bosnia'
  const parts = location.split(',').map(part => part.trim())
  
  // Format the first part (usually the city)
  const formattedParts = parts.map((part, index) => {
    if (index === 0) {
      return formatCityName(part)
    }
    // For other parts, just capitalize first letter
    return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
  })
  
  return formattedParts.join(', ')
}
