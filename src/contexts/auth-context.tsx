'use client'

import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react'
import { useSession, signOut as nextAuthSignOut } from 'next-auth/react'

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
  phone?: string | null
  location?: string | null
  website?: string | null
  skills?: string | null
  experience?: string | null
  preferredJobTypes?: string[] | null
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
  signOut: () => Promise<void>
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
  signOut: async () => {},
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
      const response = await fetch(`/api/user/profile`)
      
      if (response.ok) {
        const { user: userData } = await response.json()
        setDbUser({
          profileSetupCompleted: userData.profileSetupCompleted,
          role: userData.role,
          name: userData.name,
          bio: userData.bio,
          username: userData.username,
          phone: userData.phone,
          location: userData.location,
          website: userData.website,
          skills: userData.skills,
          experience: userData.experience,
          preferredJobTypes: userData.preferredJobTypes,
        })
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
      // If there's a JWT error, clear local state
      if (error instanceof Error && error.message.includes('JWT')) {
        setDbUser(null)
      }
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

  // Custom sign out function that clears local state
  const signOut = async () => {
    // Clear local state immediately
    setDbUser(null)
    
    // Sign out with NextAuth and force redirect
    await nextAuthSignOut({ 
      callbackUrl: "/", 
      redirect: true 
    })
    
    // Force page reload to clear any cached state
    window.location.href = "/"
  }
  
  // Convert Auth.js session to our app's user format, with database fallback
  const user: AuthUser | null = session?.user ? {
    id: session.user.id,
    name: dbUser?.name || session.user.name,
    email: session.user.email,
    username: dbUser?.username || null,
    bio: dbUser?.bio || null,
    phone: dbUser?.phone || null,
    location: dbUser?.location || null,
    website: dbUser?.website || null,
    skills: dbUser?.skills || null,
    experience: dbUser?.experience || null,
    preferredJobTypes: dbUser?.preferredJobTypes || null,
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
    signOut,
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
