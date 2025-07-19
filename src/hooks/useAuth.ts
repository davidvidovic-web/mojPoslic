'use client'

import { useSession } from 'next-auth/react'

type UserRole = 'admin' | 'client' | 'tasker' | 'company'

interface AuthUser {
  id: string
  name?: string | null
  email?: string | null
  phone?: string | null
  role: UserRole
  profileSetupCompleted?: boolean
}

export function useAuth() {
  const { data: session, status } = useSession()
  
  const user: AuthUser | null = session?.user ? {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    phone: session.user.phone,
    role: (session.user.role as UserRole) || 'client',
    profileSetupCompleted: session.user.profileSetupCompleted ?? false,
  } : null

  const loading = status === 'loading'

  const hasRole = (role: UserRole): boolean => {
    if (!user) return false
    return user.role === role
  }

  const isAdmin = user?.role === 'admin'
  const isClient = user?.role === 'client' || user?.role === 'company'
  const isTasker = user?.role === 'tasker'
  const isCompany = user?.role === 'company'

  return {
    user,
    loading,
    hasRole,
    isAdmin,
    isClient,
    isTasker,
    isCompany,
  }
}
