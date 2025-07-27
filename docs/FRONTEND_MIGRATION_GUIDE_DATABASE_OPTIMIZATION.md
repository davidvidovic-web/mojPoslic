# Frontend Migration Guide: Database Optimization Implementation

**Document Version:** 1.1  
**Date:** 2025-01-27 (Updated)  
**Status:** Phase 4 Complete - Database Migration Applied  
**Purpose:** Comprehensive guide for updating frontend components, routes, and views to support database optimization changes

## Table of Contents

1. [Project Status](#project-status)
2. [Overview](#overview)
3. [TypeScript Interface Updates](#typescript-interface-updates)
4. [API Route Modifications](#api-route-modifications)
5. [Component Updates](#component-updates)
6. [Hook Modifications](#hook-modifications)
7. [Migration Timeline](#migration-timeline)
8. [Testing Strategy](#testing-strategy)
9. [Rollback Plan](#rollback-plan)

## Project Status

### ✅ **Phase 4: Database Migration - COMPLETED**
**Date Completed:** January 27, 2025  
**Status:** Database schema successfully migrated with cached data fields

**Applied Migrations:**
- ✅ `20250127000001_add_cached_data_fields.sql` - Added 40+ cached fields to job_listings, applications, and users tables
- ✅ Performance indexes created for optimized queries
- ✅ Cached city/category data fields ready for use
- ✅ Embedded privacy settings in user records
- ✅ Performance counters (view_count, application_count) added

**Database Changes Applied:**
- **job_listings table**: Added city_name, city_name_bs, city_name_en, category_name, category_name_bs, category_name_en, poster_name, poster_email, poster_phone, poster_avatar_url, view_count, application_count
- **applications table**: Added job_title, job_city_name, job_category_name, job_poster_name, applicant_name, applicant_email, applicant_phone, applicant_avatar_url, response_time_hours, last_status_change_at
- **users table**: Added privacy_email_visible, privacy_phone_visible, privacy_profile_visible, privacy_contact_form_enabled, total_jobs_posted, total_applications_sent, profile_completion_score, last_login_at

**Performance Improvement Potential:**
- 60-90% reduction in database query time
- 50-70% reduction in API response time
- Single query operations instead of complex joins

### 🔄 **Next Phase: Frontend Implementation**
**Ready to Begin:** TypeScript interface updates and component migration to use cached data

**Dependencies Met:**
- ✅ Database schema updated
- ✅ Cached fields available
- ✅ Performance indexes in place
- ✅ Static data infrastructure ready

## Overview

This guide details all frontend code changes required to support the database optimization implementation outlined in `DATABASE_MIGRATION_MAPPING_ANALYSIS.md`. The changes focus on:

- **Cached Data Integration**: Embedding frequently accessed data directly in records
- **Static Data Usage**: Using JSON files for cities/categories instead of database joins
- **Privacy Settings Embedding**: Moving privacy settings from separate table to user record
- **Performance Optimization**: Reducing database queries by 60-90%

## TypeScript Interface Updates

### 1. Job Interface (`src/types/job.ts`)

**Current Structure:**
```typescript
export interface Job {
  id: string
  title: string
  description: string
  cityId: string | null
  categoryId: string | null
  city?: {
    id: string
    name: string
    name_bs: string
    name_en: string
  }
  category?: {
    id: string
    name: string
    name_bs: string
    name_en: string
  }
  postedBy?: {
    id: string
    name: string
    phone?: string
  }
  // ... other fields
}
```

**Optimized Structure:**
```typescript
export interface Job {
  id: string
  title: string
  description: string
  // Cached city data (embedded)
  city_name: string
  city_name_bs: string
  city_name_en: string
  // Cached category data (embedded)
  category_name: string
  category_name_bs: string
  category_name_en: string
  // Cached poster data (embedded)
  poster_name: string
  poster_email: string
  poster_phone?: string
  poster_avatar_url?: string
  // Performance tracking
  view_count: number
  application_count: number
  last_activity_at: string
  // ... other fields (keep existing)
}
```

### 2. User Interface (`src/types/user.ts`)

**Current Structure:**
```typescript
export interface User {
  id: string
  email: string
  fullName: string
  role: UserRole
  // ... other fields
}

export interface UserPrivacySettings {
  id: string
  userId: string
  emailVisible: boolean
  phoneVisible: boolean
  profileVisible: boolean
}
```

**Optimized Structure:**
```typescript
export interface User {
  id: string
  email: string
  fullName: string
  role: UserRole
  // Embedded privacy settings
  privacy_email_visible: boolean
  privacy_phone_visible: boolean
  privacy_profile_visible: boolean
  privacy_contact_form_enabled: boolean
  // Performance data
  total_jobs_posted: number
  total_applications_sent: number
  profile_completion_score: number
  last_login_at: string
  // ... other fields (keep existing)
}
```

### 3. Application Interface (`src/types/application.ts`)

**Current Structure:**
```typescript
export interface Application {
  id: string
  jobId: string
  applicantId: string
  status: ApplicationStatus
  appliedAt: string
  // Relations loaded separately
  job?: Job
  applicant?: User
}
```

**Optimized Structure:**
```typescript
export interface Application {
  id: string
  jobId: string
  applicantId: string
  status: ApplicationStatus
  appliedAt: string
  // Cached job data
  job_title: string
  job_city_name: string
  job_category_name: string
  job_poster_name: string
  // Cached applicant data
  applicant_name: string
  applicant_email: string
  applicant_phone?: string
  applicant_avatar_url?: string
  // Performance tracking
  response_time_hours?: number
  last_status_change_at: string
  // ... other fields (keep existing)
}
```

### 4. New Helper Types

**Create `src/types/static-data.ts`:**
```typescript
export interface StaticCity {
  id: string
  key: string
  name: string
  name_bs: string
  name_en: string
  country: string
  is_special: boolean
}

export interface StaticCategory {
  id: string
  key: string
  name: string
  name_bs: string
  name_en: string
  is_popular: boolean
  parent_id?: string | null
  children?: StaticCategory[]
}

export interface StaticDataCache {
  cities: StaticCity[]
  categories: StaticCategory[]
  lastUpdated: string
}
```

## API Route Modifications

### 1. Jobs API (`src/app/api/jobs/route.ts`)

**Current Implementation:**
- Uses Prisma joins for city/category
- Loads related data separately
- Multiple database queries per request

**Updated Implementation:**
```typescript
// src/app/api/jobs/route.ts
import { NextResponse, NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { staticDataManager } from '@/lib/static-data-manager'

export async function GET(request: NextRequest) {
  const supabase = createClient()
  
  try {
    const { searchParams } = new URL(request.url)
    
    // Build query with cached data fields
    let query = supabase
      .from('jobs')
      .select(`
        *,
        city_name,
        city_name_bs, 
        city_name_en,
        category_name,
        category_name_bs,
        category_name_en,
        poster_name,
        poster_email,
        poster_phone,
        poster_avatar_url,
        view_count,
        application_count
      `)
      .eq('is_active', true)

    // Apply filters using cached data
    const city = searchParams.get('city')
    if (city && city !== 'all') {
      // Use city name instead of cityId
      const cityData = await staticDataManager.getCityById(city)
      if (cityData) {
        query = query.eq('city_name', cityData.name)
      }
    }

    const category = searchParams.get('category')
    if (category && category !== 'all') {
      // Use category name instead of categoryId
      const categoryData = await staticDataManager.getCategoryById(category)
      if (categoryData) {
        query = query.eq('category_name', categoryData.name)
      }
    }

    // Search across cached fields
    const search = searchParams.get('search')
    if (search) {
      query = query.or(
        `title.ilike.%${search}%,` +
        `description.ilike.%${search}%,` +
        `poster_name.ilike.%${search}%,` +
        `city_name.ilike.%${search}%,` +
        `category_name.ilike.%${search}%`
      )
    }

    const { data: jobs, error } = await query
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) throw error

    return NextResponse.json(jobs)
  } catch (error) {
    console.error('Error fetching jobs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch jobs' },
      { status: 500 }
    )
  }
}
```

### 2. Job Detail API (`src/app/api/jobs/[id]/route.ts`)

**Updated Implementation:**
```typescript
// src/app/api/jobs/[id]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()
  
  try {
    // Single query with all cached data
    const { data: job, error } = await supabase
      .from('jobs')
      .select(`
        *,
        city_name,
        city_name_bs,
        city_name_en,
        category_name,
        category_name_bs,
        category_name_en,
        poster_name,
        poster_email,
        poster_phone,
        poster_avatar_url,
        view_count,
        application_count,
        last_activity_at
      `)
      .eq('id', params.id)
      .single()

    if (error) throw error
    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }

    // Increment view count using cached counter
    await supabase.rpc('increment_job_view_count', { job_id: params.id })

    return NextResponse.json(job)
  } catch (error) {
    console.error('Error fetching job:', error)
    return NextResponse.json(
      { error: 'Failed to fetch job' },
      { status: 500 }
    )
  }
}
```

### 3. Applications API (`src/app/api/applications/route.ts`)

**Updated Implementation:**
```typescript
// src/app/api/applications/route.ts
export async function GET(request: NextRequest) {
  const supabase = createClient()
  
  try {
    // Single query with cached data
    const { data: applications, error } = await supabase
      .from('applications')
      .select(`
        *,
        job_title,
        job_city_name,
        job_category_name,
        job_poster_name,
        applicant_name,
        applicant_email,
        applicant_phone,
        applicant_avatar_url,
        response_time_hours,
        last_status_change_at
      `)
      .order('applied_at', { ascending: false })

    if (error) throw error
    return NextResponse.json(applications)
  } catch (error) {
    console.error('Error fetching applications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    )
  }
}
```

## Component Updates

### 1. Job Card Component (`src/components/job-card.tsx`)

**Current Usage:**
```tsx
// Current city/category access
{locale === 'bs' ? job.category.name_bs || job.category.name : job.category.name_en || job.category.name}
<span>{job.city.name}</span>
```

**Updated Usage:**
```tsx
// src/components/job-card.tsx
import { Job } from "@/types/job"
import { useStaticData } from "@/hooks/use-static-data"

export function JobCard({ job, viewMode = 'grid', hasApplied = false }: JobCardProps) {
  const { locale } = useLocale()
  
  // Use cached data directly from job record
  const getCityName = () => {
    return locale === 'bs' ? job.city_name_bs : job.city_name_en
  }
  
  const getCategoryName = () => {
    return locale === 'bs' ? job.category_name_bs : job.category_name_en
  }

  return (
    <div className="job-card">
      {/* City display */}
      <div className="flex items-center gap-1">
        <MapPin className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">{getCityName()}</span>
      </div>
      
      {/* Category display */}
      <Badge variant="secondary">
        <Tag className="h-3 w-3 mr-1" />
        {getCategoryName()}
      </Badge>
      
      {/* Poster info (cached) */}
      <div className="poster-info">
        <span>{job.poster_name}</span>
        {job.poster_avatar_url && (
          <Image src={job.poster_avatar_url} alt={job.poster_name} />
        )}
      </div>
      
      {/* Performance indicators */}
      <div className="job-stats">
        <span>{job.view_count} views</span>
        <span>{job.application_count} applications</span>
      </div>
    </div>
  )
}
```

### 2. Job Detail Page (`src/app/[locale]/jobs/[id]/page.tsx`)

**Updated Implementation:**
```tsx
// src/app/[locale]/jobs/[id]/page.tsx
export default function JobDetailPage() {
  const { locale } = useLocale()
  
  // Helper functions for cached data
  const getCityName = (job: Job) => {
    return locale === 'bs' ? job.city_name_bs : job.city_name_en
  }
  
  const getCategoryName = (job: Job) => {
    return locale === 'bs' ? job.category_name_bs : job.category_name_en
  }

  return (
    <div className="job-detail">
      {/* Location section */}
      <div className="location-info">
        <MapPin className="h-5 w-5" />
        <span>{getCityName(job)}</span>
      </div>
      
      {/* Category section */}
      <div className="category-info">
        <Tag className="h-5 w-5" />
        <span>{getCategoryName(job)}</span>
      </div>
      
      {/* Poster contact (cached data) */}
      <div className="poster-contact">
        <h3>{job.poster_name}</h3>
        <p>{job.poster_email}</p>
        {job.poster_phone && <p>{job.poster_phone}</p>}
      </div>
      
      {/* Performance metrics */}
      <div className="job-metrics">
        <div className="metric">
          <span className="value">{job.view_count}</span>
          <span className="label">Views</span>
        </div>
        <div className="metric">
          <span className="value">{job.application_count}</span>
          <span className="label">Applications</span>
        </div>
      </div>
    </div>
  )
}
```

### 3. Job Filters Component (`src/components/job-filters.tsx`)

**Updated Implementation:**
```tsx
// src/components/job-filters.tsx
import { useStaticData } from "@/hooks/use-static-data"

export function JobFilters() {
  const { cities, categories, loading } = useStaticData()
  const { locale } = useLocale()
  
  if (loading) return <FiltersSkeleton />

  return (
    <div className="filters">
      {/* City filter using static data */}
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select city" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Cities</SelectItem>
          {cities.map(city => (
            <SelectItem key={city.id} value={city.id}>
              {locale === 'bs' ? city.name_bs : city.name_en}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {/* Category filter using static data */}
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {categories.map(category => (
            <SelectItem key={category.id} value={category.id}>
              {locale === 'bs' ? category.name_bs : category.name_en}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
```

### 4. Application List Component

**Updated Implementation:**
```tsx
// src/components/applications/application-list.tsx
export function ApplicationList() {
  // Applications now come with cached job and applicant data
  return (
    <div className="applications">
      {applications.map(app => (
        <div key={app.id} className="application-card">
          {/* Job info (cached) */}
          <div className="job-info">
            <h3>{app.job_title}</h3>
            <p>{app.job_city_name} • {app.job_category_name}</p>
            <p>Posted by: {app.job_poster_name}</p>
          </div>
          
          {/* Applicant info (cached) */}
          <div className="applicant-info">
            <h4>{app.applicant_name}</h4>
            <p>{app.applicant_email}</p>
            {app.applicant_avatar_url && (
              <Image src={app.applicant_avatar_url} alt={app.applicant_name} />
            )}
          </div>
          
          {/* Performance metrics */}
          <div className="metrics">
            {app.response_time_hours && (
              <span>Response time: {app.response_time_hours}h</span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
```

## Hook Modifications

### 1. Static Data Hook (`src/hooks/use-static-data.ts`)

**Current Implementation:**
Already optimized for JSON file usage.

**Enhancement for Error Handling:**
```typescript
// src/hooks/use-static-data.ts
export function useStaticData() {
  const [data, setData] = useState<StaticDataCache | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Try cache first
        const cached = localStorage.getItem('static-data-cache')
        if (cached) {
          const parsedCache = JSON.parse(cached)
          const cacheAge = Date.now() - new Date(parsedCache.lastUpdated).getTime()
          
          // Use cache if less than 1 hour old
          if (cacheAge < 3600000) {
            setData(parsedCache)
            setLoading(false)
            return
          }
        }
        
        // Fetch fresh data
        const [citiesRes, categoriesRes] = await Promise.all([
          fetch('/api/static/cities'),
          fetch('/api/static/categories')
        ])
        
        if (!citiesRes.ok || !categoriesRes.ok) {
          throw new Error('Failed to fetch static data')
        }
        
        const [cities, categories] = await Promise.all([
          citiesRes.json(),
          categoriesRes.json()
        ])
        
        const freshData = {
          cities,
          categories,
          lastUpdated: new Date().toISOString()
        }
        
        // Update cache
        localStorage.setItem('static-data-cache', JSON.stringify(freshData))
        setData(freshData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
        console.error('Static data loading error:', err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  return {
    cities: data?.cities || [],
    categories: data?.categories || [],
    loading,
    error,
    refresh: () => {
      localStorage.removeItem('static-data-cache')
      window.location.reload()
    }
  }
}
```

### 2. User Profile Hook (`src/hooks/use-user-profile.ts`)

**Updated for Embedded Privacy Settings:**
```typescript
// src/hooks/use-user-profile.ts
export function useUserProfile(userId: string) {
  const [profile, setProfile] = useState<User | null>(null)
  
  // Privacy settings are now embedded in user record
  const updatePrivacySettings = async (settings: Partial<UserPrivacySettings>) => {
    try {
      const response = await fetch(`/api/users/${userId}/privacy`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          privacy_email_visible: settings.emailVisible,
          privacy_phone_visible: settings.phoneVisible,
          privacy_profile_visible: settings.profileVisible,
          privacy_contact_form_enabled: settings.contactFormEnabled
        })
      })
      
      if (!response.ok) throw new Error('Failed to update privacy settings')
      
      const updatedUser = await response.json()
      setProfile(updatedUser)
    } catch (error) {
      console.error('Error updating privacy settings:', error)
      throw error
    }
  }

  return {
    profile,
    updatePrivacySettings,
    privacySettings: profile ? {
      emailVisible: profile.privacy_email_visible,
      phoneVisible: profile.privacy_phone_visible,
      profileVisible: profile.privacy_profile_visible,
      contactFormEnabled: profile.privacy_contact_form_enabled
    } : null
  }
}
```

## Migration Timeline

### Phase 1: TypeScript Interface Updates (Week 1)
- [ ] Update all TypeScript interfaces
- [ ] Add new static data types
- [ ] Update import statements across codebase
- [ ] Test type checking

### Phase 2: API Route Migration (Week 2)
- [ ] Update job listing API routes
- [ ] Update job detail API routes
- [ ] Update application API routes
- [ ] Update user profile API routes
- [ ] Test API response formats

### Phase 3: Component Updates (Week 3-4)
- [ ] Update job card components
- [ ] Update job detail pages
- [ ] Update application components
- [ ] Update filter components
- [ ] Update user profile components

### Phase 4: Hook Enhancements (Week 5)
- [ ] Enhance static data hooks
- [ ] Update user profile hooks
- [ ] Update application hooks
- [ ] Add performance monitoring hooks

### Phase 5: Testing & Optimization (Week 6)
- [ ] Unit testing for all updated components
- [ ] Integration testing for API routes
- [ ] Performance testing
- [ ] User acceptance testing

## Testing Strategy

### 1. Component Testing
```typescript
// src/components/__tests__/job-card.test.tsx
describe('JobCard with cached data', () => {
  const mockJob: Job = {
    id: '1',
    title: 'Test Job',
    city_name: 'Sarajevo',
    city_name_bs: 'Sarajevo',
    city_name_en: 'Sarajevo',
    category_name: 'Technology',
    category_name_bs: 'Tehnologija',
    category_name_en: 'Technology',
    poster_name: 'John Doe',
    view_count: 150,
    application_count: 25
  }

  it('displays cached city and category names', () => {
    render(<JobCard job={mockJob} />)
    expect(screen.getByText('Sarajevo')).toBeInTheDocument()
    expect(screen.getByText('Technology')).toBeInTheDocument()
  })

  it('shows performance metrics', () => {
    render(<JobCard job={mockJob} />)
    expect(screen.getByText('150 views')).toBeInTheDocument()
    expect(screen.getByText('25 applications')).toBeInTheDocument()
  })
})
```

### 2. API Testing
```typescript
// src/app/api/__tests__/jobs.test.ts
describe('/api/jobs with cached data', () => {
  it('returns jobs with cached city and category data', async () => {
    const response = await GET(new NextRequest('http://localhost/api/jobs'))
    const jobs = await response.json()
    
    expect(jobs[0]).toHaveProperty('city_name')
    expect(jobs[0]).toHaveProperty('category_name')
    expect(jobs[0]).toHaveProperty('poster_name')
    expect(jobs[0]).toHaveProperty('view_count')
  })
})
```

### 3. Performance Testing
```typescript
// Performance monitoring for cached data
const measurePerformance = async () => {
  const start = performance.now()
  const jobs = await fetch('/api/jobs')
  const end = performance.now()
  
  console.log(`API call took ${end - start} milliseconds`)
  // Target: < 200ms for job listings with cached data
}
```

## Rollback Plan

### 1. Database Rollback
- Maintain current structure during transition
- Use feature flags to switch between old/new data access
- Keep migration scripts for reverting changes

### 2. Frontend Rollback
```typescript
// Feature flag for cached data usage
const USE_CACHED_DATA = process.env.NEXT_PUBLIC_USE_CACHED_DATA === 'true'

// Component logic with fallback
const getCityName = (job: Job) => {
  if (USE_CACHED_DATA && job.city_name) {
    return locale === 'bs' ? job.city_name_bs : job.city_name_en
  }
  // Fallback to joined data
  return locale === 'bs' ? job.city?.name_bs : job.city?.name_en
}
```

### 3. API Rollback
```typescript
// API route with dual support
export async function GET(request: NextRequest) {
  if (USE_CACHED_DATA) {
    // New cached data query
    return getCachedJobs(request)
  } else {
    // Legacy joined query
    return getJoinedJobs(request)
  }
}
```

## Performance Targets

### Before Optimization
- Job listing API: ~800ms (multiple joins)
- Job detail API: ~400ms (multiple queries)
- Application listing: ~600ms (complex joins)

### After Optimization
- Job listing API: ~150ms (single query, cached data)
- Job detail API: ~80ms (single query)
- Application listing: ~120ms (cached data)

### Expected Improvements
- **60-90% reduction** in database query time
- **50-70% reduction** in API response time
- **40-60% reduction** in frontend rendering time
- **80% reduction** in database load

---

**Next Steps:**
1. Begin Phase 1: TypeScript interface updates
2. Set up feature flags for gradual rollout
3. Implement comprehensive testing suite
4. Monitor performance metrics during migration

**Dependencies:**
- Database optimization implementation must be completed first
- Static data API endpoints must be ready
- Caching mechanisms must be in place

This migration will significantly improve application performance while maintaining all existing functionality.
