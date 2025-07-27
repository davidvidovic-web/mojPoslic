# Supabase Storage Buckets Setup

## 📁 Storage Buckets Configuration (Week 1 Task)

According to our migration checklist, we need to set up storage buckets for file uploads. This can be done via the Supabase Dashboard.

### Required Buckets

#### 1. **Avatars Bucket**
```sql
-- Bucket Configuration
CREATE BUCKET 'avatars' WITH (
  public = true,
  file_size_limit = 5242880, -- 5MB
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp']
);

-- Storage Policies
CREATE POLICY "Avatar images are publicly accessible" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own avatar" 
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own avatar" 
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

#### 2. **Resumes Bucket**
```sql
-- Bucket Configuration  
CREATE BUCKET 'resumes' WITH (
  public = false,
  file_size_limit = 10485760, -- 10MB
  allowed_mime_types = ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
);

-- Storage Policies
CREATE POLICY "Users can upload their own resumes" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'resumes' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own resumes" 
ON storage.objects FOR SELECT 
USING (
  bucket_id = 'resumes' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Job owners can view applicant resumes" 
ON storage.objects FOR SELECT 
USING (
  bucket_id = 'resumes' 
  AND EXISTS (
    SELECT 1 FROM applications a
    JOIN job_listings j ON a.job_id = j.id
    WHERE j.posted_by_id = auth.uid()
    AND a.resume_url LIKE '%' || name || '%'
  )
);
```

#### 3. **Message Attachments Bucket**
```sql
-- Bucket Configuration
CREATE BUCKET 'message-attachments' WITH (
  public = false,
  file_size_limit = 5242880, -- 5MB
  allowed_mime_types = ARRAY['image/*', 'application/pdf', 'text/plain']
);

-- Storage Policies
CREATE POLICY "Conversation participants can upload attachments" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'message-attachments' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Conversation participants can view attachments" 
ON storage.objects FOR SELECT 
USING (
  bucket_id = 'message-attachments' 
  AND EXISTS (
    SELECT 1 FROM conversation_participants cp
    WHERE cp.user_id = auth.uid()
    AND cp.conversation_id::text = (storage.foldername(name))[2]
  )
);
```

## 🛠️ Setup Instructions

### Via Supabase Dashboard
1. Go to **Storage** → **Buckets**
2. Create each bucket with the specified configuration
3. Set up the storage policies in **SQL Editor**

### Via CLI (when Docker is available)
```bash
# Start local Supabase
npx supabase start

# Create buckets
npx supabase storage create avatars --public
npx supabase storage create resumes
npx supabase storage create message-attachments

# Apply policies via SQL files
npx supabase db push
```

## 📝 Next Steps After Storage Setup

1. ✅ **Test file upload functionality**
2. ✅ **Update environment variables**
3. ✅ **Create upload hooks** (`useFileUpload.ts`)
4. ✅ **Test image transformations**
5. ✅ **Migrate existing file upload components**

## 🔗 Related Files
- Storage client: `src/lib/supabase/client.ts`
- Upload hooks: `src/hooks/useFileUpload.ts` (to be created)
- File components: `src/components/ui/FileUpload.tsx` (to be migrated)

---

**Status**: ⚠️ **Pending** - Requires Supabase Dashboard access or Docker for local setup
