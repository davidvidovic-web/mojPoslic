-- Step-by-step diagnostic to identify the exact issue
-- Run each section separately in Supabase SQL Editor

-- 1. First, check if we can access the auth schema at all
SELECT current_user, current_database();
| current_user | current_database |
| ------------ | ---------------- |
| postgres     | postgres         |
-- 2. Check if profiles table exists
SELECT table_name, table_schema 
FROM information_schema.tables 
WHERE table_name = 'profiles';
| table_name | table_schema |
| ---------- | ------------ |
| profiles   | public       |

-- 3. Check if user_role enum exists
SELECT typname, enumlabel
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE typname = 'user_role';
| typname   | enumlabel |
| --------- | --------- |
| user_role | admin     |
| user_role | employee  |
| user_role | employer  |

-- 4. Check if we can query auth.users (this might be the issue)
SELECT COUNT(*) FROM auth.users;
| count |
| ----- |
| 1     |
-- 5. Check if handle_new_user function exists
SELECT routine_name, specific_name, routine_definition
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user' 
AND routine_schema = 'public';
| routine_name    | specific_name         | routine_definition                                                                                                                                                                                                                                                                   |
| --------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| handle_new_user | handle_new_user_18411 | 
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
 |

-- 6. Check triggers on auth.users
SELECT trigger_name, event_manipulation, action_timing
FROM information_schema.triggers 
WHERE event_object_schema = 'auth' 
AND event_object_table = 'users';
| trigger_name         | event_manipulation | action_timing |
| -------------------- | ------------------ | ------------- |
| on_auth_user_created | INSERT             | AFTER         |
-- 7. Check RLS status on profiles
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'profiles';
| schemaname | tablename | rowsecurity |
| ---------- | --------- | ----------- |
| public     | profiles  | true        |
-- 8. Check existing policies
SELECT policyname, cmd, permissive
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'profiles';
| policyname                               | cmd    | permissive |
| ---------------------------------------- | ------ | ---------- |
| Public profiles are viewable by everyone | SELECT | PERMISSIVE |
| Users can insert their own profile       | INSERT | PERMISSIVE |
| Users can update their own profile       | UPDATE | PERMISSIVE |
| Users can view all profiles              | SELECT | PERMISSIVE |
| Users can update own profile             | UPDATE | PERMISSIVE |
| Users can insert own profile             | INSERT | PERMISSIVE |
-- 9. Try to access profiles table directly
SELECT COUNT(*) FROM public.profiles;
| count |
| ----- |
| 1     |