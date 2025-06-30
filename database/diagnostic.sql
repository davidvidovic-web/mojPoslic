-- Supabase Database Diagnostic Script
-- Run this in your Supabase SQL editor to check what's missing

-- 1. Check if user_role enum exists
SELECT 
    typname as enum_name,
    enumlabel as enum_value
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE typname = 'user_role'
ORDER BY enumsortorder;

-- 2. Check if profiles table exists and its structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 3. Check RLS policies on profiles table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'profiles';

-- 4. Check if the handle_new_user function exists
SELECT 
    routine_name,
    routine_type,
    specific_name
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'handle_new_user';

-- 5. Check if the trigger exists on auth.users
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'auth' 
AND event_object_table = 'users'
AND trigger_name = 'on_auth_user_created';

-- 6. Check if there are any existing profiles
SELECT 
    COUNT(*) as profile_count,
    COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_count,
    COUNT(CASE WHEN role = 'employer' THEN 1 END) as employer_count,
    COUNT(CASE WHEN role = 'employee' THEN 1 END) as employee_count
FROM profiles;

-- 7. Check if auth.users table is accessible
SELECT COUNT(*) as user_count FROM auth.users;

-- 8. Test a simple profile query (this is what your app is trying to do)
-- Replace 'your-user-id-here' with an actual user ID if you have one
-- SELECT * FROM profiles WHERE id = 'your-user-id-here';
