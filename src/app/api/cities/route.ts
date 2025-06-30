import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

// Create a simple Prisma client for this endpoint
const simplePrisma = new PrismaClient()

export async function GET() {
  try {
    const cities = await simplePrisma.city.findMany({
      where: {
        isActive: true,
      },
      orderBy: [
        { sortOrder: 'asc' },
        { nameEN: 'asc' }
      ],
    })

    return NextResponse.json({ cities })
  } catch (error) {
    console.error('Error fetching cities:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cities' },
      { status: 500 }
    )
  }
}
