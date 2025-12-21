/**
 * Static Data Types for Optimized Database Structure
 * These interfaces define the structure for static data loaded from JSON files
 * instead of database queries for improved performance.
 */

export interface StaticCity {
  id: string
  key: string
  name: string
  name_bs: string
  name_en: string
  country: string
  is_special: boolean
  sort_order?: number
  is_active?: boolean
}

export interface StaticCategory {
  id: string
  key: string
  name: string
  name_bs: string
  name_en: string
  is_popular: boolean
  parent_id?: string | null
  sort_order?: number
  is_active?: boolean
  children?: StaticCategory[]
  subcategories?: StaticCategory[]
}

export interface StaticDataCache {
  cities: StaticCity[]
  categories: StaticCategory[]
  lastUpdated: string
  version: string
}

/**
 * Helper interface for static data loading states
 */
export interface StaticDataState {
  cities: StaticCity[]
  categories: StaticCategory[]
  loading: boolean
  error: string | null
  lastFetch: Date | null
}

/**
 * Filter interfaces using static data
 */
export interface JobFilters {
  cityId?: string
  categoryId?: string
  jobType?: string
  salaryMin?: number
  salaryMax?: number
  isUrgent?: boolean
  isFeatured?: boolean
  search?: string
}

export interface FilterOptions {
  cities: StaticCity[]
  categories: StaticCategory[]
  jobTypes: Array<{ id: string; name: string; name_bs: string; name_en: string }>
  salaryRanges: Array<{ min: number; max: number; label: string; label_bs: string; label_en: string }>
}
