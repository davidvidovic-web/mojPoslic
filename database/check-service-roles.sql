-- Test with proper Supabase service role permissions
-- Run this to check if the issue is with user roles

-- 1. Check what roles exist in your database
SELECT rolname, rolsuper, rolcanlogin 
FROM pg_roles 
WHERE rolname IN ('postgres', 'authenticator', 'service_role', 'anon', 'authenticated')
ORDER BY rolname;

-- 2. Check if service_role has proper permissions on auth schema
SELECT 
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.schema_privileges 
WHERE schema_name = 'auth'
ORDER BY grantee;

-- 3. Check auth.users table permissions for service roles
SELECT 
    grantee,
    privilege_type
FROM information_schema.table_privileges 
WHERE table_schema = 'auth' 
AND table_name = 'users'
AND grantee IN ('service_role', 'authenticator', 'anon', 'authenticated')
ORDER BY grantee, privilege_type;

-- 4. Check if there are any missing or broken auth functions
SELECT 
    routine_name,
    routine_type,
    security_type
FROM information_schema.routines 
WHERE routine_schema = 'auth'
ORDER BY routine_name;

-- 5. Test basic auth function access
SELECT auth.uid() as current_auth_user_id;

-- 6. Check if JWT settings are accessible
SELECT 
    setting_name,
    setting_value
FROM pg_settings 
WHERE name LIKE '%jwt%' OR name LIKE '%auth%'
ORDER BY name;
