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
   * Fetch data from JSON files (server-side using filesystem, client-side using fetch)
   */
  private async fetchData(): Promise<StaticDataCache> {
    try {
      // Check if we're on server side
      const isServer = typeof window === 'undefined'
      
      if (isServer) {
        // Server-side: use filesystem access
        const fs = await import('fs/promises')
        const path = await import('path')
        
        const publicPath = path.join(process.cwd(), 'public', 'cache')
        
        const [citiesFile, categoriesFile] = await Promise.all([
          fs.readFile(path.join(publicPath, 'cities.json'), 'utf-8'),
          fs.readFile(path.join(publicPath, 'categories.json'), 'utf-8')
        ])
        
        const citiesData = JSON.parse(citiesFile) as CitiesResponse
        const categoriesData = JSON.parse(categoriesFile) as CategoriesResponse
        
        // Try to load metadata (optional)
        let metadataData: CacheMetadata | null = null
        try {
          const metadataFile = await fs.readFile(path.join(publicPath, 'metadata.json'), 'utf-8')
          metadataData = JSON.parse(metadataFile) as CacheMetadata
        } catch {
          // Metadata is optional
        }
        
        return {
          cities: citiesData.cities,
          categories: this.processCategories(categoriesData.categories),
          lastUpdated: metadataData?.lastUpdated || new Date().toISOString(),
          version: metadataData?.version || '1.0.0'
        }
      } else {
        // Client-side: use fetch
        const [citiesRes, categoriesRes, metadataRes] = await Promise.all([
          fetch('/cache/cities.json'),
          fetch('/cache/categories.json'),
          fetch('/cache/metadata.json').catch(() => null) // metadata is optional
        ])
        
        if (!citiesRes.ok) {
          throw new Error(`Failed to load cities: ${citiesRes.status} ${citiesRes.statusText}`)
        }
        if (!categoriesRes.ok) {
          throw new Error(`Failed to load categories: ${categoriesRes.status} ${categoriesRes.statusText}`)
        }
        
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
    } catch (error) {
      console.error('Error loading static data:', error)
      throw new Error(`Failed to load static data: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Process categories to build hierarchical structure
   */
  private processCategories(categories: Category[]): Category[] {
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
