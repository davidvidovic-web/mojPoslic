# Storage Setup and Troubleshooting Guide

## Current Issue
Avatar uploads are failing with "new row violates row-level security policy" error.

## Root Cause
The Supabase storage buckets exist, but they don't have proper Row Level Security (RLS) policies configured, which are required for file uploads.

## Quick Fix

### Option 1: Manual Policy Setup via Dashboard (Recommended)

**The SQL approach failed due to permissions. Use the Dashboard UI instead:**

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to **Authentication** > **Policies**
3. Find the **storage** schema and **objects** table
4. Enable RLS if not already enabled
5. Click **"New Policy"** and create these 4 policies:

**Policy 1: "Users can upload their own avatars"**
- Policy command: `INSERT`
- Target roles: `authenticated`  
- WITH CHECK expression: `bucket_id = 'avatars' AND auth.uid()::text = split_part(name, '.', 1)`

**Policy 2: "Anyone can view avatars"**
- Policy command: `SELECT`
- Target roles: `authenticated, anon`
- USING expression: `bucket_id = 'avatars'`

**Policy 3: "Users can update their own avatars"**  
- Policy command: `UPDATE`
- Target roles: `authenticated`
- USING expression: `bucket_id = 'avatars' AND auth.uid()::text = split_part(name, '.', 1)`

**Policy 4: "Users can delete their own avatars"**
- Policy command: `DELETE`
- Target roles: `authenticated` 
- USING expression: `bucket_id = 'avatars' AND auth.uid()::text = split_part(name, '.', 1)`

### Option 2: Using Service Role Key (Advanced)
If you have access to the service role key, you might be able to run policies programmatically:
```bash
npm run supabase:setup-policies
```

## Common Permission Errors

### Error: "must be owner of table objects"
- **Cause**: Your database user doesn't have owner privileges on the storage.objects table
- **Solution**: Use the Dashboard UI method above instead of SQL commands
- **Why**: Supabase restricts direct SQL access to storage tables for security

### Quick Test: Temporarily Disable RLS (Not Recommended for Production)
If you want to test uploads quickly, you can temporarily disable RLS:

1. Go to **Authentication** > **Policies** > **storage.objects**
2. Toggle **"Enable RLS"** to OFF temporarily
3. Test your avatar upload 
4. **Important**: Re-enable RLS and set up proper policies before going to production

⚠️ **Security Warning**: Only use this for testing. Disabling RLS allows unrestricted file access.

## How Storage RLS Works

For avatar uploads, the policies work as follows:

1. **File Naming**: Avatars are stored as `{userId}.{extension}` (e.g., `abc123.jpg`)
2. **Upload Policy**: Users can only upload files where the filename (before the extension) matches their user ID
3. **View Policy**: Anyone can view avatar files (they are public)
4. **Update/Delete**: Users can only modify files that belong to them

## File Structure

```
Storage Buckets:
├── avatars/           (public, 2MB limit)
│   ├── user1-id.jpg
│   ├── user2-id.png
│   └── ...
├── resumes/           (private, 2MB limit)  
├── message-attachments/ (private, 2MB limit)
└── company-logos/     (public, 2MB limit)
```

## Verification

After running the SQL, verify the setup:

1. Check policies were created:
```sql
SELECT policyname, cmd FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage' 
AND policyname LIKE '%avatar%';
```

2. Test upload in the application
3. Check browser console for any remaining errors

## Troubleshooting

### Error: "Storage access denied"
- RLS policies not set up correctly
- Run the SQL setup script above

### Error: "Bucket not found" 
- Storage buckets not created
- Run: `npm run supabase:setup-storage`

### Error: "Authentication failed"
- User not logged in
- Check authentication state

### Error: "File too large"
- File exceeds 2MB limit
- Use smaller image or compress

## Next Steps

1. ✅ Run storage setup SQL
2. ✅ Test avatar upload
3. 🔄 Set up similar policies for other buckets (resumes, etc.)
4. 🔄 Add more sophisticated conversation-based policies for message attachments
