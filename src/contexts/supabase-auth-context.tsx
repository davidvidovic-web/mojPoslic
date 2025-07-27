'use client'

import React, { createContext, useContext, ReactNode, useEffect, useState, useCallback } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

type UserRole = 'admin' | 'client' | 'tasker' | 'company'

export type { UserRole }

export interface AuthUser {
  // Base Supabase User properties
  id: string
  email?: string
  aud: string
  email_confirmed_at?: string
  phone?: string
  confirmed_at?: string
  last_sign_in_at?: string
  app_metadata?: Record<string, unknown>
  user_metadata?: Record<string, unknown>
  identities?: unknown[]
  created_at?: string
  updated_at?: string
  
  // Extended user properties from your database
  name?: string | null
  username?: string | null
  bio?: string | null
  position?: string | null
  role: UserRole | null
  profileSetupCompleted?: boolean
  emailVerified?: boolean
  location?: string | null
  website?: string | null
  skills?: string | null
  experience?: string | null
  preferredJobTypes?: string[] | null
  preferredLanguage?: string | null
  avatarUrl?: string | null
  resumeUrl?: string | null
}

interface SupabaseAuthContextType {
  user: AuthUser | null
  session: Session | null
  loading: boolean
  hasRole: (role: UserRole) => boolean
  isAdmin: boolean
  isClient: boolean
  isTasker: boolean
  isCompany: boolean
  refreshUser: () => Promise<void>
  signOut: () => Promise<void>
  updateLanguagePreference: (language: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<{ error?: Error | null }>
  signUp: (email: string, password: string, options?: { data?: Record<string, unknown>; redirectTo?: string }) => Promise<{ error?: Error | null }>
  signInWithOtp: (email: string, options?: { shouldCreateUser?: boolean }) => Promise<{ error?: Error | null }>
  verifyOtp: (email: string, token: string) => Promise<{ error?: Error | null }>
  signInWithProvider: (provider: string) => Promise<{ error?: Error | null }>
  resetPassword: (email: string) => Promise<{ error?: Error | null }>
}

const SupabaseAuthContext = createContext<SupabaseAuthContextType>({
  user: null,
  session: null,
  loading: false,
  hasRole: () => false,
  isAdmin: false,
  isClient: false,
  isTasker: false,
  isCompany: false,
  refreshUser: async () => {},
  signOut: async () => {},
  updateLanguagePreference: async () => {},
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signInWithOtp: async () => ({ error: null }),
  verifyOtp: async () => ({ error: null }),
  signInWithProvider: async () => ({ error: null }),
  resetPassword: async () => ({ error: null }),
})

export const useSupabaseAuth = () => {
  const context = useContext(SupabaseAuthContext)
  if (!context) {
    throw new Error('useSupabaseAuth must be used within a SupabaseAuthProvider')
  }
  return context
}

export function SupabaseAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch extended user data from your database
  const fetchUserData = useCallback(async (supabaseUser: User, userSession?: Session | null) => {
    try {
      // Only fetch if we have a valid user and session
      if (!supabaseUser || !userSession) {
        console.log('No valid session, skipping user data fetch')
        // If we have a user but no session, create basic user data
        if (supabaseUser && !userSession) {
          const basicUser: AuthUser = {
            ...supabaseUser,
            role: null, // No default role - must be selected
            profileSetupCompleted: false,
            emailVerified: false,
          }
          setUser(basicUser)
        }
        return
      }

      // Try to fetch user profile data with explicit auth header
      const response = await fetch('/api/user/profile', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userSession.access_token}`,
        },
      })
      
      if (response.ok) {
        const { user: userData } = await response.json()
        
        // Merge Supabase user with database user data
        const extendedUser: AuthUser = {
          ...supabaseUser,
          name: userData.name,
          username: userData.username,
          bio: userData.bio,
          position: userData.position,
          role: userData.role || null, // No fallback - role must be explicitly set
          profileSetupCompleted: userData.profileSetupCompleted,
          emailVerified: userData.emailVerified,
          phone: userData.phone,
          location: userData.location,
          website: userData.website,
          skills: userData.skills,
          experience: userData.experience,
          preferredJobTypes: userData.preferredJobTypes,
          preferredLanguage: userData.preferredLanguage,
          avatarUrl: userData.avatarUrl,
          resumeUrl: userData.resumeUrl,
        }
        
        setUser(extendedUser)
      } else if (response.status === 401) {
        console.log('User session not valid, using basic user data')
        const basicUser: AuthUser = {
          ...supabaseUser,
          role: null, // No default role - must be selected
          profileSetupCompleted: false,
          emailVerified: false,
        }
        setUser(basicUser)
      } else {
        console.warn('Failed to fetch user profile, using basic user data')
        const basicUser: AuthUser = {
          ...supabaseUser,
          role: null, // No default role - must be selected
          profileSetupCompleted: false,
          emailVerified: false,
        }
        setUser(basicUser)
      }

    } catch (error) {
      console.error('Error fetching user data:', error)
      // Fallback to basic user data
      const basicUser: AuthUser = {
        ...supabaseUser,
        role: null, // No default role - must be selected
        profileSetupCompleted: false,
        emailVerified: false,
      }
      setUser(basicUser)
    }
  }, [])

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('AuthContext: Initializing auth state...')
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('AuthContext: Error getting session:', error)
          setSession(null)
          setUser(null)
        } else if (session?.user) {
          console.log('AuthContext: Session found for user:', session.user.email)
          setSession(session)
          await fetchUserData(session.user, session)
        } else {
          // No session - user is not authenticated
          console.log('AuthContext: No session found')
          setSession(null)
          setUser(null)
        }
      } catch (error) {
        console.error('AuthContext: Session initialization error:', error)
        setSession(null)
        setUser(null)
      } finally {
        console.log('AuthContext: Setting loading to false')
        setLoading(false)
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        
        if (session?.user) {
          await fetchUserData(session.user, session)
        } else {
          setUser(null)
        }
        
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [fetchUserData])

  // Helper functions
  const hasRole = useCallback((role: UserRole) => {
    return user?.role === role
  }, [user])

  const refreshUser = useCallback(async () => {
    try {
      console.log('AuthContext: Refreshing user session...')
      // First try to refresh the session - this is critical for newly verified users
      const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession()
      
      if (refreshError) {
        console.log('AuthContext: Session refresh failed, trying getSession:', refreshError)
        // If refresh fails, try getSession as fallback
        const { data: { session: currentSession }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('AuthContext: Error getting session:', error)
          return
        }
        
        if (currentSession?.user) {
          console.log('AuthContext: Session found via getSession for user:', currentSession.user.email)
          setSession(currentSession)
          await fetchUserData(currentSession.user, currentSession)
        } else {
          console.log('AuthContext: No session found during refresh')
          setSession(null)
          setUser(null)
        }
      } else if (refreshedSession?.user) {
        console.log('AuthContext: Session refreshed successfully for user:', refreshedSession.user.email)
        setSession(refreshedSession)
        await fetchUserData(refreshedSession.user, refreshedSession)
      } else {
        console.log('AuthContext: No session after refresh')
        setSession(null)
        setUser(null)
      }
    } catch (error) {
      console.error('AuthContext: Error in refreshUser:', error)
    }
  }, [fetchUserData])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
  }, [])

  const updateLanguagePreference = useCallback(async (language: string) => {
    if (!user) return

    try {
      const response = await fetch('/api/user/update-language', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language }),
      })

      if (response.ok) {
        await refreshUser()
      }
    } catch (error) {
      console.error('Error updating language preference:', error)
    }
  }, [user, refreshUser])

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      return { error }
    } catch (error) {
      console.error('Sign in error:', error)
      return { error: error as Error }
    }
  }, [])

  const signUp = useCallback(async (email: string, password: string, options?: { data?: Record<string, unknown>; redirectTo?: string }) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          ...options
        }
      })
      return { error }
    } catch (error) {
      console.error('Sign up error:', error)
      return { error: error as Error }
    }
  }, [])

  const signInWithProvider = useCallback(async (provider: string) => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider as 'google' | 'github' | 'linkedin',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })
      return { error }
    } catch (error) {
      console.error('Provider sign in error:', error)
      return { error: error as Error }
    }
  }, [])

  const signInWithOtp = useCallback(async (email: string, options?: { shouldCreateUser?: boolean }) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: options?.shouldCreateUser ?? true
        }
      })
      return { error }
    } catch (error) {
      console.error('OTP sign in error:', error)
      return { error: error as Error }
    }
  }, [])

  const verifyOtp = useCallback(async (email: string, token: string) => {
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email'
      })
      return { error }
    } catch (error) {
      console.error('OTP verification error:', error)
      return { error: error as Error }
    }
  }, [])

  const resetPassword = useCallback(async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      })
      return { error }
    } catch (error) {
      console.error('Reset password error:', error)
      return { error: error as Error }
    }
  }, [])

  const contextValue: SupabaseAuthContextType = {
    user,
    session,
    loading,
    hasRole,
    isAdmin: hasRole('admin'),
    isClient: hasRole('client'),
    isTasker: hasRole('tasker'),
    isCompany: hasRole('company'),
    refreshUser,
    signOut,
    updateLanguagePreference,
    signIn,
    signUp,
    signInWithOtp,
    verifyOtp,
    signInWithProvider,
    resetPassword,
  }

  return (
    <SupabaseAuthContext.Provider value={contextValue}>
      {children}
    </SupabaseAuthContext.Provider>
  )
}
