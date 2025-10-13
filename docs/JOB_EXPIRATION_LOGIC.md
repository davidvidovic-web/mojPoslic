# Job Expiration Logic

## Overview
Jobs now have a smart expiration system that calculates when they expire based on the job's start date or a default 14-day period from creation.

## Expiration Calculation

### Logic
```typescript
// If job has a start_date, use that as the deadline
if (job.start_date) {
  return new Date(job.start_date)
}

// Otherwise, calculate: created_at + 14 days (constant)
const createdDate = new Date(job.created_at)
const expirationDate = new Date(createdDate)
expirationDate.setDate(createdDate.getDate() + 14)
return expirationDate
```

### Priority
1. **Job Start Date**: If `start_date` is set → use that as the application deadline
2. **Default Period**: Otherwise → `created_at` + 14 days (constant)

## Implementation

### New Utility Functions (`/src/lib/job-utils.ts`)

```typescript
/**
 * Calculates the expiration date for a job
 * @param job - The job object with created_at and optional start_date
 * @returns The expiration date
 */
export function getJobExpirationDate(job: {
  created_at: string | Date;
  start_date?: string | null;
}): Date

/**
 * Checks if a job is expired
 * @param job - The job object
 * @returns true if the job is expired, false otherwise
 */
export function isJobExpired(job: {
  created_at: string | Date;
  start_date?: string | null;
}): boolean
```

### Updated Components

#### 1. Client Dashboard (`client-jobs-manager.tsx`)
- Status calculation uses `isJobExpired()` instead of checking `expires_at`
- Expires display shows calculated date: `getJobExpirationDate(job)`

#### 2. Job Card (`job-card.tsx`)
- Status badge uses `isJobExpired()` for color/text
- Expiration date always displayed (not conditional)

#### 3. Job Details Drawer (`job-details-drawer.tsx`)
- Expiration section always visible
- Shows calculated expiration date

#### 4. Job Details Page (`job-details.tsx`)
- Expiration section always visible
- Shows calculated expiration date

## Examples

### Example 1: Job with Start Date
```typescript
const job = {
  created_at: '2025-10-01T10:00:00Z',
  start_date: '2025-10-20T09:00:00Z'
}

// Expiration: October 20, 2025 (uses start_date as deadline)
getJobExpirationDate(job) // → 2025-10-20T09:00:00Z
```

### Example 2: Job without Start Date (Default 14 days)
```typescript
const job = {
  created_at: '2025-10-01T10:00:00Z',
  start_date: null
}

// Expiration: October 15, 2025 (created_at + 14 days constant)
getJobExpirationDate(job) // → 2025-10-15T10:00:00Z
```

### Example 3: Checking Expiration Status
```typescript
const job = {
  created_at: '2025-09-20T10:00:00Z',
  start_date: null
}

// Today is October 12, 2025
// Job expires on October 4, 2025 (14 days after creation)
isJobExpired(job) // → true (expired 8 days ago)
```

## Benefits

### 1. **Consistent Expiration**
- All jobs have a calculated expiration date
- No more "Not Specified" for expiration
- Clear expectations for users

### 2. **Smart Deadlines**
- Uses job start date as natural deadline when available
- Falls back to reasonable 14-day constant
- Prevents indefinite job listings

### 3. **Better UX**
- Users always see when a job expires
- Status badges accurately reflect expired state
- No confusion about job availability

## Migration Notes

### Previous Behavior
- Used `expires_at` field directly
- Could be null/undefined
- No automatic expiration calculation

### New Behavior
- Calculates from `start_date` or `created_at + 14 days`
- Always returns a date
- 14-day constant (not client-configurable)

### Database Fields
- `created_at`: Required (job creation timestamp)
- `start_date`: Optional (when the job starts - becomes the application deadline)
- `expires_at`: Legacy field (now calculated, not stored)
- `application_deadline`: NOT USED (expiration is calculated, not set by client)

## Business Rules

### Why 14 Days Constant?
- Provides consistent expectations for all users
- Encourages timely applications
- Prevents stale job listings
- Simple and predictable system

### Why Use Start Date as Deadline?
- Natural deadline: applications should close before job starts
- Makes logical sense to applicants
- No need for separate deadline configuration
- Reduces client configuration complexity

## Future Considerations

1. **Expiration Notifications**: Send reminders to clients before jobs expire
2. **Auto-archival**: Automatically archive expired jobs after a grace period
3. **Repost Mechanism**: Allow clients to easily repost expired jobs with new 14-day window
4. **Different Constants**: Consider different constants for different job types (quick jobs vs full-time)
