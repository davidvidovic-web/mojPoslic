/**
 * Cache management utilities for cities and categories
 */

const CACHE_KEYS = {
  cities: 'app_cache_cities',
  categories: 'app_cache_categories',
  citiesTimestamp: 'app_cache_cities_timestamp',
  categoriesTimestamp: 'app_cache_categories_timestamp'
}

export class CacheManager {
  /**
   * Clear all cached data
   */
  static clearAll(): void {
    if (typeof window === 'undefined') return
    
    Object.values(CACHE_KEYS).forEach(key => {
      localStorage.removeItem(key)
    })
  }

  /**
   * Clear cities cache
   */
  static clearCities(): void {
    if (typeof window === 'undefined') return
    
    localStorage.removeItem(CACHE_KEYS.cities)
    localStorage.removeItem(CACHE_KEYS.citiesTimestamp)
  }

  /**
   * Clear categories cache
   */
  static clearCategories(): void {
    if (typeof window === 'undefined') return
    
    localStorage.removeItem(CACHE_KEYS.categories)
    localStorage.removeItem(CACHE_KEYS.categoriesTimestamp)
  }

  /**
   * Get cache status information
   */
  static getCacheInfo(): {
    cities: { cached: boolean; timestamp: number | null }
    categories: { cached: boolean; timestamp: number | null }
  } {
    if (typeof window === 'undefined') {
      return {
        cities: { cached: false, timestamp: null },
        categories: { cached: false, timestamp: null }
      }
    }

    const citiesTimestamp = localStorage.getItem(CACHE_KEYS.citiesTimestamp)
    const categoriesTimestamp = localStorage.getItem(CACHE_KEYS.categoriesTimestamp)

    return {
      cities: {
        cached: !!localStorage.getItem(CACHE_KEYS.cities),
        timestamp: citiesTimestamp ? parseInt(citiesTimestamp) : null
      },
      categories: {
        cached: !!localStorage.getItem(CACHE_KEYS.categories),
        timestamp: categoriesTimestamp ? parseInt(categoriesTimestamp) : null
      }
    }
  }

  /**
   * Check if cache is expired (older than 30 minutes)
   */
  static isCacheExpired(type: 'cities' | 'categories'): boolean {
    if (typeof window === 'undefined') return true
    
    const timestampKey = type === 'cities' ? CACHE_KEYS.citiesTimestamp : CACHE_KEYS.categoriesTimestamp
    const timestamp = localStorage.getItem(timestampKey)
    
    if (!timestamp) return true
    
    const cacheTime = parseInt(timestamp)
    const now = Date.now()
    const CACHE_DURATION = 30 * 60 * 1000 // 30 minutes
    
    return (now - cacheTime) > CACHE_DURATION
  }
}

/**
 * Hook for cache management in React components
 */
export function useCacheManager() {
  const clearAll = () => CacheManager.clearAll()
  const clearCities = () => CacheManager.clearCities()
  const clearCategories = () => CacheManager.clearCategories()
  const getCacheInfo = () => CacheManager.getCacheInfo()
  
  return {
    clearAll,
    clearCities,
    clearCategories,
    getCacheInfo,
    isCacheExpired: CacheManager.isCacheExpired
  }
}
