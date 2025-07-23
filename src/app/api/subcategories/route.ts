import { NextResponse } from 'next/server'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

const CATEGORIES_CACHE_FILE = join(process.cwd(), 'public', 'static', 'categories.json')

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

interface HierarchicalCategory extends FlatCategory {
  subcategories?: FlatCategory[]
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const parentId = searchParams.get('parentId')

    // Serve from cache file only
    if (existsSync(CATEGORIES_CACHE_FILE)) {
      try {
        const cachedData = JSON.parse(readFileSync(CATEGORIES_CACHE_FILE, 'utf8'))
        
        // If we have hierarchical data with subcategories property
        if (cachedData.categories && cachedData.categories[0]?.subcategories) {
          if (parentId) {
            // Find the parent category and return its subcategories
            const parentCategory = cachedData.categories.find((cat: HierarchicalCategory) => cat.id === parentId)
            if (parentCategory && parentCategory.subcategories) {
              return NextResponse.json({
                categories: parentCategory.subcategories.map((sub: FlatCategory) => ({
                  id: sub.id,
                  nameEN: sub.name_en,
                  nameBS: sub.name_bs,
                  name_en: sub.name_en,
                  name_bs: sub.name_bs,
                  key: sub.key,
                  description: sub.description,
                  parent_id: sub.parent_id,
                  sort_order: sub.sort_order,
                  is_active: sub.is_active,
                  is_popular: sub.is_popular || false
                }))
              })
            } else {
              return NextResponse.json({ categories: [] })
            }
          } else {
            // Return all subcategories from all parent categories
            const allSubcategories = cachedData.categories.flatMap((cat: HierarchicalCategory) => 
              cat.subcategories ? cat.subcategories.map((sub: FlatCategory) => ({
                id: sub.id,
                nameEN: sub.name_en,
                nameBS: sub.name_bs,
                name_en: sub.name_en,
                name_bs: sub.name_bs,
                key: sub.key,
                description: sub.description,
                parent_id: sub.parent_id,
                sort_order: sub.sort_order,
                is_active: sub.is_active,
                is_popular: sub.is_popular || false
              })) : []
            )
            return NextResponse.json({ categories: allSubcategories })
          }
        } else {
          // Handle flat structure
          const flatCategories: FlatCategory[] = cachedData.categories || []
          
          if (parentId) {
            // Filter subcategories by parent ID
            const subcategories = flatCategories
              .filter((cat: FlatCategory) => cat.parent_id === parentId)
              .map((cat: FlatCategory) => ({
                id: cat.id,
                nameEN: cat.name_en,
                nameBS: cat.name_bs,
                name_en: cat.name_en,
                name_bs: cat.name_bs,
                key: cat.key,
                description: cat.description,
                parent_id: cat.parent_id,
                sort_order: cat.sort_order,
                is_active: cat.is_active,
                is_popular: cat.is_popular
              }))
            
            return NextResponse.json({ categories: subcategories })
          } else {
            // Return all subcategories (categories with parent_id)
            const subcategories = flatCategories
              .filter((cat: FlatCategory) => cat.parent_id)
              .map((cat: FlatCategory) => ({
                id: cat.id,
                nameEN: cat.name_en,
                nameBS: cat.name_bs,
                name_en: cat.name_en,
                name_bs: cat.name_bs,
                key: cat.key,
                description: cat.description,
                parent_id: cat.parent_id,
                sort_order: cat.sort_order,
                is_active: cat.is_active,
                is_popular: cat.is_popular
              }))
            
            return NextResponse.json({ categories: subcategories })
          }
        }
      } catch (error) {
        console.error('Error parsing categories cache file:', error)
        return NextResponse.json(
          { error: 'Invalid cache file format' },
          { status: 500 }
        )
      }
    }

    // If no cache file exists, return empty array
    return NextResponse.json({ categories: [] })

  } catch (error) {
    console.error('Error in subcategories API:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subcategories' },
      { status: 500 }
    )
  }
}
