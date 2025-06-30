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
  } | null
  loading: boolean
  hasRole: (role: UserRole) => boolean
  isAdmin: boolean
  isEmployer: boolean
  isEmployee: boolean
  isCompany: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  hasRole: () => false,
  isAdmin: false,
  isEmployer: false,
  isEmployee: false,
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
    return user?.role === role
  }
  
  const isAdmin = user?.role === UserRole.admin
  const isEmployer = user?.role === UserRole.employer || user?.role === UserRole.company
  const isEmployee = user?.role === UserRole.employee
  const isCompany = user?.role === UserRole.company

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      hasRole,
      isAdmin,
      isEmployer,
      isEmployee,
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
