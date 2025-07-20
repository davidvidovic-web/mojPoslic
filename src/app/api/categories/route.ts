import { NextResponse } from 'next/server'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

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
    // Serve from cache file only - no database fallback
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
        console.error('Failed to read categories cache file:', error)
        return NextResponse.json(
          { error: 'Failed to load categories data' },
          { status: 500 }
        )
      }
    }

    // No database fallback - cache file is required
    return NextResponse.json(
      { error: 'Categories data not available - cache file missing' },
      { status: 500 }
    )
  } catch (error) {
    console.error('Error serving categories:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
