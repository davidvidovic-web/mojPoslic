/**
 * React hooks for static data (cities, categories)
 * Replaces TanStack Query for static reference data
 */

import { useState, useEffect, useCallback } from 'react'
import { staticDataManager } from '@/lib/static-data'
import type { City, Category } from '@/lib/static-data-types'

export interface UseStaticDataResult<T> {
  data: T
  loading: boolean
  error: string | null
  reload: () => Promise<void>
}

/**
 * Hook for cities static data
 */
export function useStaticCities(): UseStaticDataResult<City[]> & {
  getCityById: (id: string) => City | undefined
  getCityByKey: (key: string) => City | undefined
  getActiveCities: () => City[]
  getSpecialCities: () => City[]
  getCitiesByCountry: (country: string) => City[]
} {
  const [cities, setCities] = useState<City[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await staticDataManager.loadData()
      setCities(data.cities)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load cities'
      setError(errorMessage)
      setCities([])
      console.error('Error loading cities:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const reload = useCallback(async () => {
    await staticDataManager.reloadData()
    await loadData()
  }, [loadData])

  useEffect(() => {
    loadData()
  }, [loadData])

  return {
    data: cities,
    loading,
    error,
    reload,
    getCityById: staticDataManager.getCityById.bind(staticDataManager),
    getCityByKey: staticDataManager.getCityByKey.bind(staticDataManager),
    getActiveCities: staticDataManager.getActiveCities.bind(staticDataManager),
    getSpecialCities: staticDataManager.getSpecialCities.bind(staticDataManager),
    getCitiesByCountry: staticDataManager.getCitiesByCountry.bind(staticDataManager),
  }
}

/**
 * Hook for categories static data
 */
export function useStaticCategories(): UseStaticDataResult<Category[]> & {
  getCategoryById: (id: string) => Category | undefined
  getCategoryByKey: (key: string) => Category | undefined
  getMainCategories: () => Category[]
  getSubcategories: (parentId: string) => Category[]
  getPopularCategories: () => Category[]
} {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await staticDataManager.loadData()
      setCategories(data.categories)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load categories'
      setError(errorMessage)
      setCategories([])
      console.error('Error loading categories:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const reload = useCallback(async () => {
    await staticDataManager.reloadData()
    await loadData()
  }, [loadData])

  useEffect(() => {
    loadData()
  }, [loadData])

  return {
    data: categories,
    loading,
    error,
    reload,
    getCategoryById: staticDataManager.getCategoryById.bind(staticDataManager),
    getCategoryByKey: staticDataManager.getCategoryByKey.bind(staticDataManager),
    getMainCategories: staticDataManager.getMainCategories.bind(staticDataManager),
    getSubcategories: staticDataManager.getSubcategories.bind(staticDataManager),
    getPopularCategories: staticDataManager.getPopularCategories.bind(staticDataManager),
  }
}

/**
 * Combined hook for both cities and categories
 */
export function useStaticData() {
  const cities = useStaticCities()
  const categories = useStaticCategories()

  const reload = useCallback(async () => {
    await staticDataManager.reloadData()
    await Promise.all([cities.reload(), categories.reload()])
  }, [cities, categories])

  return {
    cities: cities.data,
    categories: categories.data,
    loading: cities.loading || categories.loading,
    error: cities.error || categories.error,
    reload,
    
    // City helpers
    getCityById: cities.getCityById,
    getCityByKey: cities.getCityByKey,
    getActiveCities: cities.getActiveCities,
    getSpecialCities: cities.getSpecialCities,
    getCitiesByCountry: cities.getCitiesByCountry,
    
    // Category helpers
    getCategoryById: categories.getCategoryById,
    getCategoryByKey: categories.getCategoryByKey,
    getMainCategories: categories.getMainCategories,
    getSubcategories: categories.getSubcategories,
    getPopularCategories: categories.getPopularCategories,
    
    // Cache stats
    getCacheStats: staticDataManager.getCacheStats.bind(staticDataManager),
  }
}
