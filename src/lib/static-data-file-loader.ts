/**
 * Simple file-based static data loader for server-side use
 */

import { readFileSync } from 'fs'
import { join } from 'path'
import { StaticCity, StaticCategory, StaticDataCache } from '@/types/static-data'

let cachedData: StaticDataCache | null = null

export async function loadStaticDataFromFiles(): Promise<StaticDataCache> {
  // Return cached data if available
  if (cachedData) {
    return cachedData
  }

  try {
    // Load files directly from the public directory
    const citiesPath = join(process.cwd(), 'public', 'static', 'cities.json')
    const categoriesPath = join(process.cwd(), 'public', 'static', 'categories.json')

    const citiesRaw = readFileSync(citiesPath, 'utf8')
    const categoriesRaw = readFileSync(categoriesPath, 'utf8')

    const citiesData = JSON.parse(citiesRaw)
    const categoriesData = JSON.parse(categoriesRaw)

    // Cache the data
    cachedData = {
      cities: citiesData.cities || citiesData,
      categories: categoriesData.categories || categoriesData,
      lastUpdated: new Date().toISOString(),
      version: '1.0'
    }

    return cachedData
  } catch (error) {
    console.error('Error loading static data from files:', error)
    throw error
  }
}
