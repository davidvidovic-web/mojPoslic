import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (user?.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied. Admin role required.' }, { status: 403 })
    }

    // Fetch all cities
    const cities = await prisma.city.findMany({
      orderBy: [
        { sortOrder: 'asc' },
        { nameBS: 'asc' }
      ]
    })

    // Transform to match expected format
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formattedCities = cities.map((city: any) => ({
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
