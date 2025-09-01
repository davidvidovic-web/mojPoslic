/**
 * Static Data Manager
 * Handles loading and caching of cities and categories from JSON files
 */

import { 
  City, 
  Category, 
  StaticDataCache, 
  CitiesResponse, 
  CategoriesResponse,
  CacheMetadata 
} from './static-data-types'

class StaticDataManager {
  private cache: StaticDataCache | null = null
  private loadPromise: Promise<StaticDataCache> | null = null
  private readonly cacheTimeout = 60 * 60 * 1000 // 1 hour
  private lastLoadTime = 0

  /**
   * Load data from cache files with automatic refresh
   */
  async loadData(): Promise<StaticDataCache> {
    const now = Date.now()
    
    // Return cached data if it's still fresh
    if (this.cache && (now - this.lastLoadTime) < this.cacheTimeout) {
      return this.cache
    }
    
    // If already loading, wait for that promise
    if (this.loadPromise) {
      return this.loadPromise
    }

    // Start fresh load
    this.loadPromise = this.fetchData()
    
    try {
      this.cache = await this.loadPromise
      this.lastLoadTime = now
      return this.cache
    } finally {
      this.loadPromise = null
    }
  }

  /**
   * Force reload data (bypass cache)
   */
  async reloadData(): Promise<StaticDataCache> {
    this.cache = null
    this.lastLoadTime = 0
    return this.loadData()
  }

  /**
   * Fetch data from JSON files (using fetch for both client and server)
   */
  private async fetchData(): Promise<StaticDataCache> {
    try {
      // Check if we're running on the server side
      const isServer = typeof window === 'undefined'
      
      if (isServer) {
        // Server-side: use API route to access filesystem data
        try {
          const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL || 'http://localhost:3000'
          const response = await fetch(`${baseUrl}/api/static-data`)
          if (response.ok) {
            return await response.json()
          }
          throw new Error(`Server static data API failed: ${response.status}`)
        } catch (error) {
          console.error('Server-side API load failed, falling back to client-side fetch:', error)
          return this.loadDataFromFetch()
        }
      } else {
        // Client-side: use fetch only
        return this.loadDataFromFetch()
      }
    } catch (error) {
      console.error('Error loading static data:', error)
      throw new Error(`Failed to load static data: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

    /**
   * Load data from fetch (client-side only)
   */
  private async loadDataFromFetch(): Promise<StaticDataCache> {
    // Try to load from static files first, then fallback to API endpoints
    try {
      const [citiesRes, categoriesRes, metadataRes] = await Promise.all([
        fetch('/static/cities.json'),
        fetch('/static/categories.json'),
        fetch('/static/metadata.json').catch(() => null) // metadata is optional
      ])
      
      if (citiesRes.ok && categoriesRes.ok) {
        const [citiesData, categoriesData, metadataData] = await Promise.all([
          citiesRes.json() as Promise<CitiesResponse>,
          categoriesRes.json() as Promise<CategoriesResponse>,
          metadataRes?.json().catch(() => null) as Promise<CacheMetadata | null>
        ])
        
        return {
          cities: citiesData.cities,
          categories: this.processCategories(categoriesData.categories),
          lastUpdated: metadataData?.lastUpdated || new Date().toISOString(),
          version: metadataData?.version || '1.0.0'
        }
      }
    } catch (cacheError) {
      console.warn('Failed to load from static files, trying API routes:', cacheError)
    }
    
    // Fallback to API routes
    try {
      const [citiesRes, categoriesRes, metadataRes] = await Promise.all([
        fetch('/api/static/cities'),
        fetch('/api/static/categories'),
        fetch('/api/static/metadata').catch(() => null) // metadata is optional
      ])
      
      if (citiesRes.ok && categoriesRes.ok) {
        const [citiesData, categoriesData, metadataData] = await Promise.all([
          citiesRes.json() as Promise<CitiesResponse>,
          categoriesRes.json() as Promise<CategoriesResponse>,
          metadataRes?.json().catch(() => null) as Promise<CacheMetadata | null>
        ])
        
        return {
          cities: citiesData.cities,
          categories: this.processCategories(categoriesData.categories),
          lastUpdated: metadataData?.lastUpdated || new Date().toISOString(),
          version: metadataData?.version || '1.0.0'
        }
      }
    } catch (apiError) {
      console.warn('Failed to load from API routes, falling back to main API:', apiError)
    }
    
    // Fallback to API endpoints
    console.log('Loading static data from API endpoints...')
    const [citiesRes, categoriesRes] = await Promise.all([
      fetch('/api/cities', {
        headers: {
          'Content-Type': 'application/json',
        },
        // Add cache control headers to avoid stale responses
        cache: 'no-store'
      }),
      fetch('/api/categories', {
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store'
      })
    ])
    
    if (!citiesRes.ok) {
      throw new Error(`Failed to load cities from API: ${citiesRes.status} ${citiesRes.statusText}`)
    }
    if (!categoriesRes.ok) {
      throw new Error(`Failed to load categories from API: ${categoriesRes.status} ${categoriesRes.statusText}`)
    }
    
    const [citiesData, categoriesData] = await Promise.all([
      citiesRes.json(),
      categoriesRes.json()
    ])
    
    return {
      cities: citiesData.cities || citiesData, // Handle different response formats
      categories: this.processCategories(categoriesData.categories || categoriesData),
      lastUpdated: new Date().toISOString(),
      version: '1.0.0'
    }
  }

  /**
   * Process categories to build hierarchical structure
   */
  private processCategories(categories: Category[]): Category[] {
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
        }
        return processedCategory
      }).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
    }
    
    // Original logic for flat array structure
    const categoryMap = new Map<string, Category>()
    const rootCategories: Category[] = []
    
    // First pass: create category map
    categories.forEach(category => {
      categoryMap.set(category.id, { ...category, children: [] })
    })
    
    // Second pass: build hierarchy
    categories.forEach(category => {
      const processedCategory = categoryMap.get(category.id)!
      
      if (category.parent_id) {
        const parent = categoryMap.get(category.parent_id)
        if (parent) {
          parent.children = parent.children || []
          parent.children.push(processedCategory)
        } else {
          // Parent not found, treat as root category
          rootCategories.push(processedCategory)
        }
      } else {
        rootCategories.push(processedCategory)
      }
    })
    
    // Sort categories by sort_order
    rootCategories.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
    rootCategories.forEach(category => {
      if (category.children) {
        category.children.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
      }
    })
    
    return rootCategories
  }

  // Helper methods for cities
  getCities(): City[] {
    return this.cache?.cities || []
  }

  getCityById(id: string): City | undefined {
    return this.cache?.cities.find(city => city.id === id)
  }

  getCityByKey(key: string): City | undefined {
    return this.cache?.cities.find(city => city.key === key)
  }

  getActiveCities(): City[] {
    return this.cache?.cities.filter(city => city.is_active) || []
  }

  getSpecialCities(): City[] {
    return this.cache?.cities.filter(city => city.is_special) || []
  }

  getCitiesByCountry(country: string): City[] {
    return this.cache?.cities.filter(city => city.country === country) || []
  }

  // Helper methods for categories
  getCategoryById(id: string): Category | undefined {
    if (!this.cache?.categories) return undefined
    
    // Search in hierarchical structure
    const findCategory = (categories: Category[]): Category | undefined => {
      for (const category of categories) {
        if (category.id === id) return category
        if (category.children) {
          const found = findCategory(category.children)
          if (found) return found
        }
      }
      return undefined
    }
    
    return findCategory(this.cache.categories)
  }

  getCategoryByKey(key: string): Category | undefined {
    if (!this.cache?.categories) return undefined
    
    // Search in hierarchical structure
    const findCategory = (categories: Category[]): Category | undefined => {
      for (const category of categories) {
        if (category.key === key) return category
        if (category.children) {
          const found = findCategory(category.children)
          if (found) return found
        }
      }
      return undefined
    }
    
    return findCategory(this.cache.categories)
  }

  getMainCategories(): Category[] {
    return this.cache?.categories || []
  }

  getSubcategories(parentId: string): Category[] {
    const parent = this.getCategoryById(parentId)
    return parent?.children || []
  }

  /**
   * Get all subcategories from all main categories (flattened)
   */
  getAllSubcategories(): Category[] {
    if (!this.cache?.categories) return []
    
    const allSubcategories: Category[] = []
    
    const collectSubcategories = (categories: Category[]) => {
      categories.forEach(category => {
        if (category.children && category.children.length > 0) {
          allSubcategories.push(...category.children)
          // Recursively collect nested subcategories if any
          collectSubcategories(category.children)
        }
      })
    }
    
    collectSubcategories(this.cache.categories)
    return allSubcategories
  }

  getPopularCategories(): Category[] {
    if (!this.cache?.categories) return []
    
    const popular: Category[] = []
    
    const collectPopular = (categories: Category[]) => {
      categories.forEach(category => {
        if (category.is_popular) {
          popular.push(category)
        }
        if (category.children) {
          collectPopular(category.children)
        }
      })
    }
    
    collectPopular(this.cache.categories)
    return popular
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    if (!this.cache) return null
    
    const totalCategories = this.countCategories(this.cache.categories)
    const parentCategories = this.cache.categories.length
    const subcategories = totalCategories - parentCategories
    
    return {
      cities: this.cache.cities.length,
      totalCategories,
      parentCategories,
      subcategories,
      activeCities: this.getActiveCities().length,
      specialCities: this.getSpecialCities().length,
      popularCategories: this.getPopularCategories().length,
      lastUpdated: this.cache.lastUpdated,
      version: this.cache.version,
      cacheAge: this.lastLoadTime ? Date.now() - this.lastLoadTime : null
    }
  }

  private countCategories(categories: Category[]): number {
    let count = 0
    categories.forEach(category => {
      count++
      if (category.children) {
        count += this.countCategories(category.children)
      }
    })
    return count
  }
}

// Export singleton instance
export const staticDataManager = new StaticDataManager()

// Export the class for testing
export { StaticDataManager }
