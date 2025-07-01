import { UserRole as PrismaUserRole } from '@prisma/client'

export type UserRole = PrismaUserRole

export interface UserProfile {
  id: string
  email: string
  name: string
  username?: string
  role: UserRole
  created_at: string
  updated_at: string
  avatar_url?: string
  position?: string // For employees
  bio?: string
}

export interface AuthUser {
  id: string
  email: string
  name: string
  username?: string
  role: UserRole
  profile?: UserProfile
}
