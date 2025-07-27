/**
 * Optimized Static Data Hooks
 * These hooks provide access to cities and categories from JSON files
 * with caching and error handling for better performance
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { StaticCity, StaticCategory, StaticDataState } from '@/types/static-data'
import { staticDataManager } from '@/lib/static-data-manager'

/**
 * Main hook for static data (cities and categories)
 */
export function useStaticData(): StaticDataState & {
  refresh: () => Promise<void>
  getCityName: (id: string, locale?: 'bs' | 'en') => Promise<string>
  getCategoryName: (id: string, locale?: 'bs' | 'en') => Promise<string>
} {
  const [state, setState] = useState<StaticDataState>({
    cities: [],
    categories: [],
    loading: true,
    error: null,
    lastFetch: null
  })

  const loadData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      
      const data = await staticDataManager.loadStaticData()
      
      setState({
        cities: data.cities,
        categories: data.categories,
        loading: false,
        error: null,
        lastFetch: new Date()
      })
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load static data'
      }))
    }
  }, [])

  const refresh = useCallback(async () => {
    await staticDataManager.refresh()
    await loadData()
  }, [loadData])

  const getCityName = useCallback(async (id: string, locale: 'bs' | 'en' = 'en') => {
    return staticDataManager.getCityName(id, locale)
  }, [])

  const getCategoryName = useCallback(async (id: string, locale: 'bs' | 'en' = 'en') => {
    return staticDataManager.getCategoryName(id, locale)
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  return {
    ...state,
    refresh,
    getCityName,
    getCategoryName
  }
}

/**
 * Hook for cities only
 */
export function useCities() {
  const [cities, setCities] = useState<StaticCity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadCities = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await staticDataManager.getCities()
        setCities(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load cities')
      } finally {
        setLoading(false)
      }
    }

    loadCities()
  }, [])

  const searchCities = useCallback(async (query: string, locale: 'bs' | 'en' = 'en') => {
    return staticDataManager.searchCities(query, locale)
  }, [])

  const getCityById = useCallback(async (id: string) => {
    return staticDataManager.getCityById(id)
  }, [])

  const getPopularCities = useCallback(async () => {
    return staticDataManager.getPopularCities()
  }, [])

  return {
    cities,
    loading,
    error,
    searchCities,
    getCityById,
    getPopularCities
  }
}

/**
 * Hook for categories only
 */
export function useCategories() {
  const [categories, setCategories] = useState<StaticCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await staticDataManager.getCategories()
        setCategories(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load categories')
      } finally {
        setLoading(false)
      }
    }

    loadCategories()
  }, [])

  const searchCategories = useCallback(async (query: string, locale: 'bs' | 'en' = 'en') => {
    return staticDataManager.searchCategories(query, locale)
  }, [])

  const getCategoryById = useCallback(async (id: string) => {
    return staticDataManager.getCategoryById(id)
  }, [])

  const getPopularCategories = useCallback(async () => {
    return staticDataManager.getPopularCategories()
  }, [])

  return {
    categories,
    loading,
    error,
    searchCategories,
    getCategoryById,
    getPopularCategories
  }
}

/**
 * Hook for a specific city
 */
export function useCity(cityId: string | undefined) {
  const [city, setCity] = useState<StaticCity | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadCity = async () => {
      if (!cityId) {
        setCity(null)
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        const cityData = await staticDataManager.getCityById(cityId)
        setCity(cityData || null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load city')
      } finally {
        setLoading(false)
      }
    }

    loadCity()
  }, [cityId])

  return { city, loading, error }
}

/**
 * Hook for a specific category
 */
export function useCategory(categoryId: string | undefined) {
  const [category, setCategory] = useState<StaticCategory | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadCategory = async () => {
      if (!categoryId) {
        setCategory(null)
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        const categoryData = await staticDataManager.getCategoryById(categoryId)
        setCategory(categoryData || null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load category')
      } finally {
        setLoading(false)
      }
    }

    loadCategory()
  }, [categoryId])

  return { category, loading, error }
}

/**
 * Hook for localized names (cached lookup)
 */
export function useLocalizedNames(locale: 'bs' | 'en' = 'en') {
  const getCityName = useCallback(async (cityId: string) => {
    return staticDataManager.getCityName(cityId, locale)
  }, [locale])

  const getCategoryName = useCallback(async (categoryId: string) => {
    return staticDataManager.getCategoryName(categoryId, locale)
  }, [locale])

  return {
    getCityName,
    getCategoryName
  }
}

// Legacy exports for backward compatibility
export interface UseStaticDataResult<T> {
  data: T
  loading: boolean
  error: string | null
  reload: () => Promise<void>
}

/**
 * @deprecated Use useCities() instead
 */
export function useStaticCities() {
  return useCities()
}

/**
 * @deprecated Use useCategories() instead
 */
export function useStaticCategories() {
  return useCategories()
}
