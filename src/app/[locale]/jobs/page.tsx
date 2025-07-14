'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function JobsPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to homepage which has the comprehensive job listing
    router.replace('/')
  }, [router])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Redirecting to job listings...</p>
      </div>
    </div>
  )
}
