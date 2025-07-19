import { NextResponse } from 'next/server'
import { writeFileSync, readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Cache directory path - store in public folder for easy access
const CACHE_DIR = join(process.cwd(), 'public', 'cache')
const CITIES_CACHE_FILE = join(CACHE_DIR, 'cities.json')
const CATEGORIES_CACHE_FILE = join(CACHE_DIR, 'categories.json')
const CACHE_METADATA_FILE = join(CACHE_DIR, 'metadata.json')

// Ensure cache directory exists
import { mkdirSync } from 'fs'
try {
  mkdirSync(CACHE_DIR, { recursive: true })
} catch {
  // Directory already exists
}

interface CacheMetadata {
  lastUpdated: string
  citiesCount: number
  categoriesCount: number
  citiesHash: string
  categoriesHash: string
}

// Simple hash function for detecting changes
function simpleHash(data: unknown): string {
  return Buffer.from(JSON.stringify(data)).toString('base64').slice(0, 16)
}

// Read current cache metadata
function getCacheMetadata(): CacheMetadata | null {
  try {
    if (existsSync(CACHE_METADATA_FILE)) {
      const metadata = JSON.parse(readFileSync(CACHE_METADATA_FILE, 'utf8'))
      return metadata
    }
  } catch (error) {
    console.error('Error reading cache metadata:', error)
  }
  return null
}

// Write cache metadata
function setCacheMetadata(metadata: CacheMetadata) {
  try {
    writeFileSync(CACHE_METADATA_FILE, JSON.stringify(metadata, null, 2))
  } catch (error) {
    console.error('Error writing cache metadata:', error)
  }
}

// Check if we need to update based on data changes
async function shouldUpdateCache(): Promise<boolean> {
  try {
    const metadata = getCacheMetadata()
    if (!metadata) return true // No cache exists, need to create

    // Check if it's been more than 24 hours since last update
    const lastUpdate = new Date(metadata.lastUpdated)
    const now = new Date()
    const hoursSinceUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60)
    
    if (hoursSinceUpdate >= 24) return true // Force update after 24 hours

    // Check if data has changed by comparing counts and hashes
    const [cities, categories] = await Promise.all([
      prisma.city.findMany({
        where: { isActive: true },
        orderBy: [
          { isSpecial: 'desc' },
          { sortOrder: 'asc' },
          { nameEN: 'asc' }
        ]
      }),
      prisma.category.findMany({
        where: { isActive: true },
        orderBy: [
          { isPopular: 'desc' },
          { sortOrder: 'asc' },
          { nameEN: 'asc' }
        ]
      })
    ])

    const currentCitiesHash = simpleHash(cities)
    const currentCategoriesHash = simpleHash(categories)

    return (
      cities.length !== metadata.citiesCount ||
      categories.length !== metadata.categoriesCount ||
      currentCitiesHash !== metadata.citiesHash ||
      currentCategoriesHash !== metadata.categoriesHash
    )
  } catch (error) {
    console.error('Error checking if cache should update:', error)
    return true // On error, force update
  }
}

interface DatabaseCity {
  id: string
  key: string
  nameBS: string
  nameEN: string
  isSpecial: boolean
  sortOrder: number
  isActive: boolean
}

interface DatabaseCategory {
  id: string
  key: string
  nameBS: string
  nameEN: string
  description: string | null
  icon: string | null
  color: string | null
  sortOrder: number
  isActive: boolean
  parentId: string | null
  isPopular: boolean
}

// Transform database data to API format
function transformCityData(city: DatabaseCity) {
  return {
    id: city.id,
    key: city.key,
    name_bs: city.nameBS,
    name_en: city.nameEN,
    name: city.nameEN, // For convenience
    country: 'Bosnia and Herzegovina',
    state: '',
    is_special: city.isSpecial,
    sort_order: city.sortOrder,
    is_active: city.isActive
  }
}

function transformCategoryData(category: DatabaseCategory) {
  return {
    id: category.id,
    key: category.key,
    name_bs: category.nameBS,
    name_en: category.nameEN,
    name: category.nameEN, // For convenience
    description: category.description,
    icon: category.icon,
    color: category.color,
    parent_id: category.parentId,
    sort_order: category.sortOrder,
    is_active: category.isActive,
    is_popular: category.isPopular
  }
}

export async function POST() {
  try {
    // Check if update is needed
    const needsUpdate = await shouldUpdateCache()
    
    if (!needsUpdate) {
      return NextResponse.json({
        success: true,
        message: 'Cache is up to date',
        updated: false
      })
    }

    // Fetch fresh data from database
    const [cities, categories] = await Promise.all([
      prisma.city.findMany({
        where: { isActive: true },
        orderBy: [
          { isSpecial: 'desc' },
          { sortOrder: 'asc' },
          { nameEN: 'asc' }
        ]
      }),
      prisma.category.findMany({
        where: { isActive: true },
        orderBy: [
          { isPopular: 'desc' },
          { sortOrder: 'asc' },
          { nameEN: 'asc' }
        ]
      })
    ])

    // Transform data
    const transformedCities = cities.map(transformCityData)
    const transformedCategories = categories.map(transformCategoryData)

    // Write cache files
    writeFileSync(CITIES_CACHE_FILE, JSON.stringify({ cities: transformedCities }, null, 2))
    writeFileSync(CATEGORIES_CACHE_FILE, JSON.stringify({ categories: transformedCategories }, null, 2))

    // Update metadata
    const metadata: CacheMetadata = {
      lastUpdated: new Date().toISOString(),
      citiesCount: cities.length,
      categoriesCount: categories.length,
      citiesHash: simpleHash(cities),
      categoriesHash: simpleHash(categories)
    }
    setCacheMetadata(metadata)

    return NextResponse.json({
      success: true,
      message: 'Cache updated successfully',
      updated: true,
      metadata
    })

  } catch (error) {
    console.error('Error updating cache:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update cache',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// GET endpoint to check cache status
export async function GET() {
  try {
    const metadata = getCacheMetadata()
    const citiesExists = existsSync(CITIES_CACHE_FILE)
    const categoriesExists = existsSync(CATEGORIES_CACHE_FILE)

    return NextResponse.json({
      success: true,
      metadata,
      files: {
        cities: citiesExists,
        categories: categoriesExists
      }
    })
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to get cache status' },
      { status: 500 }
    )
  }
}
