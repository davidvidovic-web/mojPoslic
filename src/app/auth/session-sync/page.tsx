'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSupabaseAuth } from '@/contexts/supabase-auth-context'

export default function SessionSyncPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading, refreshUser } = useSupabaseAuth()
  const [attempts, setAttempts] = useState(0)
  const [syncStarted, setSyncStarted] = useState(false)
  
  const next = searchParams.get('next') || '/dashboard'
  const verified = searchParams.get('verified')
  const maxAttempts = 10 // Try for 5 seconds (500ms * 10)

  useEffect(() => {
    if (syncStarted) return
    setSyncStarted(true)

    const syncSession = async () => {
      
      // Force refresh the auth context to pick up server-established session
      await refreshUser()
      
      // Check if we now have a user
      if (user) {
        
        // Build the redirect URL with parameters
        const params = new URLSearchParams()
        if (verified === 'true') {
          params.set('verified', 'true')
        }
        
        const redirectUrl = params.toString() 
          ? `/${next}?${params.toString()}`
          : `/${next}`
        
        router.push(redirectUrl)
        return
      }
      
      // If we still don't have a user and haven't exceeded max attempts, try again
      if (attempts < maxAttempts) {
        setAttempts(prev => prev + 1)
        setTimeout(() => setSyncStarted(false), 500) // Retry in 500ms
      } else {
        console.error('SessionSync: Max attempts reached, no session found')
        router.push('/auth/signin?error=session_sync_timeout')
      }
    }

    // Only start syncing if we're not already loading and don't have a user
    if (!loading && !user) {
      syncSession()
    } else if (user) {
      // User is already available, redirect immediately
      const params = new URLSearchParams()
      if (verified === 'true') {
        params.set('verified', 'true')
      }
      
      const redirectUrl = params.toString() 
        ? `/${next}?${params.toString()}`
        : `/${next}`
      
      router.push(redirectUrl)
    }
  }, [user, loading, attempts, maxAttempts, next, verified, router, refreshUser, syncStarted])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">
          Finalizing your account setup...
          {attempts > 3 && <span className="block text-xs mt-2">This is taking longer than expected, please wait...</span>}
        </p>
      </div>
    </div>
  )
}
