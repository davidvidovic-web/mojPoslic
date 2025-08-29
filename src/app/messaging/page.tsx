'use client'

import { UnifiedMessagingInterface } from '@/components/messaging/unified-messaging-interface'
import { useSupabaseAuth } from '@/contexts/supabase-auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function MessagingPage() {
  const { user, loading } = useSupabaseAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="container mx-auto p-4 h-screen flex flex-col">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Messages</h1>
        <p className="text-muted-foreground">
          Communicate with job applicants and employers
        </p>
      </div>
      
      <div className="flex-1 min-h-0">
        <UnifiedMessagingInterface className="h-full max-w-none border-0" />
      </div>
    </div>
  )
}
