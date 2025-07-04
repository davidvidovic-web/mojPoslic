import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Fetch all categories with their children
    const categories = await prisma.category.findMany({
      where: {
        parentId: null, // Only get parent categories
        isActive: true
      },
      include: {
        children: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' }
        }
      },
      orderBy: { sortOrder: 'asc' }
    })

    // Transform the data to match the expected format
    const formattedCategories = categories.map((category: Record<string, unknown>) => ({
      id: category.id,
      key: category.key,
      nameBS: category.nameBS,
      nameEN: category.nameEN,
      isPopular: category.isPopular,
      sortOrder: category.sortOrder,
      children: Array.isArray(category.children) ? category.children.map((child: Record<string, unknown>) => ({
        id: child.id,
        key: child.key,
        nameBS: child.nameBS,
        nameEN: child.nameEN,
        isPopular: child.isPopular,
        sortOrder: child.sortOrder
      })) : []
    }))

    return NextResponse.json({ categories: formattedCategories })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  } finally {
    // No need to disconnect when using the shared prisma instance
  }
}
