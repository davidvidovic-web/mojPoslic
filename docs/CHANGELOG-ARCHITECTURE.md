# mojPoslic Development Standards & Guidelines

This document establishes unified development standards for creating consistent, maintainable, and scalable components and systems in mojPoslic. All developers should follow these guidelines when building new features or refactoring existing code.

## 🏗️ Component Development Standards

### 1. Component Architecture Pattern

**Structure**: Feature-based organization with clear separation of concerns
```
src/components/
├── ui/                  # Reusable UI primitives (buttons, inputs, modals)
├── core/               # App-wide components (header, layout, providers)
├── [feature]/          # Feature-specific components
│   ├── [feature]-list.tsx      # List/grid views
│   ├── [feature]-card.tsx      # Individual item displays
│   ├── [feature]-form.tsx      # Create/edit forms
│   ├── [feature]-details.tsx   # Detail/view pages
│   └── [feature]-filters.tsx   # Search/filter controls
└── [feature]/[sub-feature]/    # Complex features with sub-components
```

**Component Naming**: Use descriptive, consistent naming
```typescript
// ✅ GOOD: Clear, specific names
JobCard.tsx, JobPostForm.tsx, JobFilters.tsx

// ❌ BAD: Generic, unclear names
Card.tsx, Form.tsx, Filters.tsx
```

### 2. State Management Standards

**Server State**: Use TanStack Query for all API data
```typescript
// ✅ REQUIRED: Custom query hooks for reusability
export function useJobs(filters?: JobFilters) {
  return useQuery({
    queryKey: ['jobs', filters],
    queryFn: () => fetchJobs(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// ✅ REQUIRED: Optimistic updates for user actions
export function useCreateJob() {
  return useMutation({
    mutationFn: createJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
      toast.success('Job posted successfully!')
    }
  })
}
```

**Client/UI State**: Use Zustand stores for shared UI state
```typescript
// ✅ REQUIRED: Use appropriate store for UI state
const { isOpen, openDialog, closeDialog } = useDialogStore()
const { filters, setFilter, clearFilters } = useFilterStore()
const { activeTab, setActiveTab } = useNavigationStore()

// ❌ FORBIDDEN: useState for shared state across components
// ❌ FORBIDDEN: New Context providers for simple UI state
```

### 3. Data Fetching & API Standards

**Query Key Conventions**: Hierarchical structure for cache management
```typescript
// ✅ REQUIRED: Follow naming convention
['jobs']                    // All jobs
['jobs', filters]           // Filtered jobs  
['jobs', id]               // Single job
['jobs', 'user', userId]   // User's jobs
['categories']             // All categories
['cities', 'popular']      // Popular cities
```

**Error Handling**: Consistent user feedback
```typescript
// ✅ REQUIRED: Toast notifications for user actions
// ✅ REQUIRED: Error boundaries for component failures
// ✅ REQUIRED: Graceful degradation for network issues

export function JobCard({ jobId }: { jobId: string }) {
  const { data: job, isLoading, error } = useJob(jobId)
  
  if (isLoading) return <JobCardSkeleton />
  if (error) return <ErrorMessage message="Failed to load job" />
  if (!job) return <EmptyState message="Job not found" />
  
  return <div>{/* Job content */}</div>
}
```

### 4. TypeScript Standards

**Type Organization**: Feature-based with shared common types
```typescript
// src/types/common.ts - Shared across features
export interface ApiResponse<T> {
  data: T
  message: string
  success: boolean
}

// src/types/job.ts - Feature-specific
export interface Job {
  id: string
  title: string
  description: string
  // ... other job fields
}
```

**Store Type Patterns**: Separate state and actions
```typescript
// ✅ REQUIRED: Interface separation for clarity
interface DialogState {
  isJobPostOpen: boolean
  isEditProfileOpen: boolean
  activeJobId: string | null
}

interface DialogActions {
  openJobPost: () => void
  closeJobPost: () => void
  setActiveJob: (id: string) => void
}

export type DialogStore = DialogState & DialogActions
```

## 🎨 UI/UX Development Standards

### 1. Design System Usage

**Components**: Use shadcn/ui as the foundation
```typescript
// ✅ REQUIRED: Use design system components
import { Button, Card, Input, Dialog } from '@/components/ui'

// ✅ REQUIRED: Extend with consistent variants
<Button variant="primary" size="lg">Post Job</Button>
<Card className="p-6 shadow-sm">...</Card>

// ❌ FORBIDDEN: Custom styling that breaks design consistency
```

**Styling**: Tailwind CSS with consistent spacing
```typescript
// ✅ REQUIRED: Use design tokens
className="p-4 mb-6 bg-background text-foreground"

// ✅ REQUIRED: Responsive design
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"

// ❌ FORBIDDEN: Arbitrary values without justification
className="p-[13px] mb-[23px]"
```

### 2. Loading & Empty States

**Loading Patterns**: Skeleton loading over spinners
```typescript
// ✅ REQUIRED: Skeleton loading for content areas
function JobCardSkeleton() {
  return (
    <Card className="p-6">
      <Skeleton className="h-6 w-3/4 mb-4" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-2/3" />
    </Card>
  )
}

// ✅ REQUIRED: Optimistic updates for user actions
function useCreateJob() {
  return useMutation({
    mutationFn: createJob,
    onMutate: (variables) => {
      // Optimistically add job to list
      queryClient.setQueryData(['jobs'], (old) => [variables, ...old])
    }
  })
}
```

**Empty States**: Helpful and actionable
```typescript
// ✅ REQUIRED: Clear messaging with next steps
function JobsEmptyState() {
  return (
    <div className="text-center p-8">
      <Icon name="briefcase" className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
      <h3 className="text-lg font-semibold mb-2">No jobs found</h3>
      <p className="text-muted-foreground mb-4">Try adjusting your filters or post a new job.</p>
      <Button onClick={() => openJobPostDialog()}>Post Your First Job</Button>
    </div>
  )
}
```

### 3. Form Standards

**Validation**: Zod schemas with real-time feedback
```typescript
// ✅ REQUIRED: Separate validation schemas
const jobPostSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  budget: z.number().min(1, 'Budget is required')
})

// ✅ REQUIRED: Real-time validation with helpful errors
function JobPostForm() {
  const form = useForm({
    resolver: zodResolver(jobPostSchema),
    mode: 'onChange' // Real-time validation
  })
  
  return (
    <Form {...form}>
      <FormField
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Job Title</FormLabel>
            <FormControl>
              <Input placeholder="e.g. Website Design" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </Form>
  )
}
```

## 🚀 Performance Standards

### 1. Component Optimization

**Code Splitting**: Dynamic imports for heavy components
```typescript
// ✅ REQUIRED: Lazy load heavy components
const JobPostForm = lazy(() => import('@/components/jobs/job-post-form'))
const UserDashboard = lazy(() => import('@/components/dashboard/user-dashboard'))

// ✅ REQUIRED: Suspense boundaries with loading fallbacks
<Suspense fallback={<ComponentSkeleton />}>
  <JobPostForm />
</Suspense>
```

**React Optimization**: Prevent unnecessary re-renders
```typescript
// ✅ REQUIRED: Memo for expensive components
const JobCard = memo(({ job }: { job: Job }) => {
  return <Card>{/* Job content */}</Card>
})

// ✅ REQUIRED: Callback optimization for handlers
const handleJobClick = useCallback((jobId: string) => {
  navigate(`/jobs/${jobId}`)
}, [navigate])
```

### 2. Data Loading Optimization

**Query Optimization**: Proper cache management
```typescript
// ✅ REQUIRED: Appropriate stale times
const useJobs = (filters?: JobFilters) => {
  return useQuery({
    queryKey: ['jobs', filters],
    queryFn: () => fetchJobs(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  })
}

// ✅ REQUIRED: Background refetch for important data
const useJob = (id: string) => {
  return useQuery({
    queryKey: ['jobs', id],
    queryFn: () => fetchJob(id),
    refetchOnWindowFocus: true, // Keep job details fresh
  })
}
```

## 🧪 Testing Standards

### 1. Component Testing

**Test Structure**: Follow AAA pattern (Arrange, Act, Assert)
```typescript
// ✅ REQUIRED: Test user interactions, not implementation
describe('JobCard', () => {
  it('displays job information correctly', () => {
    // Arrange
    const mockJob = { id: '1', title: 'Test Job', budget: 1000 }
    
    // Act
    render(<JobCard job={mockJob} />)
    
    // Assert
    expect(screen.getByText('Test Job')).toBeInTheDocument()
    expect(screen.getByText('$1,000')).toBeInTheDocument()
  })
  
  it('calls onApply when apply button is clicked', async () => {
    // Arrange
    const mockOnApply = jest.fn()
    render(<JobCard job={mockJob} onApply={mockOnApply} />)
    
    // Act
    await user.click(screen.getByRole('button', { name: /apply/i }))
    
    // Assert
    expect(mockOnApply).toHaveBeenCalledWith(mockJob.id)
  })
})
```

### 2. Integration Testing

**Store Testing**: Test store behavior
```typescript
// ✅ REQUIRED: Test store logic separately
describe('DialogStore', () => {
  beforeEach(() => {
    useDialogStore.setState({ isJobPostOpen: false })
  })
  
  it('opens job post dialog', () => {
    const { openJobPost } = useDialogStore.getState()
    openJobPost()
    expect(useDialogStore.getState().isJobPostOpen).toBe(true)
  })
})
```

## 📁 File Organization Standards

### 1. Import Organization

**Import Order**: External → Internal → Relative
```typescript
// ✅ REQUIRED: Organized import structure
// External libraries
import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'

// Internal utilities
import { cn } from '@/lib/utils'
import { useDialogStore } from '@/stores/dialog-store'

// Components
import { Button } from '@/components/ui/button'
import { JobCard } from './job-card'

// Types
import type { Job } from '@/types/job'

// Relative imports last
import './job-list.css'
```

### 2. File Naming Conventions

**Consistent Naming**: kebab-case for files, PascalCase for components
```
✅ GOOD:
- job-post-form.tsx (component file)
- use-jobs.ts (hook file)  
- job-utils.ts (utility file)
- dialog-store.ts (store file)

❌ BAD:
- JobPostForm.tsx (inconsistent casing)
- useJobs.ts (inconsistent casing)
- jobUtils.ts (inconsistent casing)
```

## 🔧 Development Workflow

### 1. New Component Checklist

Before creating any new component, ask:
- [ ] Does this need server data? → Use TanStack Query hook
- [ ] Does this have modal/dialog state? → Use DialogStore
- [ ] Does this have filter/search state? → Use FilterStore  
- [ ] Does this have navigation state? → Use NavigationStore
- [ ] Does this have user preferences? → Use UIPreferencesStore
- [ ] Is this a multi-step form? → Use FormStateStore
- [ ] Does this need real-time updates? → Consider existing Context

### 2. Code Review Standards

**Required Checks**:
- [ ] No new Context providers for simple UI state
- [ ] All server data uses TanStack Query
- [ ] Consistent error handling and loading states  
- [ ] Type safety for all store interactions
- [ ] Performance considerations (memoization, lazy loading)
- [ ] Accessibility standards (ARIA labels, keyboard navigation)
- [ ] Responsive design implementation
- [ ] Test coverage for critical functionality

### 3. Performance Monitoring

**Metrics to Track**:
- Bundle size impact of new components
- Query cache hit rates and performance
- Component render frequencies
- Core Web Vitals (LCP, FID, CLS)

---

## 🎯 Migration Guidelines

### Current State (Phase 1)
- ✅ Core Zustand stores implemented
- ✅ TanStack Query configuration ready
- 🔄 Header component migration in progress

### Immediate Next Steps (Phase 2)
- Migrate job list components to TanStack Query
- Replace manual refresh triggers with automatic invalidation
- Standardize all filter components to use FilterStore
- Update all dashboard dialogs to use DialogStore

### Future Phases (Phase 3-4)
- Complete form state migration to FormStateStore
- Remove deprecated context providers
- Implement advanced caching strategies
- Add comprehensive test coverage

---

## 🚨 URGENT: Migration Required

**Current Status**: Major migration needed to align with new development standards.

### 📋 Critical Issues Identified:
1. **Dialog State**: 15+ components using local `useState` instead of `DialogStore`
2. **Data Context**: `categories-filter.tsx` and others still using deprecated `data-context.tsx`
3. **Job Management**: All components still using `jobs-context.tsx` instead of TanStack Query
4. **Filter Props**: Heavy prop drilling instead of centralized `FilterStore`
5. **Navigation State**: Dashboard components using local state instead of `NavigationStore`

### 🔧 Migration Status:
- ✅ **Infrastructure Ready**: All Zustand stores and TanStack Query hooks created
- 🔄 **Partial Migration**: Categories filter partially updated
- ❌ **Major Work Needed**: 30+ components need migration to new patterns

### 📁 Immediate Action Required:
See `docs/URGENT-MIGRATION-PLAN.md` for detailed migration roadmap and examples.

---

*This document serves as the single source of truth for mojPoslic development standards. All team members should reference these guidelines when building new features or reviewing code.*

**Last Updated**: July 7, 2025  
**Next Review**: After urgent migration completion (Est. 4 weeks)
