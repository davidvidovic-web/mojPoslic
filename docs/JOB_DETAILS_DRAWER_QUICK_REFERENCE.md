# Job Details Drawer - Quick Reference

## Quick Start

### 1. Open a Job Drawer
```typescript
import { useJobDetailsDrawer } from '@/hooks/use-job-details-drawer'

const { openDrawer } = useJobDetailsDrawer()
openDrawer(jobId)
```

### 2. Close the Drawer
```typescript
const { closeDrawer } = useJobDetailsDrawer()
closeDrawer()
```

### 3. Check Drawer State
```typescript
const { isOpen, jobId } = useJobDetailsDrawer()
```

## Component Integration

### Job Card Integration Example
```typescript
import { useJobDetailsDrawer } from '@/hooks/use-job-details-drawer'

const JobCard = ({ job }) => {
  const { openDrawer } = useJobDetailsDrawer()
  
  return (
    <div 
      onClick={() => openDrawer(job.id)}
      className="cursor-pointer p-4 border rounded hover:shadow-lg"
    >
      <h3>{job.title}</h3>
      <p>{job.company}</p>
    </div>
  )
}
```

### Provider Setup
```typescript
// In your app's providers.tsx or layout
import { JobDetailsDrawerProvider } from '@/components/jobs/job-details-drawer'

export function Providers({ children }) {
  return (
    <>
      {/* Other providers */}
      <JobDetailsDrawerProvider />
      {children}
    </>
  )
}
```

## Translation Keys Reference

### Core Sections
| Key | English | Bosnian |
|-----|---------|---------|
| `jobs.details.jobDetails` | Job Details | Detalji posla |
| `jobs.details.compensation` | Compensation | Kompenzacija |
| `jobs.content.jobDescription` | Job Description | Opis posla |
| `jobs.content.requirements` | Requirements | Zahtjevi |
| `jobs.content.benefits` | Benefits | Benefiti |

### Form Labels
| Key | English | Bosnian |
|-----|---------|---------|
| `jobs.form.labels.salary` | Salary | Plata |
| `jobs.form.labels.negotiable` | Negotiable | Po dogovoru |
| `jobs.form.labels.performanceBonus` | Performance Bonus | Bonus za performanse |
| `jobs.form.labels.startDate` | Start Date | Datum početka |
| `jobs.form.labels.duration` | Duration | Trajanje |
| `jobs.form.labels.applicationDeadline` | Application Deadline | Rok za prijavu |

### Transportation
| Key | English | Bosnian |
|-----|---------|---------|
| `jobs.form.labels.transportation` | Transportation | Prevoz |
| `jobs.form.labels.transportationProvided` | Provided by client | Osigurava klijent |
| `jobs.form.labels.transportationCompensated` | Compensated | Kompenzovano |
| `jobs.form.labels.parking` | Parking | Parking |
| `jobs.form.labels.publicTransport` | Public Transport | Javni prevoz |

### Privacy Messages
| Key | English | Bosnian |
|-----|---------|---------|
| `jobs.privacy.locationRestricted` | Location details are restricted | Detalji lokacije su ograničeni |
| `jobs.privacy.availableAfterSelection` | Available after selection | Dostupno nakon selekcije |
| `jobs.privacy.contactHidden` | Hidden | Skriveno |

## Job Data Structure

### Required Fields
```typescript
interface MinimalJob {
  id: string
  title: string
  description: string
  job_type: 'quick_job' | 'full_time' | 'part_time' | 'remote'
}
```

### Commonly Used Optional Fields
```typescript
interface ExtendedJob extends MinimalJob {
  // Compensation
  salary_type?: 'fixed' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'negotiable'
  salary_amount?: number
  salary_min?: number
  salary_max?: number
  is_salary_negotiable?: boolean
  performance_bonus?: boolean
  
  // Content
  requirements?: string
  benefits?: string
  tags?: string[]
  
  // Schedule
  start_date?: string
  start_time?: string
  duration?: string
  duration_days?: number
  application_deadline?: string
  
  // Location
  job_address?: string
  exact_location?: string
  job_latitude?: number
  job_longitude?: number
  
  // Transportation
  transportation?: 'provided' | 'not_provided' | 'compensated'
  transportation_amount?: number
  has_parking?: boolean
  public_transport_info?: string
  
  // Status
  is_urgent?: boolean
  is_featured?: boolean
  
  // Contact
  application_url?: string
  website?: string
  
  // Relationships
  city?: { name: string }
  category?: { name: string }
  postedBy?: { name: string, email: string, phone: string }
}
```

## Privacy Control Logic

### Show Detailed Information When:
```typescript
const showDetails = job.isSelectedTasker || isOwner
const isOwner = user?.id === job.posted_by
```

### Privacy-Protected Fields:
- `job_address` - Exact work location
- `job_latitude`, `job_longitude` - Map coordinates  
- `postedBy.phone` - Contact phone number
- Interactive map component

## Styling Classes Reference

### Layout Classes
```css
/* Full-screen drawer */
.drawer-container {
  @apply fixed inset-0 z-50 bg-black/50;
}

/* Drawer panel */
.drawer-panel {
  @apply absolute inset-y-0 right-0 w-full max-w-4xl bg-background border-l overflow-hidden;
}

/* Sticky header */
.drawer-header {
  @apply sticky top-0 z-10 bg-background/95 backdrop-blur p-6;
}

/* Scrollable content */
.drawer-content {
  @apply h-full overflow-y-auto pb-20 px-6 space-y-8;
}
```

### Section Classes
```css
/* Section headers */
.section-header {
  @apply text-2xl font-bold mb-4 text-foreground;
}

/* Info cards */
.info-card {
  @apply flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl;
}

/* Icon containers */
.icon-container {
  @apply w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center;
}

/* Privacy indicators */
.privacy-warning {
  @apply bg-yellow-50 border border-yellow-200 rounded p-3;
}
```

## Common Patterns

### Conditional Section Rendering
```typescript
{(condition1 || condition2 || condition3) && (
  <section>
    <h2>{t('section.title')}</h2>
    <div className="space-y-4">
      {condition1 && <Component1 />}
      {condition2 && <Component2 />}
      {condition3 && <Component3 />}
    </div>
  </section>
)}
```

### Info Card Pattern
```typescript
<div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
  <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
    <Icon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
  </div>
  <div>
    <span className="text-sm font-medium text-muted-foreground">{label}</span>
    <p className="text-sm font-medium text-foreground">{value}</p>
  </div>
</div>
```

### Privacy-Protected Content
```typescript
{isAuthorized ? (
  <p className="text-sm font-medium">{sensitiveData}</p>
) : (
  <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
    <p className="text-sm font-medium text-yellow-800">
      {t('jobs.privacy.restricted')}
    </p>
    <p className="text-xs text-yellow-600">
      {t('jobs.privacy.availableAfterSelection')}
    </p>
  </div>
)}
```

## Debugging

### Debug Drawer State
```typescript
import { useJobDetailsDrawer } from '@/hooks/use-job-details-drawer'

const DebugDrawer = () => {
  const store = useJobDetailsDrawer()
  console.log('Drawer state:', store)
  
  return (
    <div className="fixed top-4 left-4 bg-black text-white p-2 rounded text-xs">
      Open: {store.isOpen ? 'Yes' : 'No'} | Job: {store.jobId || 'None'}
    </div>
  )
}
```

### Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|---------|
| Drawer not opening | Provider not configured | Add `<JobDetailsDrawerProvider />` |
| Missing translations | Key not found | Check translation files for key existence |
| Job data not loading | Invalid job ID | Verify job exists and ID is correct |
| Privacy content not updating | User state not refreshed | Check auth context updates |
| Performance issues | Too many re-renders | Add `useMemo` for expensive calculations |

## Version Compatibility

### Next.js Requirements
- Next.js 13+ (App Router)
- React 18+
- TypeScript 4.9+

### Package Dependencies
```json
{
  "zustand": "^4.0.0",
  "next-intl": "^3.0.0",
  "lucide-react": "^0.400.0",
  "sonner": "^1.0.0"
}
```

## Migration Guide

### From Page Navigation to Drawer
1. Remove old job detail page routes
2. Update job card click handlers to use `openDrawer()`
3. Add drawer provider to app layout
4. Test all job card components

### Legacy Job Fields Support
The drawer maintains backward compatibility with legacy job fields:
- `salary` → formatted display
- `type` → mapped to `job_type`
- `company` → uses `postedBy.name`

This quick reference should help developers quickly implement and work with the Job Details Drawer system.