/**
 * TanStack Query hooks for categories and cities data
 * Replaces the legacy data-context.tsx
 */

import { useQuery } from '@tanstack/react-query'

// Types
interface City {
  id: string
  key: string
  nameEN: string
  nameBS: string
  isSpecial: boolean
  isActive: boolean
  countryCode: string
}

interface Category {
  id: string
  key: string
  name_en: string
  name_bs: string
  is_popular: boolean
  parent_id: string | null
  created_at: string
}

// Query Keys
export const dataKeys = {
  cities: ['cities'] as const,
  citiesPopular: ['cities', 'popular'] as const,
  citiesByCountry: (country: string) => ['cities', 'country', country] as const,
  categories: ['categories'] as const,
  categoriesActive: ['categories', 'active'] as const,
  categoriesByParent: (parentId?: string) => ['categories', 'parent', parentId] as const,
}

// API Functions
async function fetchCities(): Promise<City[]> {
  const response = await fetch('/api/cities')
  if (!response.ok) throw new Error('Failed to fetch cities')
  return response.json()
}

async function fetchPopularCities(): Promise<City[]> {
  const response = await fetch('/api/cities?popular=true')
  if (!response.ok) throw new Error('Failed to fetch popular cities')
  return response.json()
}

async function fetchCategories(): Promise<Category[]> {
  const response = await fetch('/api/categories')
  if (!response.ok) throw new Error('Failed to fetch categories')
  return response.json()
}

// Query Hooks
export function useCities() {
  const query = useQuery<City[]>({
    queryKey: dataKeys.cities,
    queryFn: fetchCities,
    staleTime: 60 * 60 * 1000, // 1 hour - cities don't change often
    gcTime: 24 * 60 * 60 * 1000, // 24 hours (cacheTime renamed to gcTime in v5)
  })

  // Helper functions
  const getCityById = (id: string) => {
    if (!Array.isArray(query.data)) return undefined
    return query.data.find((city: City) => city.id === id)
  }

  const getCityByKey = (key: string) => {
    if (!Array.isArray(query.data)) return undefined
    return query.data.find((city: City) => city.key === key)
  }

  const getCitiesByCountry = (countryCode: string) => {
    if (!Array.isArray(query.data)) return []
    return query.data.filter((city: City) => city.countryCode === countryCode) || []
  }

  const getActiveCities = () => {
    if (!Array.isArray(query.data)) return []
    return query.data.filter((city: City) => city.isActive) || []
  }

  const getSpecialCities = () => {
    if (!Array.isArray(query.data)) return []
    return query.data.filter((city: City) => city.isSpecial) || []
  }

  return {
    ...query,
    cities: Array.isArray(query.data) ? query.data : [],
    getCityById,
    getCityByKey,
    getCitiesByCountry,
    getActiveCities,
    getSpecialCities,
  }
}

export function usePopularCities() {
  return useQuery<City[]>({
    queryKey: dataKeys.citiesPopular,
    queryFn: fetchPopularCities,
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
  })
}

export function useCategories() {
  const query = useQuery<Category[]>({
    queryKey: dataKeys.categories,
    queryFn: fetchCategories,
    staleTime: 60 * 60 * 1000, // 1 hour - categories don't change often
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
  })

  // Helper functions
  const getCategoryById = (id: string) => {
    if (!Array.isArray(query.data)) return undefined
    return query.data.find((category: Category) => category.id === id)
  }

  const getCategoryByKey = (key: string) => {
    if (!Array.isArray(query.data)) return undefined
    return query.data.find((category: Category) => category.key === key)
  }

  const getCategoriesByParent = (parentId?: string) => {
    // Ensure query.data is an array before attempting to filter
    if (!Array.isArray(query.data)) return []
    
    if (parentId === undefined) {
      // Return main categories (no parent)
      return query.data.filter((category: Category) => category.parent_id === null) || []
    }
    // Return subcategories
    return query.data.filter((category: Category) => category.parent_id === parentId) || []
  }

  const getMainCategories = () => {
    // Ensure query.data is an array before attempting to filter
    if (!Array.isArray(query.data)) return []
    return query.data.filter((category: Category) => category.parent_id === null) || []
  }

  const getSubcategories = (parentId: string) => {
    // Ensure query.data is an array before attempting to filter
    if (!Array.isArray(query.data)) return []
    return query.data.filter((category: Category) => category.parent_id === parentId) || []
  }

  const getPopularCategories = () => {
    // Ensure query.data is an array before attempting to filter
    if (!Array.isArray(query.data)) return []
    return query.data.filter((category: Category) => category.is_popular) || []
  }

  return {
    ...query,
    categories: Array.isArray(query.data) ? query.data : [],
    getCategoryById,
    getCategoryByKey,
    getCategoriesByParent,
    getMainCategories,
    getSubcategories,
    getPopularCategories,
  }
}

// Combined hook for components that need both
export function useData() {
  const cities = useCities()
  const categories = useCategories()

  return {
    cities: Array.isArray(cities.cities) ? cities.cities : [],
    categories: Array.isArray(categories.categories) ? categories.categories : [],
    loading: cities.isLoading || categories.isLoading,
    error: cities.error || categories.error,
    
    // City helpers
    getCityById: cities.getCityById,
    getCityByKey: cities.getCityByKey,
    getCitiesByCountry: cities.getCitiesByCountry,
    getActiveCities: cities.getActiveCities,
    getSpecialCities: cities.getSpecialCities,
    
    // Category helpers
    getCategoryById: categories.getCategoryById,
    getCategoryByKey: categories.getCategoryByKey,
    getCategoriesByParent: categories.getCategoriesByParent,
    getMainCategories: categories.getMainCategories,
    getSubcategories: categories.getSubcategories,
    getPopularCategories: categories.getPopularCategories,
    
    // Refresh functions (will trigger refetch)
    refreshCities: cities.refetch,
    refreshCategories: categories.refetch,
  }
}
