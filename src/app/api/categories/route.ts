import { NextResponse } from 'next/server'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { prisma } from '@/lib/prisma'

const CATEGORIES_CACHE_FILE = join(process.cwd(), 'public', 'cache', 'categories.json')

interface FlatCategory {
  id: string
  key: string
  name_bs: string
  name_en: string
  name: string
  description?: string | null
  icon?: string | null
  color?: string | null
  parent_id?: string | null
  sort_order: number
  is_active: boolean
  is_popular: boolean
}

export async function GET() {
  try {
    // First, try to serve from cache file
    if (existsSync(CATEGORIES_CACHE_FILE)) {
      try {
        const cachedData = JSON.parse(readFileSync(CATEGORIES_CACHE_FILE, 'utf8'))
        
        // Transform flat array to hierarchical structure
        const flatCategories: FlatCategory[] = cachedData.categories || []
        const parentCategories = flatCategories.filter((cat) => !cat.parent_id)
        const childCategories = flatCategories.filter((cat) => cat.parent_id)
        
        // Build hierarchical structure
        const hierarchicalCategories = parentCategories.map((parent) => ({
          id: parent.id,
          nameEN: parent.name_en,
          nameBS: parent.name_bs,
          key: parent.key,
          children: childCategories
            .filter((child) => child.parent_id === parent.id)
            .map((child) => ({
              id: child.id,
              nameEN: child.name_en,
              nameBS: child.name_bs,
              key: child.key
            }))
        }))
        
        return NextResponse.json({ categories: hierarchicalCategories })
      } catch (error) {
        console.warn('Cache file exists but failed to read, falling back to database:', error)
      }
    }

    // Fallback to database if cache doesn't exist or fails
    if (!prisma) {
      throw new Error('Database connection not available')
    }

    // Fetch all categories
    const categories = await prisma.category.findMany({
      where: {
        isActive: true
      },
      orderBy: [
        { isPopular: 'desc' },
        { sortOrder: 'asc' },
        { nameEN: 'asc' }
      ]
    })

    // Separate parent and child categories
    const parentCategories = categories.filter(cat => !cat.parentId)
    const childCategories = categories.filter(cat => cat.parentId)
    
    // Build hierarchical structure
    const hierarchicalCategories = parentCategories.map((parent) => ({
      id: parent.id,
      nameEN: parent.nameEN,
      nameBS: parent.nameBS,
      key: parent.key,
      children: childCategories
        .filter(child => child.parentId === parent.id)
        .map(child => ({
          id: child.id,
          nameEN: child.nameEN,
          nameBS: child.nameBS,
          key: child.key
        }))
    }))

    return NextResponse.json({ categories: hierarchicalCategories })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
