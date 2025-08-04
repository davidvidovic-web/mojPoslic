/**
 * Job Data Helpers
 * Utilities for enriching job data with static city and category information
 * Updated for optimized static data management
 */

import { loadStaticDataFromFiles } from './static-data-file-loader'
import type { StaticCity, StaticCategory } from '@/types/static-data'

// Types for job enrichment
export interface BaseJob {
  id: string
  title: string
  description?: string | null
  cityId: string | null
  categoryId: string | null
  [key: string]: unknown // Allow other job properties
}

export interface JobWithStaticData extends BaseJob {
  city?: {
    id: string
    key: string
    name_bs: string
    name_en: string
    name: string
    country: string
    is_special: boolean
  } | null
  category?: {
    id: string
    key: string
    name_bs: string
    name_en: string
    name: string
    is_popular: boolean
    parent_id?: string | null
  } | null
}

/**
 * Enrich a single job with static city and category data
 */
export async function enrichJobWithStaticData(job: BaseJob): Promise<JobWithStaticData> {
  try {
    const data = await loadStaticDataFromFiles()
    
    // Find city - check both by key (new format) and by id (legacy format)
    let city = null
    if (job.cityId) {
      // First try to find by key (new format)
      city = data.cities.find(c => c.key === job.cityId)
      // If not found, try by id (legacy format)
      if (!city) {
        city = data.cities.find(c => c.id === job.cityId)
      }
    }
    
    // Find category - check both by key (new format) and by id (legacy format)
    let category = null
    if (job.categoryId) {
      // First try to find by key (new format)
      category = data.categories.find(c => c.key === job.categoryId)
      // If not found, try by id (legacy format)
      if (!category) {
        category = data.categories.find(c => c.id === job.categoryId)
      }
      // If still not found, search in subcategories
      if (!category) {
        for (const cat of data.categories) {
          if (cat.subcategories) {
            const subcat = cat.subcategories.find((sub: StaticCategory) => 
              sub.key === job.categoryId || sub.id === job.categoryId
            )
            if (subcat) {
              category = subcat
              break
            }
          }
        }
      }
    }
    
    return {
      ...job,
      city: city ? {
        id: city.id,
        key: city.key,
        name_bs: city.name_bs,
        name_en: city.name_en,
        name: city.name_bs, // Default to Bosnian for compatibility
        country: city.country,
        is_special: city.is_special
      } : null,
      category: category ? {
        id: category.id,
        key: category.key,
        name_bs: category.name_bs,
        name_en: category.name_en,
        name: category.name_bs, // Default to Bosnian for compatibility
        is_popular: category.is_popular,
        parent_id: category.parent_id
      } : null
    }
  } catch (error) {
    console.error('Error enriching job with static data:', error)
    // Return job as-is if enrichment fails
    return { ...job, city: null, category: null }
  }
}

/**
 * Enrich multiple jobs with static data
 */
export async function enrichJobsWithStaticData(jobs: BaseJob[]): Promise<JobWithStaticData[]> {
  if (!Array.isArray(jobs) || jobs.length === 0) {
    return []
  }

  try {
    // Load static data once for all jobs
    const data = await loadStaticDataFromFiles()
    
    return jobs.map((job) => {
      let city = null
      let category = null
      
      // Find city - check both by key (new format) and by id (legacy format)
      if (job.cityId) {
        // First try to find by key (new format)
        city = data.cities.find(c => c.key === job.cityId)
        // If not found, try by id (legacy format)
        if (!city) {
          city = data.cities.find(c => c.id === job.cityId)
        }
      }
      
      // Find category - check both by key (new format) and by id (legacy format)  
      if (job.categoryId) {
        // First try to find by key (new format)
        category = data.categories.find(c => c.key === job.categoryId)
        // If not found, try by id (legacy format)
        if (!category) {
          category = data.categories.find(c => c.id === job.categoryId)
        }
        // If still not found, search in subcategories
        if (!category) {
          for (const cat of data.categories) {
            if (cat.subcategories) {
              const subcat = cat.subcategories.find((sub: StaticCategory) => 
                sub.key === job.categoryId || sub.id === job.categoryId
              )
              if (subcat) {
                category = subcat
                break
              }
            }
          }
        }
      }
      
      return {
        ...job,
        // Add cached city fields for direct access
        city_name_bs: city?.name_bs || null,
        city_name_en: city?.name_en || null,
        city_name: city?.name_bs || null, // Default to Bosnian
        // Add cached category fields for direct access  
        category_name_bs: category?.name_bs || null,
        category_name_en: category?.name_en || null,
        category_name: category?.name_bs || null, // Default to Bosnian
        city: city ? {
          id: city.id,
          key: city.key,
          name_bs: city.name_bs,
          name_en: city.name_en,
          name: city.name_bs, // Default to Bosnian for compatibility
          country: city.country,
          is_special: city.is_special
        } : null,
        category: category ? {
          id: category.id,
          key: category.key,
          name_bs: category.name_bs,
          name_en: category.name_en,
          name: category.name_bs, // Default to Bosnian for compatibility
          is_popular: category.is_popular,
          parent_id: category.parent_id
        } : null
      }
    })
  } catch (error) {
    console.error('Error enriching jobs with static data:', error)
    // Return jobs as-is if enrichment fails
    return jobs.map(job => ({ ...job, city: null, category: null }))
  }
}

/**
 * Validate if a city ID exists in static data
 */
export async function validateCityId(cityId: string): Promise<boolean> {
  try {
    const data = await loadStaticDataFromFiles()
    return data.cities.some((city: StaticCity) => city.id === cityId && city.is_active !== false)
  } catch (error) {
    console.error('Error validating city ID:', error)
    return false
  }
}

/**
 * Validate if a category ID exists in static data
 */
export async function validateCategoryId(categoryId: string): Promise<boolean> {
  try {
    const data = await loadStaticDataFromFiles()
    const category = data.categories.find((c: StaticCategory) => c.id === categoryId)
    return category ? category.is_active !== false : false
  } catch (error) {
    console.error('Error validating category ID:', error)
    return false
  }
}

/**
 * Get city by ID from static data (async)
 */
export async function getCityById(cityId: string): Promise<StaticCity | undefined> {
  try {
    const data = await loadStaticDataFromFiles()
    return data.cities.find((c: StaticCity) => c.id === cityId)
  } catch (error) {
    console.error('Error getting city by ID:', error)
    return undefined
  }
}

/**
 * Get category by ID from static data (async)
 */
export async function getCategoryById(categoryId: string): Promise<StaticCategory | undefined> {
  try {
    const data = await loadStaticDataFromFiles()
    return data.categories.find((c: StaticCategory) => c.id === categoryId)
  } catch (error) {
    console.error('Error getting category by ID:', error)
    return undefined
  }
}

/**
 * Batch validate city and category IDs
 */
export async function validateJobReferences(cityId: string, categoryId: string): Promise<{
  validCity: boolean
  validCategory: boolean
  city?: StaticCity
  category?: StaticCategory
}> {
  try {
    const data = await loadStaticDataFromFiles()
    
    const city = data.cities.find((c: StaticCity) => c.id === cityId && c.is_active !== false)
    const category = data.categories.find((c: StaticCategory) => c.id === categoryId && c.is_active !== false)
    
    return {
      validCity: !!city,
      validCategory: !!category,
      city,
      category
    }
  } catch (error) {
    console.error('Error validating job references:', error)
    return {
      validCity: false,
      validCategory: false
    }
  }
}
