/**
 * API route for server-side static data loading
 * This ensures filesystem operations stay on the server
 */

import fs from 'fs'
import path from 'path'
import { NextResponse } from 'next/server'
import type { 
  StaticDataCache, 
  CitiesResponse, 
  CategoriesResponse,
  CacheMetadata,
  Category
} from '@/lib/static-data-types'

/**
 * Process categories to build hierarchical structure
 */
function processCategories(categories: Category[]): Category[] {
  // Check if categories already have a hierarchical structure (subcategories property)
  const hasSubcategories = categories.some(cat => 'subcategories' in cat)
  
  if (hasSubcategories) {
    // Categories already have hierarchical structure with subcategories, just convert to children format
    return categories.map(category => {
      const processedCategory = { ...category }
      const categoryWithSubs = category as Category & { subcategories?: Category[] }
      if (categoryWithSubs.subcategories && Array.isArray(categoryWithSubs.subcategories)) {
        processedCategory.children = categoryWithSubs.subcategories.map((sub: Category) => ({
          ...sub,
          parent_id: category.id
        }))
        // Remove the old subcategories property
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { subcategories, ...cleanCategory } = categoryWithSubs
        Object.assign(processedCategory, cleanCategory)
      }
      return processedCategory
    })
  }
  
  // Build parent-child relationships from flat array using parent_id
  const categoryMap = new Map<string, Category>()
  const topLevel: Category[] = []
  
  // First pass: Create category map and identify top-level categories
  categories.forEach(category => {
    const processedCategory = { ...category, children: [] }
    categoryMap.set(category.id, processedCategory)
    
    if (!category.parent_id) {
      topLevel.push(processedCategory)
    }
  })
  
  // Second pass: Build parent-child relationships
  categories.forEach(category => {
    if (category.parent_id) {
      const parent = categoryMap.get(category.parent_id)
      const child = categoryMap.get(category.id)
      if (parent && child) {
        parent.children = parent.children || []
        parent.children.push(child)
      }
    }
  })
  
  return topLevel
}

export async function GET() {
  try {
    const publicDir = path.join(process.cwd(), 'public')
    
    const [citiesData, categoriesData, metadataData] = await Promise.all([
      fs.promises.readFile(path.join(publicDir, 'static', 'cities.json'), 'utf8')
        .then((data: string) => JSON.parse(data) as CitiesResponse),
      fs.promises.readFile(path.join(publicDir, 'static', 'categories.json'), 'utf8')
        .then((data: string) => JSON.parse(data) as CategoriesResponse),
      fs.promises.readFile(path.join(publicDir, 'static', 'metadata.json'), 'utf8')
        .then((data: string) => JSON.parse(data) as CacheMetadata)
        .catch(() => null) // metadata is optional
    ])
    
    
    const result: StaticDataCache = {
      cities: citiesData.cities,
      categories: processCategories(categoriesData.categories),
      lastUpdated: metadataData?.lastUpdated || new Date().toISOString(),
      version: metadataData?.version || '1.0.0'
    }
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error loading static data from filesystem via API:', error)
    return NextResponse.json(
      { error: 'Failed to load static data from filesystem' },
      { status: 500 }
    )
  }
}
