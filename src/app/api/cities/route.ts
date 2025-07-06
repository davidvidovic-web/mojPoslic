import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    if (!prisma) {
      throw new Error('Database connection not available')
    }

    const cities = await prisma.city.findMany({
      where: {
        isActive: true,
      },
      orderBy: [
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
      country: 'Bosnia and Herzegovina', // Default country
      state: '', // Not used in current schema
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
