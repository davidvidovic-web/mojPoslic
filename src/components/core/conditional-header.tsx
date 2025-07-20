'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { OptimizedHeader } from './optimized-header'

const ONBOARDING_PATHS = [
  '/role-selection',
  '/profile-setup',
  '/auth/signin',
  '/auth/register',
  '/auth/verify-email',
  '/auth/forgot-password',
  '/auth/reset-password'
]

export function ConditionalHeader() {
  const pathname = usePathname()
  
  // Check if current path is an onboarding path
  const isOnboardingPath = ONBOARDING_PATHS.some(path => pathname === path)
  
  // Don't show header on onboarding pages
  if (isOnboardingPath) {
    return null
  }
  
  return <OptimizedHeader />
}
