-- Check Supabase project configuration for auth issues
-- This will help identify project-level problems

-- 1. Check if auth schema is properly accessible
SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'auth';

-- 2. Check auth.users table structure and accessibility
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'auth' 
AND table_name = 'users'
ORDER BY ordinal_position;

-- 3. Check if there are any problematic constraints on auth.users
SELECT 
    constraint_name,
    constraint_type
FROM information_schema.table_constraints 
WHERE table_schema = 'auth' 
AND table_name = 'users';

-- 4. Check for any custom triggers or functions on auth.users (besides yours)
SELECT 
    trigger_name,
    action_statement,
    action_timing,
    event_manipulation
FROM information_schema.triggers 
WHERE event_object_schema = 'auth' 
AND event_object_table = 'users';

-- 5. Check auth configuration tables
SELECT 
    table_name
FROM information_schema.tables 
WHERE table_schema = 'auth'
ORDER BY table_name;

-- 6. Check if there are any auth-related extensions
SELECT 
    extname as extension_name,
    extversion as version
FROM pg_extension 
WHERE extname LIKE '%auth%' OR extname LIKE '%supabase%';

-- 7. Check current database and user permissions
SELECT 
    current_database(),
    current_user,
    session_user;

-- 8. Check if there are any blocking policies on auth schema itself
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd
FROM pg_policies 
WHERE schemaname = 'auth';

-- 9. Test if we can insert into auth.users directly (this should fail with permission error, not schema error)
-- SELECT 'Testing direct auth.users access...' as test;
