import { Database } from '@/types/supabase'

// Export database types for easier use
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]

export type Row<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type Insert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

export type Update<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']

export type Enums<T extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][T]

// Specific table types for common use
export type User = Row<'users'>
export type Job = Row<'job_listings'>
export type Application = Row<'applications'>
export type Conversation = Row<'conversations'>
export type Message = Row<'messages'>
export type Notification = Row<'notifications'>
export type City = Row<'cities'>
export type Category = Row<'categories'>
export type Review = Row<'reviews'>

// Insert types for creating new records
export type UserInsert = Insert<'users'>
export type JobInsert = Insert<'job_listings'>
export type ApplicationInsert = Insert<'applications'>
export type MessageInsert = Insert<'messages'>

// Update types for updating records
export type UserUpdate = Update<'users'>
export type JobUpdate = Update<'job_listings'>
export type ApplicationUpdate = Update<'applications'>

// Enum types
export type UserRole = Enums<'user_role'>
export type JobType = Enums<'job_type'>
export type JobStatus = Enums<'job_status'>
export type ApplicationStatus = Enums<'application_status'>
export type SalaryType = Enums<'salary_type'>
export type NotificationType = Enums<'notification_type'>

// Extended types with relationships
export type JobWithUser = Job & {
  posted_by: User
}

export type JobWithDetails = Job & {
  posted_by: User
  applications: { count: number }[]
  _count?: { job_views: number }[]
}

export type ApplicationWithJob = Application & {
  job_listing: Job
}

export type ApplicationWithUser = Application & {
  user: User
}

export type ApplicationWithDetails = Application & {
  job_listing: JobWithUser
  user: User
}

export type ConversationWithParticipants = Conversation & {
  participants: {
    user: User
  }[]
  messages: Message[]
}

export type MessageWithUser = Message & {
  sender: User
}

// Filter types
export interface JobFilters {
  search?: string
  city?: string
  category?: string
  subcategory?: string
  type?: JobType
  salaryMin?: number
  salaryMax?: number
  status?: JobStatus
  isUrgent?: boolean
  isFeatured?: boolean
  postedById?: string
  page?: number
  limit?: number
  sortBy?: 'created_at' | 'title' | 'salary_amount'
  sortOrder?: 'asc' | 'desc'
}

export interface UserFilters {
  search?: string
  role?: UserRole
  isActive?: boolean
  emailVerified?: boolean
  profileCompleted?: boolean
  city?: string
  page?: number
  limit?: number
}

export interface ApplicationFilters {
  status?: ApplicationStatus
  jobId?: string
  userId?: string
  dateFrom?: string
  dateTo?: string
  page?: number
  limit?: number
}

export interface NotificationFilters {
  userId: string
  type?: NotificationType
  isRead?: boolean
  page?: number
  limit?: number
}

// API Response types
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
}

export interface SupabaseResponse<T> {
  data: T | null
  error: string | null
  success: boolean
}

// Form types
export interface JobFormData {
  title: string
  description: string
  category_id: string
  subcategory_id?: string
  city_id: string
  exact_location?: string
  job_type: JobType
  salary_type?: SalaryType
  salary_amount?: number
  salary_min?: number
  salary_max?: number
  is_salary_negotiable: boolean
  duration_days?: number
  requirements?: string
  benefits?: string
  contact_info?: string
  application_deadline?: string
  is_urgent: boolean
  is_featured: boolean
}

export interface ApplicationFormData {
  job_id: string
  cover_letter?: string
  resume_url?: string
  contact_info?: string
  availability?: string
  hourly_rate?: number
  estimated_duration?: string
  questions_answers?: Record<string, string | number | boolean>
}

export interface UserProfileFormData {
  name: string
  username?: string
  bio?: string
  skills?: string[]
  experience?: string
  phone?: string
  website?: string
  location?: string
  company_name?: string
  position?: string
  preferred_job_types?: string
  avatar_url?: string
}
