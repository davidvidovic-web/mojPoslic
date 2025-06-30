-- Simplified Setup Script - Run this if complete-setup.sql didn't work
-- This addresses common auth issues with Supabase

-- 1. Ensure we're in the right schema context
SET search_path TO public, auth;

-- 2. Create user_role enum with explicit schema
DROP TYPE IF EXISTS public.user_role CASCADE;
CREATE TYPE public.user_role AS ENUM ('admin', 'employer', 'employee');

-- 3. Drop profiles table if it exists and recreate
DROP TABLE IF EXISTS public.profiles CASCADE;
CREATE TABLE public.profiles (
    id UUID NOT NULL,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    role public.user_role NOT NULL DEFAULT 'employee',
    avatar_url TEXT,
    company_name TEXT,
    position TEXT,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT profiles_pkey PRIMARY KEY (id),
    CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 4. Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies with explicit names
CREATE POLICY profiles_select_policy ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY profiles_insert_policy ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY profiles_update_policy ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- 6. Grant permissions explicitly
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.profiles TO anon, authenticated;
GRANT USAGE ON TYPE public.user_role TO anon, authenticated;

-- 7. Create the trigger function with security definer
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
        COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'employee'::public.user_role)
    );
    RETURN NEW;
END;
$$;

-- 8. Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 9. Create indexes
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- 10. Test the setup
DO $$
DECLARE
    test_count INTEGER;
BEGIN
    -- Test if we can query profiles
    SELECT COUNT(*) INTO test_count FROM public.profiles;
    RAISE NOTICE 'Profiles table accessible. Current count: %', test_count;
    
    -- Test if we can query auth.users (this is often where it fails)
    SELECT COUNT(*) INTO test_count FROM auth.users;
    RAISE NOTICE 'Auth users table accessible. Current count: %', test_count;
    
    RAISE NOTICE 'Setup completed successfully!';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error during setup test: %', SQLERRM;
END $$;
