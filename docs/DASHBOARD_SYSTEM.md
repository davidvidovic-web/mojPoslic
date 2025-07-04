# Dashboard System Documentation

## Overview

The dashboard system provides role-based interfaces for different user types in the job platform. Each role has a tailored dashboard with specific functionality and data access patterns.

## Architecture

### 🏗️ **Dashboard Structure**

```
src/components/dashboard/
├── admin-dashboard.tsx           # Main admin interface
├── client-dashboard.tsx          # Client (individual) interface  
├── company-dashboard.tsx         # Company interface
├── tasker-dashboard.tsx          # Tasker (worker) interface
├── connections-section.tsx       # Shared connections component
├── admin/                        # Admin-specific components
│   ├── admin-stats-cards.tsx
│   ├── user-management-tab.tsx
│   ├── job-management-tab.tsx
│   └── system-management-tab.tsx
├── client/                       # Client-specific components
│   ├── dashboard-header.tsx
│   ├── dashboard-stats-cards.tsx
│   ├── job-card-actions.tsx
│   ├── job-card.tsx
│   └── jobs-list-section.tsx
├── company/                      # Company-specific components
│   ├── applications-analytics-tabs.tsx
│   ├── company-stats-cards.tsx
│   ├── jobs-management-tab.tsx
│   └── overview-tab.tsx
├── tasker/                       # Tasker-specific components
│   ├── applications-section.tsx
│   ├── recommended-jobs-section.tsx
│   ├── saved-jobs-section.tsx
│   └── tasker-stats-cards.tsx
└── connections/                  # Connection system components
    ├── connection-activity.tsx
    ├── connection-balance.tsx
    ├── connection-costs.tsx
    ├── connection-history.tsx
    ├── low-connections-warning.tsx
    └── purchase-connections-section.tsx
```

## Role-Based Dashboards

### 🛡️ **Admin Dashboard**

**Purpose**: System administration and oversight
**Access**: Admin users only

**Features**:
- User management (view, edit roles, suspend)
- Job moderation (approve, reject, feature)
- System statistics and analytics
- Category and city management
- Job type configuration

**Tabs**:
```typescript
- User Management: List all users, manage roles
- Job Management: Moderate job postings
- System Management: Configure categories, cities, job types
```

**API Endpoints Used**:
- `/api/admin/users` - User data with job counts
- `/api/admin/jobs` - All job postings with details
- `/api/admin/stats` - Dashboard statistics
- `/api/admin/categories` - Job categories management
- `/api/admin/cities` - Cities management  
- `/api/admin/types` - Job types with usage stats

### 🏢 **Company Dashboard**

**Purpose**: Enterprise-level job posting and recruitment
**Access**: Company role users

**Features**:
- Multi-job management
- Application tracking
- Company analytics
- Team collaboration tools
- Advanced posting options

**Tabs**:
```typescript
- Overview: Company stats and recent activity
- Job Listings: Manage all company job postings
- Applications: Track and manage applications
- Analytics: Detailed recruitment metrics
```

### 👤 **Client Dashboard**

**Purpose**: Individual job posting and management
**Access**: Client role users

**Features**:
- Personal job posting
- Application management
- Connection system integration
- Basic analytics

**Layout**:
```typescript
- Header: Post new job action
- Stats Cards: Personal job statistics
- Job List: Active and inactive postings
- Connections: Purchase and manage connections
```

### 🔧 **Tasker Dashboard**

**Purpose**: Job discovery and application management
**Access**: Tasker role users

**Features**:
- Job search and discovery
- Application tracking
- Saved jobs management
- Profile optimization
- Skill showcase

**Sections**:
```typescript
- Applications: Track sent applications
- Saved Jobs: Bookmarked opportunities
- Recommended: AI-suggested jobs
- Connections: View and purchase connections
```

## Dashboard Routing

### **Main Router** (`src/app/dashboard/page.tsx`)

```typescript
export default function DashboardPage() {
  const { user, loading } = useAuth()
  const searchParams = useSearchParams()
  
  // Redirect to profile setup if not completed
  useEffect(() => {
    if (user && !user.profileSetupCompleted) {
      router.push('/profile-setup')
    }
  }, [user, router])
  
  // Admin can access any dashboard view
  if (user.role === UserRole.admin) {
    const dashboardView = searchParams.get('view') || 'default'
    switch (dashboardView) {
      case 'client': return <ClientDashboard />
      case 'company': return <CompanyDashboard />
      case 'tasker': return <TaskerDashboard />
      case 'admin':
      default: return <AdminDashboard />
    }
  }
  
  // Regular users get role-specific dashboard
  switch (user.role) {
    case 'client': return <ClientDashboard />
    case 'company': return <CompanyDashboard />
    case 'tasker': return <TaskerDashboard />
    default: return <UnknownRoleError />
  }
}
```

### **Admin Multi-View Access**

Admins can access any dashboard by URL parameter:
```
/dashboard               # Admin dashboard (default)
/dashboard?view=admin    # Admin dashboard (explicit)
/dashboard?view=client   # Client dashboard view
/dashboard?view=company  # Company dashboard view
/dashboard?view=tasker   # Tasker dashboard view
```

## Component Patterns

### **Dashboard Structure Pattern**

All dashboards follow a consistent structure:

```typescript
export function RoleDashboard() {
  const { user } = useAuth()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Data fetching
  useEffect(() => {
    fetchData()
  }, [])
  
  // Loading state
  if (loading) {
    return <LoadingComponent />
  }
  
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <DashboardHeader />
        
        {/* Stats Cards */}
        <StatsCards />
        
        {/* Main Content */}
        <MainContent />
      </div>
    </div>
  )
}
```

### **Stats Cards Pattern**

Each role has customized statistics:

```typescript
// Example: Client Stats
interface ClientStats {
  totalJobs: number
  activeJobs: number
  totalApplications: number
  connectionBalance: number
}

// Example: Admin Stats  
interface AdminStats {
  users: {
    total: number
    admin: number
    client: number
    tasker: number
    company: number
  }
  jobs: {
    total: number
    active: number
    featured: number
  }
  growth: {
    percentage: number
    recentUsers: number
    previousUsers: number
  }
}
```

### **Data Fetching Pattern**

Consistent async data loading:

```typescript
const fetchData = async () => {
  try {
    setLoading(true)
    const response = await fetch('/api/role-specific-endpoint')
    if (!response.ok) {
      throw new Error('Failed to fetch data')
    }
    const data = await response.json()
    setData(data)
  } catch (error) {
    console.error('Error fetching data:', error)
    toast.error('Failed to load data')
  } finally {
    setLoading(false)
  }
}
```

## Shared Components

### **Connections System**

The connections system is shared across Client and Tasker dashboards:

```typescript
// Usage in dashboards
<ConnectionsSection />

// Features
- Connection balance display
- Purchase connections
- Connection history
- Usage tracking
- Low balance warnings
```

### **Job Management Components**

Reusable job-related components:

```typescript
// Job posting (Client/Company)
<JobPostForm onJobPosted={handleJobPosted} />

// Job listing (All roles)
<JobCard job={job} onJobUpdated={fetchJobs} />
<JobCardList job={job} onJobUpdated={fetchJobs} />

// Job applications (Tasker)
<ApplicationsSection applications={applications} />
```

## UI Design System

### **Color Scheme**

```css
/* Role-specific gradients */
.admin-header {
  background: linear-gradient(to right, #DC2626, #B91C1C); /* Red */
}

.client-header {
  background: linear-gradient(to right, #2563EB, #7C3AED); /* Blue to Purple */
}

.company-header {
  background: linear-gradient(to right, #059669, #0D9488); /* Green */
}

.tasker-header {
  background: linear-gradient(to right, #2563EB, #7C3AED); /* Blue to Purple */
}
```

### **Layout Grid**

```typescript
// Standard dashboard layout
<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
  {/* Main content - 2/3 width */}
  <div className="lg:col-span-2">
    <MainContent />
  </div>
  
  {/* Sidebar - 1/3 width */}
  <div className="space-y-8">
    <SidebarComponent />
  </div>
</div>
```

### **Responsive Design**

All dashboards are mobile-responsive:

```typescript
// Stats cards responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

// Job cards responsive grid  
<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

// Mobile-first approach with breakpoints
className="flex flex-col md:flex-row md:items-center md:justify-between"
```

## Data Management

### **State Management Pattern**

Each dashboard manages its own state:

```typescript
// Local state for dashboard data
const [jobs, setJobs] = useState<Job[]>([])
const [stats, setStats] = useState<Stats | null>(null)
const [loading, setLoading] = useState(true)

// Refresh patterns
const refreshData = useCallback(async () => {
  await Promise.all([
    fetchJobs(),
    fetchStats(),
    fetchApplications()
  ])
}, [])

// Auto-refresh on data changes
useEffect(() => {
  refreshData()
}, [refreshTrigger])
```

### **Optimistic Updates**

For better UX, dashboards use optimistic updates:

```typescript
const handleJobUpdate = async (jobId: string, updates: Partial<Job>) => {
  // Optimistic update
  setJobs(prev => prev.map(job => 
    job.id === jobId ? { ...job, ...updates } : job
  ))
  
  try {
    await updateJob(jobId, updates)
    toast.success('Job updated successfully')
  } catch (error) {
    // Revert on error
    await fetchJobs()
    toast.error('Failed to update job')
  }
}
```

## Error Handling

### **Error Boundaries**

Each dashboard includes error handling:

```typescript
// Loading states
if (loading) {
  return <DashboardSkeleton />
}

// Error states
if (error) {
  return <ErrorState onRetry={fetchData} />
}

// Empty states
if (data.length === 0) {
  return <EmptyState />
}
```

### **Toast Notifications**

Consistent feedback using Sonner:

```typescript
import { toast } from 'sonner'

// Success notifications
toast.success('Job posted successfully!')

// Error notifications  
toast.error('Failed to load jobs')

// Loading notifications
toast.loading('Posting job...')
```

## Performance Optimizations

### **Lazy Loading**

Large datasets use pagination:

```typescript
const ITEMS_PER_PAGE = 20

// Pagination calculation
const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE)
const paginatedData = filteredData.slice(startIndex, endIndex)

// Pagination component
<JobsPagination
  currentPage={currentPage}
  totalPages={totalPages}
  onPageChange={setCurrentPage}
/>
```

### **Memoization**

Expensive calculations are memoized:

```typescript
const filteredJobs = useMemo(() => {
  return jobs.filter(job => {
    const matchesSearch = searchTerm === '' || 
      job.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || 
      job.category?.key === categoryFilter
    return matchesSearch && matchesCategory
  })
}, [jobs, searchTerm, categoryFilter])
```

### **Skeleton Loading**

Improve perceived performance:

```typescript
// While loading, show skeleton UI
{loading ? (
  <div className="space-y-4">
    {Array.from({ length: 6 }).map((_, index) => (
      <JobCardSkeleton key={index} />
    ))}
  </div>
) : (
  <JobsList jobs={jobs} />
)}
```

## Testing

### **Component Testing**

Each dashboard component should be tested:

```typescript
// Example test structure
describe('AdminDashboard', () => {
  it('renders admin stats correctly', () => {
    // Test stats display
  })
  
  it('loads user management tab', () => {
    // Test tab switching
  })
  
  it('handles data loading states', () => {
    // Test loading/error states
  })
})
```

### **Integration Testing**

Test role-based access:

```typescript
describe('Dashboard Routing', () => {
  it('redirects non-admin users from admin view', () => {
    // Test access control
  })
  
  it('allows admin to access all dashboard views', () => {
    // Test admin multi-view access
  })
})
```

## Future Enhancements

### **Planned Features**

1. **Real-time Updates**: WebSocket integration for live data
2. **Advanced Analytics**: Charts and reporting
3. **Bulk Operations**: Multi-select actions
4. **Export Functionality**: CSV/PDF data export
5. **Dashboard Customization**: User-configurable layouts
6. **Mobile Apps**: React Native dashboard apps

### **Performance Improvements**

1. **Virtual Scrolling**: For large job lists
2. **Background Sync**: Service worker data sync
3. **Caching Strategy**: Redis for frequently accessed data
4. **Image Optimization**: Next.js Image component integration

## Maintenance

### **Code Organization**

- Keep dashboard-specific logic in respective folders
- Share common components in the root dashboard directory
- Use TypeScript interfaces for type safety
- Follow consistent naming conventions

### **Updates and Migration**

When updating dashboards:
1. Update TypeScript interfaces
2. Test role-based access
3. Verify API endpoint compatibility
4. Check responsive design on all breakpoints
5. Update documentation

## System Management Features

### **Connections Management**
The admin dashboard includes a comprehensive connections management system:

**Location**: Admin Dashboard → System Management → Connections

**Features**:
- **User Selection**: Dropdown with all platform users
- **Grant Connections**: Numeric input for connection amounts
- **Audit Trail**: Optional reason field for tracking
- **Real-time Updates**: Immediate UI updates after granting
- **User Overview**: Display all users with current connection balances

**Implementation**:
```typescript
// Connection granting workflow
const handleGrantConnections = async () => {
  const response = await fetch('/api/admin/connections', {
    method: 'POST',
    body: JSON.stringify({
      userId: selectedUserId,
      amount: parseInt(connectionAmount),
      reason: reason || 'Admin grant'
    })
  })
  
  if (response.ok) {
    // Refresh user list and show success
    fetchUsersForConnections()
    toast.success('Connections granted successfully')
  }
}
```

### **Categories & Cities Management**
System management also handles:
- **Categories**: View and manage job categories with popularity flags
- **Cities**: Manage available cities with special status indicators
- **Pagination**: Handle large datasets with proper pagination
- **Search**: Quick filtering capabilities

**Data Structure**:
```typescript
interface AdminCategory {
  id: string
  key: string
  nameEN: string
  nameBS: string
  isPopular: boolean
  sortOrder: number
  isActive: boolean
  createdAt: string
}

interface AdminCity {
  id: string
  key: string
  nameEN: string
  nameBS: string
  isSpecial: boolean
  sortOrder: number
  isActive: boolean
  createdAt: string
}
```

## API Integration

### **Dashboard Data Loading**
Each dashboard fetches its required data on mount:

**Admin Dashboard APIs**:
- `GET /api/admin/users` - User management data
- `GET /api/admin/jobs` - Job moderation data
- `GET /api/admin/stats` - Platform statistics
- `GET /api/admin/categories` - Category management
- `GET /api/admin/cities` - City management
- `GET /api/admin/connections` - User connections data

**Error Handling**:
```typescript
const fetchStats = async () => {
  try {
    const response = await fetch('/api/admin/stats')
    if (!response.ok) {
      throw new Error('Failed to fetch stats')
    }
    const data = await response.json()
    setStats(data)
  } catch (error) {
    console.error('Error fetching stats:', error)
    toast.error('Failed to load statistics')
  }
}
```
