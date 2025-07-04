'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
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
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  hasRole: (role: UserRole) => boolean
  isAdmin: boolean
  isClient: boolean
  isTasker: boolean
  isCompany: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => false,
  logout: () => {},
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing session on mount
    checkSession()
  }, [])

  const checkSession = async () => {
    try {
      const response = await fetch('/api/auth/session', {
        credentials: 'include'
      })
      if (response.ok) {
        const userData = await response.json()
        setUser(userData.user)
      }
    } catch (error) {
      console.error('Session check failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        const userData = await response.json()
        setUser(userData.user)
        return true
      }
      return false
    } catch (error) {
      console.error('Login failed:', error)
      return false
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      setUser(null)
    }
  }

  const hasRole = (role: UserRole): boolean => {
    return checkRole(role.toString(), user?.role)
  }
  
  // Using safe role checking function to avoid type issues
  const checkRole = (expectedRole: string, userRole?: string | null): boolean => {
    if (!userRole) return false
    
    return userRole === expectedRole
  }
  
  const isAdmin = checkRole('admin', user?.role)
  const isClient = checkRole('client', user?.role) || checkRole('company', user?.role)
  const isTasker = checkRole('tasker', user?.role)
  const isCompany = checkRole('company', user?.role)

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      hasRole,
      isAdmin,
      isClient,
      isTasker,
      isCompany
    }}>
      {children}
    </AuthContext.Provider>
  )
}
