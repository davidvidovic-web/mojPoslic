/**
 * Text normalization utilities for location handling
 */

import { cyrillicToLatin, latinToCyrillic } from './character-mapping'

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
