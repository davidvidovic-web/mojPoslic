'use client'

import React, { createContext, useContext, ReactNode, useEffect, useState, useRef, useMemo, useCallback } from 'react'
import { useSession, signOut as nextAuthSignOut } from 'next-auth/react'

type UserRole = 'admin' | 'client' | 'tasker' | 'company'

export interface AuthUser {
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
  preferredLanguage?: string | null
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
  updateLanguagePreference: (language: string) => Promise<void>
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
  updateLanguagePreference: async () => {},
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
  
  // Fetch fresh user data from database with debouncing and error handling
  const fetchUserData = useCallback(async () => {
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
          preferredLanguage: userData.preferredLanguage,
          createdAt: userData.createdAt ? new Date(userData.createdAt) : undefined,
        })
        setDataFetched(true)
      } else if (response.status === 500) {
        // If it's a server error (likely database timeout), silently fail and use session data
        console.warn('Server error fetching user data, using session data only')
        setDataFetched(true) // Mark as fetched to prevent retry loops
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
      // If there's a network error or timeout, use session data only
      setDataFetched(true) // Mark as fetched to prevent retry loops
      
      // If there's a JWT error, clear local state
      if (error instanceof Error && error.message.includes('JWT')) {
        setDbUser(null)
      }
    } finally {
      setLoading(false)
    }
  }, [])

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
  }, [session?.user?.id, fetchUserData])

  // Refresh user data manually
  const refreshUser = useCallback(async () => {
    if (session?.user?.id && !loading) {
      await fetchUserData()
    }
  }, [session?.user?.id, loading, fetchUserData])

  // Custom sign out function that clears local state
  const signOut = useCallback(async () => {
    // Clear local state immediately
    setDbUser(null)
    
    // Sign out with NextAuth and force redirect
    await nextAuthSignOut({ 
      callbackUrl: "/", 
      redirect: true 
    })
    
    // Force page reload to clear any cached state
    window.location.href = "/"
  }, [])

  // Update user language preference
  const updateLanguagePreference = useCallback(async (language: string) => {
    if (!session?.user?.id) return

    try {
      const response = await fetch('/api/user/language-preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ language }),
      })

      if (response.ok) {
        // Update local state
        setDbUser(prev => prev ? { ...prev, preferredLanguage: language } : null)
        
        // Redirect to the appropriate domain
        const currentUrl = new URL(window.location.href)
        
        if (language === 'en') {
          // Redirect to English subdomain
          let targetUrl: string
          if (process.env.NODE_ENV === 'development') {
            const port = currentUrl.port || '3000'
            targetUrl = `${currentUrl.protocol}//en.localhost:${port}${currentUrl.pathname}${currentUrl.search}`
          } else {
            targetUrl = `${currentUrl.protocol}//en.mojposlic.com${currentUrl.pathname}${currentUrl.search}`
          }
          window.location.href = targetUrl
        } else {
          // Redirect to main domain (Bosnian)
          let targetUrl: string
          if (process.env.NODE_ENV === 'development') {
            const port = currentUrl.port || '3000'
            targetUrl = `${currentUrl.protocol}//localhost:${port}${currentUrl.pathname}${currentUrl.search}`
          } else {
            targetUrl = `${currentUrl.protocol}//mojposlic.com${currentUrl.pathname}${currentUrl.search}`
          }
          window.location.href = targetUrl
        }
      }
    } catch (error) {
      console.error('Failed to update language preference:', error)
    }
  }, [session?.user?.id])
  
  // Convert Auth.js session to our app's user format, with database fallback
  const user: AuthUser | null = useMemo(() => {
    if (!session?.user) return null
    
    // If we haven't fetched database data yet AND we're currently loading, don't return partial user data
    // This prevents race conditions during onboarding flow
    if (!dataFetched && loading) {
      return null // Force loading state until we have complete data
    }
    
    // If we haven't fetched database data yet, but we're not loading, return minimal user from session
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
    loading, // Add loading dependency to prevent returning partial data during loading
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

  const hasRole = useCallback((role: UserRole): boolean => {
    if (!user) return false
    return user.role === role
  }, [user])

  const isAdmin = user?.role === 'admin'
  const isClient = user?.role === 'client' || user?.role === 'company'
  const isTasker = user?.role === 'tasker'
  const isCompany = user?.role === 'company'

  const contextValue: AuthContextType = useMemo(() => ({
    user,
    loading: status === 'loading' || Boolean(session?.user?.id && !dataFetched && loading), // Wait for initial data fetch
    hasRole,
    isAdmin,
    isClient,
    isTasker,
    isCompany,
    refreshUser,
    signOut,
    updateLanguagePreference,
  }), [
    user,
    status,
    session?.user?.id,
    dataFetched,
    loading, // Include database loading state
    hasRole,
    isAdmin,
    isClient,
    isTasker,
    isCompany,
    refreshUser,
    signOut,
    updateLanguagePreference
  ])

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
