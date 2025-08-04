/**
 * Job Types for Key-Based Data Structure
 * These interfaces reflect the new key-based approach for cities and categories
 */

// City interface with key-based identification
export interface City {
  id: string        // Legacy numeric ID (for form compatibility)
  key: string       // Primary identifier: "banja-luka", "sarajevo", etc.
  name_bs: string
  name_en: string
  name: string // For convenience, will map to name_en
  state?: string
  country: string
  is_special?: boolean
  sort_order?: number
  is_active?: boolean
}

// Category interface with key-based identification  
export interface Category {
  id: string        // Legacy numeric ID (for form compatibility)
  key: string       // Primary identifier: "majstorski-radovi", "popravke-u-kuci", etc.
  name_bs: string
  name_en: string
  name: string // For convenience, will map to name_en
  parent_id?: string // For hierarchy support (legacy ID)
  parentId?: string // Alternative naming
  is_popular?: boolean
  sort_order?: number
  is_active?: boolean
  children?: Category[] // For nested categories
}

// Job interface with key-based references
export interface Job {
  id: string
  title: string
  description: string
  posted_by_id: string
  
  // Key-based references (instead of UUIDs)
  city_id: string       // City key: "banja-luka", "sarajevo", etc.
  category_id: string   // Category key: "majstorski-radovi", "popravke-u-kuci", etc.
  subcategory_id?: string
  
  // Cached city data (embedded for performance)
  city_name: string
  city_name_bs: string
  city_name_en: string
  
  // Cached category data (embedded for performance)  
  category_name: string
  category_name_bs: string
  category_name_en: string
  
  // Cached poster data (embedded for performance)
  poster_name: string
  poster_email: string
  poster_phone?: string
  poster_avatar_url?: string
  poster_rating: number
  
  // Job details
  job_type: 'quick_job' | 'full_time' | 'part_time' | 'remote'
  salary_type?: 'fixed' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'negotiable'
  salary_amount?: number
  salary_min?: number
  salary_max?: number
  currency: string
  is_salary_negotiable: boolean
  
  // Location details
  exact_location?: string
  latitude?: number
  longitude?: number
  
  // Job status and features
  is_active: boolean
  is_urgent: boolean
  is_featured: boolean
  status: 'active' | 'inactive' | 'completed' | 'expired'
  
  // Additional details
  duration_days?: number
  requirements?: string
  benefits?: string
  contact_info?: string // JSON string
  application_url?: string
  application_deadline?: string
  
  // Performance tracking (cached counters)
  view_count: number
  application_count: number
  last_viewed_at?: string
  last_application_at?: string
  
  // Timestamps
  created_at: string
  updated_at: string
  
  // Legacy fields for backward compatibility (deprecated)
  type?: 'quick_job' | 'full_time' | 'part_time' | 'remote' // Use job_type instead, but mapped for component compatibility
  company?: string // Use poster_name instead
  city?: City // Use cached city_name_* instead
  category?: Category // Use cached category_name_* instead
  email?: string // Use poster_email instead
  website?: string // Use application_url instead
  salary?: string // Use salary_* fields instead
  salaryType?: string // Use salary_type instead
  salaryMin?: number // Use salary_min instead
  salaryMax?: number // Use salary_max instead
  tags?: string[] // Deprecated in favor of categories
  start_date?: string // Use duration_days instead
  start_time?: string // What time the job should start (e.g., "09:00", "14:30")
  duration?: string // How long the job will take (e.g., "1_day", "3_days", "1_week", "1_month")
  transportation?: 'provided' | 'not_provided' | 'compensated' // Transportation arrangement
  transportation_amount?: number // Amount if client compensates for transportation
  has_parking?: boolean // Whether parking is available
  public_transport_info?: string // Public transport accessibility information
  expires_at?: string // When the job posting expires
  job_address?: string // Full address of the job location
  job_latitude?: number // Latitude coordinate
  job_longitude?: number // Longitude coordinate
  posted_by?: string // Foreign key to auth.users
  // Job poster information
  postedBy?: {
    id: string
    name: string | null
    email: string | null
    phone: string | null
    role: string
  }
  createdAt: string
  updatedAt?: string
  posted_at?: string // Alias for createdAt for compatibility
  contact_email?: string
  
  // Security-related fields for selective data exposure
  isSelectedTasker?: boolean // Whether current user is the selected tasker
  hasAssignment?: boolean // Whether job has been assigned to someone
}

// Create job data interface for form submission
export interface CreateJobData {
  title: string
  city_id: string
  category_id?: string
  job_type: 'quick_job' | 'full_time' | 'part_time' | 'remote'
  description: string
  requirements?: string
  benefits?: string
  salary_type?: 'fixed' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'negotiable'
  salary_amount?: number
  salary_min?: number
  salary_max?: number
  currency?: string
  is_salary_negotiable?: boolean
  application_url?: string
  exact_location?: string
  latitude?: number
  longitude?: number
  duration_days?: number
  is_urgent?: boolean
  is_featured?: boolean
  application_deadline?: string
  
  // Legacy fields (deprecated)
  type?: 'quick_job' | 'full_time' | 'part_time' | 'remote'
  salary?: string // Legacy text field
  salaryType?: 'fixed' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'negotiable'
  salaryMin?: number
  salaryMax?: number
  website?: string
  email?: string
  start_date?: string
  start_time?: string
  duration?: string
  transportation?: 'provided' | 'not_provided' | 'compensated'
  transportation_amount?: number
  has_parking?: boolean
  public_transport_info?: string
  job_address?: string
  job_latitude?: number
  job_longitude?: number
  contact_email?: string
  performance_bonus?: boolean
  tags?: string[] // Keep for backward compatibility but deprecated
}

// Job filtering interface for TanStack Query
export interface JobFilters {
  search?: string
  city?: string
  category?: string
  subcategory?: string
  job_type?: 'quick_job' | 'full_time' | 'part_time' | 'remote' | 'all'
  type?: 'quick_job' | 'full_time' | 'part_time' | 'remote' | 'all' // Legacy naming
  salaryMin?: number
  salaryMax?: number
  is_active?: boolean
  is_featured?: boolean
  featured?: boolean // Alternative naming for is_featured
  posted_by_id?: string // Filter by user who posted the job
  postedBy?: string // Legacy naming
  
  // Pagination properties
  page?: number
  limit?: number
  
  // Sorting properties  
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}
