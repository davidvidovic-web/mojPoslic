'use client'

import React from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useRouter, usePathname } from 'next/navigation'
import { getTimeBasedGreetingWithIcon } from '@/lib/utils'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Sunrise, 
  Sun, 
  Moon,
  LayoutDashboard,
  Briefcase,
  MessageSquare,
  Zap
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
  activeTab?: string
  title?: string
  subtitle?: string
  userRole?: 'client' | 'tasker' | 'company' | 'admin'
}

export function DashboardLayout({ 
  children, 
  activeTab, 
  title,
  subtitle,
  userRole = 'tasker' 
}: DashboardLayoutProps) {
  const { user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  // Determine active tab based on pathname if not provided
  const currentTab = activeTab || (() => {
    if (pathname?.includes('/dashboard/messages')) return 'messages'
    if (pathname?.includes('/dashboard/jobs')) return 'jobs'
    if (pathname?.includes('/connections')) return 'connections'
    return 'overview'
  })()

  // Navigate to section
  const navigateToSection = (section: string) => {
    switch (section) {
      case 'overview':
        router.push('/dashboard')
        break
      case 'jobs':
        router.push('/dashboard/jobs')
        break
      case 'messages':
        router.push('/dashboard/messages')
        break
      case 'connections':
        router.push('/connections')
        break
      default:
        router.push('/dashboard')
    }
  }
  
  // Get time-based greeting with icon
  const { greeting, iconName } = getTimeBasedGreetingWithIcon()
  
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

  // Get theme colors based on user role
  const getThemeColors = () => {
    switch (userRole) {
      case 'client':
        return {
          gradient: 'from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30',
          border: 'border-blue-100 dark:border-blue-900/30',
          iconBg: 'bg-blue-100 dark:bg-blue-900/40',
          iconBorder: 'border-blue-200 dark:border-blue-800',
          iconColor: 'text-blue-600 dark:text-blue-400',
          textPrimary: 'text-blue-900 dark:text-blue-100',
          textSecondary: 'text-blue-600 dark:text-blue-300',
          tagline: 'Find top talent for your projects'
        }
      case 'company':
        return {
          gradient: 'from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30',
          border: 'border-purple-100 dark:border-purple-900/30',
          iconBg: 'bg-purple-100 dark:bg-purple-900/40',
          iconBorder: 'border-purple-200 dark:border-purple-800',
          iconColor: 'text-purple-600 dark:text-purple-400',
          textPrimary: 'text-purple-900 dark:text-purple-100',
          textSecondary: 'text-purple-600 dark:text-purple-300',
          tagline: 'Scale your business with expert talent'
        }
      case 'tasker':
      default:
        return {
          gradient: 'from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30',
          border: 'border-emerald-100 dark:border-emerald-900/30',
          iconBg: 'bg-emerald-100 dark:bg-emerald-900/40',
          iconBorder: 'border-emerald-200 dark:border-emerald-800',
          iconColor: 'text-emerald-600 dark:text-emerald-400',
          textPrimary: 'text-emerald-900 dark:text-emerald-100',
          textSecondary: 'text-emerald-600 dark:text-emerald-300',
          tagline: 'Ready to take on new challenges'
        }
    }
  }

  const themeColors = getThemeColors()

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="container mx-auto px-4 py-8 flex-1">
        {/* Header */}
        <div className="mb-8">
          <div className={`bg-gradient-to-r ${themeColors.gradient} rounded-lg p-6 border ${themeColors.border}`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-3">
              <div className={`flex items-center justify-center w-12 h-12 rounded-lg ${themeColors.iconBg} border ${themeColors.iconBorder}`}>
                {renderTimeIcon()}
              </div>
              <div className="flex-1">
                <div className="space-y-2">
                  {/* Greeting message */}
                  <div className={`flex items-center gap-2 ${themeColors.textSecondary}`}>
                    <span className="text-lg font-medium">{greeting}!</span>
                  </div>
                  
                  {/* Full name - bold and prominent */}
                  <h1 className={`text-xl sm:text-2xl font-bold ${themeColors.textPrimary}`}>
                    {getFullNameDisplay(user?.name)}
                  </h1>
                  
                  {/* Page title if provided, otherwise role tagline */}
                  <p className={`text-sm ${themeColors.textSecondary}`}>
                    {title || themeColors.tagline}
                  </p>
                </div>
              </div>
            </div>
            <div className={`flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-sm ${themeColors.textSecondary}`}>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 ${themeColors.iconColor.replace('text-', 'bg-')} rounded-full`}></div>
                <span>{subtitle || 'Dashboard Active'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="space-y-6">
          {/* Section Selector - Dropdown on mobile, Tabs on tablet+ */}
          <div className="block md:hidden">
            <div className="bg-card border rounded-lg p-4">
              <div className="flex items-center gap-4">
                <label htmlFor="section-select" className="text-sm font-medium text-foreground whitespace-nowrap">
                  View Section:
                </label>
                <Select value={currentTab} onValueChange={navigateToSection}>
                  <SelectTrigger className="flex-1" id="section-select">
                    <SelectValue placeholder="Select a section" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="overview">
                      <div className="flex items-center gap-2">
                        <LayoutDashboard className="h-4 w-4 text-blue-600" />
                        Overview
                      </div>
                    </SelectItem>
                    <SelectItem value="jobs">
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-green-600" />
                        Jobs
                      </div>
                    </SelectItem>
                    <SelectItem value="messages">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-purple-600" />
                        Messages
                      </div>
                    </SelectItem>
                    <SelectItem value="connections">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-yellow-600" />
                        Connections
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Tabs for tablet and desktop */}
          <div className="hidden md:block">
            <Tabs value={currentTab} onValueChange={navigateToSection} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <LayoutDashboard className="h-4 w-4 text-blue-600" />
                  <span>Overview</span>
                </TabsTrigger>
                <TabsTrigger value="jobs" className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-green-600" />
                  <span>Jobs</span>
                </TabsTrigger>
                <TabsTrigger value="messages" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-purple-600" />
                  <span>Messages</span>
                </TabsTrigger>
                <TabsTrigger value="connections" className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-600" />
                  <span>Connections</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Content */}
          <div>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
