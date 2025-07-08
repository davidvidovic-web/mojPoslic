# mojPoslić State Management Upgrade Plan
## TanStack Query + Zustand Implementation

---

## 🎯 **Executive Summary**

This document outlines a comprehensive upgrade plan to implement **TanStack Query + Zustand** for state management in the mojPoslić application. The upgrade will solve current pain points around job refresh, context complexity, and provide better developer experience with minimal breaking changes.

---

## 📊 **Current State Analysis**

### **Existing Architecture**
```
Current Stack:
├── Context API (4 contexts)
│   ├── auth-context.tsx (✅ Good)
│   ├── data-context.tsx (🔄 Needs optimization)
│   ├── messaging-context.tsx (✅ Good)
│   └── jobs-context.tsx (🔄 Replace with TanStack Query)
├── Local State (useState/useReducer)
├── Manual API calls (fetch)
└── Custom caching (localStorage)
```

### **Pain Points Identified**
1. **Job List Refresh**: Manual refresh triggers, not automatic
2. **Cache Management**: Custom localStorage implementation
3. **State Synchronization**: Multiple contexts need coordination
4. **Performance**: Re-fetching data unnecessarily
5. **Developer Experience**: Verbose context setup

### **What's Working Well**
- ✅ Auth context with NextAuth.js integration
- ✅ Messaging context with real-time features
- ✅ Component architecture and UI consistency
- ✅ TypeScript implementation
- ✅ No infinite re-render loops (recently fixed)

---

## 🎯 **Upgrade Objectives**

### **Primary Goals**
1. **Automatic Job Refresh** - Jobs appear immediately after posting
2. **Better Caching** - Smart cache invalidation and background updates
3. **Simplified State** - Reduce context complexity
4. **Performance** - Faster data loading and optimistic updates
5. **Developer Experience** - Less boilerplate, better DevTools

### **Success Metrics**
- ✅ Job posts trigger immediate UI updates across all views
- ✅ Reduced API calls through intelligent caching
- ✅ Faster page loads (cached data)
- ✅ Better error handling and loading states
- ✅ Maintainable codebase with less context boilerplate

---

## 🏗️ **Implementation Plan**

### **Phase 1: Foundation Setup** (Week 1)
```bash
# Dependencies already installed ✅
@tanstack/react-query: "^5.81.5"

# Add Zustand
npm install zustand
```

#### **1.1 Query Client Setup**
```tsx
// src/lib/query-client.ts
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error) => {
        if (error?.status === 404) return false
        return failureCount < 2
      },
    },
    mutations: {
      retry: 1,
    },
  },
})
```

#### **1.2 Root Layout Integration**
```tsx
// src/app/layout.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

// Add QueryClientProvider above existing providers
<QueryClientProvider client={queryClient}>
  <SessionProvider>
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          {children}
          <ReactQueryDevtools initialIsOpen={false} />
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  </SessionProvider>
</QueryClientProvider>
```

### **Phase 2: Core Queries Implementation** (Week 1-2)

#### **2.1 Jobs Queries**
```tsx
// src/hooks/queries/use-jobs.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const JOBS_QUERY_KEY = ['jobs']

export function useJobs(filters?: JobFilters) {
  return useQuery({
    queryKey: [...JOBS_QUERY_KEY, filters],
    queryFn: () => fetchJobs(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes for fresh job data
  })
}

export function usePostJob() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: postJob,
    onMutate: async (newJob) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: JOBS_QUERY_KEY })
      const previousJobs = queryClient.getQueryData(JOBS_QUERY_KEY)
      
      queryClient.setQueryData(JOBS_QUERY_KEY, old => [newJob, ...old])
      return { previousJobs }
    },
    onError: (err, newJob, context) => {
      // Rollback on error
      queryClient.setQueryData(JOBS_QUERY_KEY, context.previousJobs)
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: JOBS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ['user', 'jobs'] })
    },
  })
}
```

#### **2.2 Categories & Cities Queries**
```tsx
// src/hooks/queries/use-data.ts
export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    gcTime: 7 * 24 * 60 * 60 * 1000, // 7 days
  })
}

export function useCities() {
  return useQuery({
    queryKey: ['cities'],
    queryFn: fetchCities,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    gcTime: 7 * 24 * 60 * 60 * 1000, // 7 days
  })
}
```

### **Phase 3: Zustand Store Setup** (Week 2)

#### **3.1 UI State Store**
```tsx
// src/stores/ui-store.ts
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface UIState {
  // Navigation
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  
  // Dialogs
  jobPostDialogOpen: boolean
  setJobPostDialogOpen: (open: boolean) => void
  
  // Filters
  activeJobFilters: JobFilters
  setJobFilters: (filters: JobFilters) => void
  
  // View preferences
  jobViewMode: 'list' | 'grid'
  setJobViewMode: (mode: 'list' | 'grid') => void
}

export const useUIStore = create<UIState>()(
  devtools(
    (set) => ({
      sidebarOpen: false,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      
      jobPostDialogOpen: false,
      setJobPostDialogOpen: (open) => set({ jobPostDialogOpen: open }),
      
      activeJobFilters: {},
      setJobFilters: (filters) => set({ activeJobFilters: filters }),
      
      jobViewMode: 'list',
      setJobViewMode: (mode) => set({ jobViewMode: mode }),
    }),
    { name: 'ui-store' }
  )
)
```

#### **3.2 User Preferences Store**
```tsx
// src/stores/user-store.ts
interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  language: string
  notifications: {
    email: boolean
    push: boolean
    newJobs: boolean
  }
  dashboard: {
    layout: 'compact' | 'comfortable'
    showStats: boolean
  }
}

export const useUserStore = create<UserPreferences>()(
  devtools(
    persist(
      (set) => ({
        theme: 'system',
        language: 'en',
        notifications: {
          email: true,
          push: false,
          newJobs: true,
        },
        dashboard: {
          layout: 'comfortable',
          showStats: true,
        },
        // Actions
        setTheme: (theme) => set({ theme }),
        updateNotifications: (notifications) => set({ notifications }),
        updateDashboard: (dashboard) => set({ dashboard }),
      }),
      { name: 'user-preferences' }
    )
  )
)
```

### **Phase 4: Migration Strategy** (Week 2-3)

#### **4.1 Context Migration Priority**

1. **Keep As-Is** ✅
   - `auth-context.tsx` - Works well with NextAuth
   - `messaging-context.tsx` - Real-time features, complex state

2. **Migrate to TanStack Query** 🔄
   - `data-context.tsx` → `use-categories.ts` + `use-cities.ts`
   - `jobs-context.tsx` → `use-jobs.ts` + various job queries

3. **Migrate to Zustand** 🔄
   - UI state scattered across components
   - User preferences and settings

#### **4.2 Component Update Strategy**

```tsx
// Before: Manual job refresh
const JobList = ({ refreshTrigger }) => {
  const [jobs, setJobs] = useState([])
  
  useEffect(() => {
    fetchJobs().then(setJobs)
  }, [refreshTrigger])
  
  // ...
}

// After: Automatic with TanStack Query
const JobList = ({ filters }) => {
  const { data: jobs, isLoading, error } = useJobs(filters)
  
  // Automatically refreshes when cache is invalidated
  // ...
}
```

#### **4.3 Form Integration**

```tsx
// Before: Manual callback
const handleJobPosted = () => {
  setIsDialogOpen(false)
  router.refresh() // ❌ Page reload
}

// After: Automatic cache invalidation
const handleJobPosted = () => {
  setIsDialogOpen(false)
  // ✅ All job lists automatically update
}

const { mutate: postJob } = usePostJob()
```

### **Phase 5: Advanced Features** (Week 3-4)

#### **5.1 Background Sync**
```tsx
// Auto-refresh jobs every 30 seconds when tab is visible
export function useJobs(filters?: JobFilters) {
  return useQuery({
    queryKey: [...JOBS_QUERY_KEY, filters],
    queryFn: () => fetchJobs(filters),
    refetchInterval: 30 * 1000,
    refetchIntervalInBackground: false,
  })
}
```

#### **5.2 Optimistic Updates**
```tsx
// Job applications with instant feedback
export function useApplyToJob() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: applyToJob,
    onMutate: async ({ jobId }) => {
      // Instantly show "Applied" state
      queryClient.setQueryData(['job', jobId], old => ({
        ...old,
        hasApplied: true,
        applicationsCount: old.applicationsCount + 1
      }))
    },
    // Error handling...
  })
}
```

#### **5.3 Infinite Queries**
```tsx
// Pagination for large datasets
export function useInfiniteJobs(filters?: JobFilters) {
  return useInfiniteQuery({
    queryKey: [...JOBS_QUERY_KEY, 'infinite', filters],
    queryFn: ({ pageParam = 1 }) => fetchJobsPage(filters, pageParam),
    getNextPageParam: (lastPage) => lastPage.nextPage,
  })
}
```

---

## 🗂️ **File Structure Changes**

### **New Files to Create**
```
src/
├── lib/
│   ├── query-client.ts              # Query client configuration
│   └── query-keys.ts                # Centralized query key factory
├── hooks/
│   ├── queries/
│   │   ├── use-jobs.ts              # Job-related queries
│   │   ├── use-data.ts              # Categories/cities queries
│   │   ├── use-user.ts              # User profile queries
│   │   └── use-stats.ts             # Statistics queries
│   └── mutations/
│       ├── use-job-mutations.ts     # Job CRUD mutations
│       └── use-user-mutations.ts    # User update mutations
├── stores/
│   ├── ui-store.ts                  # UI state (Zustand)
│   ├── user-store.ts                # User preferences (Zustand)
│   └── filters-store.ts             # Filter state (Zustand)
└── services/
    ├── api-client.ts                # Centralized API client
    ├── jobs-service.ts              # Job API functions
    └── user-service.ts              # User API functions
```

### **Files to Modify**
```
src/
├── app/layout.tsx                   # Add QueryClientProvider
├── components/
│   ├── jobs/job-list.tsx            # Use useJobs() hook
│   ├── jobs/job-post-form/          # Use usePostJob() mutation
│   ├── dashboard/                   # Update all dashboard components
│   └── core/header.tsx              # Use usePostJob() mutation
└── contexts/
    ├── data-context.tsx             # ⚠️ Deprecate gradually
    └── jobs-context.tsx             # ⚠️ Remove after migration
```

### **Files to Keep**
```
src/contexts/
├── auth-context.tsx                 # ✅ Keep - works well
├── messaging-context.tsx           # ✅ Keep - complex real-time state
└── prisma-auth-context.tsx         # ✅ Keep - fallback auth
```

---

## 🔄 **Migration Timeline**

### **Week 1: Foundation**
- [ ] Install Zustand
- [ ] Set up Query Client
- [ ] Create basic query hooks
- [ ] Update layout with providers

### **Week 2: Core Migration**
- [ ] Migrate JobList to useJobs()
- [ ] Migrate job posting forms to usePostJob()
- [ ] Create Zustand stores for UI state
- [ ] Update header job posting

### **Week 3: Dashboard Migration**
- [ ] Update all dashboard components
- [ ] Migrate categories/cities to queries
- [ ] Add optimistic updates
- [ ] Background sync implementation

### **Week 4: Polish & Testing**
- [ ] Remove old context files
- [ ] Add React Query DevTools
- [ ] Performance optimization
- [ ] Error boundary improvements
- [ ] Documentation updates

---

## 🧪 **Testing Strategy**

### **Unit Tests**
```tsx
// Test query hooks
import { renderHook } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useJobs } from '../hooks/queries/use-jobs'

test('useJobs returns job data', async () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  })
  
  const wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
  
  const { result } = renderHook(() => useJobs(), { wrapper })
  
  await waitFor(() => {
    expect(result.current.isSuccess).toBe(true)
  })
})
```

### **Integration Tests**
- [ ] Job posting workflow
- [ ] Cache invalidation behavior
- [ ] Error handling scenarios
- [ ] Optimistic update rollbacks

### **Performance Tests**
- [ ] Measure API call reduction
- [ ] Cache hit ratio
- [ ] Bundle size impact
- [ ] Runtime performance

---

## 🔒 **Risk Mitigation**

### **Potential Risks**
1. **Breaking Changes** - Major refactor might introduce bugs
2. **Learning Curve** - Team needs to learn new patterns
3. **Bundle Size** - Additional dependencies
4. **Migration Complexity** - Complex state dependencies

### **Mitigation Strategies**
1. **Gradual Migration** - Keep old and new systems running in parallel
2. **Feature Flags** - Toggle between old/new implementations
3. **Comprehensive Testing** - Automated tests for critical paths
4. **Rollback Plan** - Keep git commits atomic for easy reversion

### **Rollback Plan**
```bash
# Each phase is a separate PR that can be reverted
git revert <phase-3-commit>  # Revert Zustand implementation
git revert <phase-2-commit>  # Revert TanStack Query migration
git revert <phase-1-commit>  # Revert foundation setup
```

---

## 📈 **Expected Benefits**

### **Immediate (Week 1-2)**
- ✅ Automatic job list refresh
- ✅ Better loading states
- ✅ Error handling improvements
- ✅ Developer experience with DevTools

### **Medium-term (Week 3-4)**
- ✅ Reduced API calls (caching)
- ✅ Faster page loads
- ✅ Optimistic updates
- ✅ Background data sync

### **Long-term (Month 2+)**
- ✅ Easier feature development
- ✅ Better performance monitoring
- ✅ Simpler state management
- ✅ More maintainable codebase

---

## 🛠️ **Development Guidelines**

### **Query Key Conventions**
```tsx
// src/lib/query-keys.ts
export const queryKeys = {
  jobs: ['jobs'] as const,
  job: (id: string) => ['jobs', id] as const,
  jobsByUser: (userId: string) => ['jobs', 'user', userId] as const,
  categories: ['categories'] as const,
  cities: ['cities'] as const,
  user: (id: string) => ['user', id] as const,
  userProfile: (id: string) => ['user', id, 'profile'] as const,
}
```

### **Error Handling**
```tsx
// Global error boundary for query errors
export function QueryErrorBoundary({ children }) {
  return (
    <ErrorBoundary
      fallback={<ErrorFallback />}
      onError={(error) => {
        if (error.name === 'ChunkLoadError') {
          window.location.reload()
        }
      }}
    >
      {children}
    </ErrorBoundary>
  )
}
```

### **Cache Management**
```tsx
// Centralized cache invalidation
export const cacheUtils = {
  invalidateJobs: () => queryClient.invalidateQueries({ queryKey: queryKeys.jobs }),
  invalidateUser: (userId: string) => queryClient.invalidateQueries({ queryKey: queryKeys.user(userId) }),
  clearAll: () => queryClient.clear(),
}
```

---

## 📋 **Implementation Checklist**

### **Phase 1: Foundation**
- [ ] Install dependencies
- [ ] Configure QueryClient
- [ ] Update layout with providers
- [ ] Add TypeScript types
- [ ] Basic query hooks structure

### **Phase 2: Core Features**
- [ ] Jobs query hook
- [ ] Job posting mutation
- [ ] Categories/Cities queries
- [ ] Update JobList component
- [ ] Update job posting forms

### **Phase 3: Advanced Features**
- [ ] Zustand stores
- [ ] Optimistic updates
- [ ] Background sync
- [ ] Infinite queries
- [ ] Cache invalidation strategies

### **Phase 4: Migration & Cleanup**
- [ ] Remove old context files
- [ ] Update all components
- [ ] Add error boundaries
- [ ] Performance optimization
- [ ] Documentation

### **Phase 5: Testing & Polish**
- [ ] Unit tests
- [ ] Integration tests
- [ ] Performance testing
- [ ] User acceptance testing
- [ ] Production deployment

---

## 🎉 **Success Criteria**

At the end of this upgrade, we should achieve:

1. **✅ Instant Job Updates**: Jobs appear immediately after posting without manual refresh
2. **✅ Better Performance**: Reduced API calls and faster loading
3. **✅ Improved DX**: Better debugging with React Query DevTools
4. **✅ Cleaner Code**: Less context boilerplate, more maintainable
5. **✅ Robust Error Handling**: Better user experience with errors
6. **✅ Future-Ready**: Foundation for advanced features like real-time updates

---

## 🤝 **Team Coordination**

### **Roles & Responsibilities**
- **Lead Developer**: Overall architecture and complex migrations
- **Frontend Developer**: Component updates and UI state management
- **QA Engineer**: Testing strategy and validation
- **Product Owner**: Feature prioritization and acceptance criteria

### **Communication Plan**
- **Daily Standups**: Progress updates and blockers
- **Weekly Reviews**: Demo new features and gather feedback
- **Documentation**: Keep this document updated with actual progress
- **Code Reviews**: Focus on patterns and consistency

---

*This document will be updated as the implementation progresses. The goal is to make this upgrade smooth, safe, and beneficial for the entire team and user base.*
