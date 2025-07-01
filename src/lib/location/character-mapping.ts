/**
 * Character mapping utilities for Cyrillic and Latin scripts
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
