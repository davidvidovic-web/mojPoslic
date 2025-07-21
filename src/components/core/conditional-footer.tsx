'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { GlobalFooter } from './global-footer'

const ONBOARDING_PATHS = [
  '/role-selection',
  '/profile-setup',
  '/auth/verify-email',
  '/auth/forgot-password',
  '/auth/reset-password'
]

const HIDE_FOOTER_PATHS = [
  '/dashboard',
  '/messages',
  '/notifications',
  '/settings'
]

export function ConditionalFooter() {
  const pathname = usePathname()
  
  // Check if current path is an onboarding path or dashboard path
  const isOnboardingPath = ONBOARDING_PATHS.some(path => pathname === path)
  const isHideFooterPath = HIDE_FOOTER_PATHS.some(path => pathname.includes(path))
  
  // Don't show footer on onboarding pages or dashboard pages
  if (isOnboardingPath || isHideFooterPath) {
    return null
  }
  
  return <GlobalFooter />
}
