'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

interface City {
  id: string
  key: string
  name_bs: string
  name_en: string
  name: string
  country: string
  state: string
  is_special: boolean
  sort_order: number
  is_active: boolean
}

interface Category {
  id: string
  key: string
  name_bs: string
  name_en: string
  name: string
  description?: string
  icon?: string
  color?: string
  parent_id?: string
  sort_order: number
  is_active: boolean
  is_popular: boolean
}

interface DataContextType {
  cities: City[]
  categories: Category[]
  loading: {
    cities: boolean
    categories: boolean
  }
  error: {
    cities: string | null
    categories: string | null
  }
  refreshCities: () => Promise<void>
  refreshCategories: () => Promise<void>
  getCityById: (id: string) => City | undefined
  getCategoryById: (id: string) => Category | undefined
  getCitiesByCountry: (country: string) => City[]
  getCategoriesByParent: (parentId?: string) => Category[]
}

const DataContext = createContext<DataContextType | undefined>(undefined)

const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours - rely on server-side daily updates
const STORAGE_KEYS = {
  cities: 'app_cache_cities_v2',
  categories: 'app_cache_categories_v2', // Updated version to force refresh
  citiesTimestamp: 'app_cache_cities_timestamp_v2',
  categoriesTimestamp: 'app_cache_categories_timestamp_v2'
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [cities, setCities] = useState<City[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState({
    cities: true, // Start with loading true since we fetch on mount
    categories: true
  })
  const [error, setError] = useState({
    cities: null as string | null,
    categories: null as string | null
  })

  // Add global function to clear cache (for debugging)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as unknown as { clearMojPoslicCache: () => void }).clearMojPoslicCache = () => {
        localStorage.removeItem(STORAGE_KEYS.cities)
        localStorage.removeItem(STORAGE_KEYS.categories)
        localStorage.removeItem(STORAGE_KEYS.citiesTimestamp)
        localStorage.removeItem(STORAGE_KEYS.categoriesTimestamp)
        // Cache cleared! Refresh the page to reload data.
      }
    }
  }, [])

  // Check if cached data is still valid
  const isCacheValid = (key: string): boolean => {
    if (typeof window === 'undefined') return false
    
    const timestamp = localStorage.getItem(key)
    if (!timestamp) return false
    
    const cacheTime = parseInt(timestamp)
    const now = Date.now()
    return (now - cacheTime) < CACHE_DURATION
  }

  // Load cached data from localStorage
  const loadCitiesFromCache = (): City[] | null => {
    if (typeof window === 'undefined') return null
    
    try {
      const cached = localStorage.getItem(STORAGE_KEYS.cities)
      return cached ? JSON.parse(cached) : null
    } catch (error) {
      console.error('Error loading cities from cache:', error)
      return null
    }
  }

  // Load cached categories from localStorage
  const loadCategoriesFromCache = (): Category[] | null => {
    if (typeof window === 'undefined') return null
    
    try {
      const cached = localStorage.getItem(STORAGE_KEYS.categories)
      return cached ? JSON.parse(cached) : null
    } catch (error) {
      console.error('Error loading categories from cache:', error)
      return null
    }
  }

  // Save cities to localStorage
  const saveCitiesToCache = (data: City[]) => {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem(STORAGE_KEYS.cities, JSON.stringify(data))
      localStorage.setItem(STORAGE_KEYS.citiesTimestamp, Date.now().toString())
    } catch (error) {
      console.error('Error saving cities to cache:', error)
    }
  }

  // Save categories to localStorage
  const saveCategoriesToCache = (data: Category[]) => {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem(STORAGE_KEYS.categories, JSON.stringify(data))
      localStorage.setItem(STORAGE_KEYS.categoriesTimestamp, Date.now().toString())
    } catch (error) {
      console.error('Error saving categories to cache:', error)
    }
  }

  // Fetch cities from API
  const fetchCities = useCallback(async (force = false): Promise<City[]> => {
    // Check cache first unless forced
    if (!force && isCacheValid(STORAGE_KEYS.citiesTimestamp)) {
      const cached = loadCitiesFromCache()
      if (cached && cached.length > 0) {
        // Make sure to set loading to false when returning cached data
        setLoading(prev => ({ ...prev, cities: false }))
        return cached
      }
    }

    setLoading(prev => ({ ...prev, cities: true }))
    setError(prev => ({ ...prev, cities: null }))

    try {
      const response = await fetch('/api/cities')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      // Handle API response format { cities: [...] }
      const citiesArray = data.cities || data || []
      
      // Cache the data
      saveCitiesToCache(citiesArray)
      
      return citiesArray
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch cities'
      setError(prev => ({ ...prev, cities: errorMessage }))
      console.error('Error fetching cities:', err)
      
      // Try to return cached data even if expired
      const cached = loadCitiesFromCache()
      return cached || []
    } finally {
      setLoading(prev => ({ ...prev, cities: false }))
    }
  }, [])

  // Fetch categories from API
  const fetchCategories = useCallback(async (force = false): Promise<Category[]> => {
    // Check cache first unless forced
    if (!force && isCacheValid(STORAGE_KEYS.categoriesTimestamp)) {
      const cached = loadCategoriesFromCache()
      if (cached && cached.length > 0) {
        // Make sure to set loading to false when returning cached data
        setLoading(prev => ({ ...prev, categories: false }))
        return cached
      }
    }

    setLoading(prev => ({ ...prev, categories: true }))
    setError(prev => ({ ...prev, categories: null }))

    try {
      const response = await fetch('/api/categories')
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      // Handle API response format { categories: [...] }
      const categoriesArray = data.categories || data || []
      
      // Cache the data
      saveCategoriesToCache(categoriesArray)
      
      return categoriesArray
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch categories'
      setError(prev => ({ ...prev, categories: errorMessage }))
      
      // Try to return cached data even if expired
      const cached = loadCategoriesFromCache()
      return cached || []
    } finally {
      setLoading(prev => ({ ...prev, categories: false }))
    }
  }, [])

  // Initialize data on mount
  useEffect(() => {
    const initData = async () => {
      // Load cities
      const citiesData = await fetchCities()
      setCities(citiesData)

      // Load categories
      const categoriesData = await fetchCategories()
      setCategories(categoriesData)
    }

    initData()
  }, [fetchCities, fetchCategories])

  // Refresh functions
  const refreshCities = useCallback(async () => {
    const data = await fetchCities(true)
    setCities(data)
  }, [fetchCities])

  const refreshCategories = useCallback(async () => {
    const data = await fetchCategories(true)
    setCategories(data)
  }, [fetchCategories])

  // Helper functions
  const getCityById = useCallback((id: string) => {
    return Array.isArray(cities) ? cities.find(city => city.id === id) : undefined
  }, [cities])

  const getCategoryById = useCallback((id: string) => {
    return Array.isArray(categories) ? categories.find(category => category.id === id) : undefined
  }, [categories])

  const getCitiesByCountry = useCallback((country: string) => {
    return Array.isArray(cities) ? cities.filter(city => city.country === country) : []
  }, [cities])

  const getCategoriesByParent = useCallback((parentId?: string) => {
    return Array.isArray(categories) ? categories.filter(category => {
      // Handle both null and undefined for main categories
      if (parentId === undefined) {
        return category.parent_id === null || category.parent_id === undefined
      }
      return category.parent_id === parentId
    }) : []
  }, [categories])

  const value: DataContextType = {
    cities,
    categories,
    loading,
    error,
    refreshCities,
    refreshCategories,
    getCityById,
    getCategoryById,
    getCitiesByCountry,
    getCategoriesByParent
  }

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}

// Export hook for cities specifically
export function useCities() {
  const { cities, loading, error, refreshCities, getCityById, getCitiesByCountry } = useData()
  return { 
    cities: Array.isArray(cities) ? cities : [], // Ensure always an array
    loading: loading.cities, 
    error: error.cities, 
    refreshCities, 
    getCityById, 
    getCitiesByCountry 
  }
}

// Export hook for categories specifically
export function useCategories() {
  const { categories, loading, error, refreshCategories, getCategoryById, getCategoriesByParent } = useData()
  return { 
    categories: Array.isArray(categories) ? categories : [], // Ensure always an array
    loading: loading.categories, 
    error: error.categories, 
    refreshCategories, 
    getCategoryById, 
    getCategoriesByParent 
  }
}
