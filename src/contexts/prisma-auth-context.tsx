'use client'

import { createContext, useContext } from 'react'
import { SessionProvider, useSession } from 'next-auth/react'

type UserRole = 'admin' | 'employer' | 'employee'

interface AuthContextType {
  user: {
    id: string
    name?: string | null
    email?: string | null
    role: UserRole
  } | null
  loading: boolean
  hasRole: (role: UserRole) => boolean
  isAdmin: boolean
  isEmployer: boolean
  isEmployee: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  hasRole: () => false,
  isAdmin: false,
  isEmployer: false,
  isEmployee: false,
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
  
  const isAdmin = user?.role === 'admin'
  const isEmployer = user?.role === 'employer'
  const isEmployee = user?.role === 'employee'

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      hasRole,
      isAdmin,
      isEmployer,
      isEmployee
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
