# Job Post Form Components

## Overview

This directory contains the complete job posting and editing system, featuring a modular architecture that separates concerns while sharing common functionality.

## Quick Start

### Basic Job Creation
```tsx
import { JobPostForm } from '@/components/job-post-form'

<JobPostForm onJobPosted={() => console.log('Job created!')} />
```

### Job Editing
```tsx
import { JobEditForm } from '@/components/job-post-form'

<JobEditForm 
  jobId="job-123"
  initialData={existingJobData}
  onJobUpdated={() => console.log('Job updated!')}
/>
```

### Legacy Compatibility
```tsx
import { MultiStepJobForm } from '@/components/job-post-form'

// Will automatically route to JobPostForm or JobEditForm
<MultiStepJobForm 
  isEditMode={false}
  onJobPosted={() => console.log('Done!')}
/>
```

## Component Architecture

```
MultiStepJobForm (Entry Point)
├── JobPostForm (Create Workflow)
│   └── JobFormBase (Shared Logic)
│       ├── BasicDetailsStep
│       ├── LocationCompensationStep
│       └── ReviewStep
└── JobEditForm (Edit Workflow)
    └── JobFormBase (Shared Logic)
        ├── BasicDetailsStep
        ├── LocationCompensationStep
        └── ReviewStep
```

## Component Details

### `MultiStepJobForm`
- **Purpose**: Entry point and backward compatibility
- **Props**: `isEditMode`, `jobId`, `initialData`, `onJobPosted`, `onCancel`
- **Behavior**: Routes to appropriate workflow based on props

### `JobPostForm`
- **Purpose**: Handle new job creation
- **Features**: Progressive validation, form reset, success notifications
- **API**: POST to `/api/jobs/create`

### `JobEditForm`
- **Purpose**: Handle job editing
- **Features**: Pre-filled data, free navigation, edit indicators
- **API**: PUT to `/api/jobs/{id}`

### `JobFormBase`
- **Purpose**: Shared form logic and 3-step workflow
- **Features**: State management, validation, navigation, responsive UI

### Step Components

#### `BasicDetailsStep`
- Job title, company name, description
- City and category selection
- Required field validation

#### `LocationCompensationStep`
- Job location with map picker
- Salary information (optional)
- Job type, start date, requirements, benefits

#### `ReviewStep`
- Final review of all information
- Contact details
- Submission handling

## Workflow Differences

### Create Mode (JobPostForm)
- ✅ Progressive validation (must complete steps in order)
- ✅ Empty form with smart defaults
- ✅ Form reset after successful submission
- ✅ Cannot navigate to incomplete steps

### Edit Mode (JobEditForm)
- ✅ Pre-filled with existing job data
- ✅ Free navigation between all steps
- ✅ No validation restrictions
- ✅ Visual edit mode indicators
- ✅ Optimized for quick edits

## API Integration

### Create Job
```typescript
POST /api/jobs/create
{
  title: string
  company: string
  description: string
  type: 'quick_job' | 'full_time' | 'part_time' | 'remote'
  city_id: string
  category_id?: string
  // ... other fields
}
```

### Update Job
```typescript
PUT /api/jobs/{id}
// Same payload structure as create
```

## Testing

### Test Files
- `job-post-form.test.tsx` - Create workflow testing
- `job-edit-form.test.tsx` - Edit workflow testing  
- `job-form-base.test.tsx` - Shared logic testing
- `multi-step-job-form.test.tsx` - Delegation testing
- `category-selection.test.tsx` - Category logic testing

### Running Tests
```bash
npm test -- src/components/job-post-form/__tests__/
```

## TypeScript Interfaces

### Core Types
```typescript
interface CreateJobData {
  title: string
  company: string
  description: string
  type: 'quick_job' | 'full_time' | 'part_time' | 'remote'
  city_id: string
  category_id?: string
  // ... other fields
}

type JobFormStep = 'basic-details' | 'location-compensation' | 'review'
```

### Component Props
```typescript
interface JobPostFormProps {
  initialData?: Partial<CreateJobData>
  onJobPosted?: () => void
}

interface JobEditFormProps {
  jobId: string
  initialData: Partial<CreateJobData>
  onJobUpdated?: () => void
  onCancel?: () => void
}
```

## Best Practices

### Usage Guidelines
1. **Use JobPostForm directly** for new job creation flows
2. **Use JobEditForm directly** for job editing workflows
3. **Use MultiStepJobForm** only for legacy compatibility
4. **Always provide onJobPosted/onJobUpdated** for state updates
5. **Handle loading states** in parent components

### Performance Tips
- Components are optimized for re-rendering
- Form state is managed efficiently
- Validation runs only when necessary
- Step navigation is debounced

### Accessibility
- All forms are keyboard navigable
- Screen reader compatible
- Clear focus management
- Proper ARIA labels and descriptions

## Troubleshooting

### Common Issues

**Form not submitting:**
- Check that all required fields are filled
- Verify user authentication state
- Check network connectivity and API responses

**Validation errors:**
- Ensure category selection is complete
- Check that email formats are valid
- Verify start date is not in the past

**Edit mode not working:**
- Confirm `jobId` and `initialData` are provided
- Check that user has permission to edit the job
- Verify job exists and is not deleted

### Debug Mode
Set `NODE_ENV=development` to see additional console logs and validation details.

## Integration Examples

### In a Modal Dialog
```tsx
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { JobEditForm } from '@/components/job-post-form'

<Dialog open={isEditing} onOpenChange={setIsEditing}>
  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
    <JobEditForm
      jobId={job.id}
      initialData={job}
      onJobUpdated={() => {
        setIsEditing(false)
        refetchJobs()
      }}
      onCancel={() => setIsEditing(false)}
    />
  </DialogContent>
</Dialog>
```

### In a Dashboard
```tsx
import { JobPostForm } from '@/components/job-post-form'

<Card>
  <CardHeader>
    <CardTitle>Post New Job</CardTitle>
  </CardHeader>
  <CardContent>
    <JobPostForm onJobPosted={() => router.push('/dashboard')} />
  </CardContent>
</Card>
```

---

## Changelog

**v3.0.0** (June 2025)
- Split into JobPostForm and JobEditForm
- Added comprehensive test suite
- Streamlined to 3-step workflow
- Full TypeScript coverage

**v2.0.0** (January 2025)
- Added job editing capabilities
- Improved validation and UX

**v1.0.0** (December 2024)
- Initial multi-step form implementation
