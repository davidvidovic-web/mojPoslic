import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { queryKeys } from '@/lib/query-keys'
import type { City } from '@/types/database'

/**
 * Hook to fetch all active cities
 * This replaces the static data manager for cities
 */
export function useCitiesQuery() {
  return useQuery({
    queryKey: queryKeys.cities.active(),
    queryFn: async (): Promise<City[]> => {
      
      const { data, error } = await supabase
        .from('cities')
        .select('*')
        .eq('is_active', true)
        .order('name')
      
      if (error) {
        throw new Error(`Failed to fetch cities: ${error.message}`)
      }
      
      return data || []
    },
    staleTime: 24 * 60 * 60 * 1000, // 24 hours - cities rarely change
    gcTime: 7 * 24 * 60 * 60 * 1000, // 7 days
    refetchOnWindowFocus: false,
  })
}

/**
 * Hook to fetch all active categories
 * This replaces the static data manager for categories
 */
export function useCategoriesQuery() {
  return useQuery({
    queryKey: queryKeys.categories.active(),
    queryFn: async () => {
      
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('name')
      
      if (error) {
        throw new Error(`Failed to fetch categories: ${error.message}`)
      }
      
      return data || []
    },
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    gcTime: 7 * 24 * 60 * 60 * 1000, // 7 days
    refetchOnWindowFocus: false,
  })
}

/**
 * Hook to fetch popular categories
 */
export function usePopularCategoriesQuery() {
  return useQuery({
    queryKey: queryKeys.categories.popular(),
    queryFn: async () => {
      
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_popular', true)
        .order('sort_order', { ascending: true })
        .order('name')
      
      if (error) {
        throw new Error(`Failed to fetch popular categories: ${error.message}`)
      }
      
      return data || []
    },
    staleTime: 1 * 60 * 60 * 1000, // 1 hour
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
    refetchOnWindowFocus: false,
  })
}
