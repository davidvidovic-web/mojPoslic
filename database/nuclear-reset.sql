-- Nuclear option: Completely reset the profiles setup
-- Use this only if all other approaches fail

-- 1. Drop everything related to profiles
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TYPE IF EXISTS public.user_role CASCADE;

-- 2. Recreate everything from scratch with minimal setup
CREATE TYPE public.user_role AS ENUM ('admin', 'employer', 'employee');

CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    role public.user_role NOT NULL DEFAULT 'employee',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Enable RLS with very simple policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_all_access" ON public.profiles
    FOR ALL USING (true) WITH CHECK (true);

-- 4. Grant all permissions
GRANT ALL ON public.profiles TO authenticated, anon;
GRANT USAGE ON TYPE public.user_role TO authenticated, anon;

-- 5. Do NOT create any triggers - handle profiles manually in the app
SELECT 'Profiles table recreated with minimal setup. No triggers. Test login now.';

-- 6. You can create profiles manually after successful login:
-- INSERT INTO public.profiles (id, email, name, role) 
-- SELECT id, email, email, 'employee' FROM auth.users WHERE id NOT IN (SELECT id FROM public.profiles);
