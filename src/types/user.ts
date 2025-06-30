export type UserRole = 'admin' | 'employer' | 'employee'

export interface UserProfile {
  id: string
  email: string
  name: string
  role: UserRole
  created_at: string
  updated_at: string
  avatar_url?: string
  company_name?: string // For employers
  position?: string // For employees
  bio?: string
}

export interface AuthUser {
  id: string
  email: string
  name: string
  role: UserRole
  profile?: UserProfile
}
