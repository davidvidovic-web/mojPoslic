-- Alternative diagnosis: Check for other potential issues
-- Run this if removing the trigger doesn't fix the login

-- 1. Check if there are any other triggers on auth.users that might be interfering
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_schema = 'auth' 
AND event_object_table = 'users';

-- 2. Check if there are any other functions that might be called during auth
SELECT 
    routine_name,
    routine_type,
    security_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%user%' 
OR routine_name LIKE '%auth%'
OR routine_name LIKE '%profile%';

-- 3. Check if profiles table has any other constraints that might be failing
SELECT 
    constraint_name,
    constraint_type,
    table_name
FROM information_schema.table_constraints 
WHERE table_name = 'profiles' 
AND table_schema = 'public';

-- 4. Check for any custom extensions or functions that might interfere
SELECT 
    schemaname,
    tablename,
    attname,
    defname
FROM pg_attrdef 
JOIN pg_attribute ON pg_attrdef.adrelid = pg_attribute.attrelid 
    AND pg_attrdef.adnum = pg_attribute.attnum
JOIN pg_class ON pg_attribute.attrelid = pg_class.oid
JOIN pg_namespace ON pg_class.relnamespace = pg_namespace.oid
WHERE nspname = 'public' 
AND relname = 'profiles';

-- 5. Test if the issue is with a specific user
-- Check if any existing users have problematic data
SELECT 
    id,
    email,
    raw_user_meta_data,
    created_at
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;
