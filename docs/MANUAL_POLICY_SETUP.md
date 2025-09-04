# Manual Storage Policy Setup Guide

## 🚨 RLS Error Fix - Step by Step

Your storage buckets exist and RLS is enabled, but **no policies exist yet**. You need to create them manually via the Supabase Dashboard.

### Step 1: Access the Dashboard
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Authentication** → **Policies**

### Step 2: Find Storage Objects Table (Alternative Method)

**If you don't see the "storage" schema section in the UI:**

1. The storage schema might not be visible in the Policies UI
2. **Use the SQL Editor instead** (this is more reliable)
3. Go to **SQL Editor** in your Supabase Dashboard  
4. Copy and paste the contents of `docs/CREATE_STORAGE_POLICIES.sql`
5. Click **Run** to execute the SQL
6. This will create all 4 avatar policies directly

**If you DO see the storage schema:**
1. Look for the **"storage"** schema section
2. Find the **"objects"** table 
3. You should see "Row Level Security is enabled" message
4. Continue with Step 3 below

### Step 3: Create Policies

**Option A: SQL Editor Method (Recommended if storage schema not visible)**
1. Go to **SQL Editor** in Supabase Dashboard
2. Copy and paste the contents of `docs/CREATE_STORAGE_POLICIES.sql`  
3. Click **Run** to execute
4. Skip to Step 7 (Verify Policies)

**Option B: Manual UI Method (if storage schema is visible)**
Click **"New Policy"** and create each policy manually:

**Policy 1: Avatar Upload Policy**

**Policy Name:** `Users can upload their own avatars`
- **Policy Command:** `INSERT`
- **Target Roles:** `authenticated`
- **USING expression:** *(leave empty)*
- **WITH CHECK expression:** 
```sql
bucket_id = 'avatars' AND auth.uid()::text = split_part(name, '.', 1)
```

**Policy 2: Avatar View Policy**

**Policy Name:** `Anyone can view avatars`
- **Policy Command:** `SELECT` 
- **Target Roles:** `authenticated, anon`
- **USING expression:**
```sql
bucket_id = 'avatars'
```

**Policy 3: Avatar Update Policy**

**Policy Name:** `Users can update their own avatars`
- **Policy Command:** `UPDATE`
- **Target Roles:** `authenticated`
- **USING expression:**
```sql
bucket_id = 'avatars' AND auth.uid()::text = split_part(name, '.', 1)
```

**Policy 4: Avatar Delete Policy**

**Policy Name:** `Users can delete their own avatars`
- **Policy Command:** `DELETE`
- **Target Roles:** `authenticated`
- **USING expression:**
```sql
bucket_id = 'avatars' AND auth.uid()::text = split_part(name, '.', 1)
```
- **WITH CHECK expression:** *(leave empty)*

### Step 7: Verify Policies
After creating all 4 policies, you should see them listed under storage.objects. 

### Step 8: Test Upload
1. Go back to your application
2. Try uploading an avatar
3. It should work now! 🎉

---

## ⚡ Quick Test Alternative

If you want to test immediately without setting up policies:

1. Go to **Authentication** → **Policies** → **storage.objects**
2. **Temporarily disable RLS** (toggle the switch to OFF)
3. Test your upload
4. **Re-enable RLS** and set up proper policies before production

⚠️ **Warning:** Only disable RLS for testing. Always re-enable it with proper policies for security.

---

## How These Policies Work

- **File naming:** Your code uploads files as `{userId}.{extension}` (e.g., `abc123.jpg`)
- **Upload policy:** Only allows users to upload files where the filename (before the `.`) matches their user ID
- **View policy:** Anyone can view avatar files (they're public)
- **Update/Delete:** Users can only modify files that belong to them

This ensures users can only manage their own avatars while allowing public viewing.

## Troubleshooting

- **Can't find storage schema?** Make sure you're looking in the right project
- **Policies not working?** Double-check the expressions match exactly
- **Still getting errors?** Temporarily disable RLS to test, then re-enable

Once you create these 4 policies, your avatar uploads will work perfectly! 🚀
