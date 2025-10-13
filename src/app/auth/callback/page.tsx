'use client'

import { useEffect } from 'react'

export default function AuthCallbackRedirect() {
  useEffect(() => {
    // Get locale from accept-language header
    const acceptLanguage = navigator.language || 'bs'
    const locale = acceptLanguage.startsWith('en') ? 'en' : 'bs'
    
    // Preserve URL parameters
    const params = new URLSearchParams(window.location.search)
    const queryString = params.toString()
    const redirectUrl = `/${locale}/auth/callback${queryString ? `?${queryString}` : ''}`
    
    window.location.href = redirectUrl
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        {/* Hardcoded in Bosnian - redirect page without translation context */}
        <p className="text-muted-foreground">Preusmjeravanje...</p>
      </div>
    </div>
  )
}
