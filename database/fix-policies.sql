-- Clean up duplicate RLS policies that might be causing conflicts
-- This could be the source of the "Database error querying schema" issue

-- 1. Drop ALL existing policies on profiles table
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- 2. Create clean, non-conflicting policies with simple names
CREATE POLICY "profiles_select" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "profiles_insert" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- 3. Verify the policies are correct
SELECT policyname, cmd, permissive, qual, with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'profiles'
ORDER BY cmd, policyname;
