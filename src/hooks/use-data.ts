/**
 * Data hooks - Updated to use static JSON data instead of TanStack Query
 * This provides better performance for cities and categories reference data
 */

import { useStaticCities, useStaticCategories, useStaticData } from './use-static-data'
import type { StaticCategory } from '@/types/static-data'

// Re-export types for backwards compatibility
export type { City, Category } from '@/lib/static-data-types'

// Legacy query keys (kept for backwards compatibility but not used)
export const dataKeys = {
  cities: ['cities'] as const,
  citiesPopular: ['cities', 'popular'] as const,
  citiesByCountry: (country: string) => ['cities', 'country', country] as const,
  categories: ['categories'] as const,
  categoriesActive: ['categories', 'active'] as const,
  categoriesByParent: (parentId?: string) => ['categories', 'parent', parentId] as const,
}

// Main hooks - now use static data instead of TanStack Query
export function useCities() {
  const result = useStaticCities()
  
  return {
    ...result,
    // Map to old API for backwards compatibility
    isLoading: result.loading,
    data: result.cities,
    cities: result.cities,
    error: result.error,
    refetch: () => Promise.resolve(), // Static data doesn't need refetch
  }
}

export function usePopularCities() {
  const cities = useStaticCities()
  
  return {
    data: cities.cities.filter(city => city.is_special), // Popular cities are special cities
    isLoading: cities.loading,
    error: cities.error,
  }
}

export function useCategories() {
  const result = useStaticCategories()
  
  return {
    ...result,
    // Map to old API for backwards compatibility
    isLoading: result.loading,
    data: result.categories,
    categories: result.categories,
    error: result.error,
    refetch: () => Promise.resolve(), // Static data doesn't need refetch
    // Add the missing method for backwards compatibility
    getCategoriesByParent: (parentId?: string) => {
      if (parentId === undefined) {
        return result.categories
      }
      const parent = result.categories.find(cat => cat.id === parentId)
      return parent?.children || []
    },
    getAllSubcategories: () => {
      const allSubs: StaticCategory[] = []
      result.categories.forEach(category => {
        if (category.children) {
          allSubs.push(...category.children)
        }
      })
      return allSubs
    },
  }
}

// Combined hook for components that need both
export function useData() {
  const staticData = useStaticData()
  
  // Helper function to find city by key
  const getCityByKey = (key: string) => {
    return staticData.cities.find(city => city.key === key)
  }
  
  // Helper function to find category by key (searches recursively)
  const getCategoryByKey = (key: string): StaticCategory | undefined => {
    const findCategory = (categories: StaticCategory[]): StaticCategory | undefined => {
      for (const category of categories) {
        if (category.key === key) return category
        if (category.children) {
          const found = findCategory(category.children)
          if (found) return found
        }
      }
      return undefined
    }
    return findCategory(staticData.categories)
  }
  
  // Helper function to get cities by country
  const getCitiesByCountry = (country: string) => {
    return staticData.cities.filter(city => city.country === country)
  }
  
  // Helper function to get active cities
  const getActiveCities = () => {
    return staticData.cities.filter(city => city.is_active)
  }
  
  // Helper function to get special cities
  const getSpecialCities = () => {
    return staticData.cities.filter(city => city.is_special)
  }
  
  // Helper function to get main categories
  const getMainCategories = () => {
    return staticData.categories
  }
  
  // Helper function to get subcategories
  const getSubcategories = (parentId: string) => {
    const parent = staticData.categories.find(cat => cat.id === parentId)
    return parent?.children || []
  }
  
  // Helper function to get all subcategories (flattened)
  const getAllSubcategories = () => {
    const allSubs: StaticCategory[] = []
    staticData.categories.forEach(category => {
      if (category.children) {
        allSubs.push(...category.children)
      }
    })
    return allSubs
  }
  
  return {
    cities: staticData.cities,
    categories: staticData.categories,
    loading: staticData.loading,
    error: staticData.error,
    
    // City helpers
    getCityByKey,
    getCitiesByCountry,
    getActiveCities,
    getSpecialCities,
    
    // Category helpers
    getCategoryByKey,
    getCategoriesByParent: (parentId?: string) => {
      if (parentId === undefined) {
        return getMainCategories()
      }
      return getSubcategories(parentId)
    },
    getMainCategories,
    getSubcategories,
    getAllSubcategories,
    
    // Refresh functions
    refreshCities: staticData.refresh,
    refreshCategories: staticData.refresh,
  }
}
