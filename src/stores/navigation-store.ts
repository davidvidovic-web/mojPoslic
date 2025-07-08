import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type DashboardTab = 'overview' | 'jobs' | 'applications' | 'messages' | 'connections' | 'finances' | 'settings'
type AdminTab = 'users' | 'jobs' | 'system' | 'billing' | 'analytics'
type SystemTab = 'categories' | 'cities' | 'connections' | 'settings'

interface NavigationState {
  // Dashboard navigation
  currentDashboardTab: DashboardTab
  currentAdminTab: AdminTab
  currentSystemTab: SystemTab
  
  // Page states
  isOnMobile: boolean
  showSidebar: boolean
  
  // Navigation history
  previousTab: DashboardTab | null
  navigationHistory: string[]
  
  // Actions
  setDashboardTab: (tab: DashboardTab) => void
  setAdminTab: (tab: AdminTab) => void
  setSystemTab: (tab: SystemTab) => void
  toggleSidebar: () => void
  setMobileView: (isMobile: boolean) => void
  navigateWithHistory: (path: string) => void
  goBack: () => void
  
  // Computed getters
  canGoBack: () => boolean
}

export const useNavigationStore = create<NavigationState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentDashboardTab: 'overview',
      currentAdminTab: 'users',
      currentSystemTab: 'categories',
      isOnMobile: false,
      showSidebar: true,
      previousTab: null,
      navigationHistory: [],
      
      // Dashboard navigation
      setDashboardTab: (tab) => set(state => ({ 
        previousTab: state.currentDashboardTab,
        currentDashboardTab: tab 
      })),
      
      setAdminTab: (tab) => set({ currentAdminTab: tab }),
      setSystemTab: (tab) => set({ currentSystemTab: tab }),
      
      // UI state
      toggleSidebar: () => set(state => ({ 
        showSidebar: !state.showSidebar 
      })),
      
      setMobileView: (isMobile) => set({ 
        isOnMobile: isMobile,
        showSidebar: !isMobile // Auto-hide sidebar on mobile
      }),
      
      // Navigation with history
      navigateWithHistory: (path) => set(state => ({
        navigationHistory: [...state.navigationHistory.slice(-9), path]
      })),
      
      goBack: () => {
        const state = get()
        if (state.previousTab) {
          set({ 
            currentDashboardTab: state.previousTab, 
            previousTab: null 
          })
        }
      },
      
      // Computed
      canGoBack: () => get().previousTab !== null,
    }),
    {
      name: 'navigation-store',
      partialize: (state) => ({
        currentDashboardTab: state.currentDashboardTab,
        currentAdminTab: state.currentAdminTab,
        currentSystemTab: state.currentSystemTab,
        showSidebar: state.showSidebar,
      })
    }
  )
)
