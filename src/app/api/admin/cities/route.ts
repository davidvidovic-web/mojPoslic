import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type City = {
  id: string
  key: string
  nameEN: string
  nameBS: string
  isSpecial: boolean
  sortOrder: number
  isActive: boolean
  createdAt: Date
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getPrismaClient = () => prisma as any

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const client = getPrismaClient()

    // Check if user is admin
    const user = await client.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (user?.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied. Admin role required.' }, { status: 403 })
    }

    // Fetch all cities
    const cities: City[] = await client.city.findMany({
      orderBy: [
        { sortOrder: 'asc' },
        { nameBS: 'asc' }
      ]
    })

    // Transform to match expected format
    const formattedCities = cities.map((city: City) => ({
      id: city.id,
      key: city.key,
      nameEN: city.nameEN,
      nameBS: city.nameBS,
      isSpecial: city.isSpecial,
      sortOrder: city.sortOrder,
      isActive: city.isActive,
      createdAt: city.createdAt.toISOString()
    }))

    return NextResponse.json(formattedCities)
  } catch (error) {
    console.error('Error fetching cities:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
