'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { UserProfile, UserRole } from '@/types/user'
import { signOut, useSession } from 'next-auth/react'
import { Session } from 'next-auth'

// Define types for our auth context
interface AuthUser {
  id: string
  email: string
  name?: string
}

interface RobustAuthContextType {
  user: AuthUser | null
  session: Session | null
  profile: UserProfile | null
  loading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  ensureProfile: () => Promise<UserProfile | null>
  hasRole: (role: UserRole) => boolean
  isAdmin: boolean
  isClient: boolean
  isTasker: boolean
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
  isClient: false,
  isTasker: false,
})

export const useRobustAuth = () => {
  const context = useContext(RobustAuthContext)
  if (!context) {
    throw new Error('useRobustAuth must be used within a RobustAuthProvider')
  }
  return context
}

export function RobustAuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      const response = await fetch(`/api/user/profile?userId=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        console.error('Error fetching profile:', response.statusText)
        return null
      }

      const data = await response.json()
      return data.profile
    } catch (error) {
      console.error('Error fetching profile:', error)
      return null
    }
  }

  const createProfileForUser = async (userId: string, email: string, name?: string): Promise<UserProfile | null> => {
    try {
      console.log('Creating profile for user:', userId)
      
      // Use Prisma-based API route to create a profile
      const response = await fetch('/api/user/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          email,
          name: name || email,
          role: 'tasker' // Default role
        }),
      })

      if (!response.ok) {
        console.error('Error creating profile:', response.statusText)
        return null
      }

      const data = await response.json()
      return data.profile
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
      userProfile = await createProfileForUser(user.id, user.email, user.name)
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
  const isClient = profile?.role === 'client'
  const isTasker = profile?.role === 'tasker'

  useEffect(() => {
    if (status === 'loading') return

    if (session && session.user) {
      // Set user from NextAuth session
      setUser({
        id: session.user.id || '',
        email: session.user.email || '',
        name: session.user.name || undefined
      })
      
      // Fetch user profile
      fetchUserProfile(session.user.id || '').then(userProfile => {
        if (userProfile) {
          setProfile(userProfile)
        } else {
          // Create profile if none exists
          createProfileForUser(
            session.user.id || '', 
            session.user.email || '', 
            session.user.name || undefined
          ).then(newProfile => {
            setProfile(newProfile)
          })
        }
        setLoading(false)
      })
    } else {
      setUser(null)
      setProfile(null)
      setLoading(false)
    }
  }, [session, status])

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/login' })
    setProfile(null)
  }

  return (
    <RobustAuthContext.Provider value={{ 
      user, 
      session, 
      profile, 
      loading, 
      signOut: handleSignOut, 
      refreshProfile,
      ensureProfile,
      hasRole,
      isAdmin,
      isClient,
      isTasker
    }}>
      {children}
    </RobustAuthContext.Provider>
  )
}
