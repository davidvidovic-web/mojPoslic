'use client'

import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

type UserRole = 'admin' | 'client' | 'tasker' | 'company'

interface AuthUser {
  id: string
  name?: string | null
  email?: string | null
  username?: string | null
  bio?: string | null
  position?: string | null
  role: UserRole
  profileSetupCompleted?: boolean
  createdAt?: Date
}

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  hasRole: (role: UserRole) => boolean
  isAdmin: boolean
  isClient: boolean
  isTasker: boolean
  isCompany: boolean
  refreshUser: () => Promise<void>
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
  refreshUser: async () => {},
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
  const [dbUser, setDbUser] = useState<Partial<AuthUser> | null>(null)
  const [loading, setLoading] = useState(false)
  
  // Fetch fresh user data from database
  const fetchUserData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/user/me`)
      if (response.ok) {
        const userData = await response.json()
        setDbUser({
          profileSetupCompleted: userData.profileSetupCompleted,
          role: userData.role, // In case role was updated
        })
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch user data when session changes
  useEffect(() => {
    if (session?.user?.id) {
      fetchUserData()
    } else {
      setDbUser(null)
    }
  }, [session?.user?.id])

  // Refresh user data manually
  const refreshUser = async () => {
    if (session?.user?.id) {
      await fetchUserData()
    }
  }
  
  // Convert Auth.js session to our app's user format, with database fallback
  const user: AuthUser | null = session?.user ? {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    username: null,
    role: (dbUser?.role as UserRole) || (session.user.role as UserRole) || 'client',
    profileSetupCompleted: dbUser?.profileSetupCompleted ?? session.user.profileSetupCompleted ?? false,
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
    loading: status === 'loading' || loading,
    hasRole,
    isAdmin,
    isClient,
    isTasker,
    isCompany,
    refreshUser,
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <AuthContextProvider>
      {children}
    </AuthContextProvider>
  )
}
