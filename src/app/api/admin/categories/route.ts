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

    // Fetch all categories
    const categories = await prisma.category.findMany({
      orderBy: [
        { sortOrder: 'asc' },
        { nameBS: 'asc' }
      ]
    })

    // Transform to match expected format
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formattedCategories = categories.map((category: any) => ({
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
