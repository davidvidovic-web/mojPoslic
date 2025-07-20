'use client'

import React from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useRouter, usePathname } from 'next/navigation'
import { getTimeBasedGreetingWithIcon } from '@/lib/localized-greetings'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTranslations } from 'next-intl'
import { DashboardFooter } from '@/components/core/global-footer'
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
  userName?: string | null
  isDialogOpen?: boolean
  setIsDialogOpen?: (open: boolean) => void
  onJobPosted?: () => void
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
  const t = useTranslations('dashboard')
  const tGreetings = useTranslations('greetings')

  // Determine active tab based on pathname if not provided
  const currentTab = activeTab || (() => {
    if (pathname?.includes('/dashboard/messages')) return 'messages'
    if (pathname?.includes('/dashboard/jobs')) return 'jobs'
    if (pathname?.includes('/dashboard/connections')) return 'connections'
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
        router.push('/dashboard/connections')
        break
      default:
        router.push('/dashboard')
    }
  }
  
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
        {/* Navigation */}
        <div className="space-y-6">
          {/* Section Selector - Dropdown on mobile, Tabs on tablet+ */}
          <div className="block md:hidden">
            <div className="bg-card border rounded-lg p-4">
              <div className="flex items-center gap-4">
                <label htmlFor="section-select" className="text-sm font-medium text-foreground whitespace-nowrap">
                  {t('navigation.viewSection')}
                </label>
                <Select value={currentTab} onValueChange={navigateToSection}>
                  <SelectTrigger className="flex-1" id="section-select">
                    <SelectValue placeholder={t('navigation.selectSection')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="overview">
                      <div className="flex items-center gap-2">
                        <LayoutDashboard className="h-4 w-4 text-blue-600" />
                        {t('navigation.overview')}
                      </div>
                    </SelectItem>
                    <SelectItem value="jobs">
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-green-600" />
                        {t('navigation.jobs')}
                      </div>
                    </SelectItem>
                    <SelectItem value="messages">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-purple-600" />
                        {t('navigation.messages')}
                      </div>
                    </SelectItem>
                    <SelectItem value="connections">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-yellow-600" />
                        {t('navigation.connections')}
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
                  <span>{t('navigation.overview')}</span>
                </TabsTrigger>
                <TabsTrigger value="jobs" className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-green-600" />
                  <span>{t('navigation.jobs')}</span>
                </TabsTrigger>
                <TabsTrigger value="messages" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-purple-600" />
                  <span>{t('navigation.messages')}</span>
                </TabsTrigger>
                <TabsTrigger value="connections" className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-600" />
                  <span>{t('navigation.connections')}</span>
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
      
      {/* Dashboard Footer */}
      <DashboardFooter />
    </div>
  )
}
