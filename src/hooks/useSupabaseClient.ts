'use client'

import { useSession } from 'next-auth/react'
import { createClientSupabaseClient } from '@/lib/supabase-nextauth-integration'
import { useMemo } from 'react'

// Client-side hook for Supabase operations (read-only or simple operations)
export function useSupabaseClient() {
  const { data: session } = useSession()
  
  const client = useMemo(() => {
    // For client-side, we'll use the regular anon client
    // Server-side operations will handle JWT authentication
    return createClientSupabaseClient()
  }, [])

  return {
    client,
    userId: session?.user?.id,
    userRole: session?.user?.role,
    isAuthenticated: !!session?.user?.id,
  }
}

// Helper for client-side real-time subscriptions
export function useSupabaseSubscription() {
  const { client, userId, isAuthenticated } = useSupabaseClient()
  
  return {
    client,
    userId,
    isAuthenticated,
    // Can be used for real-time subscriptions where RLS isn't critical
    // For write operations, use API routes with server-side JWT authentication
  }
}
