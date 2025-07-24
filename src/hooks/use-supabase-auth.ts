'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { authenticatedSupabase } from '@/lib/messaging/supabase'

/**
 * Hook to synchronize NextAuth JWT token with Supabase real-time authentication
 * This enables RLS policies to work with NextAuth user sessions
 */
export function useSupabaseAuth() {
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === 'loading') {
      return // Still loading, don't do anything yet
    }

    if (status === 'authenticated' && session?.user) {
      // Create a custom JWT payload for Supabase
      // We need to create a token that matches what RLS policies expect
      const customPayload = {
        sub: session.user.id, // User ID for auth.uid()
        role: 'authenticated',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
        // Add custom claims that our RLS policies can use
        user_id: session.user.id,
        user_role: session.user.role,
        email: session.user.email,
      }

      // For now, we'll use a simple approach and set the user ID directly
      // In production, you might want to generate a proper JWT with your secret
      const tokenPayload = JSON.stringify(customPayload)
      const encodedToken = btoa(tokenPayload) // Base64 encode for now

      // Set the auth token for Supabase real-time
      authenticatedSupabase.setAuthToken(encodedToken)

      if (process.env.NODE_ENV === 'development') {
        console.log('🔐 NextAuth session synchronized with Supabase:', {
          userId: session.user.id,
          role: session.user.role,
          email: session.user.email
        })
      }
    } else {
      // User is not authenticated, clear the token
      authenticatedSupabase.setAuthToken(null)
      
      if (process.env.NODE_ENV === 'development') {
        console.log('🔐 NextAuth session cleared from Supabase')
      }
    }
  }, [session, status])

  return {
    isAuthenticated: status === 'authenticated',
    userId: session?.user?.id,
    userRole: session?.user?.role,
    session
  }
}
