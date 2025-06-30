# Supabase Login Error Troubleshooting Guide

## Error: "Database error querying schema"

This error typically occurs when there are issues with the database schema, RLS policies, or missing tables/functions.

## Step-by-Step Debugging Process

### 1. Check Environment Variables

Make sure you have these environment variables set in your `.env.local` file:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 2. Run Database Diagnostic

1. Go to your Supabase dashboard → SQL Editor
2. Run the diagnostic script: `database/diagnostic.sql`
3. Check the output for any missing components

### 3. Run Complete Setup Script

If anything is missing from the diagnostic:

1. Run the complete setup script: `database/complete-setup.sql`
2. This will create all necessary tables, functions, triggers, and policies

### 4. Test Connection Locally

1. Visit `http://localhost:3000/debug` after starting your dev server
2. Click "Test Connection" to verify basic database connectivity
3. Try logging in with existing credentials to see detailed error messages

### 5. Common Issues and Solutions

#### Issue: `profiles` table doesn't exist
**Solution:** Run `database/complete-setup.sql`

#### Issue: RLS policies are blocking access
**Solution:** Check that these policies exist on the `profiles` table:
- "Users can view all profiles" (SELECT)
- "Users can update own profile" (UPDATE)  
- "Users can insert own profile" (INSERT)

#### Issue: `handle_new_user` function missing
**Solution:** This function creates a profile when a user signs up. Re-run the setup script.

#### Issue: Trigger not working
**Solution:** The `on_auth_user_created` trigger should exist on `auth.users` table.

#### Issue: User exists but no profile
**Solution:** Manually create a profile or run:
```sql
INSERT INTO profiles (id, email, name, role)
SELECT id, email, COALESCE(raw_user_meta_data->>'name', email), 'employee'
FROM auth.users 
WHERE id NOT IN (SELECT id FROM profiles);
```

### 6. Create Test User

If you don't have any users yet, create one:

1. Go to Supabase dashboard → Authentication → Users
2. Click "Add user"
3. Add email/password
4. Check if a profile was automatically created

### 7. Manual Profile Creation

If profiles aren't being created automatically:

```sql
-- Replace with actual user data
INSERT INTO profiles (id, email, name, role)
VALUES (
    'user-uuid-from-auth-users',
    'user@example.com',
    'User Name',
    'employee'
);
```

### 8. Check RLS in Supabase Dashboard

1. Go to Database → Tables → profiles
2. Check that "Enable RLS" is turned ON
3. Verify the policies are active

### 9. Test Auth Flow

1. Try signing up a new user (should auto-create profile)
2. Try logging in with existing user
3. Check if profile is fetched correctly

## Files Created for Debugging

- `database/diagnostic.sql` - Check what's missing
- `database/complete-setup.sql` - Fix missing components  
- `src/app/debug/page.tsx` - Test connection locally
- `debug-supabase.js` - Browser console test script

## Still Having Issues?

If you're still getting the error after following these steps:

1. Check the exact error message in browser console
2. Check Supabase project logs in the dashboard
3. Verify your Supabase project is not paused/suspended
4. Double-check environment variables are correct
5. Try creating a fresh Supabase project to test

The most common cause is missing database schema. Run the complete setup script and the issue should be resolved.
