'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

export default function MessagesRedirectPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Redirect to dashboard messages with all query parameters preserved
    const queryString = searchParams.toString()
    const redirectUrl = queryString 
      ? `/dashboard?${queryString}`
      : '/dashboard'
    
    router.replace(redirectUrl)
  }, [router, searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        {/* Hardcoded in Bosnian - redirect page without translation context */}
        <p className="text-muted-foreground">Preusmjeravanje na poruke...</p>
      </div>
    </div>
  )
}
