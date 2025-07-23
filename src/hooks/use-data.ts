/**
 * Data hooks - Updated to use static JSON data instead of TanStack Query
 * This provides better performance for cities and categories reference data
 */

import { useStaticCities, useStaticCategories, useStaticData } from './use-static-data'

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
    data: result.data,
    cities: result.data,
    error: result.error,
    refetch: result.reload,
  }
}

export function usePopularCities() {
  const cities = useStaticCities()
  
  return {
    data: cities.getSpecialCities(), // Popular cities are special cities in our system
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
    data: result.data,
    categories: result.data,
    error: result.error,
    refetch: result.reload,
    // Add the missing method for backwards compatibility
    getCategoriesByParent: (parentId?: string) => {
      if (parentId === undefined) {
        return result.getMainCategories()
      }
      return result.getSubcategories(parentId)
    },
    getAllSubcategories: result.getAllSubcategories,
  }
}

// Combined hook for components that need both
export function useData() {
  const staticData = useStaticData()
  
  return {
    cities: staticData.cities,
    categories: staticData.categories,
    loading: staticData.loading,
    error: staticData.error,
    
    // City helpers
    getCityById: staticData.getCityById,
    getCityByKey: staticData.getCityByKey,
    getCitiesByCountry: staticData.getCitiesByCountry,
    getActiveCities: staticData.getActiveCities,
    getSpecialCities: staticData.getSpecialCities,
    
    // Category helpers
    getCategoryById: staticData.getCategoryById,
    getCategoryByKey: staticData.getCategoryByKey,
    getCategoriesByParent: (parentId?: string) => {
      if (parentId === undefined) {
        return staticData.getMainCategories()
      }
      return staticData.getSubcategories(parentId)
    },
    getMainCategories: staticData.getMainCategories,
    getSubcategories: staticData.getSubcategories,
    getAllSubcategories: staticData.getAllSubcategories,
    getPopularCategories: staticData.getPopularCategories,
    
    // Refresh functions
    refreshCities: staticData.reload,
    refreshCategories: staticData.reload,
  }
}
