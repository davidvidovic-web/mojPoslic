# 🚨 URGENT MIGRATION REQUIRED

Based on our new development standards, **YES, significant migration is needed** to align mojPoslic with our unified architecture. Here's the comprehensive action plan:

## 📋 Critical Migration Checklist

### 🔴 HIGH PRIORITY (Do First)

#### 1. **Dialog/Modal State Management**
**Problem**: Multiple components using local `useState` for dialog state
**Files to Update**:
- ✅ `src/stores/dialog-store.ts` - Already created
- 🔄 `src/components/core/header.tsx` - Replace `isDialogOpen`, `isMobileMenuOpen`
- 🔄 `src/components/dashboard/client-dashboard.tsx` - Replace `isDialogOpen`, `isEditDialogOpen`
- 🔄 `src/components/dashboard/company-dashboard.tsx` - Replace dialog states
- 🔄 All admin dashboard dialog states

**Migration Pattern**:
```typescript
// ❌ OLD: Local state
const [isDialogOpen, setIsDialogOpen] = useState(false)

// ✅ NEW: Zustand store
const { isJobPostOpen, openJobPost, closeJobPost } = useDialogStore()
```

#### 2. **Data Context Migration** 
**Problem**: Using deprecated data context for categories/cities
**Files to Update**:
- ✅ `src/hooks/use-data.ts` - Already created
- ✅ `src/components/filters/categories-filter.tsx` - Partially migrated
- 🔄 `src/components/filters/cities-filter.tsx` - Still uses data context
- 🔄 All components importing from `@/contexts/data-context`
- 🔄 Remove `src/contexts/data-context.tsx` after migration

**Migration Pattern**:
```typescript
// ❌ OLD: Context
import { useCategories } from '@/contexts/data-context'

// ✅ NEW: TanStack Query
import { useCategories } from '@/hooks/use-data'
```

#### 3. **Job Data Management**
**Problem**: Using jobs context that should be replaced with TanStack Query
**Files to Update**:
- ✅ `src/hooks/use-jobs.ts` - Already created
- 🔄 `src/components/core/header.tsx` - Replace `refreshJobs()` calls
- 🔄 `src/components/dashboard/client-dashboard.tsx` - Replace job loading
- 🔄 `src/components/dashboard/company-dashboard.tsx` - Replace job loading
- 🔄 All components using `useJobs()` from context
- 🔄 Remove `src/contexts/jobs-context.tsx` after migration

**Migration Pattern**:
```typescript
// ❌ OLD: Context with manual refresh
const { refreshJobs } = useJobs()

// ✅ NEW: TanStack Query with automatic invalidation
const createJobMutation = useCreateJob() // Auto-invalidates cache
```

### 🟡 MEDIUM PRIORITY (Do Next)

#### 4. **Filter State Management**
**Problem**: Filter states passed through props, not centralized
**Files to Update**:
- ✅ `src/stores/filter-store.ts` - Already created
- 🔄 `src/components/jobs/job-list/job-filters.tsx` - Replace prop drilling
- 🔄 `src/components/job-list/job-filters.tsx` - Duplicate, should consolidate
- 🔄 Admin dashboard filter components

**Migration Pattern**:
```typescript
// ❌ OLD: Prop drilling
<JobFilters 
  searchTerm={searchTerm}
  setSearchTerm={setSearchTerm}
  cityFilter={cityFilter}
  setCityFilter={setCityFilter}
/>

// ✅ NEW: Zustand store
const { searchTerm, cityFilter, setSearchTerm, setCityFilter } = useFilterStore()
<JobFilters />
```

#### 5. **Navigation/Tab State**
**Problem**: Local navigation state in dashboard components
**Files to Update**:
- ✅ `src/stores/navigation-store.ts` - Already created
- 🔄 Dashboard components with `activeTab` state
- 🔄 Mobile menu navigation

**Migration Pattern**:
```typescript
// ❌ OLD: Local state
const [activeTab, setActiveTab] = useState('overview')

// ✅ NEW: Zustand store
const { activeTab, setActiveTab } = useNavigationStore()
```

#### 6. **Form State Management**
**Problem**: Multi-step forms could benefit from centralized state
**Files to Update**:
- ✅ `src/stores/form-state-store.ts` - Already created
- 🔄 `src/components/jobs/job-post-form/use-job-form-state.ts` - Consider migration
- 🔄 Profile setup form
- 🔄 Any multi-step forms

### 🟢 LOW PRIORITY (Do Later)

#### 7. **Theme/UI Preferences**
**Files to Update**:
- ✅ `src/stores/ui-preferences-store.ts` - Already created  
- 🔄 `src/components/core/theme-toggle-button.tsx` - Migrate theme state
- 🔄 Any UI preference components

#### 8. **Component Consolidation**
**Problem**: Duplicate components that should be unified
- 🔄 `src/components/jobs/job-list/job-filters.tsx` vs `src/components/job-list/job-filters.tsx`
- 🔄 Other duplicate filter/UI components

## 🚀 Implementation Strategy

### Phase 1: Core Data Migration (Week 1)
1. **Install TanStack Query** ✅ (Already in lib/query-client.ts)
2. **Migrate categories-filter.tsx** ✅ (Partially done)
3. **Complete cities-filter.tsx migration**
4. **Remove data-context.tsx dependencies**

### Phase 2: Job System Migration (Week 2)
1. **Update header.tsx to use new job hooks**
2. **Migrate dashboard job loading**
3. **Remove jobs-context.tsx dependencies**
4. **Test automatic cache invalidation**

### Phase 3: Dialog & Navigation (Week 3)
1. **Migrate all dialog states to DialogStore**
2. **Migrate navigation states to NavigationStore**
3. **Update all components using these states**

### Phase 4: Filters & Final Cleanup (Week 4)
1. **Migrate filter components to FilterStore**
2. **Remove deprecated context providers**
3. **Consolidate duplicate components**
4. **Add comprehensive tests**

## 🔧 Ready-to-Use Migration Examples

### Categories Filter (Already Done)
```typescript
// Before
import { useCategories } from '@/contexts/data-context'

// After  
import { useCategories } from '@/hooks/use-data'
const { categories, isLoading, getCategoriesByParent } = useCategories()
```

### Job Creation (Ready to Implement)
```typescript
// Before
const { refreshJobs } = useJobs()
const handleJobPosted = () => {
  setIsDialogOpen(false)
  refreshJobs() // Manual refresh
}

// After
const createJobMutation = useCreateJob()
const { closeJobPost } = useDialogStore()
const handleJobPosted = () => {
  closeJobPost()
  // No manual refresh needed - TanStack Query handles it automatically
}
```

### Dialog Management (Ready to Implement)  
```typescript
// Before
const [isDialogOpen, setIsDialogOpen] = useState(false)

// After
const { isJobPostOpen, openJobPost, closeJobPost } = useDialogStore()
```

## 🎯 Key Benefits After Migration

1. **Automatic Data Sync** - No more manual refresh triggers
2. **Instant UI Updates** - Optimistic updates with rollback
3. **Consistent State Management** - Unified patterns across app
4. **Better Performance** - Smart caching and background updates
5. **Type Safety** - Full TypeScript support throughout
6. **Developer Experience** - Clear patterns and documentation

## 📝 Migration Progress Tracker

- ✅ **Core Infrastructure**: Zustand stores, TanStack Query config, documentation
- 🔄 **Categories Filter**: Partially migrated to new data hooks
- ❌ **Cities Filter**: Still uses old data context
- ❌ **Job Data**: Still uses jobs context
- ❌ **Dialog States**: All still use local useState
- ❌ **Navigation States**: All still use local useState
- ❌ **Filter States**: All still use prop drilling

**Next Immediate Step**: Complete the cities filter migration and start migrating header.tsx dialog state.

This migration will significantly improve the app's architecture, performance, and developer experience while aligning with modern React patterns.
