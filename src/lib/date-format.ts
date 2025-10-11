/**
 * Utility functions for formatting dates with proper localization
 */

import { formatDistanceToNow } from 'date-fns'
import { bs, enUS } from 'date-fns/locale'

/**
 * Format date for display with proper locale handling
 * @param date - Date string or Date object
 * @param locale - Locale ('bs' for Bosnian, 'en' for English)
 * @param options - Formatting options
 * @returns Formatted date string
 */
export function formatDate(
  date: string | Date,
  locale: 'bs' | 'en' = 'en',
  options: {
    includeTime?: boolean
    format?: 'short' | 'long' | 'monthYear'
  } = {}
): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    
    if (isNaN(dateObj.getTime())) {
      return locale === 'bs' ? 'Neispravan datum' : 'Invalid date'
    }

    const { includeTime = false, format = 'short' } = options

    if (locale === 'bs') {
      const monthNames = [
        'januar', 'februar', 'mart', 'april', 'maj', 'juni',
        'juli', 'august', 'septembar', 'oktobar', 'novembar', 'decembar'
      ]
      
      const day = dateObj.getDate()
      const month = monthNames[dateObj.getMonth()]
      const year = dateObj.getFullYear()
      
      switch (format) {
        case 'monthYear':
          return `${month} ${year}.`
        case 'long':
          return `${day}. ${month} ${year}.`
        case 'short':
        default:
          const formattedDate = `${day}.${(dateObj.getMonth() + 1).toString().padStart(2, '0')}.${year}.`
          if (includeTime) {
            const hours = dateObj.getHours().toString().padStart(2, '0')
            const minutes = dateObj.getMinutes().toString().padStart(2, '0')
            return `${formattedDate} ${hours}:${minutes}`
          }
          return formattedDate
      }
    } else {
      // English formatting
      switch (format) {
        case 'monthYear':
          return dateObj.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long'
          })
        case 'long':
          return dateObj.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
        case 'short':
        default:
          const formatted = dateObj.toLocaleDateString('en-US')
          if (includeTime) {
            const timeFormatted = dateObj.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            })
            return `${formatted} ${timeFormatted}`
          }
          return formatted
      }
    }
  } catch (error) {
    console.error('Error formatting date:', error)
    return locale === 'bs' ? 'Neispravan datum' : 'Invalid date'
  }
}

/**
 * Format member since date specifically
 * @param date - Date string or Date object
 * @param locale - Locale ('bs' for Bosnian, 'en' for English)
 * @returns Formatted member since date
 */
export function formatMemberSince(
  date: string | Date | undefined,
  locale: 'bs' | 'en' = 'en'
): string {
  if (!date) {
    return locale === 'bs' ? 'Novi član' : 'Recent member'
  }

  return formatDate(date, locale, { format: 'monthYear' })
}

/**
 * Format relative date (e.g., "2 days ago", "Today")
 * @param dateString - The date string to format
 * @param locale - Locale for translations
 * @returns Human-readable relative time
 */
export function formatRelativeDate(
  dateString: string,
  locale: 'bs' | 'en' = 'en'
): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
  )

  if (locale === 'bs') {
    if (diffInDays === 0) return 'Danas'
    if (diffInDays === 1) return 'Juče'
    if (diffInDays < 7) return `Prije ${diffInDays} dana`
    return formatDate(date, locale, { format: 'short' })
  } else {
    if (diffInDays === 0) return 'Today'
    if (diffInDays === 1) return 'Yesterday'
    if (diffInDays < 7) return `${diffInDays} days ago`
    return formatDate(date, locale, { format: 'short' })
  }
}

/**
 * Format distance to now with proper localization using date-fns
 * @param date - Date string or Date object
 * @param locale - Locale for formatting ('bs' for Bosnian, 'en' for English)
 * @param options - Additional formatting options
 * @returns Localized relative time string (e.g., "prije oko mjesec dana", "about 1 month ago")
 */
export function formatDistanceToNowLocalized(
  date: string | Date,
  locale: 'bs' | 'en' = 'en',
  options: { addSuffix?: boolean } = { addSuffix: true }
): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    
    if (isNaN(dateObj.getTime())) {
      return locale === 'bs' ? 'Neispravan datum' : 'Invalid date'
    }

    const localeObj = locale === 'bs' ? bs : enUS
    return formatDistanceToNow(dateObj, { ...options, locale: localeObj })
  } catch (error) {
    console.error('Error formatting distance to now:', error)
    return locale === 'bs' ? 'Neispravan datum' : 'Invalid date'
  }
}
