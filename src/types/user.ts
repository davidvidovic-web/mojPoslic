import { UserRole as PrismaUserRole } from '@prisma/client'

export type UserRole = PrismaUserRole

export interface UserProfile {
  id: string
  email: string
  name: string
  role: UserRole
  created_at: string
  updated_at: string
  avatar_url?: string
  company_name?: string // For employers and companies
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
