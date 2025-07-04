'use client'

import React, { createContext, useContext, ReactNode } from 'react'
import { useSession } from 'next-auth/react'
import { UserRole } from '@prisma/client'

interface AuthUser {
  id: string
  name?: string | null
  email?: string | null
  username?: string | null
  role: UserRole
  profileSetupCompleted?: boolean
}

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  hasRole: (role: UserRole) => boolean
  isAdmin: boolean
  isClient: boolean
  isTasker: boolean
  isCompany: boolean
}

// Auth.js-powered auth context
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  hasRole: () => false,
  isAdmin: false,
  isClient: false,
  isTasker: false,
  isCompany: false,
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

function AuthContextProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession()
  
  // Convert Auth.js session to our app's user format
  const user: AuthUser | null = session?.user ? {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    username: null, // Can be added to session if needed
    role: session.user.role as UserRole,
    profileSetupCompleted: false, // This should be fetched from your database
  } : null

  const hasRole = (role: UserRole): boolean => {
    if (!user) return false
    return user.role === role
  }

  const isAdmin = user?.role === 'admin'
  const isClient = user?.role === 'client' || user?.role === 'company'
  const isTasker = user?.role === 'tasker'
  const isCompany = user?.role === 'company'

  const contextValue: AuthContextType = {
    user,
    loading: status === 'loading',
    hasRole,
    isAdmin,
    isClient,
    isTasker,
    isCompany,
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <AuthContextProvider children={children}>
      {children}
    </AuthContextProvider>
  )
}
