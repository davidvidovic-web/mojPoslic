/**
 * Simplified Registration Flow Guard - Uses Supabase auth state only
 */
'use client'

import React, { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSupabaseAuth } from '@/contexts/supabase-auth-context'

export function RegistrationFlowGuard({ children }: { children: React.ReactNode }) {
  const { user, loading, refreshUser } = useSupabaseAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Check if user just verified email
  const isVerified = searchParams.get('verified') === 'true'

  // Refresh user context if just verified
  useEffect(() => {
    if (isVerified && !loading) {
      console.log('User just verified, refreshing auth context...')
      refreshUser()
    }
  }, [isVerified, loading, refreshUser])

  useEffect(() => {
    if (loading) return

    // If just verified, give more time for auth context to refresh
    if (isVerified && !user) {
      console.log('Just verified but no user yet, waiting...')
      return
    }
    
    if (!user && !isVerified) {
      // No user, redirect to signin
      router.push('/auth/signin')
      return
    }

    // Check if user needs to select a role
    if (user && !user.role) {
      router.push('/role-selection')
      return
    }

    // Check if user needs to complete profile setup
    if (user && !user.profileSetupCompleted) {
      router.push('/profile-setup')
      return
    }

    // User is properly authenticated and onboarded
  }, [user, loading, router, isVerified])

  // Show loading while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Show loading while redirecting (but not if just verified and waiting for auth refresh)
  if ((!user && !isVerified) || (user && !user.role) || (user && !user.profileSetupCompleted)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}