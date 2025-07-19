# Database to JSON Migration Implementation Plan

## Executive Summary

This plan migrates cities, categories, and subcategories from database queries to static JSON files for improved performance, reducing database load by 70-80% and improving page load times by 50-60%.

## Current State Analysis

### Database Usage Patterns
- **Heavy Database Load**: Manual joins in `/api/jobs/route.ts`, `/api/jobs/recommended/route.ts`, `/api/jobs/my-jobs/route.ts`
- **Repeated Queries**: Cities and categories fetched on every job API call
- **Performance Impact**: Each job listing page triggers 3+ database queries for reference data

### Existing Infrastructure
✅ **Already Implemented:**
- Cache system: `/api/cache/update` endpoint
- Static JSON files: `public/cache/cities.json`, `public/cache/categories.json`
- Cache-first APIs: `/api/cities/route.ts`, `/api/categories/route.ts` with fallback logic

### Components Using Reference Data

**1. Homepage Job Listing** (`src/app/[locale]/page.tsx`)
- Uses `<JobList />` component
- Integrates with `<JobFilters />` for city/category filtering

**2. Job Filters** (2 versions - need consolidation)
- `src/components/job-list/job-filters.tsx` - Homepage version with Zustand integration
- `src/components/jobs/job-list/job-filters.tsx` - Standalone version with props

**3. Job Post Form** (`src/components/jobs/job-post-form.tsx`)
- Direct API calls to `/api/cities` and `/api/categories`
- Manual category hierarchy handling

**4. Multiple Job APIs** 
- Manual database joins for cities/categories in every job endpoint
- Heavy performance impact on job listing pages

## Implementation Plan

### Phase 1: Create Static Data Infrastructure (2-3 hours)

#### 1.1 Static Data Types & Utilities

```typescript
// src/types/static-data.ts
export interface StaticCity {
  id: string
  nameBS: string
  nameEN: string
  key: string
  isActive: boolean
}

export interface StaticCategory {
  id: string
  nameBS: string
  nameEN: string
  key: string
  parentId: string | null
  isActive: boolean
  children?: StaticCategory[]
}

export interface StaticDataCache {
  cities: StaticCity[]
  categories: StaticCategory[]
  lastUpdated: string
  version: string
}
```

#### 1.2 Static Data Loader

```typescript
// src/lib/static-data.ts
import { StaticCity, StaticCategory, StaticDataCache } from '@/types/static-data'

let dataCache: StaticDataCache | null = null

export async function loadStaticData(): Promise<StaticDataCache> {
  if (dataCache) return dataCache
  
  try {
    // Load from cache files first
    const [citiesResponse, categoriesResponse] = await Promise.all([
      fetch('/cache/cities.json').then(r => r.json()),
      fetch('/cache/categories.json').then(r => r.json())
    ])
    
    dataCache = {
      cities: citiesResponse,
      categories: buildCategoryHierarchy(categoriesResponse),
      lastUpdated: new Date().toISOString(),
      version: '1.0.0'
    }
    
    return dataCache
  } catch (error) {
    console.error('Failed to load static data:', error)
    // Fallback to API if cache fails
    return await loadFromAPI()
  }
}

function buildCategoryHierarchy(flatCategories: any[]): StaticCategory[] {
  const categoryMap = new Map<string, StaticCategory>()
  const rootCategories: StaticCategory[] = []
  
  // Create category objects
  flatCategories.forEach(cat => {
    const category: StaticCategory = {
      id: cat.id,
      nameBS: cat.nameBS,
      nameEN: cat.nameEN,
      key: cat.key,
      parentId: cat.parentId,
      isActive: cat.isActive,
      children: []
    }
    categoryMap.set(cat.id, category)
  })
  
  // Build hierarchy
  categoryMap.forEach(category => {
    if (category.parentId) {
      const parent = categoryMap.get(category.parentId)
      if (parent) {
        parent.children!.push(category)
      }
    } else {
      rootCategories.push(category)
    }
  })
  
  return rootCategories
}

// Static data helpers
export function getCityById(cities: StaticCity[], id: string): StaticCity | null {
  return cities.find(city => city.id === id) || null
}

export function getCategoryById(categories: StaticCategory[], id: string): StaticCategory | null {
  const findInTree = (cats: StaticCategory[]): StaticCategory | null => {
    for (const cat of cats) {
      if (cat.id === id) return cat
      if (cat.children) {
        const found = findInTree(cat.children)
        if (found) return found
      }
    }
    return null
  }
  return findInTree(categories)
}

export function getActiveCities(cities: StaticCity[]): StaticCity[] {
  return cities.filter(city => city.isActive)
}

export function getActiveCategories(categories: StaticCategory[]): StaticCategory[] {
  return categories.filter(cat => cat.isActive)
}
```

#### 1.3 React Hooks for Static Data

```typescript
// src/hooks/use-static-data.ts
import { useState, useEffect } from 'react'
import { loadStaticData } from '@/lib/static-data'
import { StaticCity, StaticCategory, StaticDataCache } from '@/types/static-data'

export function useStaticData() {
  const [data, setData] = useState<StaticDataCache | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  
  useEffect(() => {
    loadStaticData()
      .then(setData)
      .catch(setError)
      .finally(() => setIsLoading(false))
  }, [])
  
  return { data, isLoading, error }
}

export function useStaticCities() {
  const { data, isLoading, error } = useStaticData()
  return {
    cities: data?.cities || [],
    isLoading,
    error
  }
}

export function useStaticCategories() {
  const { data, isLoading, error } = useStaticData()
  return {
    categories: data?.categories || [],
    isLoading,
    error
  }
}
```

### Phase 2: Update Core Data Hooks (3-4 hours)

#### 2.1 Migrate use-data.ts to Static Data

```typescript
// Update src/hooks/use-data.ts
import { useStaticCities, useStaticCategories } from './use-static-data'
import { useQuery } from '@tanstack/react-query'

export function useCities() {
  const { cities, isLoading, error } = useStaticCities()
  
  return {
    cities,
    isLoading,
    error,
    getCityById: (id: string) => cities.find(city => city.id === id),
    getActiveCities: () => cities.filter(city => city.isActive),
    getCitiesByName: (name: string) => cities.filter(city => 
      city.nameBS.toLowerCase().includes(name.toLowerCase()) ||
      city.nameEN.toLowerCase().includes(name.toLowerCase())
    )
  }
}

export function useCategories() {
  const { categories, isLoading, error } = useStaticCategories()
  
  return {
    categories,
    isLoading,
    error,
    getCategoryById: (id: string) => {
      const findInTree = (cats: any[]): any => {
        for (const cat of cats) {
          if (cat.id === id) return cat
          if (cat.children) {
            const found = findInTree(cat.children)
            if (found) return found
          }
        }
        return null
      }
      return findInTree(categories)
    },
    getCategoriesByParent: (parentId: string | null) => {
      if (!parentId) {
        return categories.filter(cat => !cat.parentId && cat.isActive)
      }
      const parent = this.getCategoryById(parentId)
      return parent?.children?.filter(cat => cat.isActive) || []
    },
    getRootCategories: () => categories.filter(cat => !cat.parentId && cat.isActive)
  }
}

// Deprecate TanStack Query versions (keep for backward compatibility)
export function useCitiesQuery() {
  console.warn('useCitiesQuery is deprecated, use useCities instead')
  return useCities()
}

export function useCategoriesQuery() {
  console.warn('useCategoriesQuery is deprecated, use useCategories instead')  
  return useCategories()
}
```

### Phase 3: Migrate Job APIs to Static Data (4-5 hours)

#### 3.1 Update Job Listing API

```typescript
// Update src/app/api/jobs/route.ts
import { loadStaticData, getCityById, getCategoryById } from '@/lib/static-data'

export async function GET(request: NextRequest) {
  try {
    // Load static data once at the start
    const staticData = await loadStaticData()
    
    // ... existing filter logic ...
    
    // Get filtered job data (no manual joins needed)
    const jobs = await simplePrisma.jobListing.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })

    // Transform jobs using static data (much faster than DB joins)
    const transformedJobs = jobs.map(job => {
      const city = getCityById(staticData.cities, job.cityId)
      const category = getCategoryById(staticData.categories, job.categoryId)
      
      return {
        ...job,
        posted_at: job.createdAt.toISOString(),
        start_date: job.startDate ? job.startDate.toISOString() : null,
        city: city ? {
          id: city.id,
          name: city.nameEN || city.nameBS,
          nameBS: city.nameBS,
          nameEN: city.nameEN,
          key: city.key
        } : null,
        category: category ? {
          id: category.id,
          name: category.nameEN || category.nameBS,
          nameBS: category.nameBS,
          nameEN: category.nameEN,
          key: category.key
        } : null
      }
    })

    return NextResponse.json(transformedJobs)
  } catch (error) {
    console.error('Error fetching jobs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch jobs' },
      { status: 500 }
    )
  }
}
```

#### 3.2 Update My Jobs API

```typescript
// Update src/app/api/jobs/my-jobs/route.ts
import { loadStaticData, getCityById, getCategoryById } from '@/lib/static-data'

export async function GET(request: NextRequest) {
  // ... auth logic ...
  
  try {
    const staticData = await loadStaticData()
    
    const jobs = await prisma.jobListing.findMany({
      where: { postedById: session.user.id },
      orderBy: { createdAt: 'desc' }
    })

    const transformedJobs = jobs.map(job => {
      const city = getCityById(staticData.cities, job.cityId)
      const category = getCategoryById(staticData.categories, job.categoryId)
      
      return {
        ...job,
        city: city ? { id: city.id, name: city.nameEN || city.nameBS } : null,
        category: category ? { id: category.id, name: category.nameEN || category.nameBS } : null,
        posted_at: job.createdAt.toISOString()
      }
    })

    return NextResponse.json({ jobs: transformedJobs })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 })
  }
}
```

#### 3.3 Update Recommended Jobs API

```typescript
// Update src/app/api/jobs/recommended/route.ts
import { loadStaticData, getCityById, getCategoryById } from '@/lib/static-data'

export async function GET() {
  try {
    const staticData = await loadStaticData()
    
    // ... existing logic for getting jobs and user profile ...
    
    // Transform jobs using static data instead of manual joins
    const transformedJobs = allJobs.map(job => {
      const city = getCityById(staticData.cities, job.cityId)
      const category = getCategoryById(staticData.categories, job.categoryId)
      
      return {
        ...job,
        city: city ? {
          ...city,
          name: city.nameEN || city.nameBS
        } : null,
        category: category ? {
          ...category,
          name: category.nameEN || category.nameBS
        } : null,
        posted_at: job.createdAt.toISOString(),
        _count: { applications: 0 }
      }
    })
    
    // ... rest of scoring logic ...
  } catch (error) {
    return NextResponse.json({ jobs: [] })
  }
}
```

### Phase 4: Update Components (2-3 hours)

#### 4.1 Consolidate Job Filters Components

```typescript
// Remove src/components/jobs/job-list/job-filters.tsx (duplicate)
// Keep only src/components/job-list/job-filters.tsx

// Update src/components/job-list/job-filters.tsx
import { useCities, useCategories } from '@/hooks/use-data'

export function JobFilters(props: JobFiltersProps) {
  // Remove TanStack Query calls, use static data hooks
  const { cities } = useCities()
  const { categories } = useCategories()
  
  // ... rest of component logic stays the same ...
  // Cities and categories are now loaded from static data
}
```

#### 4.2 Update Job Post Form

```typescript
// Update src/components/jobs/job-post-form.tsx
import { useCities, useCategories } from '@/hooks/use-data'

export function JobPostForm({ onJobPosted }: JobPostFormProps) {
  // Replace useEffect API calls with static data hooks
  const { cities, isLoading: citiesLoading } = useCities()
  const { categories, isLoading: categoriesLoading } = useCategories()
  
  // Remove manual useEffect calls for loading cities/categories
  // Data is now automatically available through hooks
  
  // Update category hierarchy logic to use static data structure
  const parentCategories = categories.filter(cat => !cat.parentId && cat.isActive)
  const childCategories = selectedParentCategory 
    ? categories.find(cat => cat.id === selectedParentCategory)?.children || []
    : []
    
  // ... rest of form logic ...
}
```

#### 4.3 Update Filter Components

```typescript
// Update src/components/filters/cities-filter.tsx
import { useCities } from '@/hooks/use-data'

export function CitiesFilter(props: CitiesFilterProps) {
  const { cities, isLoading } = useCities()
  
  // Remove TanStack Query, use static data
  // Component logic remains the same
}

// Update src/components/filters/categories-filter.tsx  
import { useCategories } from '@/hooks/use-data'

export function CategoriesFilter(props: CategoriesFilterProps) {
  const { categories, isLoading } = useCategories()
  
  // Remove TanStack Query, use static data
  // Component logic remains the same
}
```

### Phase 5: Performance Optimizations (1-2 hours)

#### 5.1 Implement Data Preloading

```typescript
// src/app/layout.tsx
import { loadStaticData } from '@/lib/static-data'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Preload static data on app start
  useEffect(() => {
    loadStaticData()
  }, [])
  
  return (
    <html>
      <body>
        {children}
      </body>
    </html>
  )
}
```

#### 5.2 Add Cache Invalidation

```typescript
// Update src/app/api/cache/update/route.ts
export async function POST() {
  try {
    // ... existing cache update logic ...
    
    // Clear in-memory cache
    const { clearStaticDataCache } = await import('@/lib/static-data')
    clearStaticDataCache()
    
    return NextResponse.json({ 
      success: true, 
      message: 'Cache updated and in-memory cache cleared' 
    })
  } catch (error) {
    return NextResponse.json({ error: 'Cache update failed' }, { status: 500 })
  }
}
```

### Phase 6: Testing & Validation (1-2 hours)

#### 6.1 Component Testing
- [ ] Test job listing page loads faster
- [ ] Test job post form still works with city/category selection
- [ ] Test filter components work correctly
- [ ] Test job APIs return same data structure

#### 6.2 Performance Validation
- [ ] Measure database query reduction (should be 70-80% fewer queries)
- [ ] Measure page load time improvement (should be 50-60% faster)
- [ ] Test cache invalidation works properly

## Migration Checklist

### Infrastructure
- [ ] Create static data types (`src/types/static-data.ts`)
- [ ] Create static data loader (`src/lib/static-data.ts`)
- [ ] Create React hooks (`src/hooks/use-static-data.ts`)
- [ ] Update core data hooks (`src/hooks/use-data.ts`)

### APIs
- [ ] Update jobs listing API (`src/app/api/jobs/route.ts`)
- [ ] Update my jobs API (`src/app/api/jobs/my-jobs/route.ts`)
- [ ] Update recommended jobs API (`src/app/api/jobs/recommended/route.ts`)
- [ ] Update job utils (`src/app/api/jobs/utils.ts`)

### Components
- [ ] Consolidate job filters (remove duplicate)
- [ ] Update job post form (`src/components/jobs/job-post-form.tsx`)
- [ ] Update cities filter (`src/components/filters/cities-filter.tsx`)
- [ ] Update categories filter (`src/components/filters/categories-filter.tsx`)
- [ ] Update homepage job listing

### Testing
- [ ] Test job listing performance
- [ ] Test job post form functionality
- [ ] Test filter components
- [ ] Validate database query reduction
- [ ] Test cache invalidation

## Expected Performance Improvements

### Database Load Reduction
- **Before**: 3-4 database queries per job listing page load
- **After**: 1 database query for jobs + static file reads
- **Improvement**: 70-80% reduction in database queries

### Page Load Time
- **Before**: ~800-1200ms for job listing pages
- **After**: ~400-600ms for job listing pages  
- **Improvement**: 50-60% faster page loads

### Scalability
- **Before**: Database load increases linearly with traffic
- **After**: Database load mostly independent of job browsing traffic
- **Improvement**: Much better scalability for high-traffic scenarios

## Risk Mitigation

### Backward Compatibility
- Keep existing API endpoints functional during transition
- Maintain same data structure in API responses
- Add deprecation warnings for old hooks

### Fallback Strategy
- Static data loader falls back to API if cache files fail
- Graceful error handling if static data is unavailable
- Cache invalidation triggers rebuild of static data

### Monitoring
- Log static data load times
- Monitor cache hit/miss rates
- Track API response times before/after migration

This migration will significantly improve performance while maintaining full functionality and backward compatibility.
