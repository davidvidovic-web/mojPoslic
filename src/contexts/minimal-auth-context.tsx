'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface MinimalAuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
}

const MinimalAuthContext = createContext<MinimalAuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
})

export const useMinimalAuth = () => {
  const context = useContext(MinimalAuthContext)
  if (!context) {
    throw new Error('useMinimalAuth must be used within a MinimalAuthProvider')
  }
  return context
}

export function MinimalAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session without querying profiles
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes without querying profiles
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <MinimalAuthContext.Provider value={{ 
      user, 
      session, 
      loading, 
      signOut
    }}>
      {children}
    </MinimalAuthContext.Provider>
  )
}
