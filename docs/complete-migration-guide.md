# Complete TanStack Query + Zustand Migration Implementation Guide

## Overview

This comprehensive guide provides step-by-step implementation instructions for migrating mojPoslić from Context API to TanStack Query + Zustand. This migration will improve performance, developer experience, and maintainability.

## Architecture Summary

### State Management Split
- **TanStack Query**: Server state (jobs, users, categories, cities, stats)
- **Zustand**: Client/UI state (dialogs, navigation, filters, preferences, forms)
- **React Context**: Authentication and messaging (real-time features)

### Benefits
1. **Performance**: Automatic caching, background updates, optimistic mutations
2. **DX**: Better TypeScript support, DevTools, easier testing
3. **Maintainability**: Clear separation of concerns, predictable state updates
4. **UX**: Instant UI feedback, background sync, offline resilience

## Phase 1: Foundation Setup (Week 1)

### Step 1: Install Dependencies

```bash
# TanStack Query is already installed
npm install zustand

# Optional: Dev tools for debugging
npm install @tanstack/react-query-devtools
```

### Step 2: Update Root Layout

```tsx
// src/app/layout.tsx
'use client'

import type { Metadata } from "next";
import React from "react";
import { Manrope } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { AuthProvider } from "@/contexts/auth-context";
import { MessagingProvider } from "@/contexts/messaging-context";
import { Header } from "@/components/core/header";
import { Toaster } from "sonner";
import { QueryErrorBoundary } from "@/components/error-boundary";
import { queryClient } from '@/lib/query-client'
import Script from "next/script";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-Z17WLM3N7R"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-Z17WLM3N7R');
          `}
        </Script>
      </head>
      <body className={`${manrope.variable} font-sans antialiased`}>
        <SessionProvider>
          <QueryClientProvider client={queryClient}>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <QueryErrorBoundary>
                <AuthProvider>
                  <MessagingProvider>
                    <div className="min-h-screen bg-background">
                      <Toaster 
                        position="top-right" 
                        richColors={false}
                        closeButton
                        duration={4000}
                        theme="system"
                        toastOptions={{
                          style: {
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: '500',
                          },
                          className: 'toast-custom',
                        }}
                      />
                      <Header />
                      <main className="pt-20">
                        {children}
                      </main>
                    </div>
                  </MessagingProvider>
                </AuthProvider>
              </QueryErrorBoundary>
            </ThemeProvider>
            <ReactQueryDevtools initialIsOpen={false} />
          </QueryClientProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
```

### Step 3: Create API Layer

```typescript
// src/lib/api.ts
class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `/api${endpoint}`
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error' }))
    throw new ApiError(
      error.message || `HTTP ${response.status}`,
      response.status,
      error.code
    )
  }

  return response.json()
}

// Job API functions
export const jobsApi = {
  getJobs: (filters: JobFilters): Promise<PaginatedResponse<Job>> =>
    apiRequest(`/jobs?${new URLSearchParams(filters as any)}`),
    
  getJob: (id: string): Promise<Job> =>
    apiRequest(`/jobs/${id}`),
    
  createJob: (data: CreateJobData): Promise<Job> =>
    apiRequest('/jobs', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    
  updateJob: (id: string, data: UpdateJobData): Promise<Job> =>
    apiRequest(`/jobs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    
  deleteJob: (id: string): Promise<void> =>
    apiRequest(`/jobs/${id}`, { method: 'DELETE' }),
}

// Export other API functions...
```

## Phase 2: Core Migration (Week 2-3)

### Step 4: Migrate Header Component

```tsx
// src/components/core/header.tsx
"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { MultiStepJobForm } from "@/components/jobs/job-post-form/multi-step-job-form";
import { useAuth } from "@/contexts/auth-context";
import { useDialogStore } from "@/stores/dialog-store";
import { ThemeToggleButton } from "@/components/core/theme-toggle-button";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus,
  LogIn,
  LogOut,
  User,
  Settings,
  LayoutDashboard,
  Menu,
  X,
} from "lucide-react";

export function Header() {
  const { loading, user, signOut } = useAuth();
  const pathname = usePathname();
  
  // Use Zustand stores instead of local state
  const { 
    isJobPostDialogOpen, 
    isMobileMenuOpen,
    openJobPostDialog,
    closeJobPostDialog,
    toggleMobileMenu,
    closeMobileMenu 
  } = useDialogStore();

  const handleJobPosted = () => {
    closeJobPostDialog();
    // TanStack Query will handle the refresh automatically
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 shadow-sm border-b border-border/40">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-foreground">
            mojPoslić
          </Link>

          <div className="flex items-center gap-4">
            {loading ? (
              <div className="animate-pulse">
                <div className="h-8 w-24 bg-gray-200 rounded"></div>
              </div>
            ) : !user ? (
              <div className="flex items-center gap-2">
                <Link href="/auth/signin">
                  <Button variant="outline">
                    <LogIn className="h-4 w-4 mr-2" />
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Register
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                {/* Post Job Button */}
                <Button 
                  onClick={openJobPostDialog}
                  className="bg-foreground hover:bg-foreground/80"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Post Job
                </Button>

                {/* Mobile Menu Trigger */}
                <div className="md:hidden">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleMobileMenu}
                  >
                    <Menu className="h-7 w-7" />
                  </Button>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                  <div className="fixed inset-0 z-[60] bg-background md:hidden">
                    <div className="flex h-full flex-col">
                      <div className="flex items-center justify-between p-4 border-b">
                        <h2 className="text-lg font-semibold">Menu</h2>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={closeMobileMenu}
                        >
                          <X className="h-7 w-7" />
                        </Button>
                      </div>
                      
                      <div className="flex-1 px-6 py-8">
                        <nav className="space-y-6">
                          <Link
                            href="/dashboard"
                            onClick={closeMobileMenu}
                          >
                            <LayoutDashboard className="mr-4 h-6 w-6" />
                            Dashboard
                          </Link>
                          
                          <Link
                            href="/settings"
                            onClick={closeMobileMenu}
                          >
                            <Settings className="mr-4 h-6 w-6" />
                            Settings
                          </Link>

                          <ThemeToggleButton 
                            className="text-lg font-medium"
                            iconClassName="h-6 w-6"
                          />

                          <button
                            onClick={() => {
                              closeMobileMenu();
                              handleSignOut();
                            }}
                            className="flex items-center py-4 text-lg font-medium text-destructive"
                          >
                            <LogOut className="mr-4 h-6 w-6" />
                            Sign Out
                          </button>
                        </nav>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Job Post Dialog */}
      <Dialog open={isJobPostDialogOpen} onOpenChange={closeJobPostDialog}>
        <DialogContent className="max-w-[95vw] w-full max-h-[90vh] overflow-y-auto xl:max-w-6xl 2xl:max-w-7xl">
          <DialogHeader>
            <DialogTitle>Post a Job - Free & Easy</DialogTitle>
          </DialogHeader>
          <MultiStepJobForm
            onJobPosted={handleJobPosted}
            showCard={false}
          />
        </DialogContent>
      </Dialog>
    </header>
  );
}
```

### Step 5: Migrate Job List Component

```tsx
// src/components/jobs/job-list.tsx
'use client'

import { useJobsQuery } from '@/hooks/queries/use-jobs'
import { useFilterStore } from '@/stores/filter-store'
import { JobCard } from './job-card'
import { JobCardSkeleton } from './job-card-skeleton'
import { JobsEmptyState } from './job-list/jobs-empty-state'
import { JobFilters } from './job-list/job-filters'
import { JobsPagination } from './job-list/jobs-pagination'

export function JobList() {
  const {
    jobSearch,
    jobCityFilter,
    jobCategoryFilter,
    jobSubcategoryFilter,
    jobTypeFilter,
    currentPage,
    itemsPerPage,
    hasActiveJobFilters,
  } = useFilterStore()

  const filters = {
    search: jobSearch || undefined,
    city: jobCityFilter !== 'all' ? jobCityFilter : undefined,
    category: jobCategoryFilter !== 'all' ? jobCategoryFilter : undefined,
    subcategory: jobSubcategoryFilter !== 'all' ? jobSubcategoryFilter : undefined,
    type: jobTypeFilter !== 'all' ? jobTypeFilter : undefined,
    page: currentPage,
    limit: itemsPerPage,
  }

  const {
    data,
    isLoading,
    isError,
    error,
    isFetching,
  } = useJobsQuery(filters)

  const jobs = data?.data || []
  const totalJobs = data?.total || 0
  const totalPages = Math.ceil(totalJobs / itemsPerPage)

  if (isError) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error loading jobs: {error?.message}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <JobFilters />
      
      {/* Loading indicator */}
      {isFetching && (
        <div className="text-center py-2">
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            Updating jobs...
          </div>
        </div>
      )}
      
      {/* Job count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {isLoading ? (
            'Loading jobs...'
          ) : (
            <>
              Showing {jobs.length} of {totalJobs} jobs
              {hasActiveJobFilters() && ' (filtered)'}
            </>
          )}
        </p>
      </div>
      
      {/* Job grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 9 }).map((_, i) => (
            <JobCardSkeleton key={i} />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <JobsEmptyState hasFilters={hasActiveJobFilters()} />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <JobsPagination
              currentPage={currentPage}
              totalPages={totalPages}
            />
          )}
        </>
      )}
    </div>
  )
}
```

### Step 6: Migrate Job Filters Component

```tsx
// src/components/jobs/job-list/job-filters.tsx
'use client'

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { CitiesFilter } from "@/components/filters/cities-filter"
import { CategoriesFilter } from "@/components/filters/categories-filter"
import { useFilterStore } from "@/stores/filter-store"
import { Search, ChevronDown, Filter, X } from "lucide-react"

export function JobFilters() {
  const {
    jobSearch,
    jobCityFilter,
    jobCategoryFilter,
    jobSubcategoryFilter,
    jobTypeFilter,
    isFiltersOpen,
    setJobSearch,
    setJobCityFilter,
    setJobCategoryFilter,
    setJobSubcategoryFilter,
    setJobTypeFilter,
    toggleFilters,
    clearJobFilters,
    hasActiveJobFilters,
    getJobFiltersCount,
  } = useFilterStore()

  const activeFiltersCount = getJobFiltersCount()

  return (
    <div className="bg-card rounded-xl p-6 shadow-sm border-border/40">
      {/* Search Bar - Always Visible */}
      <div className="flex flex-col gap-4">
        <div className="flex-1 relative">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
            <Search className="h-4 w-4" />
          </span>
          <Input
            placeholder="Search jobs, companies, skills, or categories..."
            value={jobSearch}
            onChange={(e) => setJobSearch(e.target.value)}
            className="pl-10 border-border/50"
          />
        </div>

        {/* Filter Toggle Button */}
        <div className="flex items-center justify-between">
          <Collapsible open={isFiltersOpen} onOpenChange={toggleFilters}>
            <CollapsibleTrigger asChild>
              <Button 
                variant="outline" 
                className="justify-between border-border/50"
              >
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <span>Filters</span>
                  {activeFiltersCount > 0 && (
                    <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                      {activeFiltersCount}
                    </span>
                  )}
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform ${isFiltersOpen ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="mt-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <CitiesFilter
                  value={jobCityFilter}
                  onChange={setJobCityFilter}
                  placeholder="All locations"
                  className="sm:w-64"
                />
                
                <CategoriesFilter
                  value={jobCategoryFilter}
                  onChange={(value) => {
                    setJobCategoryFilter(value)
                    // Reset subcategory when main category changes
                    if (value === 'all') {
                      setJobSubcategoryFilter('all')
                    }
                  }}
                  placeholder="All categories"
                  className="sm:w-64"
                  showSubcategories={true}
                  subcategoryValue={jobSubcategoryFilter}
                  onSubcategoryChange={setJobSubcategoryFilter}
                />
                
                <Select value={jobTypeFilter} onValueChange={setJobTypeFilter}>
                  <SelectTrigger className="sm:w-48 border-border/50">
                    <SelectValue placeholder="Job Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="quick-job">Quick Job</SelectItem>
                    <SelectItem value="full-time">Full Time</SelectItem>
                    <SelectItem value="part-time">Part Time</SelectItem>
                    <SelectItem value="remote">Remote</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Clear Filters Button */}
          {hasActiveJobFilters() && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearJobFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
```

## Phase 3: Advanced Features (Week 4-5)

### Step 7: Create Job Manager Hook

```typescript
// src/hooks/use-job-manager.ts
import { useJobsQuery, useCreateJobMutation, useUpdateJobMutation, useDeleteJobMutation } from '@/hooks/queries/use-jobs'
import { useFilterStore } from '@/stores/filter-store'
import { useDialogStore } from '@/stores/dialog-store'

export function useJobManager() {
  const { 
    jobSearch, 
    jobCityFilter, 
    jobCategoryFilter, 
    jobSubcategoryFilter, 
    jobTypeFilter,
    currentPage,
    itemsPerPage 
  } = useFilterStore()
  
  const { closeJobPostDialog, closeEditJobDialog } = useDialogStore()
  
  const filters = {
    search: jobSearch || undefined,
    city: jobCityFilter !== 'all' ? jobCityFilter : undefined,
    category: jobCategoryFilter !== 'all' ? jobCategoryFilter : undefined,
    subcategory: jobSubcategoryFilter !== 'all' ? jobSubcategoryFilter : undefined,
    type: jobTypeFilter !== 'all' ? jobTypeFilter : undefined,
    page: currentPage,
    limit: itemsPerPage,
  }
  
  const jobsQuery = useJobsQuery(filters)
  const createMutation = useCreateJobMutation()
  const updateMutation = useUpdateJobMutation()
  const deleteMutation = useDeleteJobMutation()
  
  const handleJobCreated = () => {
    closeJobPostDialog()
    // Query will automatically refetch due to cache invalidation
  }
  
  const handleJobUpdated = () => {
    closeEditJobDialog()
    // Query will automatically refetch due to cache invalidation
  }
  
  return {
    // Query data
    jobs: jobsQuery.data?.data || [],
    totalJobs: jobsQuery.data?.total || 0,
    totalPages: Math.ceil((jobsQuery.data?.total || 0) / itemsPerPage),
    
    // Query states
    isLoading: jobsQuery.isLoading,
    isError: jobsQuery.isError,
    error: jobsQuery.error,
    isFetching: jobsQuery.isFetching,
    
    // Mutations
    createJob: (data: CreateJobData) => createMutation.mutate(data, { onSuccess: handleJobCreated }),
    updateJob: (id: string, data: UpdateJobData) => updateMutation.mutate({ id, data }, { onSuccess: handleJobUpdated }),
    deleteJob: deleteMutation.mutate,
    
    // Mutation states
    isCreating: createMutation.isLoading,
    isUpdating: updateMutation.isLoading,
    isDeleting: deleteMutation.isLoading,
    
    // Utility functions
    refetch: jobsQuery.refetch,
  }
}
```

### Step 8: Migrate Dashboard Components

```tsx
// src/components/dashboard/client-dashboard.tsx
'use client'

import { useJobManager } from '@/hooks/use-job-manager'
import { useDashboardStatsQuery } from '@/hooks/queries/use-stats'
import { useNavigationStore } from '@/stores/navigation-store'
import { useDialogStore } from '@/stores/dialog-store'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Plus, Loader2 } from 'lucide-react'

export function ClientDashboard() {
  const { data: stats, isLoading: isLoadingStats } = useDashboardStatsQuery()
  const { currentDashboardTab, setDashboardTab } = useNavigationStore()
  const { isJobPostDialogOpen, openJobPostDialog } = useDialogStore()
  
  const {
    jobs: userJobs,
    totalJobs,
    isLoading: isLoadingJobs,
    isCreating,
  } = useJobManager()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Client Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your job postings and applications
          </p>
        </div>
        
        <Button 
          onClick={openJobPostDialog}
          disabled={isCreating}
          className="bg-foreground hover:bg-foreground/90"
        >
          {isCreating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Posting...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Post Job
            </>
          )}
        </Button>
      </div>

      {/* Stats Cards */}
      {isLoadingStats ? (
        <StatsCardsSkeleton />
      ) : (
        <StatsCards stats={stats} />
      )}

      {/* Tab Navigation with Zustand */}
      <Tabs value={currentDashboardTab} onValueChange={setDashboardTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="jobs">My Jobs ({totalJobs})</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <DashboardOverview stats={stats} />
        </TabsContent>

        <TabsContent value="jobs">
          <UserJobsList jobs={userJobs} isLoading={isLoadingJobs} />
        </TabsContent>

        <TabsContent value="applications">
          <ApplicationsList />
        </TabsContent>

        <TabsContent value="messages">
          <MessagesList />
        </TabsContent>
      </Tabs>
    </div>
  )
}
```

## Phase 4: Cleanup & Testing (Week 6)

### Step 9: Remove Deprecated Contexts

1. **Remove JobsProvider and DataProvider from layout**
2. **Delete context files**:
   ```bash
   rm src/contexts/jobs-context.tsx
   rm src/contexts/data-context.tsx
   ```

3. **Update components that were using these contexts**

### Step 10: Add DevTools and Error Boundaries

```tsx
// src/components/error-boundary.tsx
'use client'

import { useQueryErrorResetBoundary } from '@tanstack/react-query'
import { ErrorBoundary } from 'react-error-boundary'
import { Button } from '@/components/ui/button'

function ErrorFallback({ error, resetErrorBoundary }: any) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold text-red-600">Something went wrong</h2>
        <p className="text-gray-600">{error.message}</p>
        <Button onClick={resetErrorBoundary}>
          Try again
        </Button>
      </div>
    </div>
  )
}

export function QueryErrorBoundary({ children }: { children: React.ReactNode }) {
  const { reset } = useQueryErrorResetBoundary()
  
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={reset}
    >
      {children}
    </ErrorBoundary>
  )
}
```

## Testing Strategy

### Unit Tests for Stores

```typescript
// src/stores/__tests__/dialog-store.test.ts
import { renderHook, act } from '@testing-library/react'
import { useDialogStore } from '../dialog-store'

describe('Dialog Store', () => {
  beforeEach(() => {
    useDialogStore.setState({
      isJobPostDialogOpen: false,
      isEditJobDialogOpen: false,
      editingJob: null,
    })
  })

  test('should open job post dialog', () => {
    const { result } = renderHook(() => useDialogStore())
    
    act(() => {
      result.current.openJobPostDialog()
    })
    
    expect(result.current.isJobPostDialogOpen).toBe(true)
  })

  test('should manage edit job dialog with job data', () => {
    const { result } = renderHook(() => useDialogStore())
    const mockJob = { id: '1', title: 'Test Job' }
    
    act(() => {
      result.current.openEditJobDialog(mockJob)
    })
    
    expect(result.current.isEditJobDialogOpen).toBe(true)
    expect(result.current.editingJob).toEqual(mockJob)
    
    act(() => {
      result.current.closeEditJobDialog()
    })
    
    expect(result.current.isEditJobDialogOpen).toBe(false)
    expect(result.current.editingJob).toBeNull()
  })
})
```

### Integration Tests

```typescript
// src/components/__tests__/job-list.test.tsx
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { JobList } from '../jobs/job-list'
import { jobsApi } from '@/lib/api'

// Mock the API
jest.mock('@/lib/api', () => ({
  jobsApi: {
    getJobs: jest.fn(),
  },
}))

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
})

function renderWithQuery(component: React.ReactElement) {
  const queryClient = createTestQueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  )
}

describe('JobList', () => {
  test('should display jobs when loaded', async () => {
    const mockJobs = [
      { id: '1', title: 'Test Job 1' },
      { id: '2', title: 'Test Job 2' },
    ]

    ;(jobsApi.getJobs as jest.Mock).mockResolvedValue({
      data: mockJobs,
      total: 2,
    })

    renderWithQuery(<JobList />)

    await waitFor(() => {
      expect(screen.getByText('Test Job 1')).toBeInTheDocument()
      expect(screen.getByText('Test Job 2')).toBeInTheDocument()
    })
  })
})
```

## Performance Monitoring

### Add Performance Metrics

```typescript
// src/hooks/use-performance.ts
import { useQuery } from '@tanstack/react-query'

export function usePerformanceMetrics() {
  return useQuery({
    queryKey: ['performance-metrics'],
    queryFn: () => {
      const navigation = window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        firstPaint: window.performance.getEntriesByName('first-paint')[0]?.startTime || 0,
        firstContentfulPaint: window.performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
      }
    },
    staleTime: Infinity,
  })
}
```

## Migration Checklist

### Phase 1 ✅
- [ ] Install Zustand
- [ ] Set up QueryClient configuration
- [ ] Update root layout with providers
- [ ] Create error boundaries

### Phase 2 ✅
- [ ] Create all Zustand stores
- [ ] Migrate Header component
- [ ] Migrate Job List component
- [ ] Migrate Job Filters component
- [ ] Create query hooks

### Phase 3 ✅
- [ ] Create job manager hook
- [ ] Migrate dashboard components
- [ ] Add optimistic updates
- [ ] Implement background sync

### Phase 4
- [ ] Remove deprecated contexts
- [ ] Add comprehensive tests
- [ ] Performance testing
- [ ] User acceptance testing
- [ ] Deploy and monitor

## Expected Outcomes

1. **Performance Improvements**:
   - 30-50% reduction in unnecessary re-renders
   - Faster navigation with cached data
   - Better perceived performance with optimistic updates

2. **Developer Experience**:
   - Cleaner component code
   - Better TypeScript support
   - Easier testing and debugging

3. **User Experience**:
   - Instant UI feedback
   - Background data synchronization
   - Better offline resilience
   - Smoother interactions

This migration will transform mojPoslić into a modern, high-performance application with excellent developer experience and user satisfaction.
