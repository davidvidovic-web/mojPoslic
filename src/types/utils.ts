/**
 * Utility functions for working with optimized database structure
 * These helpers provide backward compatibility and easy access to cached data
 */

import { Job } from './job'
import { User } from './user'
import { StaticCity, StaticCategory } from './static-data'

/**
 * Get localized city name from cached job data
 */
export function getJobCityName(job: Job, locale: 'bs' | 'en' = 'en'): string {
  // Use cached data if available (optimized)
  if (job.city_name_bs && job.city_name_en) {
    return locale === 'bs' ? job.city_name_bs : job.city_name_en
  }
  
  // Fallback to joined data (legacy)
  if (job.city) {
    return locale === 'bs' ? job.city.name_bs : job.city.name_en
  }
  
  return 'Unknown City'
}

/**
 * Get localized category name from cached job data
 */
export function getJobCategoryName(job: Job, locale: 'bs' | 'en' = 'en'): string {
  // Use cached data if available (optimized)
  if (job.category_name_bs && job.category_name_en) {
    return locale === 'bs' ? job.category_name_bs : job.category_name_en
  }
  
  // Fallback to joined data (legacy)
  if (job.category) {
    return locale === 'bs' ? job.category.name_bs : job.category.name_en
  }
  
  return 'Unknown Category'
}

/**
 * Get job poster contact information from cached data
 */
export function getJobPosterInfo(job: Job) {
  // Use cached data if available (optimized)
  if (job.poster_name && job.poster_email) {
    return {
      name: job.poster_name,
      email: job.poster_email,
      phone: job.poster_phone,
      avatar_url: job.poster_avatar_url,
      rating: job.poster_rating
    }
  }
  
  // Fallback to legacy fields
  return {
    name: job.company || job.postedBy?.name || 'Unknown',
    email: job.email || job.postedBy?.email || '',
    phone: job.postedBy?.phone,
    avatar_url: undefined,
    rating: 0
  }
}

/**
 * Get user privacy settings from embedded data
 */
export function getUserPrivacySettings(user: User) {
  return {
    profileVisibility: user.privacy_profile_visibility || 'public',
    showEmail: user.privacy_show_email || false,
    showPhone: user.privacy_show_phone || false,
    allowMessages: user.privacy_allow_messages !== false, // Default true
    showReviews: user.privacy_show_reviews !== false, // Default true
    showCompletedJobs: user.privacy_show_completed_jobs !== false, // Default true
    emailNotifications: user.privacy_email_notifications !== false // Default true
  }
}

/**
 * Format salary information for display
 */
export function formatJobSalary(job: Job, locale: 'bs' | 'en' = 'en'): string {
  const currency = job.currency || 'BAM'
  
  // Use new salary structure if available
  if (job.salary_type && (job.salary_min || job.salary_max || job.salary_amount)) {
    if (job.salary_amount) {
      return `${job.salary_amount} ${currency} (${job.salary_type})`
    }
    
    if (job.salary_min && job.salary_max) {
      return `${job.salary_min} - ${job.salary_max} ${currency} (${job.salary_type})`
    }
    
    if (job.salary_min) {
      return `${locale === 'bs' ? 'Od' : 'From'} ${job.salary_min} ${currency} (${job.salary_type})`
    }
    
    if (job.salary_max) {
      return `${locale === 'bs' ? 'Do' : 'Up to'} ${job.salary_max} ${currency} (${job.salary_type})`
    }
  }
  
  // Fallback to legacy salary field
  if (job.salary) {
    return job.salary
  }
  
  // Check for legacy salaryMin/salaryMax
  if (job.salaryMin && job.salaryMax) {
    return `${job.salaryMin} - ${job.salaryMax} ${currency}`
  }
  
  if (job.is_salary_negotiable) {
    return locale === 'bs' ? 'Po dogovoru' : 'Negotiable'
  }
  
  return locale === 'bs' ? 'Plata nije navedena' : 'Salary not specified'
}

/**
 * Get job type display name
 */
export function getJobTypeDisplayName(jobType: string, locale: 'bs' | 'en' = 'en'): string {
  const jobTypes = {
    quick_job: {
      bs: 'Brzi posao',
      en: 'Quick Job'
    },
    full_time: {
      bs: 'Puno radno vrijeme',
      en: 'Full Time'
    },
    part_time: {
      bs: 'Skraćeno radno vrijeme',
      en: 'Part Time'
    },
    remote: {
      bs: 'Rad od kuće',
      en: 'Remote'
    }
  }
  
  return jobTypes[jobType as keyof typeof jobTypes]?.[locale] || jobType
}

/**
 * Check if user can view private information based on privacy settings
 */
export function canViewPrivateInfo(user: User, field: 'email' | 'phone' | 'profile', viewerRole?: string): boolean {
  if (viewerRole === 'admin') return true
  
  switch (field) {
    case 'email':
      return user.privacy_show_email
    case 'phone':
      return user.privacy_show_phone
    case 'profile':
      return user.privacy_profile_visibility === 'public'
    default:
      return false
  }
}

/**
 * Get performance metrics display for jobs
 */
export function getJobPerformanceMetrics(job: Job, locale: 'bs' | 'en' = 'en') {
  return {
    views: {
      count: job.view_count || 0,
      label: locale === 'bs' ? 'pregleda' : 'views'
    },
    applications: {
      count: job.application_count || 0,
      label: locale === 'bs' ? 'prijava' : 'applications'
    },
    lastActivity: job.last_viewed_at || job.last_application_at || job.updated_at
  }
}

/**
 * Convert legacy job data to optimized structure (for migration)
 */
export function convertLegacyJobToOptimized(job: Record<string, unknown>, cityData?: StaticCity, categoryData?: StaticCategory): Partial<Job> {
  return {
    ...job,
    // Map legacy fields to new structure
    job_type: (job.type || job.job_type) as Job['job_type'],
    salary_type: (job.salaryType || job.salary_type) as Job['salary_type'],
    salary_min: (job.salaryMin || job.salary_min) as number,
    salary_max: (job.salaryMax || job.salary_max) as number,
    poster_name: (job.company || job.poster_name) as string,
    poster_email: (job.email || job.poster_email) as string,
    application_url: (job.website || job.application_url) as string,
    is_featured: (job.is_featured || false) as boolean,
    is_urgent: (job.is_urgent || false) as boolean,
    is_active: (job.is_active !== false) as boolean,
    view_count: (job.view_count || 0) as number,
    application_count: (job.application_count || 0) as number,
    
    // Add cached city data
    city_name: cityData?.name || 'Unknown',
    city_name_bs: cityData?.name_bs || 'Unknown',
    city_name_en: cityData?.name_en || 'Unknown',
    
    // Add cached category data
    category_name: categoryData?.name || 'Unknown',
    category_name_bs: categoryData?.name_bs || 'Unknown',
    category_name_en: categoryData?.name_en || 'Unknown'
  } as Partial<Job>
}
