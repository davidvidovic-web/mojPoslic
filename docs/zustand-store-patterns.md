# Zustand Store Patterns and Migration Guide

## Overview

This document provides specific patterns and implementation examples for migrating the mojPoslić application's UI state from React's `useState` to Zustand stores. Based on our codebase analysis, we've identified key UI state patterns that should be centralized in Zustand stores.

## Core Store Architecture

### Store Categories

1. **Dialog Store** - Manages all dialog/modal open/close states
2. **Navigation Store** - Handles dashboard tab navigation and page routing
3. **Filter Store** - Centralizes all filter states (search, categories, etc.)
4. **UI Preferences Store** - Theme, layout preferences, and user settings
5. **Form State Store** - Multi-step form navigation and edit modes
6. **View State Store** - Pagination, view modes, and display preferences

## Store Implementations

### 1. Dialog Store (`src/stores/dialog-store.ts`)

```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface DialogState {
  // Dialog states
  isJobPostDialogOpen: boolean
  isEditJobDialogOpen: boolean
  isDeleteConfirmOpen: boolean
  isMobileMenuOpen: boolean
  isMessagingDialogOpen: boolean
  isConnectionPurchaseOpen: boolean
  
  // Data for dialogs
  editingJob: Job | null
  deletingJobId: string | null
  
  // Actions
  openJobPostDialog: () => void
  closeJobPostDialog: () => void
  openEditJobDialog: (job: Job) => void
  closeEditJobDialog: () => void
  openDeleteConfirm: (jobId: string) => void
  closeDeleteConfirm: () => void
  toggleMobileMenu: () => void
  closeMobileMenu: () => void
  openMessagingDialog: () => void
  closeMessagingDialog: () => void
  openConnectionPurchase: () => void
  closeConnectionPurchase: () => void
  
  // Bulk actions
  closeAllDialogs: () => void
}

export const useDialogStore = create<DialogState>((set, get) => ({
  // Initial state
  isJobPostDialogOpen: false,
  isEditJobDialogOpen: false,
  isDeleteConfirmOpen: false,
  isMobileMenuOpen: false,
  isMessagingDialogOpen: false,
  isConnectionPurchaseOpen: false,
  editingJob: null,
  deletingJobId: null,
  
  // Job posting dialog
  openJobPostDialog: () => set({ isJobPostDialogOpen: true }),
  closeJobPostDialog: () => set({ isJobPostDialogOpen: false }),
  
  // Edit job dialog
  openEditJobDialog: (job) => set({ 
    isEditJobDialogOpen: true, 
    editingJob: job 
  }),
  closeEditJobDialog: () => set({ 
    isEditJobDialogOpen: false, 
    editingJob: null 
  }),
  
  // Delete confirmation
  openDeleteConfirm: (jobId) => set({ 
    isDeleteConfirmOpen: true, 
    deletingJobId: jobId 
  }),
  closeDeleteConfirm: () => set({ 
    isDeleteConfirmOpen: false, 
    deletingJobId: null 
  }),
  
  // Mobile menu
  toggleMobileMenu: () => set(state => ({ 
    isMobileMenuOpen: !state.isMobileMenuOpen 
  })),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),
  
  // Messaging dialog
  openMessagingDialog: () => set({ isMessagingDialogOpen: true }),
  closeMessagingDialog: () => set({ isMessagingDialogOpen: false }),
  
  // Connection purchase
  openConnectionPurchase: () => set({ isConnectionPurchaseOpen: true }),
  closeConnectionPurchase: () => set({ isConnectionPurchaseOpen: false }),
  
  // Bulk close
  closeAllDialogs: () => set({
    isJobPostDialogOpen: false,
    isEditJobDialogOpen: false,
    isDeleteConfirmOpen: false,
    isMobileMenuOpen: false,
    isMessagingDialogOpen: false,
    isConnectionPurchaseOpen: false,
    editingJob: null,
    deletingJobId: null,
  }),
}))
```

### 2. Navigation Store (`src/stores/navigation-store.ts`)

```typescript
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
```

### 3. Filter Store (`src/stores/filter-store.ts`)

```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface FilterState {
  // Job filters
  jobSearch: string
  jobCityFilter: string
  jobCategoryFilter: string
  jobSubcategoryFilter: string
  jobTypeFilter: string
  isFiltersOpen: boolean
  
  // Admin filters
  userSearchTerm: string
  userRoleFilter: string
  jobSearchTerm: string
  transactionSearchTerm: string
  statusFilter: string
  actionFilter: string
  
  // Pagination
  currentPage: number
  itemsPerPage: number
  
  // View preferences
  viewMode: 'grid' | 'list'
  sortBy: string
  sortOrder: 'asc' | 'desc'
  
  // Actions - Job filters
  setJobSearch: (search: string) => void
  setJobCityFilter: (city: string) => void
  setJobCategoryFilter: (category: string) => void
  setJobSubcategoryFilter: (subcategory: string) => void
  setJobTypeFilter: (type: string) => void
  toggleFilters: () => void
  clearJobFilters: () => void
  
  // Actions - Admin filters
  setUserSearchTerm: (term: string) => void
  setUserRoleFilter: (role: string) => void
  setJobSearchTerm: (term: string) => void
  setTransactionSearchTerm: (term: string) => void
  setStatusFilter: (status: string) => void
  setActionFilter: (action: string) => void
  
  // Actions - Pagination & View
  setCurrentPage: (page: number) => void
  setItemsPerPage: (count: number) => void
  setViewMode: (mode: 'grid' | 'list') => void
  setSorting: (sortBy: string, order: 'asc' | 'desc') => void
  resetPagination: () => void
  
  // Computed getters
  hasActiveJobFilters: () => boolean
  hasActiveAdminFilters: () => boolean
  getJobFiltersCount: () => number
}

export const useFilterStore = create<FilterState>()(
  persist(
    (set, get) => ({
      // Initial state - Job filters
      jobSearch: '',
      jobCityFilter: 'all',
      jobCategoryFilter: 'all',
      jobSubcategoryFilter: 'all',
      jobTypeFilter: 'all',
      isFiltersOpen: false,
      
      // Initial state - Admin filters
      userSearchTerm: '',
      userRoleFilter: 'all',
      jobSearchTerm: '',
      transactionSearchTerm: '',
      statusFilter: 'all',
      actionFilter: 'all',
      
      // Initial state - Pagination & View
      currentPage: 1,
      itemsPerPage: 12,
      viewMode: 'grid',
      sortBy: 'date',
      sortOrder: 'desc',
      
      // Job filter actions
      setJobSearch: (search) => set({ jobSearch: search, currentPage: 1 }),
      setJobCityFilter: (city) => set({ jobCityFilter: city, currentPage: 1 }),
      setJobCategoryFilter: (category) => set({ 
        jobCategoryFilter: category, 
        jobSubcategoryFilter: 'all', // Reset subcategory when main category changes
        currentPage: 1 
      }),
      setJobSubcategoryFilter: (subcategory) => set({ 
        jobSubcategoryFilter: subcategory, 
        currentPage: 1 
      }),
      setJobTypeFilter: (type) => set({ jobTypeFilter: type, currentPage: 1 }),
      toggleFilters: () => set(state => ({ isFiltersOpen: !state.isFiltersOpen })),
      
      clearJobFilters: () => set({
        jobSearch: '',
        jobCityFilter: 'all',
        jobCategoryFilter: 'all',
        jobSubcategoryFilter: 'all',
        jobTypeFilter: 'all',
        currentPage: 1,
      }),
      
      // Admin filter actions
      setUserSearchTerm: (term) => set({ userSearchTerm: term, currentPage: 1 }),
      setUserRoleFilter: (role) => set({ userRoleFilter: role, currentPage: 1 }),
      setJobSearchTerm: (term) => set({ jobSearchTerm: term, currentPage: 1 }),
      setTransactionSearchTerm: (term) => set({ transactionSearchTerm: term, currentPage: 1 }),
      setStatusFilter: (status) => set({ statusFilter: status, currentPage: 1 }),
      setActionFilter: (action) => set({ actionFilter: action, currentPage: 1 }),
      
      // Pagination & View actions
      setCurrentPage: (page) => set({ currentPage: page }),
      setItemsPerPage: (count) => set({ itemsPerPage: count, currentPage: 1 }),
      setViewMode: (mode) => set({ viewMode: mode }),
      setSorting: (sortBy, order) => set({ sortBy, sortOrder: order, currentPage: 1 }),
      resetPagination: () => set({ currentPage: 1 }),
      
      // Computed getters
      hasActiveJobFilters: () => {
        const state = get()
        return state.jobSearch !== '' || 
               state.jobCityFilter !== 'all' || 
               state.jobCategoryFilter !== 'all' || 
               state.jobSubcategoryFilter !== 'all' || 
               state.jobTypeFilter !== 'all'
      },
      
      hasActiveAdminFilters: () => {
        const state = get()
        return state.userSearchTerm !== '' || 
               state.userRoleFilter !== 'all' || 
               state.jobSearchTerm !== '' || 
               state.transactionSearchTerm !== '' || 
               state.statusFilter !== 'all' || 
               state.actionFilter !== 'all'
      },
      
      getJobFiltersCount: () => {
        const state = get()
        let count = 0
        if (state.jobSearch !== '') count++
        if (state.jobCityFilter !== 'all') count++
        if (state.jobCategoryFilter !== 'all') count++
        if (state.jobSubcategoryFilter !== 'all') count++
        if (state.jobTypeFilter !== 'all') count++
        return count
      },
    }),
    {
      name: 'filter-store',
      partialize: (state) => ({
        // Persist user preferences
        itemsPerPage: state.itemsPerPage,
        viewMode: state.viewMode,
        sortBy: state.sortBy,
        sortOrder: state.sortOrder,
        isFiltersOpen: state.isFiltersOpen,
      })
    }
  )
)
```

### 4. UI Preferences Store (`src/stores/ui-preferences-store.ts`)

```typescript
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
```

### 5. Form State Store (`src/stores/form-state-store.ts`)

```typescript
import { create } from 'zustand'
import { JobFormStep } from '@/components/jobs/job-post-form/types'

interface FormStateStore {
  // Multi-step form state
  currentStep: JobFormStep
  completedSteps: JobFormStep[]
  stepValidations: Record<string, boolean>
  
  // Edit mode tracking
  editMode: boolean
  editingJobId: string | null
  hasUnsavedChanges: boolean
  
  // Form data cache
  formDataCache: Record<string, any>
  lastSaveTimestamp: number | null
  
  // Password visibility states
  showCurrentPassword: boolean
  showNewPassword: boolean
  showConfirmPassword: boolean
  
  // Skills/categories selection
  selectedSkills: string[]
  selectedCategories: string[]
  
  // Actions - Step navigation
  setCurrentStep: (step: JobFormStep) => void
  markStepCompleted: (step: JobFormStep) => void
  markStepIncomplete: (step: JobFormStep) => void
  setStepValidation: (step: string, isValid: boolean) => void
  resetSteps: () => void
  
  // Actions - Edit mode
  setEditMode: (enabled: boolean, jobId?: string | null) => void
  setHasUnsavedChanges: (hasChanges: boolean) => void
  
  // Actions - Form cache
  cacheFormData: (stepId: string, data: any) => void
  getCachedFormData: (stepId: string) => any
  clearFormCache: () => void
  saveFormProgress: () => void
  
  // Actions - Password visibility
  toggleCurrentPasswordVisibility: () => void
  toggleNewPasswordVisibility: () => void
  toggleConfirmPasswordVisibility: () => void
  hideAllPasswords: () => void
  
  // Actions - Selections
  addSkill: (skill: string) => void
  removeSkill: (skill: string) => void
  setSkills: (skills: string[]) => void
  addCategory: (category: string) => void
  removeCategory: (category: string) => void
  setCategories: (categories: string[]) => void
  
  // Computed getters
  canProceedToNext: () => boolean
  getCurrentStepIndex: () => number
  getTotalSteps: () => number
  getCompletionPercentage: () => number
}

export const useFormStateStore = create<FormStateStore>((set, get) => ({
  // Initial state
  currentStep: 'basic-info',
  completedSteps: [],
  stepValidations: {},
  editMode: false,
  editingJobId: null,
  hasUnsavedChanges: false,
  formDataCache: {},
  lastSaveTimestamp: null,
  showCurrentPassword: false,
  showNewPassword: false,
  showConfirmPassword: false,
  selectedSkills: [],
  selectedCategories: [],
  
  // Step navigation
  setCurrentStep: (step) => set({ currentStep: step }),
  
  markStepCompleted: (step) => set(state => ({
    completedSteps: state.completedSteps.includes(step) 
      ? state.completedSteps 
      : [...state.completedSteps, step]
  })),
  
  markStepIncomplete: (step) => set(state => ({
    completedSteps: state.completedSteps.filter(s => s !== step)
  })),
  
  setStepValidation: (step, isValid) => set(state => ({
    stepValidations: { ...state.stepValidations, [step]: isValid }
  })),
  
  resetSteps: () => set({
    currentStep: 'basic-info',
    completedSteps: [],
    stepValidations: {},
    formDataCache: {},
    hasUnsavedChanges: false,
  }),
  
  // Edit mode
  setEditMode: (enabled, jobId = null) => set({
    editMode: enabled,
    editingJobId: jobId,
    hasUnsavedChanges: false,
  }),
  
  setHasUnsavedChanges: (hasChanges) => set({ hasUnsavedChanges: hasChanges }),
  
  // Form cache
  cacheFormData: (stepId, data) => set(state => ({
    formDataCache: { ...state.formDataCache, [stepId]: data },
    lastSaveTimestamp: Date.now(),
  })),
  
  getCachedFormData: (stepId) => get().formDataCache[stepId] || null,
  
  clearFormCache: () => set({
    formDataCache: {},
    lastSaveTimestamp: null,
  }),
  
  saveFormProgress: () => set({ lastSaveTimestamp: Date.now() }),
  
  // Password visibility
  toggleCurrentPasswordVisibility: () => set(state => ({
    showCurrentPassword: !state.showCurrentPassword
  })),
  
  toggleNewPasswordVisibility: () => set(state => ({
    showNewPassword: !state.showNewPassword
  })),
  
  toggleConfirmPasswordVisibility: () => set(state => ({
    showConfirmPassword: !state.showConfirmPassword
  })),
  
  hideAllPasswords: () => set({
    showCurrentPassword: false,
    showNewPassword: false,
    showConfirmPassword: false,
  }),
  
  // Selections
  addSkill: (skill) => set(state => ({
    selectedSkills: state.selectedSkills.includes(skill)
      ? state.selectedSkills
      : [...state.selectedSkills, skill]
  })),
  
  removeSkill: (skill) => set(state => ({
    selectedSkills: state.selectedSkills.filter(s => s !== skill)
  })),
  
  setSkills: (skills) => set({ selectedSkills: skills }),
  
  addCategory: (category) => set(state => ({
    selectedCategories: state.selectedCategories.includes(category)
      ? state.selectedCategories
      : [...state.selectedCategories, category]
  })),
  
  removeCategory: (category) => set(state => ({
    selectedCategories: state.selectedCategories.filter(c => c !== category)
  })),
  
  setCategories: (categories) => set({ selectedCategories: categories }),
  
  // Computed getters
  canProceedToNext: () => {
    const state = get()
    const currentStepValid = state.stepValidations[state.currentStep]
    return currentStepValid !== false // Allow if not explicitly false
  },
  
  getCurrentStepIndex: () => {
    const steps: JobFormStep[] = ['basic-info', 'basic-details', 'extended-details', 'review']
    return steps.indexOf(get().currentStep)
  },
  
  getTotalSteps: () => 4,
  
  getCompletionPercentage: () => {
    const state = get()
    const totalSteps = state.getTotalSteps()
    const completedCount = state.completedSteps.length
    return Math.round((completedCount / totalSteps) * 100)
  },
}))
```

## Migration Strategy by Component

### Phase 1: High-Impact Dialog Components

1. **Header Component**
   ```typescript
   // Before: Multiple useState for dialogs
   const [isDialogOpen, setIsDialogOpen] = useState(false)
   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
   
   // After: Single Zustand store
   const { 
     isJobPostDialogOpen, 
     isMobileMenuOpen, 
     openJobPostDialog, 
     closeMobileMenu 
   } = useDialogStore()
   ```

2. **Dashboard Components**
   ```typescript
   // Before: Complex tab state management
   const activeTab = getActiveSection()
   const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
   
   // After: Centralized navigation and dialog state
   const { currentDashboardTab, setDashboardTab } = useNavigationStore()
   const { isEditJobDialogOpen, openEditJobDialog } = useDialogStore()
   ```

### Phase 2: Filter and Search Components

1. **Job Filters Component**
   ```typescript
   // Before: Multiple filter states
   const [searchTerm, setSearchTerm] = useState("")
   const [cityFilter, setCityFilter] = useState("all")
   const [categoryFilter, setCategoryFilter] = useState("all")
   
   // After: Centralized filter store
   const {
     jobSearch,
     jobCityFilter,
     jobCategoryFilter,
     setJobSearch,
     setJobCityFilter,
     clearJobFilters,
     hasActiveJobFilters
   } = useFilterStore()
   ```

### Phase 3: Form and Preferences

1. **Multi-step Forms**
   ```typescript
   // Before: Complex form state
   const [currentStep, setCurrentStep] = useState('basic-info')
   const [completedSteps, setCompletedSteps] = useState([])
   
   // After: Form state store
   const {
     currentStep,
     completedSteps,
     setCurrentStep,
     markStepCompleted,
     canProceedToNext
   } = useFormStateStore()
   ```

2. **Theme and Preferences**
   ```typescript
   // Before: Scattered preference state
   const { theme, setTheme } = useTheme()
   
   // After: Unified preferences store
   const {
     theme,
     sidebarCollapsed,
     autoRefreshJobs,
     setTheme,
     toggleSidebarCollapsed
   } = useUIPreferencesStore()
   ```

## Integration with TanStack Query

Zustand stores work seamlessly with TanStack Query:

```typescript
// In a component
const { jobSearch, jobCityFilter } = useFilterStore()
const { data: jobs, refetch } = useJobsQuery({
  search: jobSearch,
  city: jobCityFilter
})

// Auto-refetch when filters change
useEffect(() => {
  refetch()
}, [jobSearch, jobCityFilter, refetch])
```

## Testing Patterns

### Store Testing

```typescript
// Example test for dialog store
import { renderHook, act } from '@testing-library/react'
import { useDialogStore } from '@/stores/dialog-store'

describe('Dialog Store', () => {
  test('should open and close job post dialog', () => {
    const { result } = renderHook(() => useDialogStore())
    
    act(() => {
      result.current.openJobPostDialog()
    })
    
    expect(result.current.isJobPostDialogOpen).toBe(true)
    
    act(() => {
      result.current.closeJobPostDialog()
    })
    
    expect(result.current.isJobPostDialogOpen).toBe(false)
  })
})
```

## Performance Optimizations

### Selective Subscriptions

```typescript
// Only subscribe to specific store slices
const isDialogOpen = useDialogStore(state => state.isJobPostDialogOpen)
const openDialog = useDialogStore(state => state.openJobPostDialog)

// Prevents re-renders when other dialog states change
```

### Store Slicing

```typescript
// Create focused selectors
const useJobFilters = () => useFilterStore(state => ({
  search: state.jobSearch,
  city: state.jobCityFilter,
  category: state.jobCategoryFilter,
  setSearch: state.setJobSearch,
  setCCity: state.setJobCityFilter,
  clear: state.clearJobFilters,
}))
```

## Migration Checklist

### Immediate Migration (Week 1)
- [ ] Install Zustand: `npm install zustand`
- [ ] Create dialog store
- [ ] Migrate Header component dialogs
- [ ] Migrate mobile menu state

### Short Term (Week 2-3)
- [ ] Create navigation store
- [ ] Migrate dashboard tab navigation
- [ ] Create filter store
- [ ] Migrate job list filters

### Medium Term (Week 4-6)
- [ ] Create UI preferences store
- [ ] Migrate theme and layout preferences
- [ ] Create form state store
- [ ] Migrate multi-step forms

### Testing & Validation
- [ ] Write store unit tests
- [ ] Test component integration
- [ ] Validate performance improvements
- [ ] User testing for UX regressions

## Benefits of This Architecture

1. **Predictable State**: Centralized state management
2. **Type Safety**: Full TypeScript support
3. **Performance**: Selective subscriptions prevent unnecessary re-renders
4. **Persistence**: Automatic local storage sync for user preferences
5. **Testability**: Stores can be tested independently
6. **DevTools**: Excellent debugging experience
7. **Scalability**: Easy to add new UI state as the app grows

This migration will significantly improve the maintainability and performance of the mojPoslić application's UI state management.
