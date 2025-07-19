import { NextResponse } from 'next/server'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

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

interface DatabaseCategory {
  id: string
  key: string
  nameBS: string
  nameEN: string
  parentId: string | null
  isPopular: boolean
}

export async function GET() {
  try {
    // First, try to serve from cache file
    if (existsSync(CATEGORIES_CACHE_FILE)) {
      try {
        const cachedData = JSON.parse(readFileSync(CATEGORIES_CACHE_FILE, 'utf8'))
        
        // Transform flat array to hierarchical structure for frontend
        const flatCategories: FlatCategory[] = cachedData.categories || []
        const parentCategories = flatCategories.filter((cat: FlatCategory) => !cat.parent_id)
        const childCategories = flatCategories.filter((cat: FlatCategory) => cat.parent_id)
        
        // Build hierarchical structure with correct property names
        const hierarchicalCategories = parentCategories.map((parent: FlatCategory) => ({
          id: parent.id,
          nameEN: parent.name_en,
          nameBS: parent.name_bs,
          name_en: parent.name_en,  // Add for component compatibility
          name_bs: parent.name_bs,  // Add for component compatibility
          is_popular: parent.is_popular,  // Add for component compatibility
          key: parent.key,
          children: childCategories
            .filter((child: FlatCategory) => child.parent_id === parent.id)
            .map((child: FlatCategory) => ({
              id: child.id,
              nameEN: child.name_en,
              nameBS: child.name_bs,
              name_en: child.name_en,  // Add for component compatibility
              name_bs: child.name_bs,  // Add for component compatibility
              is_popular: child.is_popular,  // Add for component compatibility
              key: child.key
            }))
        }))
        
        // Also return flat categories for skills component
        const allCategories = [
          ...parentCategories.map((cat: FlatCategory) => ({
            id: cat.id,
            key: cat.key,
            name_en: cat.name_en,
            name_bs: cat.name_bs,
            is_popular: cat.is_popular,
            parent_id: cat.parent_id
          })),
          ...childCategories.map((cat: FlatCategory) => ({
            id: cat.id,
            key: cat.key,
            name_en: cat.name_en,
            name_bs: cat.name_bs,
            is_popular: cat.is_popular,
            parent_id: cat.parent_id
          }))
        ]
        
        return NextResponse.json({ 
          categories: hierarchicalCategories,
          flatCategories: allCategories  // For skills component
        })
      } catch (error) {
        console.warn('Cache file exists but failed to read, falling back to database:', error)
      }
    }

    // Fallback to database if cache doesn't exist or fails
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
    const parentCategories = categories.filter((cat: DatabaseCategory) => !cat.parentId)
    const childCategories = categories.filter((cat: DatabaseCategory) => cat.parentId)
    
    // Build hierarchical structure with correct property names
    const hierarchicalCategories = parentCategories.map((parent: DatabaseCategory) => ({
      id: parent.id,
      nameEN: parent.nameEN,
      nameBS: parent.nameBS,
      name_en: parent.nameEN,  // Add for component compatibility
      name_bs: parent.nameBS,  // Add for component compatibility
      is_popular: parent.isPopular,  // Add for component compatibility
      key: parent.key,
      children: childCategories
        .filter((child: DatabaseCategory) => child.parentId === parent.id)
        .map((child: DatabaseCategory) => ({
          id: child.id,
          nameEN: child.nameEN,
          nameBS: child.nameBS,
          name_en: child.nameEN,  // Add for component compatibility
          name_bs: child.nameBS,  // Add for component compatibility
          is_popular: child.isPopular,  // Add for component compatibility
          key: child.key
        }))
    }))

    // Also return flat categories for skills component
    const allCategories = [
      ...parentCategories.map((cat: DatabaseCategory) => ({
        id: cat.id,
        key: cat.key,
        name_en: cat.nameEN,
        name_bs: cat.nameBS,
        is_popular: cat.isPopular,
        parent_id: cat.parentId
      })),
      ...childCategories.map((cat: DatabaseCategory) => ({
        id: cat.id,
        key: cat.key,
        name_en: cat.nameEN,
        name_bs: cat.nameBS,
        is_popular: cat.isPopular,
        parent_id: cat.parentId
      }))
    ]

    return NextResponse.json({ 
      categories: hierarchicalCategories,
      flatCategories: allCategories  // For skills component
    })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
