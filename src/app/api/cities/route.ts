import { NextResponse } from 'next/server'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

const CITIES_CACHE_FILE = join(process.cwd(), 'public', 'static', 'cities.json')

export async function GET() {
  try {
    // Serve from cache file only - no database fallback
    if (existsSync(CITIES_CACHE_FILE)) {
      try {
        const cachedData = JSON.parse(readFileSync(CITIES_CACHE_FILE, 'utf8'))
        return NextResponse.json(cachedData)
      } catch (error) {
        console.error('Failed to read cities cache file:', error)
        return NextResponse.json(
          { error: 'Failed to load cities data' },
          { status: 500 }
        )
      }
    }

    // No database fallback - cache file is required
    return NextResponse.json(
      { error: 'Cities data not available - cache file missing' },
      { status: 500 }
    )
  } catch (error) {
    console.error('Error serving cities:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
