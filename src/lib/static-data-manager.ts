/**
 * Static Data Manager
 * Handles loading and caching of cities and categories from JSON files
 * for improved performance over database queries
 */

import { StaticCity, StaticCategory, StaticDataCache } from '@/types/static-data'

class StaticDataManager {
  private cache: StaticDataCache | null = null
  private loadingPromise: Promise<StaticDataCache> | null = null
  private readonly cacheKey = 'mojposlic-static-data-cache'
  private readonly cacheMaxAge = 60 * 60 * 1000 // 1 hour in milliseconds

  /**
   * Load static data from API or cache
   */
  async loadStaticData(): Promise<StaticDataCache> {
    // Return existing loading promise if already loading
    if (this.loadingPromise) {
      return this.loadingPromise
    }

    // Check memory cache first
    if (this.cache && this.isCacheValid()) {
      return this.cache
    }

    // Check localStorage cache
    const cachedData = this.getFromLocalStorage()
    if (cachedData && this.isCacheValid(cachedData)) {
      this.cache = cachedData
      return cachedData
    }

    // Load fresh data
    this.loadingPromise = this.fetchFreshData()
    
    try {
      const freshData = await this.loadingPromise
      this.cache = freshData
      this.saveToLocalStorage(freshData)
      return freshData
    } finally {
      this.loadingPromise = null
    }
  }

  /**
   * Get all cities
   */
  async getCities(): Promise<StaticCity[]> {
    const data = await this.loadStaticData()
    return data.cities
  }

  /**
   * Get all categories
   */
  async getCategories(): Promise<StaticCategory[]> {
    const data = await this.loadStaticData()
    return data.categories
  }

  /**
   * Get city by ID
   */
  async getCityById(id: string): Promise<StaticCity | undefined> {
    const cities = await this.getCities()
    return cities.find(city => city.id === id || city.key === id)
  }

  /**
   * Get category by ID
   */
  async getCategoryById(id: string): Promise<StaticCategory | undefined> {
    const categories = await this.getCategories()
    return this.findCategoryRecursive(categories, id)
  }

  /**
   * Get localized city name
   */
  async getCityName(id: string, locale: 'bs' | 'en' = 'en'): Promise<string> {
    const city = await this.getCityById(id)
    if (!city) return 'Unknown City'
    return locale === 'bs' ? city.name_bs : city.name_en
  }

  /**
   * Get localized category name
   */
  async getCategoryName(id: string, locale: 'bs' | 'en' = 'en'): Promise<string> {
    const category = await this.getCategoryById(id)
    if (!category) return 'Unknown Category'
    return locale === 'bs' ? category.name_bs : category.name_en
  }

  /**
   * Search cities by name
   */
  async searchCities(query: string, locale: 'bs' | 'en' = 'en'): Promise<StaticCity[]> {
    const cities = await this.getCities()
    const searchTerm = query.toLowerCase()
    
    return cities.filter(city => {
      const name = locale === 'bs' ? city.name_bs : city.name_en
      return name.toLowerCase().includes(searchTerm)
    })
  }

  /**
   * Search categories by name
   */
  async searchCategories(query: string, locale: 'bs' | 'en' = 'en'): Promise<StaticCategory[]> {
    const categories = await this.getCategories()
    const searchTerm = query.toLowerCase()
    
    return this.searchCategoriesRecursive(categories, searchTerm, locale)
  }

  /**
   * Clear cache and reload data
   */
  async refresh(): Promise<StaticDataCache> {
    this.cache = null
    this.clearLocalStorage()
    return this.loadStaticData()
  }

  /**
   * Get popular cities
   */
  async getPopularCities(): Promise<StaticCity[]> {
    const cities = await this.getCities()
    return cities.filter(city => city.is_special).slice(0, 10)
  }

  /**
   * Get popular categories
   */
  async getPopularCategories(): Promise<StaticCategory[]> {
    const categories = await this.getCategories()
    return categories.filter(category => category.is_popular).slice(0, 10)
  }

  /**
   * Fetch fresh data from API
   */
  private async fetchFreshData(): Promise<StaticDataCache> {
    try {
      const [citiesResponse, categoriesResponse] = await Promise.all([
        fetch('/api/static/cities'),
        fetch('/api/static/categories')
      ])

      if (!citiesResponse.ok || !categoriesResponse.ok) {
        throw new Error('Failed to fetch static data')
      }

      const [citiesData, categoriesData] = await Promise.all([
        citiesResponse.json(),
        categoriesResponse.json()
      ])

      // Extract the cities and categories arrays from the API responses
      const cities = citiesData.cities || citiesData
      const categories = categoriesData.categories || categoriesData

      return {
        cities,
        categories,
        lastUpdated: new Date().toISOString(),
        version: '1.0'
      }
    } catch (error) {
      console.error('Error fetching static data:', error)
      throw error
    }
  }

  /**
   * Check if cache is valid
   */
  private isCacheValid(data?: StaticDataCache): boolean {
    const cacheData = data || this.cache
    if (!cacheData) return false

    const lastUpdated = new Date(cacheData.lastUpdated).getTime()
    const now = Date.now()
    
    return (now - lastUpdated) < this.cacheMaxAge
  }

  /**
   * Get data from localStorage
   */
  private getFromLocalStorage(): StaticDataCache | null {
    if (typeof window === 'undefined') return null

    try {
      const cached = localStorage.getItem(this.cacheKey)
      return cached ? JSON.parse(cached) : null
    } catch (error) {
      console.error('Error reading from localStorage:', error)
      return null
    }
  }

  /**
   * Save data to localStorage
   */
  private saveToLocalStorage(data: StaticDataCache): void {
    if (typeof window === 'undefined') return

    try {
      localStorage.setItem(this.cacheKey, JSON.stringify(data))
    } catch (error) {
      console.error('Error saving to localStorage:', error)
    }
  }

  /**
   * Clear localStorage cache
   */
  private clearLocalStorage(): void {
    if (typeof window === 'undefined') return

    try {
      localStorage.removeItem(this.cacheKey)
    } catch (error) {
      console.error('Error clearing localStorage:', error)
    }
  }

  /**
   * Find category recursively in nested structure
   */
  private findCategoryRecursive(categories: StaticCategory[], id: string): StaticCategory | undefined {
    for (const category of categories) {
      if (category.id === id || category.key === id) {
        return category
      }
      
      if (category.children) {
        const found = this.findCategoryRecursive(category.children, id)
        if (found) return found
      }
    }
    
    return undefined
  }

  /**
   * Search categories recursively
   */
  private searchCategoriesRecursive(categories: StaticCategory[], searchTerm: string, locale: 'bs' | 'en'): StaticCategory[] {
    const results: StaticCategory[] = []
    
    for (const category of categories) {
      const name = locale === 'bs' ? category.name_bs : category.name_en
      if (name.toLowerCase().includes(searchTerm)) {
        results.push(category)
      }
      
      if (category.children) {
        results.push(...this.searchCategoriesRecursive(category.children, searchTerm, locale))
      }
    }
    
    return results
  }
}

// Create singleton instance
export const staticDataManager = new StaticDataManager()

// Export for testing
export { StaticDataManager }
