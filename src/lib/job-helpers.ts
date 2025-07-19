/**
 * Job Data Helpers
 * Utilities for enriching job data with static city and category information
 */

import { staticDataManager } from './static-data'
import type { City, Category } from './static-data-types'

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
    const data = await staticDataManager.loadData()
    
    const city = job.cityId ? data.cities.find(c => c.id === job.cityId) : null
    const category = job.categoryId ? staticDataManager.getCategoryById(job.categoryId) : null
    
    return {
      ...job,
      city: city ? {
        id: city.id,
        key: city.key,
        name_bs: city.name_bs,
        name_en: city.name_en,
        name: city.name_en, // Default to English
        country: city.country,
        is_special: city.is_special
      } : null,
      category: category ? {
        id: category.id,
        key: category.key,
        name_bs: category.name_bs,
        name_en: category.name_en,
        name: category.name_en, // Default to English
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
    const data = await staticDataManager.loadData()
    
    return jobs.map(job => {
      const city = job.cityId ? data.cities.find(c => c.id === job.cityId) : null
      const category = job.categoryId ? staticDataManager.getCategoryById(job.categoryId) : null
      
      return {
        ...job,
        city: city ? {
          id: city.id,
          key: city.key,
          name_bs: city.name_bs,
          name_en: city.name_en,
          name: city.name_en,
          country: city.country,
          is_special: city.is_special
        } : null,
        category: category ? {
          id: category.id,
          key: category.key,
          name_bs: category.name_bs,
          name_en: category.name_en,
          name: category.name_en,
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
    const data = await staticDataManager.loadData()
    return data.cities.some(city => city.id === cityId && city.is_active)
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
    const category = staticDataManager.getCategoryById(categoryId)
    return category ? category.is_active : false
  } catch (error) {
    console.error('Error validating category ID:', error)
    return false
  }
}

/**
 * Get city by ID from static data (synchronous if data is loaded)
 */
export function getCityById(cityId: string): City | undefined {
  return staticDataManager.getCityById(cityId)
}

/**
 * Get category by ID from static data (synchronous if data is loaded)
 */
export function getCategoryById(categoryId: string): Category | undefined {
  return staticDataManager.getCategoryById(categoryId)
}

/**
 * Get city by key from static data
 */
export function getCityByKey(cityKey: string): City | undefined {
  return staticDataManager.getCityByKey(cityKey)
}

/**
 * Get category by key from static data
 */
export function getCategoryByKey(categoryKey: string): Category | undefined {
  return staticDataManager.getCategoryByKey(categoryKey)
}

/**
 * Batch validate city and category IDs
 */
export async function validateJobReferences(cityId: string, categoryId: string): Promise<{
  validCity: boolean
  validCategory: boolean
  city?: City
  category?: Category
}> {
  try {
    const data = await staticDataManager.loadData()
    
    const city = data.cities.find(c => c.id === cityId && c.is_active)
    const category = staticDataManager.getCategoryById(categoryId)
    
    return {
      validCity: !!city,
      validCategory: !!(category && category.is_active),
      city,
      category: category && category.is_active ? category : undefined
    }
  } catch (error) {
    console.error('Error validating job references:', error)
    return {
      validCity: false,
      validCategory: false
    }
  }
}
