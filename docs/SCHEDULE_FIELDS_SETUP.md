# Job Schedule Fields Implementation - Setup Instructions

## Overview
This update adds `start_date` and `start_time` fields to the Supabase `job_listings` table to properly store and display job schedule information from the job post form.

## 1. Database Migration

**IMPORTANT: Run this SQL in your Supabase Dashboard SQL Editor:**

```sql
-- Add start_date and start_time fields to job_listings table
BEGIN;

-- Add start_date field (can be a date or NULL for negotiable)
ALTER TABLE public.job_listings 
ADD COLUMN IF NOT EXISTS start_date DATE;

-- Add start_time field (time of day when job should start)
ALTER TABLE public.job_listings 
ADD COLUMN IF NOT EXISTS start_time TIME;

-- Add comments for clarity
COMMENT ON COLUMN public.job_listings.start_date IS 'Date when the job should start. NULL means negotiable/flexible.';
COMMENT ON COLUMN public.job_listings.start_time IS 'Time of day when the job should start. NULL means negotiable/flexible.';

COMMIT;
```

## 2. Generate Updated TypeScript Types

After running the migration, generate updated TypeScript types:

```bash
npx supabase gen types typescript --linked > src/lib/database.types.ts
```

## 3. Files Updated

The following files have been updated to handle the new schedule fields:

### API Routes:
- `src/app/api/jobs/[jobId]/route.ts` - Now fetches and returns start_date/start_time
- `src/app/api/jobs/route.ts` - Includes schedule fields in job listings
- `src/app/api/jobs/create/route.ts` - Handles start_date/start_time during job creation

### Components:
- `src/components/jobs/job-details.tsx` - Now displays actual start dates/times instead of "Po dogovoru"

### Translations:
- `translations/bs/jobs.json` - Added "beforeDeadline" translation
- `translations/en/jobs.json` - Added "beforeDeadline" translation

## 4. Field Behavior

### Start Date Display Logic:
1. If `job.start_date` exists and is not 'negotiable' → Show formatted date
2. If no start_date but `job.application_deadline` exists → Show "Before deadline: [date]"
3. Otherwise → Show "Po dogovoru" (By agreement)

### Start Time Display Logic:
1. If `job.start_time` exists and is not 'negotiable' → Show the time
2. Otherwise → Show "Po dogovoru" (By agreement)

## 5. Form Integration

The job post form already collects `start_date` and `start_time` data. With these changes:
- Form data will be properly stored in the database
- Job details page will display the actual schedule information
- Both Bosnian and English locales are supported

## 6. Testing

After applying the migration:
1. Create a new job with specific start date/time
2. Verify the data is stored in the database
3. Check that job details page shows the correct schedule information
4. Test both "Po dogovoru" and specific date/time scenarios

## 7. Type Safety

Once the migration is applied and types are regenerated, the TypeScript compiler will recognize the new fields and provide proper type checking.
