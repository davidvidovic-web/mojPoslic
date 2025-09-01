/**
 * User Types for Optimized Database Structure
 * These interfaces reflect embedded privacy settings and performance data
 */

export type UserRole = 'client' | 'tasker' | 'admin'

// Optimized User interface with embedded privacy settings and performance data (NEW)
export interface User {
  id: string
  email: string
  username?: string
  name: string
  role: UserRole
  email_verified: boolean
  profile_setup_completed: boolean
  avatar_url?: string
  company_name?: string
  position?: string
  bio?: string
  skills?: string[]
  experience?: string
  preferred_job_types?: string
  phone?: string
  website?: string
  location?: string
  connections: number
  connections_last_refresh: string
  
  // Embedded privacy settings (optimized - no separate table)
  privacy_profile_visibility: 'public' | 'private' | 'connections_only'
  privacy_show_email: boolean
  privacy_show_phone: boolean
  privacy_allow_messages: boolean
  privacy_show_reviews: boolean
  privacy_show_completed_jobs: boolean
  privacy_email_notifications: boolean
  
  // Performance and analytics data (cached)
  average_rating: number
  total_reviews: number
  jobs_posted_total: number
  jobs_posted_active: number
  jobs_completed_as_client: number
  jobs_completed_as_tasker: number
  applications_sent: number
  applications_received: number
  applications_accepted: number
  total_earned: number
  total_spent: number
  messages_sent: number
  profile_views: number
  last_active_at: string
  
  // Timestamps
  created_at: string
  updated_at: string
  preferred_language: string
}

// Legacy interfaces for backward compatibility (will be removed)
export interface UserProfile {
  id: string
  email: string
  name: string
  username?: string
  role: UserRole
  profileSetupCompleted?: boolean
  created_at: string
  updated_at: string
  avatar_url?: string
  position?: string // For taskers
  bio?: string
}

export interface AuthUser {
  id: string
  email: string
  name: string
  username?: string
  role: UserRole
  profileSetupCompleted?: boolean
  phone?: string
  avatarUrl?: string
  profile?: UserProfile
  createdAt?: Date
}

// Legacy privacy settings interface (deprecated - now embedded in User)
export interface UserPrivacySettings {
  id: string
  userId: string
  emailVisible: boolean
  phoneVisible: boolean
  profileVisible: boolean
  contactFormEnabled: boolean
  showReviews: boolean
  showCompletedJobs: boolean
  emailNotifications: boolean
}

// Optimized privacy settings update interface
export interface UpdatePrivacySettings {
  privacy_profile_visibility?: 'public' | 'private' | 'connections_only'
  privacy_show_email?: boolean
  privacy_show_phone?: boolean
  privacy_allow_messages?: boolean
  privacy_show_reviews?: boolean
  privacy_show_completed_jobs?: boolean
  privacy_email_notifications?: boolean
}

// User profile update interface
export interface UpdateUserProfile {
  name?: string
  username?: string
  bio?: string
  skills?: string[]
  experience?: string
  preferred_job_types?: string
  phone?: string
  website?: string
  location?: string
  company_name?: string
  position?: string
  preferred_language?: string
}

// User statistics interface for dashboard
export interface UserStats {
  jobs_posted_total: number
  jobs_posted_active: number
  jobs_completed_as_client: number
  jobs_completed_as_tasker: number
  applications_sent: number
  applications_received: number
  applications_accepted: number
  average_rating: number
  total_reviews: number
  total_earned: number
  total_spent: number
  profile_views: number
  connections: number
  last_active_at: string
}
