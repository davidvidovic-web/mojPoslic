import { NextResponse } from 'next/server'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { prisma } from '@/lib/prisma'

const CITIES_CACHE_FILE = join(process.cwd(), 'public', 'cache', 'cities.json')

export async function GET() {
  try {
    // First, try to serve from cache file
    if (existsSync(CITIES_CACHE_FILE)) {
      try {
        const cachedData = JSON.parse(readFileSync(CITIES_CACHE_FILE, 'utf8'))
        return NextResponse.json(cachedData)
      } catch {
        console.warn('Cache file exists but failed to read, falling back to database')
      }
    }

    // Fallback to database if cache doesn't exist or fails
    if (!prisma) {
      throw new Error('Database connection not available')
    }

    const cities = await prisma.city.findMany({
      where: {
        isActive: true,
      },
      orderBy: [
        { isSpecial: 'desc' },
        { sortOrder: 'asc' },
        { nameEN: 'asc' }
      ],
    })

    // Transform the data to match the expected format
    const formattedCities = cities.map((city) => ({
      id: city.id,
      key: city.key,
      name_bs: city.nameBS,
      name_en: city.nameEN,
      name: city.nameEN, // Default to English name
      country: 'Bosnia and Herzegovina',
      state: '',
      is_special: city.isSpecial,
      sort_order: city.sortOrder,
      is_active: city.isActive
    }))

    return NextResponse.json({ cities: formattedCities })
  } catch (error) {
    console.error('Error fetching cities:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cities' },
      { status: 500 }
    )
  }
}
