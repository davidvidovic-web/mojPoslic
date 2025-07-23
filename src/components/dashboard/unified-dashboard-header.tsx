'use client'

import { useTranslations } from 'next-intl'
import { getTimeBasedGreetingWithIcon } from '@/lib/localized-greetings'
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

interface UnifiedDashboardHeaderProps {
  userName?: string | null
  userRole: 'tasker' | 'client' | 'admin'
  customTagline?: string
  customStatusMessage?: string
  variant?: 'default' | 'admin'
}

export function UnifiedDashboardHeader({ 
  userName, 
  userRole, 
  customTagline,
  customStatusMessage,
  variant = 'default'
}: UnifiedDashboardHeaderProps) {
  const tGreetings = useTranslations('greetings')
  const tDashboard = useTranslations('dashboard')
  
  // Get time-based greeting with icon
  const { greetingKey, iconName } = getTimeBasedGreetingWithIcon()
  const greeting = tGreetings(greetingKey)
  
  // Helper to render the appropriate icon
  const renderTimeIcon = () => {
    const iconProps = { className: "h-4 w-4" }
    switch (iconName) {
      case 'Sunrise':
        return <Sunrise {...iconProps} />
      case 'Sun':
        return <Sun {...iconProps} />
      case 'Moon':
        return <Moon {...iconProps} />
      default:
        return <Sun {...iconProps} />
    }
  }

  // Get role-specific configurations
  const getRoleConfig = () => {
    switch (userRole) {
      case 'tasker':
        return {
          gradientFrom: 'from-emerald-50',
          gradientTo: 'to-green-50',
          gradientFromDark: 'dark:from-emerald-950/30',
          gradientToDark: 'dark:to-green-950/30',
          borderColor: 'border-emerald-100',
          borderColorDark: 'dark:border-emerald-900/30',
          textColor: 'text-emerald-600',
          textColorDark: 'dark:text-emerald-300',
          nameColor: 'text-emerald-900',
          nameColorDark: 'dark:text-emerald-100',
          taglineKey: 'taglines.tasker',
          statusKey: 'status.jobSeekingActive',
          statusIcon: (
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          ),
          statusText: 'Quick Apply & Track'
        }
      case 'client':
        return {
          gradientFrom: 'from-blue-50',
          gradientTo: 'to-indigo-50',
          gradientFromDark: 'dark:from-blue-950/30',
          gradientToDark: 'dark:to-indigo-950/30',
          borderColor: 'border-blue-100',
          borderColorDark: 'dark:border-blue-900/30',
          textColor: 'text-blue-600',
          textColorDark: 'dark:text-blue-300',
          nameColor: 'text-blue-900',
          nameColorDark: 'dark:text-blue-100',
          taglineKey: 'taglines.client',
          statusKey: 'status.hiringActive',
          statusIcon: (
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          ),
          statusText: 'Quick Post & Hire'
        }
      case 'admin':
        return {
          gradientFrom: 'from-red-50',
          gradientTo: 'to-orange-50',
          gradientFromDark: 'dark:from-red-950/30',
          gradientToDark: 'dark:to-orange-950/30',
          borderColor: 'border-red-100',
          borderColorDark: 'dark:border-red-900/30',
          textColor: 'text-red-600',
          textColorDark: 'dark:text-red-300',
          nameColor: 'text-red-900',
          nameColorDark: 'dark:text-red-100',
          taglineKey: 'taglines.admin',
          statusKey: 'status.adminActive',
          statusIcon: (
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          ),
          statusText: 'System Management'
        }
      default:
        return {
          gradientFrom: 'from-gray-50',
          gradientTo: 'to-slate-50',
          gradientFromDark: 'dark:from-gray-950/30',
          gradientToDark: 'dark:to-slate-950/30',
          borderColor: 'border-gray-100',
          borderColorDark: 'dark:border-gray-900/30',
          textColor: 'text-gray-600',
          textColorDark: 'dark:text-gray-300',
          nameColor: 'text-gray-900',
          nameColorDark: 'dark:text-gray-100',
          taglineKey: 'taglines.default',
          statusKey: 'status.active',
          statusIcon: null,
          statusText: 'Dashboard'
        }
    }
  }

  const config = getRoleConfig()

  // Admin variant uses a simpler layout
  if (variant === 'admin') {
    return (
      <div className="mb-6 sm:mb-8">
        <div className={`bg-gradient-to-r ${config.gradientFrom} ${config.gradientTo} ${config.gradientFromDark} ${config.gradientToDark} rounded-[var(--radius)] p-4 sm:p-6 border ${config.borderColor} ${config.borderColorDark}`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex-1">
              <div className="space-y-2">
                {/* Greeting message */}
                <div className={`flex items-center gap-2 ${config.textColor} ${config.textColorDark}`}>
                  {renderTimeIcon()}
                  <span className="text-base sm:text-lg font-medium">{greeting}</span>
                </div>
                
                {/* Full name - bold and prominent */}
                <h1 className={`text-lg sm:text-2xl font-bold ${config.nameColor} ${config.nameColorDark}`}>
                  {getFullNameDisplay(userName)}
                </h1>
                
                {/* Role-appropriate tagline */}
                <p className={`text-sm ${config.textColor} ${config.textColorDark}`}>
                  {customTagline || tDashboard(config.taglineKey)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Default variant with full features
  return (
    <div className="mb-8">
      <div className={`bg-gradient-to-r ${config.gradientFrom} ${config.gradientTo} ${config.gradientFromDark} ${config.gradientToDark} rounded-[var(--radius)] p-6 border ${config.borderColor} ${config.borderColorDark}`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-3">
          <div className="flex-1">
            <div className="space-y-2">
              {/* Greeting message */}
              <div className={`flex items-center gap-2 ${config.textColor} ${config.textColorDark}`}>
                {renderTimeIcon()}
                <span className="text-lg font-medium">{greeting}</span>
              </div>
              
              {/* Full name - bold and prominent */}
              <h1 className={`text-xl sm:text-2xl font-bold ${config.nameColor} ${config.nameColorDark}`}>
                {getFullNameDisplay(userName)}
              </h1>
              
              {/* Role-appropriate tagline */}
              <p className={`text-sm ${config.textColor} ${config.textColorDark}`}>
                {customTagline || tDashboard(config.taglineKey)}
              </p>
            </div>
          </div>
        </div>
        
        {/* Status indicators */}
        <div className={`flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-sm ${config.textColor} ${config.textColorDark}`}>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 bg-current rounded-full opacity-60`}></div>
            <span>{customStatusMessage || tDashboard(config.statusKey)}</span>
          </div>
          {config.statusIcon && (
            <div className="flex items-center gap-2">
              {config.statusIcon}
              <span>{config.statusText}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
