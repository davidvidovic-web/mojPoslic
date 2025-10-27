/**
 * Application Types for Optimized Database Structure
 * These interfaces reflect cached job and applicant data for better performance
 */

export enum ApplicationStatus {
  PENDING = 'PENDING',
  REVIEWED = 'REVIEWED',
  SHORTLISTED = 'SHORTLISTED',
  SELECTED = 'SELECTED',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN'
}

export enum ContractStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
  WORK_COMPLETED = 'WORK_COMPLETED',
  CONFIRMED_COMPLETED = 'CONFIRMED_COMPLETED',
  COMPLETED = 'COMPLETED'
}

// Optimized Application interface with cached data (NEW)
export interface Application {
  id: string
  job_id: string
  user_id: string
  status: ApplicationStatus
  cover_letter?: string
  hourly_rate?: number
  applied_at: string
  reviewed_at?: string
  
  // Cached job data (embedded for performance)
  job_title: string
  job_type: 'quick_job' | 'full_time' | 'part_time' | 'remote'
  job_city_name: string
  job_category_name: string
  job_poster_name: string
  job_salary_min?: number
  job_salary_max?: number
  job_status: string
  
  // Cached applicant data (embedded for performance)
  applicant_name: string
  applicant_email: string
  applicant_phone?: string
  applicant_avatar_url?: string
  applicant_rating: number
  applicant_location?: string
  
  // Performance tracking
  response_time_hours?: number
  last_status_change_at: string
  
  // Timestamps
  created_at: string
  updated_at: string
}

export interface JobAssignment {
  id: string
  job_id: string
  selected_application_id: string
  contract_status: ContractStatus
  assigned_at: string
  start_date?: string
  agreed_salary?: number
  notes?: string
  created_at: string
  updated_at: string
  
  // Relations (will include cached data)
  job?: {
    id: string
    title: string
    poster_name: string
  }
  selected_application?: Application
}

// Legacy interface for backward compatibility (will be removed)
export interface JobApplication {
  id: string
  jobId: string
  userId: string
  status: ApplicationStatus
  message?: string // Cover letter/application message
  resume?: string // Resume URL/file path
  clientNotes?: string // Private client notes
  feedback?: string // Client feedback to applicant
  appliedAt: Date
  reviewedAt?: Date
  shortlistedAt?: Date
  selectedAt?: Date
  rejectedAt?: Date
  withdrawnAt?: Date
  createdAt: Date
  updatedAt: Date
  
  // Relations
  job?: {
    id: string
    title: string
    company: string
    type: string
    city?: {
      id: string
      nameEN: string
      nameBS: string
    }
    category?: {
      id: string
      nameEN: string
      nameBS: string
    }
    salary?: string
    salaryMin?: number
    salaryMax?: number
  }
  
  user?: {
    id: string
    name: string
    email: string
    avatarUrl?: string
    bio?: string
    skills?: string | string[] // Can be array (from DB) or string (legacy)
    experience?: string
    location?: string
    averageRating?: number
    totalReviews?: number
  }
}

export interface CreateApplicationRequest {
  message?: string
  resume?: File | string
}

export interface UpdateApplicationRequest {
  status?: ApplicationStatus
  clientNotes?: string
  feedback?: string
}

export interface ApplicationFilters {
  status?: ApplicationStatus[]
  jobId?: string
  userId?: string
  dateFrom?: Date
  dateTo?: Date
  search?: string
}

export interface ApplicationStats {
  total: number
  pending: number
  reviewed: number
  shortlisted: number
  selected: number
  rejected: number
  withdrawn: number
}

// Application action types for bulk operations
export interface BulkApplicationAction {
  applicationIds: string[]
  action: 'review' | 'shortlist' | 'reject' | 'message'
  data?: {
    status?: ApplicationStatus
    feedback?: string
    clientNotes?: string
    messageTemplate?: string
  }
}

// Application timeline entry
export interface ApplicationTimelineEntry {
  id: string
  type: 'status_change' | 'note_added' | 'message_sent' | 'review_submitted'
  title: string
  description?: string
  timestamp: Date
  actor?: {
    id: string
    name: string
    role: string
  }
  metadata?: Record<string, unknown>
}
