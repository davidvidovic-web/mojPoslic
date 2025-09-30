# Job Details Drawer - Technical Implementation Guide

## Component Architecture

### File Structure
```
src/
├── components/jobs/
│   └── job-details-drawer.tsx     # Main drawer component
├── hooks/
│   └── use-job-details-drawer.ts  # Zustand state management
├── components/
│   ├── job-card.tsx               # Primary job card with drawer integration
│   └── unified-job-card.tsx       # Secondary job card with drawer integration
└── providers.tsx                  # Global provider configuration
```

### Dependencies
- `zustand` - State management
- `next-intl` - Internationalization
- `lucide-react` - Icons
- `sonner` - Toast notifications
- Custom UI components (`@/components/ui/*`)

## State Management Implementation

### Zustand Store (`use-job-details-drawer.ts`)
```typescript
import { create } from 'zustand'

interface JobDetailsDrawerStore {
  isOpen: boolean
  jobId: string | null
  openDrawer: (jobId: string) => void
  closeDrawer: () => void
}

export const useJobDetailsDrawer = create<JobDetailsDrawerStore>((set) => ({
  isOpen: false,
  jobId: null,
  openDrawer: (jobId: string) => set({ isOpen: true, jobId }),
  closeDrawer: () => set({ isOpen: false, jobId: null }),
}))
```

### Usage in Components
```typescript
import { useJobDetailsDrawer } from '@/hooks/use-job-details-drawer'

const JobCard = ({ job }: { job: Job }) => {
  const { openDrawer } = useJobDetailsDrawer()
  
  const handleClick = () => {
    openDrawer(job.id)
  }
  
  return (
    <div onClick={handleClick} className="cursor-pointer">
      {/* Job card content */}
    </div>
  )
}
```

## Main Drawer Component Structure

### Core Implementation Pattern
```typescript
'use client'

import { useState, useEffect, useRef } from 'react'
import { useJobDetailsDrawer } from '@/hooks/use-job-details-drawer'
import { useTranslations, useLocale } from 'next-intl'

export function JobDetailsDrawer() {
  const { isOpen, jobId, closeDrawer } = useJobDetailsDrawer()
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(false)
  
  // Data fetching effect
  useEffect(() => {
    if (isOpen && jobId) {
      fetchJobDetails(jobId)
    }
  }, [isOpen, jobId])
  
  // Render logic
  return (
    <div className={`fixed inset-0 z-50 ${isOpen ? 'block' : 'hidden'}`}>
      {/* Drawer content */}
    </div>
  )
}
```

### Data Fetching Strategy
```typescript
const fetchJobDetails = async (jobId: string) => {
  setLoading(true)
  try {
    const { data: jobs } = useData()
    const job = jobs?.find(j => j.id === jobId)
    
    if (job) {
      // Enrich job data with relationships
      setJob(await enrichJobData(job))
    }
  } catch (error) {
    toast.error(t('jobs.messages.errorLoadingJob'))
  } finally {
    setLoading(false)
  }
}
```

## UI Layout Implementation

### Responsive Layout Structure
```typescript
return (
  <div className="fixed inset-0 z-50 bg-black/50">
    <div className="absolute inset-y-0 right-0 w-full max-w-4xl bg-background border-l border-border overflow-hidden">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur">
        <div className="flex items-center justify-between p-6">
          <Button onClick={closeDrawer}>
            <ArrowLeft className="h-4 w-4" />
            {t('jobs.actions.backToJobs')}
          </Button>
          <Button onClick={closeDrawer}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Scrollable Content */}
      <div className="h-full overflow-y-auto pb-20">
        {/* Job content sections */}
      </div>
    </div>
  </div>
)
```

### Section Organization Pattern
```typescript
// Job Overview Section
<div className="px-6 py-8 border-b border-gray-200">
  {/* Job header, badges, meta info */}
</div>

// Main Content Sections
<div className="px-6 space-y-8">
  {/* Description */}
  <section>
    <h2 className="text-2xl font-bold mb-4">{t('jobs.content.jobDescription')}</h2>
    <div dangerouslySetInnerHTML={{ __html: job.description }} />
  </section>
  
  {/* Requirements */}
  {job.requirements && (
    <section>
      <h2 className="text-2xl font-bold mb-4">{t('jobs.content.requirements')}</h2>
      <div dangerouslySetInnerHTML={{ __html: job.requirements }} />
    </section>
  )}
</div>
```

## Data Processing Functions

### Salary Formatting
```typescript
const formatSalary = (job: Job) => {
  // Handle negotiable salary
  if (job.salary_type === 'negotiable' || job.is_salary_negotiable) {
    return t('jobs.form.labels.negotiable')
  }
  
  // Handle structured salary data
  if (job.salaryMin && job.salaryMax && job.salaryType) {
    const min = job.salaryMin.toLocaleString()
    const max = job.salaryMax.toLocaleString()
    const type = getTypeTranslation(job.salaryType)
    const result = `${min} - ${max} BAM${type}`
    return job.is_salary_negotiable ? `${result} (${t('jobs.form.labels.negotiable')})` : result
  }
  
  // Handle minimum salary only
  if (job.salaryMin && job.salaryType) {
    // Implementation details...
  }
  
  // Fallback to legacy field
  return job.salary || null
}
```

### Date Formatting
```typescript
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date)
}
```

### Job Type Formatting
```typescript
const formatJobType = (type: string, locale: string) => {
  const typeMap = {
    quick_job: locale === 'bs' ? 'Kratkotrajan posao' : 'Quick Job',
    full_time: locale === 'bs' ? 'Puno radno vrijeme' : 'Full Time',
    part_time: locale === 'bs' ? 'Skraćeno radno vrijeme' : 'Part Time',
    remote: locale === 'bs' ? 'Rad na daljinu' : 'Remote'
  }
  return typeMap[type] || type
}
```

## Privacy & Security Implementation

### Conditional Information Display
```typescript
// Location privacy
const showDetailedLocation = job.isSelectedTasker || isOwner
const showMap = job.job_latitude && job.job_longitude && showDetailedLocation

// Contact privacy
const showContactDetails = isOwner || job.isSelectedTasker

return (
  <>
    {showDetailedLocation ? (
      <p className="text-sm font-medium">{job.job_address}</p>
    ) : (
      <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
        <p className="text-sm font-medium text-yellow-800">
          {t('jobs.privacy.locationRestricted')}
        </p>
      </div>
    )}
  </>
)
```

### User Role Detection
```typescript
const { user } = useSupabaseAuth()
const isOwner = user?.id === job.posted_by
const { data: applications } = useUserAppliedJobs()
const hasApplied = applications?.some(app => app.job_id === job.id)
```

## Icon Integration Pattern

### Consistent Icon Usage
```typescript
import { 
  Calendar, Clock, MapPin, Banknote, 
  Mail, Phone, Star, TrendingUp, Tag 
} from "lucide-react"

// Icon wrapper pattern
<div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
  <Calendar className="h-4 w-4 text-gray-600" />
</div>
```

## Translation Integration

### Translation Key Structure
```typescript
// Translation usage pattern
const t = useTranslations()
const locale = useLocale()

// Nested key access
t('jobs.details.jobDetails')        // "Job Details"
t('jobs.form.labels.salary')        // "Salary" 
t('jobs.content.requirements')      // "Requirements"

// Dynamic translations
t('jobs.form.labels.multipleDays', { days: job.duration_days })
```

### Translation File Organization
```json
{
  "jobs": {
    "details": {
      "jobDetails": "Job Details",
      "compensation": "Compensation",
      "salary": "Salary"
    },
    "form": {
      "labels": {
        "performanceBonus": "Performance Bonus",
        "negotiable": "Negotiable",
        "oneDay": "1 day",
        "multipleDays": "{days} days"
      }
    },
    "privacy": {
      "locationRestricted": "Location details are restricted",
      "availableAfterSelection": "Available after selection",
      "contactHidden": "Hidden"
    }
  }
}
```

## Provider Configuration

### Global Provider Setup
```typescript
// In providers.tsx
import { JobDetailsDrawerProvider } from '@/components/jobs/job-details-drawer'

export function Providers({ children }: ProvidersProps) {
  return (
    <SupabaseProvider>
      <AuthProvider>
        <DataProvider>
          <JobDetailsDrawerProvider />
          {children}
        </DataProvider>
      </AuthProvider>
    </SupabaseProvider>
  )
}
```

### Provider Component
```typescript
// Provider component pattern
export function JobDetailsDrawerProvider() {
  const { isOpen, jobId, closeDrawer } = useJobDetailsDrawer()
  
  if (!isOpen || !jobId) return null
  
  return <JobDetailsDrawer />
}
```

## Performance Optimizations

### Efficient Re-rendering
```typescript
// Memoize expensive calculations
const formattedSalary = useMemo(() => formatSalary(job), [job])
const isOwner = useMemo(() => user?.id === job.posted_by, [user?.id, job.posted_by])

// Optimize conditional rendering
const showTransportation = job.transportation || job.has_parking || job.public_transport_info
```

### Lazy Component Loading
```typescript
// Dynamic imports for heavy components
const GoogleJobLocationMap = lazy(() => import('@/components/jobs/google-job-location-map'))

// Conditional rendering with Suspense
{showMap && (
  <Suspense fallback={<div className="h-[250px] bg-gray-200 animate-pulse rounded" />}>
    <GoogleJobLocationMap latitude={job.job_latitude} longitude={job.job_longitude} />
  </Suspense>
)}
```

## Error Handling

### Comprehensive Error Boundaries
```typescript
const fetchJobDetails = async (jobId: string) => {
  try {
    // Data fetching logic
  } catch (error) {
    console.error('Failed to fetch job details:', error)
    toast.error(t('jobs.messages.errorLoadingJob'))
    closeDrawer() // Close on critical errors
  }
}
```

### Graceful Degradation
```typescript
// Safe data access patterns
const jobTitle = job?.title || t('common.messages.untitled')
const jobDescription = job?.description || t('common.messages.noDescription')

// Conditional rendering with fallbacks
{job ? (
  <JobContent job={job} />
) : (
  <div className="p-6 text-center">
    <p>{t('jobs.messages.jobNotFound')}</p>
  </div>
)}
```

## Testing Implementation

### Unit Test Structure
```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { JobDetailsDrawer } from '../job-details-drawer'

describe('JobDetailsDrawer', () => {
  it('renders job information correctly', () => {
    const mockJob = createMockJob()
    render(<JobDetailsDrawer />)
    
    expect(screen.getByText(mockJob.title)).toBeInTheDocument()
    expect(screen.getByText(/compensation/i)).toBeInTheDocument()
  })
  
  it('handles close actions properly', () => {
    render(<JobDetailsDrawer />)
    fireEvent.click(screen.getByRole('button', { name: /close/i }))
    
    expect(mockCloseDrawer).toHaveBeenCalled()
  })
})
```

### Integration Test Patterns
```typescript
describe('Job Card to Drawer Integration', () => {
  it('opens drawer when job card is clicked', () => {
    const mockJob = createMockJob()
    render(<JobCard job={mockJob} />)
    
    fireEvent.click(screen.getByRole('button'))
    
    expect(screen.getByText('Job Details')).toBeInTheDocument()
  })
})
```

## Build Configuration

### TypeScript Configuration
Ensure proper type checking for the drawer components:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  },
  "include": [
    "src/components/jobs/job-details-drawer.tsx",
    "src/hooks/use-job-details-drawer.ts"
  ]
}
```

### ESLint Rules
```json
{
  "rules": {
    "react-hooks/exhaustive-deps": "error",
    "@typescript-eslint/no-unused-vars": "error"
  }
}
```

This implementation guide provides the technical foundation for understanding, maintaining, and extending the Job Details Drawer system.