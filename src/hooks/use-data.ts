/**
 * TanStack Query hooks for categories and cities data
 * Replaces the legacy data-context.tsx
 */

import { useQuery } from '@tanstack/react-query'

// Types
interface City {
  id: string
  key: string
  name_en: string
  name_bs: string
  is_special: boolean
  is_active: boolean
  country?: string
  state?: string
  sort_order?: number
  // Keep compatibility with old property names
  nameEN?: string
  nameBS?: string
  isSpecial?: boolean
  isActive?: boolean
  countryCode?: string
}

interface Category {
  id: string
  key: string
  nameEN: string
  nameBS: string
  children?: Category[]
  // Legacy flat structure compatibility
  name_en?: string
  name_bs?: string
  is_popular?: boolean
  parent_id?: string | null
  created_at?: string
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
  const data = await response.json()
  return data.cities || []
}

async function fetchPopularCities(): Promise<City[]> {
  const response = await fetch('/api/cities?popular=true')
  if (!response.ok) throw new Error('Failed to fetch popular cities')
  const data = await response.json()
  return data.cities || []
}

async function fetchCategories(): Promise<Category[]> {
  const response = await fetch('/api/categories')
  if (!response.ok) throw new Error('Failed to fetch categories')
  const data = await response.json()
  return data.categories || []
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
    return query.data.filter((city: City) => 
      (city.countryCode === countryCode) || (city.country === countryCode)
    ) || []
  }

  const getActiveCities = () => {
    if (!Array.isArray(query.data)) return []
    return query.data.filter((city: City) => 
      city.is_active !== false && city.isActive !== false
    ) || []
  }

  const getSpecialCities = () => {
    if (!Array.isArray(query.data)) return []
    return query.data.filter((city: City) => 
      city.is_special === true || city.isSpecial === true
    ) || []
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
      // For hierarchical data, return top-level categories
      return query.data.filter((category: Category) => !category.parent_id) || []
    }
    // For hierarchical data, look within children arrays
    for (const category of query.data) {
      if (category.id === parentId && category.children) {
        return category.children
      }
    }
    return []
  }

  const getMainCategories = () => {
    // Ensure query.data is an array before attempting to filter
    if (!Array.isArray(query.data)) return []
    // For hierarchical data, return all top-level categories
    return query.data || []
  }

  const getSubcategories = (parentId: string) => {
    // Ensure query.data is an array before attempting to filter
    if (!Array.isArray(query.data)) return []
    // For hierarchical data, find the parent and return its children
    const parent = query.data.find((category: Category) => category.id === parentId)
    return parent?.children || []
  }

  const getPopularCategories = () => {
    // Ensure query.data is an array before attempting to filter
    if (!Array.isArray(query.data)) return []
    // For hierarchical data, this is less straightforward
    // We'll need to check both parent and child categories
    const popular: Category[] = []
    query.data.forEach((category: Category) => {
      if (category.is_popular) popular.push(category)
      if (category.children) {
        category.children.forEach((child: Category) => {
          if (child.is_popular) popular.push(child)
        })
      }
    })
    return popular
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
