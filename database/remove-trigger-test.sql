-- Emergency fix: Remove trigger entirely to test if auth works without it
-- This will help isolate if the trigger is truly the cause

-- 1. Remove the trigger completely
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. Keep the function but it won't be called automatically
-- (We can manually create profiles later)

-- 3. Test message
SELECT 'Trigger completely removed. Test login now - it should work without profile creation.';

-- 4. After testing login, you can manually create a profile with:
-- INSERT INTO public.profiles (id, email, name, role) 
-- VALUES ('your-user-id', 'your-email', 'your-name', 'employee');

-- 5. If login works without trigger, we know the trigger was the issue
-- If login still fails, the problem is elsewhere (RLS, permissions, or Supabase config)
