import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type Category = {
  id: string
  key: string
  nameEN: string
  nameBS: string
  isPopular: boolean
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

    // Check if Prisma client is available
    if (!prisma) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 })
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

    // Fetch all categories
    const categories: Category[] = await client.category.findMany({
      orderBy: [
        { sortOrder: 'asc' },
        { nameBS: 'asc' }
      ]
    })

    // Transform to match expected format
    const formattedCategories = categories.map((category: Category) => ({
      id: category.id,
      key: category.key,
      nameEN: category.nameEN,
      nameBS: category.nameBS,
      isPopular: category.isPopular,
      sortOrder: category.sortOrder,
      isActive: category.isActive,
      createdAt: category.createdAt.toISOString()
    }))

    return NextResponse.json(formattedCategories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
