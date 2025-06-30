-- Complete Supabase Setup Script
-- Run this script in your Supabase SQL editor to ensure everything is properly set up

-- Step 1: Create user_role enum (if it doesn't exist)
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'employer', 'employee');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Step 2: Create profiles table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'employee',
    avatar_url TEXT,
    company_name TEXT,
    position TEXT,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Step 4: Create trigger for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Step 5: Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Step 6: Drop existing policies (if any) and recreate them
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Create RLS policies
CREATE POLICY "Users can view all profiles" ON profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Step 7: Create handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, email, name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'employee')
    );
    RETURN NEW;
END;
$$ language 'plpgsql' security definer;

-- Step 8: Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 9: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at);

-- Step 10: Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.profiles TO anon, authenticated;

-- Step 11: Verify setup
DO $$
BEGIN
    -- Check if enum exists
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        RAISE EXCEPTION 'user_role enum not created';
    END IF;
    
    -- Check if table exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles' AND table_schema = 'public') THEN
        RAISE EXCEPTION 'profiles table not created';
    END IF;
    
    -- Check if function exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'handle_new_user' AND routine_schema = 'public') THEN
        RAISE EXCEPTION 'handle_new_user function not created';
    END IF;
    
    RAISE NOTICE 'All setup completed successfully!';
END $$;
