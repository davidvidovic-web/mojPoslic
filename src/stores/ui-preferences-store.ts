import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UIPreferencesState {
  // Theme & Appearance
  theme: 'light' | 'dark' | 'system'
  
  // Layout preferences
  sidebarCollapsed: boolean
  compactMode: boolean
  showConnectionsInHeader: boolean
  
  // Dashboard preferences
  dashboardLayout: 'default' | 'compact' | 'detailed'
  showJobDescriptionPreview: boolean
  autoRefreshJobs: boolean
  refreshInterval: number // in seconds
  
  // Notification preferences
  showDesktopNotifications: boolean
  soundEnabled: boolean
  emailNotifications: boolean
  
  // Display preferences
  dateFormat: 'relative' | 'absolute'
  currency: 'BAM' | 'EUR' | 'USD'
  language: 'en' | 'bs'
  
  // Performance preferences
  animationsEnabled: boolean
  lazyLoadImages: boolean
  cacheTimeout: number
  
  // Actions
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  toggleSidebarCollapsed: () => void
  setCompactMode: (enabled: boolean) => void
  setShowConnectionsInHeader: (show: boolean) => void
  setDashboardLayout: (layout: 'default' | 'compact' | 'detailed') => void
  setShowJobDescriptionPreview: (show: boolean) => void
  setAutoRefreshJobs: (enabled: boolean) => void
  setRefreshInterval: (seconds: number) => void
  setShowDesktopNotifications: (enabled: boolean) => void
  setSoundEnabled: (enabled: boolean) => void
  setEmailNotifications: (enabled: boolean) => void
  setDateFormat: (format: 'relative' | 'absolute') => void
  setCurrency: (currency: 'BAM' | 'EUR' | 'USD') => void
  setLanguage: (language: 'en' | 'bs') => void
  setAnimationsEnabled: (enabled: boolean) => void
  setLazyLoadImages: (enabled: boolean) => void
  setCacheTimeout: (seconds: number) => void
  
  // Bulk actions
  resetToDefaults: () => void
  exportPreferences: () => string
  importPreferences: (preferences: string) => void
}

const defaultPreferences = {
  theme: 'system' as const,
  sidebarCollapsed: false,
  compactMode: false,
  showConnectionsInHeader: true,
  dashboardLayout: 'default' as const,
  showJobDescriptionPreview: true,
  autoRefreshJobs: true,
  refreshInterval: 30,
  showDesktopNotifications: true,
  soundEnabled: true,
  emailNotifications: true,
  dateFormat: 'relative' as const,
  currency: 'BAM' as const,
  language: 'en' as const,
  animationsEnabled: true,
  lazyLoadImages: true,
  cacheTimeout: 300,
}

export const useUIPreferencesStore = create<UIPreferencesState>()(
  persist(
    (set, get) => ({
      ...defaultPreferences,
      
      // Theme actions
      setTheme: (theme) => set({ theme }),
      
      // Layout actions
      toggleSidebarCollapsed: () => set(state => ({ 
        sidebarCollapsed: !state.sidebarCollapsed 
      })),
      setCompactMode: (enabled) => set({ compactMode: enabled }),
      setShowConnectionsInHeader: (show) => set({ showConnectionsInHeader: show }),
      
      // Dashboard actions
      setDashboardLayout: (layout) => set({ dashboardLayout: layout }),
      setShowJobDescriptionPreview: (show) => set({ showJobDescriptionPreview: show }),
      setAutoRefreshJobs: (enabled) => set({ autoRefreshJobs: enabled }),
      setRefreshInterval: (seconds) => set({ refreshInterval: seconds }),
      
      // Notification actions
      setShowDesktopNotifications: (enabled) => set({ showDesktopNotifications: enabled }),
      setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
      setEmailNotifications: (enabled) => set({ emailNotifications: enabled }),
      
      // Display actions
      setDateFormat: (format) => set({ dateFormat: format }),
      setCurrency: (currency) => set({ currency: currency }),
      setLanguage: (language) => set({ language: language }),
      
      // Performance actions
      setAnimationsEnabled: (enabled) => set({ animationsEnabled: enabled }),
      setLazyLoadImages: (enabled) => set({ lazyLoadImages: enabled }),
      setCacheTimeout: (seconds) => set({ cacheTimeout: seconds }),
      
      // Bulk actions
      resetToDefaults: () => set(defaultPreferences),
      
      exportPreferences: () => {
        const state = get()
        return JSON.stringify(state, null, 2)
      },
      
      importPreferences: (preferences) => {
        try {
          const parsed = JSON.parse(preferences)
          set(parsed)
        } catch (error) {
          console.error('Failed to import preferences:', error)
        }
      },
    }),
    {
      name: 'ui-preferences-store',
    }
  )
)
