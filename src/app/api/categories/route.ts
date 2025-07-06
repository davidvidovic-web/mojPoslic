import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    if (!prisma) {
      throw new Error('Database connection not available')
    }

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
      name_bs: category.nameBS,
      name_en: category.nameEN,
      name: category.nameEN, // Default to English name
      is_popular: category.isPopular,
      sort_order: category.sortOrder,
      is_active: true,
      children: Array.isArray(category.children) ? category.children.map((child: Record<string, unknown>) => ({
        id: child.id,
        key: child.key,
        name_bs: child.nameBS,
        name_en: child.nameEN,
        name: child.nameEN, // Default to English name
        parent_id: category.id,
        is_popular: child.isPopular,
        sort_order: child.sortOrder,
        is_active: true
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
