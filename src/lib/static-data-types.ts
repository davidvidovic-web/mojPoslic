/**
 * TypeScript types for static data (cities, categories)
 * Used for the database-to-JSON migration
 */

export interface City {
  id: string
  key: string
  name_bs: string
  name_en: string
  name: string // convenience field - defaults to name_en
  country: string
  state: string
  is_special: boolean
  sort_order: number
  is_active: boolean
}

export interface Category {
  id: string
  key: string
  name_bs: string
  name_en: string
  name: string // convenience field - defaults to name_en
  description?: string | null
  icon?: string | null
  color?: string | null
  parent_id?: string | null
  sort_order: number
  is_active: boolean
  is_popular: boolean
  children?: Category[]
}

export interface StaticDataCache {
  cities: City[]
  categories: Category[]
  lastUpdated: string
  version: string
}

export interface CacheMetadata {
  lastUpdated: string
  version: string
  citiesCount: number
  categoriesCount: number
  parentCategories: number
  subcategories: number
}

// Response types from cache files
export interface CitiesResponse {
  cities: City[]
  lastUpdated?: string
  version?: string
  totalCount?: number
}

export interface CategoriesResponse {
  categories: Category[]
  lastUpdated?: string
  version?: string
  totalCount?: number
  parentCategories?: number
  subcategories?: number
}
