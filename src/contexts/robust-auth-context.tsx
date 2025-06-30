'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { UserProfile, UserRole } from '@/types/user'

interface RobustAuthContextType {
  user: User | null
  session: Session | null
  profile: UserProfile | null
  loading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  ensureProfile: () => Promise<UserProfile | null>
  hasRole: (role: UserRole) => boolean
  isAdmin: boolean
  isEmployer: boolean
  isEmployee: boolean
}

const RobustAuthContext = createContext<RobustAuthContextType>({
  user: null,
  session: null,
  profile: null,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
  ensureProfile: async () => null,
  hasRole: () => false,
  isAdmin: false,
  isEmployer: false,
  isEmployee: false,
})

export const useRobustAuth = () => {
  const context = useContext(RobustAuthContext)
  if (!context) {
    throw new Error('useRobustAuth must be used within a RobustAuthProvider')
  }
  return context
}

export function RobustAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
        return null
      }

      return data as UserProfile
    } catch (error) {
      console.error('Error fetching profile:', error)
      return null
    }
  }

  const createProfileForUser = async (user: User): Promise<UserProfile | null> => {
    try {
      console.log('Creating profile for user:', user.id)
      
      // Try using the manual profile creation function
      const { data, error } = await supabase.rpc('create_profile_for_user', {
        user_id: user.id,
        user_email: user.email,
        user_name: user.user_metadata?.name || user.email,
        user_role: user.user_metadata?.role || 'employee'
      })

      if (error) {
        console.error('Error creating profile with function:', error)
        
        // Fallback: direct insert
        const { data: insertData, error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email || '',
            name: user.user_metadata?.name || user.email || '',
            role: (user.user_metadata?.role as UserRole) || 'employee'
          })
          .select()
          .single()

        if (insertError) {
          console.error('Error creating profile with direct insert:', insertError)
          return null
        }

        return insertData as UserProfile
      }

      return data as UserProfile
    } catch (error) {
      console.error('Error creating profile:', error)
      return null
    }
  }

  const ensureProfile = async (): Promise<UserProfile | null> => {
    if (!user) return null

    let userProfile = await fetchUserProfile(user.id)
    
    if (!userProfile) {
      console.log('No profile found, creating one...')
      userProfile = await createProfileForUser(user)
    }

    setProfile(userProfile)
    return userProfile
  }

  const refreshProfile = async () => {
    if (user) {
      const userProfile = await fetchUserProfile(user.id)
      setProfile(userProfile)
    }
  }

  const hasRole = (role: UserRole): boolean => {
    return profile?.role === role
  }

  const isAdmin = profile?.role === 'admin'
  const isEmployer = profile?.role === 'employer' || profile?.role === 'company'
  const isEmployee = profile?.role === 'employee'

  useEffect(() => {
    let mounted = true

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return

      setSession(session)
      setUser(session?.user ?? null)
      
      if (session?.user) {
        let userProfile = await fetchUserProfile(session.user.id)
        
        // If no profile exists, try to create one
        if (!userProfile) {
          userProfile = await createProfileForUser(session.user)
        }
        
        setProfile(userProfile)
      }
      
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return

      setSession(session)
      setUser(session?.user ?? null)
      
      if (session?.user) {
        let userProfile = await fetchUserProfile(session.user.id)
        
        // If no profile exists, try to create one
        if (!userProfile) {
          userProfile = await createProfileForUser(session.user)
        }
        
        setProfile(userProfile)
      } else {
        setProfile(null)
      }
      
      setLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    setProfile(null)
  }

  return (
    <RobustAuthContext.Provider value={{ 
      user, 
      session, 
      profile, 
      loading, 
      signOut, 
      refreshProfile,
      ensureProfile,
      hasRole,
      isAdmin,
      isEmployer,
      isEmployee
    }}>
      {children}
    </RobustAuthContext.Provider>
  )
}
