# Job Details Drawer System

## Overview

The Job Details Drawer is a comprehensive full-screen overlay component that displays complete job information, replacing the traditional page-based navigation system. It provides users with an immersive, detailed view of job postings while maintaining context within the job listings.

## Architecture

### Components

- **JobDetailsDrawer** (`/src/components/jobs/job-details-drawer.tsx`) - Main drawer component
- **useJobDetailsDrawer** (`/src/hooks/use-job-details-drawer.ts`) - Zustand store for state management
- **Job Cards Integration** - Updated job cards to use drawer instead of navigation

### State Management

The drawer uses Zustand for global state management with a simple API:

```typescript
interface JobDetailsDrawerStore {
  isOpen: boolean
  jobId: string | null
  openDrawer: (jobId: string) => void
  closeDrawer: () => void
}
```

## Features

### 1. Comprehensive Job Information Display

The drawer displays all job information in organized sections:

#### Job Overview
- Job title and company information
- Job type badge (Quick Job, Full Time, Part Time, Remote)
- Featured status indicator
- Application status for current user
- Posted date and poster information

#### Job Content
- **Description** - Rich HTML content with proper styling
- **Requirements** - Detailed job requirements if specified
- **Benefits** - Employee benefits and perks if provided
- **Skills & Technologies** - Tag-based skill requirements

#### Compensation Details
- **Salary Information** - Formatted with currency (KM), type (hourly/daily/weekly/monthly)
- **Negotiable Status** - Clear indication if salary is negotiable
- **Performance Bonus** - Boolean indicator if performance bonuses are available

#### Job Details - Schedule & Timeline
- **Start Date** - When the job begins (with "By Agreement" fallback)
- **Start Time** - Specific time requirements
- **Duration** - Job length in days or descriptive format
- **Application Deadline** - When applications close
- **Expiration Date** - When the job posting expires

#### Transportation & Location
- **Transportation Arrangement** - Provided/Compensated/Not Provided with amounts
- **Parking Availability** - Whether parking is available
- **Public Transport** - Accessibility information
- **Urgency Indicators** - Priority and urgent status flags

#### Location Information
- **City/Region** - Primary job location
- **Job Address** - Specific work location (privacy-protected)
- **Exact Location** - Additional location details if different from address
- **Interactive Map** - Google Maps integration (privacy-protected)

#### Contact Information
- **Primary Contact** - Email and phone (privacy-protected)
- **Website** - Company or project website
- **Application URL** - External application links

### 2. Privacy & Security Controls

The drawer implements comprehensive privacy controls:

- **Location Privacy** - Map and specific address hidden until user selection
- **Contact Privacy** - Phone numbers and detailed contact info protected
- **Selective Exposure** - Information revealed based on user role and job assignment status

### 3. Application Management

- **Application Status** - Shows if user has already applied
- **Application Actions** - Direct apply functionality with external URL support
- **Owner Recognition** - Special UI for job owners

### 4. Responsive Design

- **Full-Screen Overlay** - Immersive experience on all devices
- **Mobile Optimized** - Touch-friendly interactions and proper sizing
- **Dark Mode Support** - Consistent theming across light/dark modes

## Design System

### Color Scheme
The drawer follows a clean monochromatic design:

- **Base Colors** - Black, white, gray scale
- **Green Accents** - Only for salary/payment information
- **System Colors** - Standard success/error/warning states
- **Privacy Indicators** - Yellow/amber for restricted information

### Typography
- **Headers** - Bold, clear hierarchy
- **Body Text** - High contrast for readability
- **Meta Information** - Muted colors for secondary information

### Layout
- **Section-Based** - Clear information grouping
- **Card Components** - Consistent styling with rounded corners
- **Icon Integration** - Lucide React icons for visual context

## Integration

### Job Cards Integration

Both main job card components integrate with the drawer:

```typescript
// In job card components
import { useJobDetailsDrawer } from '@/hooks/use-job-details-drawer'

const { openDrawer } = useJobDetailsDrawer()

const handleJobClick = () => {
  openDrawer(job.id)
}
```

### Provider Setup

The drawer provider must be included in the app layout:

```typescript
// In providers.tsx
import { JobDetailsDrawerProvider } from '@/components/jobs/job-details-drawer'

export function Providers({ children }: ProvidersProps) {
  return (
    <>
      {/* Other providers */}
      <JobDetailsDrawerProvider />
      {children}
    </>
  )
}
```

## Internationalization

### Translation Structure

The drawer supports full internationalization with comprehensive translation keys:

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
        "transportationProvided": "Provided by client",
        "applicationDeadline": "Application Deadline"
      }
    },
    "privacy": {
      "locationRestricted": "Location details are restricted",
      "availableAfterSelection": "Available after selection"
    }
  }
}
```

### Supported Languages
- English (en)
- Bosnian (bs)

## Data Flow

### Job Data Structure

The drawer consumes the complete Job type definition:

```typescript
interface Job {
  // Basic Information
  id: string
  title: string
  description: string
  job_type: 'quick_job' | 'full_time' | 'part_time' | 'remote'
  
  // Compensation
  salary_type: 'fixed' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'negotiable'
  salary_amount?: number
  salary_min?: number
  salary_max?: number
  is_salary_negotiable?: boolean
  performance_bonus?: boolean
  
  // Schedule & Timeline
  start_date?: string
  start_time?: string
  duration?: string
  duration_days?: number
  application_deadline?: string
  expires_at?: string
  
  // Location & Transportation
  job_address?: string
  exact_location?: string
  job_latitude?: number
  job_longitude?: number
  transportation?: 'provided' | 'not_provided' | 'compensated'
  transportation_amount?: number
  has_parking?: boolean
  public_transport_info?: string
  
  // Status & Flags
  is_urgent: boolean
  is_featured: boolean
  status: 'active' | 'inactive' | 'completed' | 'expired'
  
  // Additional Details
  requirements?: string
  benefits?: string
  tags?: string[]
  
  // Contact Information
  application_url?: string
  website?: string
  
  // Relationships
  city?: City
  category?: Category
  postedBy?: User
}
```

## Performance Considerations

### Lazy Loading
- Job details are fetched on-demand when drawer opens
- Map components load only when needed
- Rich content (HTML) is safely rendered

### State Management
- Minimal global state (open/closed + jobId)
- No unnecessary re-renders
- Efficient cleanup on close

### Memory Management
- Proper cleanup of event listeners
- Efficient re-rendering patterns
- Optimized for mobile devices

## Accessibility

### Keyboard Navigation
- ESC key to close drawer
- Tab navigation through interactive elements
- Focus management on open/close

### Screen Reader Support
- Proper ARIA labels and roles
- Semantic HTML structure
- Clear heading hierarchy

### Visual Accessibility
- High contrast ratios
- Scalable typography
- Clear visual hierarchy

## Testing Strategy

### Unit Tests
- Component rendering with various job data
- State management functionality
- Privacy control logic

### Integration Tests
- Job card to drawer navigation
- Application flow testing
- Privacy state transitions

### E2E Tests
- Complete user journey from job list to application
- Cross-device functionality
- Performance under load

## Future Enhancements

### Planned Features
- Job sharing functionality
- Save job for later
- Similar jobs recommendations
- Enhanced map interactions

### Performance Optimizations
- Virtual scrolling for large job details
- Progressive image loading
- Optimistic UI updates

## Migration Notes

### From Page-Based Navigation
- Job detail pages can be deprecated
- URL routing simplified
- Improved user experience with context preservation

### Backward Compatibility
- Legacy job fields are still supported
- Graceful degradation for missing data
- Smooth transition for existing users

## Troubleshooting

### Common Issues

1. **Drawer not opening**
   - Ensure JobDetailsDrawerProvider is properly configured
   - Check job ID is valid
   - Verify hook imports

2. **Missing job data**
   - Check Job type completeness
   - Verify database field mapping
   - Ensure proper data fetching

3. **Translation issues**
   - Confirm translation keys exist in both languages
   - Check locale context provider
   - Verify translation file structure

4. **Performance issues**
   - Monitor component re-render cycles
   - Check for memory leaks in useEffect cleanup
   - Optimize large job data sets

### Debug Mode
Enable debug logging by setting environment variable:
```bash
DEBUG_JOB_DRAWER=true
```

## Changelog

### Version 1.0.0
- Initial implementation with comprehensive job data display
- Full internationalization support
- Privacy controls and security features
- Responsive design and accessibility compliance
- Integration with existing job card components