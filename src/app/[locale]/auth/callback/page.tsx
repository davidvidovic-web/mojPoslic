'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabaseAuth } from '@/contexts/supabase-auth-context'

export default function AuthCallback() {
  const router = useRouter()
  const { user, loading } = useSupabaseAuth()
  const [message, setMessage] = useState('Processing authentication...')

  useEffect(() => {
    // This callback is for legacy implicit flow
    // New registrations should use /auth/confirm with PKCE flow
    if (!loading) {
      if (user) {
        setMessage('Authentication successful! Redirecting...')
        router.push('/dashboard')
      } else {
        setMessage('Authentication failed. Redirecting to sign in...')
        router.push('/auth/signin?error=auth_callback_failed')
      }
    }
  }, [user, loading, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  )
}
