import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    if (!prisma) {
      return NextResponse.json({ error: 'Prisma not available' }, { status: 500 })
    }

    // Get counts
    const [citiesCount, categoriesCount, subcategoriesCount] = await Promise.all([
      prisma.city.count({ where: { isActive: true } }),
      prisma.category.count({ where: { isActive: true, parentId: null } }),
      prisma.category.count({ where: { isActive: true, parentId: { not: null } } })
    ])

    return NextResponse.json({
      success: true,
      counts: {
        cities: citiesCount,
        parentCategories: categoriesCount,
        subcategories: subcategoriesCount,
        totalCategories: categoriesCount + subcategoriesCount
      }
    })

  } catch (error) {
    console.error('Debug API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Database error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
