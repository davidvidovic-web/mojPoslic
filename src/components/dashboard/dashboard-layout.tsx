'use client'

import React from 'react'
import { useSupabaseAuth } from "@/contexts/supabase-auth-context"
import { getTimeBasedGreetingWithIcon } from '@/lib/localized-greetings'
import { useTranslations } from 'next-intl'
import { DashboardFooter } from '@/components/core/global-footer'
import { 
  Sunrise, 
  Sun, 
  Moon
} from 'lucide-react'

// Helper function to get full name display
const getFullNameDisplay = (name?: string | null): string => {
  if (!name || typeof name !== 'string') {
    return ''
  }
  return name.trim()
}

interface DashboardLayoutProps {
  children: React.ReactNode
  sidebar?: React.ReactNode
  title?: string
  subtitle?: string
  userRole?: 'client' | 'tasker' | 'company' | 'admin'
  userName?: string | null
}

export function DashboardLayout({ 
  children, 
  sidebar,
  title,
  subtitle,
  userRole = 'tasker' 
}: DashboardLayoutProps) {
  const { user } = useSupabaseAuth()
  const t = useTranslations('dashboard')
  const tGreetings = useTranslations('greetings')

  // Get time-based greeting with icon
  const { greetingKey, iconName } = getTimeBasedGreetingWithIcon()
  const greeting = tGreetings(greetingKey)
  
  // Helper to render the appropriate icon
  const renderTimeIcon = () => {
    const iconProps = { className: "h-4 w-4" }
    switch (iconName) {
      case 'Sunrise': return <Sunrise {...iconProps} />
      case 'Sun': return <Sun {...iconProps} />
      case 'Moon': return <Moon {...iconProps} />
      default: return <Sun {...iconProps} />
    }
  }

  // Get role-based taglines
  const getRoleTagline = () => {
    return t(`header.subtitle.${userRole}`)
  }

  // Get role-based action text
  const getRoleActionText = () => {
    return t(`header.actionText.${userRole}`)
  }

  // Get role-based status
  const getRoleStatus = () => {
    return t(`header.status.${userRole}`)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="container mx-auto px-4 py-8 flex-1">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 rounded-lg p-6 border border-emerald-100 dark:border-emerald-900/30">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-3">
              <div className="flex-1">
                <div className="space-y-2">
                  {/* Greeting message */}
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-300">
                    {renderTimeIcon()}
                    <span className="text-lg font-medium">{greeting}</span>
                  </div>
                  
                  {/* Full name - bold and prominent */}
                  <h1 className="text-xl sm:text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                    {getFullNameDisplay(user?.name)}
                  </h1>
                  
                  {/* Role-appropriate tagline */}
                  <p className="text-sm text-emerald-600 dark:text-emerald-300">
                    {title || getRoleTagline()}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-sm text-emerald-600 dark:text-emerald-300">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                <span>{subtitle || getRoleStatus()}</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>{getRoleActionText()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content with Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {children}
          </div>
          
          {/* Sidebar */}
          {sidebar && (
            <div className="lg:col-span-1">
              {sidebar}
            </div>
          )}
        </div>
      </div>
      
      {/* Dashboard Footer */}
      <DashboardFooter />
    </div>
  )
}
