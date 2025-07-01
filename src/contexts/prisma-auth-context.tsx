'use client'

import { createContext, useContext } from 'react'
import { SessionProvider, useSession } from 'next-auth/react'
import { UserRole } from '@prisma/client'

interface AuthContextType {
  user: {
    id: string
    name?: string | null
    email?: string | null
    username?: string | null
    role: UserRole
    profileSetupCompleted?: boolean
  } | null
  loading: boolean
  hasRole: (role: UserRole) => boolean
  isAdmin: boolean
  isClient: boolean
  isTasker: boolean
  isCompany: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
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

function AuthContextProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const loading = status === 'loading'
  
  const user = session?.user || null
  
  const hasRole = (role: UserRole): boolean => {
    return checkRole(role.toString(), user?.role)
  }
  
  // Using safe role checking function to avoid type issues
  const checkRole = (expectedRole: string, userRole?: string | null): boolean => {
    if (!userRole) return false
    
    // Handle both old and new role names during transition
    if (expectedRole === 'client') {
      return userRole === 'client' || userRole === 'employer'
    }
    if (expectedRole === 'tasker') {
      return userRole === 'tasker' || userRole === 'employee'
    }
    
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthContextProvider>
        {children}
      </AuthContextProvider>
    </SessionProvider>
  )
}
