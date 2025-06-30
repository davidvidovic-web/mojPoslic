# Database Migration Guide

## Schema Changes Summary

The application has been updated to work with the new database schema. Here are the key changes:

### New Tables
- `cities` - Stores city information with bilingual support (Bosnian/Serbian and English)
- `job_listings` - Replaces the old `jobs` table with enhanced structure
- `profiles` - User profiles supporting both employers and employees
- `job_applications` - Tracks job applications with status management
- `saved_jobs` - Allows users to save jobs for later

### Key Differences from Old Schema

#### Jobs → job_listings
- `location` (text) → `city_id` (FK to cities table)
- `salary_min`/`salary_max` (numbers) → `salary` (text for flexible format)
- `application_url`/`contact_email` → `website`/`email` (required email field)
- Added `tags` (JSONB array)
- Added `is_featured` flag
- Job types now include: `full-time`, `part-time`, `contract`, `remote`, `quick-job`

#### Cities Table
- Bilingual support with `name_bs` and `name_en`
- Uses `key` field for URL-friendly identifiers
- Support for special/featured cities

### Component Updates

All components have been updated to work with the new schema:

1. **JobCard** - Updated to display city names and new salary format
2. **JobList** - Updated query to join with cities table, new filtering
3. **JobPostForm** - Updated to use city selection and new job types
4. **Types** - Updated Job and CreateJobData interfaces

### Testing

To test the migration:

1. Ensure your database has the new schema
2. Optionally run the seed data: `psql -d your_db < seed-data.sql`
3. Start the application and test:
   - Job listing and filtering
   - Job posting form
   - City selection
   - Tag functionality

### Environment Variables

Make sure these environment variables are set:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

The application will automatically use the new table structure and should work seamlessly with your updated database schema.
