// City interface for joined data
export interface City {
  id: string
  key: string
  name_bs: string
  name_en: string
  name: string // For convenience, will map to name_en
  state?: string
  country: string
  is_special?: boolean
  sort_order?: number
  is_active?: boolean
}

// Category interface for joined data
export interface Category {
  id: string
  key: string
  name_bs: string
  name_en: string
  name: string // For convenience, will map to name_en
  parent_id?: string // For hierarchy support
  parentId?: string // Alternative naming
  is_popular?: boolean
  sort_order?: number
  is_active?: boolean
  children?: Category[] // For nested categories
}

// Job interface matching job_listings table structure
export interface Job {
  id: string
  title: string
  company: string
  city_id: string
  city?: City // Joined city data from cities table
  category_id?: string
  category?: Category // Joined category data from categories table
  type: 'quick_job' | 'full_time' | 'part_time' | 'remote'
  description: string
  salary?: string // Text field for flexible salary info (legacy)
  salaryType?: 'fixed' | 'hourly' | 'daily' | 'weekly' | 'monthly' // New salary type field
  salaryMin?: number // Minimum salary amount
  salaryMax?: number // Maximum salary amount
  email: string // Required contact email
  website?: string // Optional company website/application URL
  is_featured?: boolean
  is_active?: boolean
  tags?: string[] // JSONB array of tags (deprecated in favor of categories)
  start_date?: string // When the job/work should start
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
    role: string
  }
  created_at: string
  updated_at?: string
  posted_at: string // Alias for created_at for compatibility
  
  // Additional fields that might be in the database
  requirements?: string
  benefits?: string
  application_url?: string
  contact_email?: string
}

// Create job data interface for form submission
export interface CreateJobData {
  title: string
  company?: string
  city_id: string
  category_id?: string
  type: 'quick_job' | 'full_time' | 'part_time' | 'remote'
  description: string
  requirements?: string
  benefits?: string
  salary?: string // Legacy text field
  salaryType?: 'fixed' | 'hourly' | 'daily' | 'weekly' | 'monthly' // New salary type field
  salaryMin?: number // Minimum salary amount
  salaryMax?: number // Maximum salary amount
  website?: string
  email: string
  start_date?: string // When the job/work should start
  start_time?: string // What time the job should start (e.g., "09:00", "14:30")
  duration?: string // How long the job will take (e.g., "1_day", "3_days", "1_week", "1_month")
  transportation?: 'provided' | 'not_provided' | 'compensated' // Transportation arrangement
  transportation_amount?: number // Amount if client compensates for transportation
  has_parking?: boolean // Whether parking is available
  public_transport_info?: string // Public transport accessibility information
  job_address?: string // Full address of the job location
  job_latitude?: number // Latitude coordinate
  job_longitude?: number // Longitude coordinate
  contact_email?: string
  application_url?: string
  tags?: string[] // Keep for backward compatibility but deprecated
}
