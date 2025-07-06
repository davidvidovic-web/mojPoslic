'use client'

import React, { createContext, useContext, ReactNode, useEffect, useState, useRef, useMemo } from 'react'
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
  const [dataFetched, setDataFetched] = useState(false)
  const fetchTimeout = useRef<NodeJS.Timeout | null>(null)
  
  // Fetch fresh user data from database with debouncing
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
          createdAt: userData.createdAt ? new Date(userData.createdAt) : undefined,
        })
        setDataFetched(true)
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

  // Fetch user data when session changes with debouncing
  useEffect(() => {
    if (session?.user?.id) {
      // Clear any existing timeout
      if (fetchTimeout.current) {
        clearTimeout(fetchTimeout.current)
      }
      
      // Reset data fetched flag when session changes
      setDataFetched(false)
      
      // Debounce the fetch to prevent rapid calls
      fetchTimeout.current = setTimeout(() => {
        fetchUserData()
      }, 200)
    } else {
      setDbUser(null)
      setDataFetched(false)
    }

    // Cleanup timeout on unmount
    return () => {
      if (fetchTimeout.current) {
        clearTimeout(fetchTimeout.current)
      }
    }
  }, [session?.user?.id])

  // Refresh user data manually
  const refreshUser = async () => {
    if (session?.user?.id && !loading) {
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
  const user: AuthUser | null = useMemo(() => {
    if (!session?.user) return null
    
    // If we haven't fetched database data yet, but we have a session, return minimal user until DB data loads
    if (!dataFetched) {
      return {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        username: null,
        bio: null,
        phone: null,
        location: null,
        website: null,
        skills: null,
        experience: null,
        preferredJobTypes: null,
        role: (session.user.role as UserRole) || 'client',
        profileSetupCompleted: session.user.profileSetupCompleted ?? false,
      }
    }
    
    // Return complete user object with database data
    return {
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
      createdAt: dbUser?.createdAt || undefined,
      // Always prefer database data for profileSetupCompleted if available
      profileSetupCompleted: dbUser?.profileSetupCompleted !== undefined 
        ? dbUser.profileSetupCompleted 
        : (session.user.profileSetupCompleted ?? false),
    }
  }, [
    session?.user,
    dataFetched,
    dbUser?.name,
    dbUser?.username,
    dbUser?.bio,
    dbUser?.phone,
    dbUser?.location,
    dbUser?.website,
    dbUser?.skills,
    dbUser?.experience,
    dbUser?.preferredJobTypes,
    dbUser?.role,
    dbUser?.profileSetupCompleted,
    dbUser?.createdAt
  ])

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
    loading: status === 'loading' || (!!session?.user && !dataFetched),
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
