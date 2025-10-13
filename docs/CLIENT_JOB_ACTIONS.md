# Client Job Actions

## Overview
Added three new action buttons to the client dashboard jobs component for better job management:
- **Accept** - Accept a job/applicant
- **Reject** - Reject a job/applicant  
- **Close** - Close/lock a job (prevent new applications)

## Implementation

### Component Updates (`client-jobs-manager.tsx`)

#### New Props
```typescript
interface ClientJobsManagerProps {
  // ... existing props
  onAccept?: (jobId: string) => void
  onReject?: (jobId: string) => void
  onClose?: (jobId: string) => void
}
```

#### New Buttons
1. **Accept Button** (Green)
   - Icon: CheckCircle
   - Color: Green (border-green-500/50, text-green-600)
   - Hover: Green background with white text
   - Label: "Accept" / "Prihvati"

2. **Reject Button** (Orange)
   - Icon: XCircle
   - Color: Orange (border-orange-500/50, text-orange-600)
   - Hover: Orange background with white text
   - Label: "Reject" / "Odbij"

3. **Close Button** (Blue)
   - Icon: Lock
   - Color: Blue (border-blue-500/50, text-blue-600)
   - Hover: Blue background with white text
   - Label: "Close" / "Zatvori"

### Button Order
The action buttons appear in this order:
1. Edit (Gray outline)
2. Feature/Remove Feature (Gray outline) - if `onFeature` provided
3. **Accept (Green)** - if `onAccept` provided
4. **Reject (Orange)** - if `onReject` provided
5. **Close (Blue)** - if `onClose` provided
6. Delete (Red) - always present

### Translations

#### Bosnian (`translations/bs/dashboard.json`)
```json
{
  "jobManagement": {
    "accept": "Prihvati",
    "reject": "Odbij",
    "close": "Zatvori"
  }
}
```

#### English (`translations/en/dashboard.json`)
```json
{
  "jobManagement": {
    "accept": "Accept",
    "reject": "Reject",
    "close": "Close"
  }
}
```

## Usage

### Basic Implementation
```typescript
<ClientJobsManager
  jobs={jobs}
  applicationCounts={applicationCounts}
  onEdit={handleEdit}
  onDelete={handleDelete}
  onAccept={handleAccept}     // New
  onReject={handleReject}     // New
  onClose={handleClose}       // New
/>
```

### With Handlers
```typescript
const handleAccept = (jobId: string) => {
  // Accept the job or selected applicant
  console.log('Accepting job:', jobId)
  // Update job status to accepted
  // Or accept a specific applicant for this job
}

const handleReject = (jobId: string) => {
  // Reject the job or selected applicant
  console.log('Rejecting job:', jobId)
  // Update job status to rejected
  // Or reject applicants for this job
}

const handleClose = (jobId: string) => {
  // Close the job to new applications
  console.log('Closing job:', jobId)
  // Set is_active to false or add closed status
  // Prevents new applications
}
```

## Visual Design

### Color Scheme
- **Accept**: Green theme (success, positive action)
- **Reject**: Orange theme (warning, negative action)
- **Close**: Blue theme (neutral, administrative action)

### Responsive Layout
- Buttons wrap on smaller screens using `flex-wrap`
- `whitespace-nowrap` prevents text wrapping within buttons
- `truncate` class on text for very long labels

### Accessibility
- Clear icon + text labels
- Color + icon for colorblind users
- Hover states for interaction feedback
- Consistent button sizing (size="sm")

## Use Cases

### Accept Button
- Accept a winning applicant for the job
- Approve the job posting (admin approval flow)
- Mark job as accepted/completed

### Reject Button
- Reject applicants for the job
- Decline the job posting
- Cancel the job before completion

### Close Button
- Prevent new applications once enough received
- Temporarily pause accepting applications
- Archive the job without deleting

## Optional Handlers
All three handlers are **optional**. Buttons only appear when the corresponding handler is provided:
- No `onAccept` → Accept button hidden
- No `onReject` → Reject button hidden
- No `onClose` → Close button hidden

This allows flexibility based on:
- Job status (can't accept/reject closed jobs)
- User permissions (only owner can close)
- Business logic (only accept if applications exist)

## Future Enhancements

1. **Conditional Visibility**: Show buttons based on job status
   ```typescript
   // Only show Accept if job has applicants
   onAccept={job.application_count > 0 ? handleAccept : undefined}
   
   // Only show Close if job is active
   onClose={job.is_active ? handleClose : undefined}
   ```

2. **Confirmation Dialogs**: Add confirmation before destructive actions
   ```typescript
   const handleReject = (jobId: string) => {
     if (confirm('Are you sure you want to reject this job?')) {
       // Proceed with rejection
     }
   }
   ```

3. **Batch Actions**: Add checkbox selection for bulk operations
4. **Status-based Actions**: Different buttons for different job statuses
5. **Tooltips**: Add helpful tooltips explaining each action
