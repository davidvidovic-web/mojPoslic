# Database Migration Mapping & Analysis

## Overview
This document provides a detailed comparison between the current database structure (as implemented in migrations) and the proposed optimized structure from the comprehensive database document. This analysis will guide the implementation of optimization changes.

**Current Database**: Based on 18+ migration files (Prisma + Supabase)  
**Target Database**: Optimized structure from DATABASE_STRUCTURE_COMPREHENSIVE.md  
**Analysis Date**: July 26, 2025

---

## Migration Files Analysis Summary

### Prisma Migrations (Original Structure)
1. **20250705230938_init** - Initial schema with basic tables
2. **20250705231418_fix_verification_tokens_replica_identity** - Fixed replica identity
3. **20250705233504_add_saved_jobs** - Added saved_jobs table
4. **20250717200706_add_user_language_preference** - Added language preference, job_assignments, job_views
5. **20250719142604_add_negotiable_salary_type** - Added 'negotiable' to salary_type enum
6. **20250719143410_remove_city_category_foreign_keys** - Removed FK constraints for cities/categories
7. **20250719210144_add_pending_registrations** - Added pending_registrations table
8. **20250719215724_add_role_change_action** - Added 'ROLE_CHANGE' to connection_action enum
9. **20250720004445_make_role_optional** - Made user role optional
10. **20250720034902_add_account_deletion_requests** - Added account deletion requests
11. **20250720202843_add_user_privacy_settings** - Added user privacy settings table

### Supabase Migrations (Current Structure)
1. **001_initial_schema.sql** - Complete Supabase schema with UUIDs and proper types
2. **002_functions_triggers.sql** - Database functions and triggers
3. **003_rls_policies.sql** - Row Level Security policies
4. **20250726_add_application_url_to_job_listings.sql** - Added application_url column
5. **20250726_seed_cities_categories.sql** - Seeded cities and categories data

---

## Current vs. Proposed Structure Comparison

### 1. Table Count Analysis

#### Current Structure (18 tables):
1. `users` ✅
2. `cities` ❌ (to be replaced with JSON files)
3. `categories` ❌ (to be replaced with JSON files)
4. `job_listings` ✅ (needs optimization)
5. `applications` ✅ (needs caching enhancements)
6. `job_assignments` ✅
7. `conversations` ✅ (needs participant embedding)
8. `conversation_participants` ❌ (to be eliminated)
9. `messages` ✅ (needs caching enhancements)
10. `notifications` ✅ (needs batching enhancements)
11. `reviews` ✅ (needs caching enhancements)
12. `stripe_transactions` ✅
13. `connection_history` ✅
14. `user_privacy_settings` ❌ (to be merged into users)
15. `job_views` ❌ (to be replaced with analytics_events)
16. `saved_jobs` ✅ (needs enhancements)
17. `pending_registrations` ✅
18. `account_deletion_requests` ✅

#### Proposed Structure (19 tables):
- **Eliminated**: 4 tables (cities, categories, conversation_participants, user_privacy_settings, job_views)
- **Enhanced**: 8 tables (users, job_listings, applications, conversations, messages, notifications, reviews, saved_jobs)
- **New Tables**: 6 tables (file_uploads, search_analytics, job_search_vectors, analytics_events, user_activity_summary)
- **Unchanged**: 5 tables (job_assignments, stripe_transactions, connection_history, pending_registrations, account_deletion_requests)

---

## Detailed Migration Requirements

### Phase 1: Foundation Changes

#### 1.1 Users Table Enhancement
**Current Structure:**
```sql
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  name TEXT NOT NULL,
  role user_role DEFAULT 'client',
  email_verified BOOLEAN DEFAULT false,
  profile_setup_completed BOOLEAN DEFAULT false,
  avatar_url TEXT,
  company_name TEXT,
  position TEXT,
  bio TEXT,
  skills TEXT[], -- Already array format ✅
  experience TEXT,
  preferred_job_types TEXT DEFAULT '',
  phone TEXT,
  website TEXT,
  location TEXT,
  connections INTEGER DEFAULT 10,
  connections_last_refresh TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  preferred_language TEXT DEFAULT 'bs'
);
```

**Required Changes:**
```sql
-- Add missing optimization columns
ALTER TABLE users ADD COLUMN average_rating DECIMAL(3,2) DEFAULT 0;
ALTER TABLE users ADD COLUMN total_reviews INTEGER DEFAULT 0;

-- Add embedded privacy settings (merge from user_privacy_settings)
ALTER TABLE users ADD COLUMN profile_visibility TEXT DEFAULT 'public';
ALTER TABLE users ADD COLUMN show_email BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN show_phone BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN allow_messages BOOLEAN DEFAULT true;
ALTER TABLE users ADD COLUMN show_reviews BOOLEAN DEFAULT true;
ALTER TABLE users ADD COLUMN show_completed_jobs BOOLEAN DEFAULT true;
ALTER TABLE users ADD COLUMN email_notifications BOOLEAN DEFAULT true;

-- Add activity statistics
ALTER TABLE users ADD COLUMN jobs_posted INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN jobs_completed INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN last_active_at TIMESTAMPTZ DEFAULT NOW();

-- Create indexes for new columns
CREATE INDEX idx_users_average_rating ON users(average_rating);
CREATE INDEX idx_users_last_active_at ON users(last_active_at);
```

**Migration Plan:**
1. Add new columns to users table
2. Migrate data from user_privacy_settings table
3. Update all application code to use embedded privacy settings
4. Create triggers for automatic rating aggregation
5. Drop user_privacy_settings table after verification

#### 1.2 Job Listings Enhancement
**Current Structure:**
```sql
CREATE TABLE public.job_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  posted_by_id UUID REFERENCES users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id), -- ❌ Will change to TEXT
  subcategory_id UUID REFERENCES categories(id), -- ❌ Will change to TEXT
  city_id UUID REFERENCES cities(id), -- ❌ Will change to TEXT
  exact_location TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  job_type job_type NOT NULL,
  salary_type salary_type,
  salary_amount DECIMAL(10, 2),
  salary_min DECIMAL(10, 2),
  salary_max DECIMAL(10, 2),
  currency TEXT DEFAULT 'BAM',
  is_salary_negotiable BOOLEAN DEFAULT false,
  duration_days INTEGER,
  is_urgent BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  status job_status DEFAULT 'active',
  requirements TEXT,
  benefits TEXT,
  contact_info TEXT,
  application_url TEXT, -- ✅ Already added in recent migration
  application_deadline TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Required Changes:**
```sql
-- Change foreign key columns to TEXT (for JSON file references)
ALTER TABLE job_listings ALTER COLUMN category_id TYPE TEXT;
ALTER TABLE job_listings ALTER COLUMN subcategory_id TYPE TEXT;
ALTER TABLE job_listings ALTER COLUMN city_id TYPE TEXT;

-- Add analytics columns
ALTER TABLE job_listings ADD COLUMN application_count INTEGER DEFAULT 0;
ALTER TABLE job_listings ADD COLUMN view_count INTEGER DEFAULT 0;
ALTER TABLE job_listings ADD COLUMN last_viewed_at TIMESTAMPTZ;
ALTER TABLE job_listings ADD COLUMN last_application_at TIMESTAMPTZ;

-- Add cached poster data
ALTER TABLE job_listings ADD COLUMN poster_name TEXT;
ALTER TABLE job_listings ADD COLUMN poster_rating DECIMAL(3,2);

-- Create composite indexes for optimization
CREATE INDEX idx_job_listings_composite ON job_listings(city_id, category_id, is_active, created_at);
```

#### 1.3 Static Data Migration (Cities & Categories)
**Current**: Database tables with UUID foreign keys  
**Target**: Static JSON files with TEXT identifiers

**Migration Steps:**
1. **Export current data** to JSON files:
   ```sql
   -- Export cities
   COPY (
     SELECT row_to_json(t) FROM (
       SELECT key as id, key, name, country, is_active, is_special 
       FROM cities ORDER BY name
     ) t
   ) TO '/tmp/cities.json';
   
   -- Export categories  
   COPY (
     SELECT row_to_json(t) FROM (
       SELECT key as id, key, name, parent_id, is_popular 
       FROM categories ORDER BY sort_order
     ) t
   ) TO '/tmp/categories.json';
   ```

2. **Update job_listings** to use TEXT keys instead of UUIDs:
   ```sql
   -- Create mapping function
   UPDATE job_listings SET 
     city_id = (SELECT key FROM cities WHERE id = job_listings.city_id::UUID),
     category_id = (SELECT key FROM categories WHERE id = job_listings.category_id::UUID),
     subcategory_id = (SELECT key FROM categories WHERE id = job_listings.subcategory_id::UUID);
   ```

3. **Drop foreign key constraints** (already done in migration)
4. **Drop cities and categories tables** after verification
5. **Update frontend** to use static JSON files

### Phase 2: Applications Enhancement

#### 2.1 Applications Table Optimization
**Current Structure:**
```sql
CREATE TABLE public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES job_listings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status application_status DEFAULT 'PENDING',
  cover_letter TEXT,
  resume_url TEXT,
  contact_info TEXT,
  availability TEXT,
  hourly_rate DECIMAL(10, 2),
  estimated_duration TEXT,
  questions_answers JSONB,
  client_notes TEXT,
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Required Changes:**
```sql
-- Add cached applicant data
ALTER TABLE applications ADD COLUMN applicant_name TEXT;
ALTER TABLE applications ADD COLUMN applicant_avatar TEXT;
ALTER TABLE applications ADD COLUMN applicant_rating DECIMAL(3,2);
ALTER TABLE applications ADD COLUMN applicant_location TEXT;

-- Add cached job data
ALTER TABLE applications ADD COLUMN job_title TEXT;
ALTER TABLE applications ADD COLUMN job_type job_type;
ALTER TABLE applications ADD COLUMN job_city TEXT;

-- Add analytics
ALTER TABLE applications ADD COLUMN response_time_hours INTEGER;

-- Create optimized indexes
CREATE INDEX idx_applications_composite ON applications(job_id, status, applied_at);
CREATE INDEX idx_applications_cached_data ON applications(applicant_name, applicant_rating);
```

### Phase 3: Communication System Optimization

#### 3.1 Conversations Table Enhancement
**Current Structure:**
```sql
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES job_listings(id),
  application_id UUID REFERENCES applications(id),
  created_by_id UUID REFERENCES users(id),
  title TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.conversation_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  last_read_at TIMESTAMPTZ,
  UNIQUE(conversation_id, user_id)
);
```

**Required Changes:**
```sql
-- Add embedded participant data
ALTER TABLE conversations ADD COLUMN participant_ids UUID[];
ALTER TABLE conversations ADD COLUMN participant_names TEXT[];
ALTER TABLE conversations ADD COLUMN participant_avatars TEXT[];

-- Add message statistics
ALTER TABLE conversations ADD COLUMN message_count INTEGER DEFAULT 0;
ALTER TABLE conversations ADD COLUMN last_message_at TIMESTAMPTZ;
ALTER TABLE conversations ADD COLUMN last_message_preview TEXT;
ALTER TABLE conversations ADD COLUMN last_sender_id UUID;

-- Add read tracking
ALTER TABLE conversations ADD COLUMN read_status JSONB DEFAULT '{}';

-- Populate embedded data from conversation_participants
UPDATE conversations SET
  participant_ids = (
    SELECT ARRAY_AGG(user_id) 
    FROM conversation_participants 
    WHERE conversation_id = conversations.id
  ),
  participant_names = (
    SELECT ARRAY_AGG(u.name) 
    FROM conversation_participants cp
    JOIN users u ON u.id = cp.user_id
    WHERE cp.conversation_id = conversations.id
  ),
  participant_avatars = (
    SELECT ARRAY_AGG(u.avatar_url) 
    FROM conversation_participants cp
    JOIN users u ON u.id = cp.user_id
    WHERE cp.conversation_id = conversations.id
  );
```

#### 3.2 Messages Table Enhancement
**Current Structure:**
```sql
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text',
  attachment_url TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Required Changes:**
```sql
-- Add cached sender data
ALTER TABLE messages ADD COLUMN sender_name TEXT;
ALTER TABLE messages ADD COLUMN sender_avatar TEXT;

-- Optimize read tracking
ALTER TABLE messages DROP COLUMN is_read;
ALTER TABLE messages ADD COLUMN read_by UUID[] DEFAULT ARRAY[]::UUID[];

-- Populate cached sender data
UPDATE messages SET
  sender_name = (SELECT name FROM users WHERE id = messages.sender_id),
  sender_avatar = (SELECT avatar_url FROM users WHERE id = messages.sender_id);

-- Add indexes for sender data
CREATE INDEX idx_messages_sender ON messages(sender_id, created_at);
```

### Phase 4: New Tables Creation

#### 4.1 File Uploads Table
```sql
CREATE TABLE public.file_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uploader_id UUID REFERENCES users(id) ON DELETE SET NULL,
  original_filename TEXT NOT NULL,
  stored_filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  -- File categorization
  category TEXT NOT NULL,
  related_table TEXT,
  related_id UUID,
  -- File lifecycle
  is_temporary BOOLEAN DEFAULT true,
  confirmed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  -- File metadata
  alt_text TEXT,
  image_width INTEGER,
  image_height INTEGER,
  download_count INTEGER DEFAULT 0,
  -- Security
  is_public BOOLEAN DEFAULT false,
  access_token TEXT,
  virus_scan_status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_file_uploads_category ON file_uploads(category, is_temporary);
CREATE INDEX idx_file_uploads_lifecycle ON file_uploads(expires_at, is_temporary);
CREATE INDEX idx_file_uploads_uploader ON file_uploads(uploader_id, created_at);
```

#### 4.2 Search Analytics Table
```sql
CREATE TABLE public.search_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  session_id TEXT,
  -- Search query data
  search_query TEXT NOT NULL,
  search_type TEXT NOT NULL,
  filters_applied JSONB DEFAULT '{}',
  -- Search context
  user_location TEXT,
  user_role TEXT,
  results_count INTEGER,
  -- Performance metrics
  response_time_ms INTEGER,
  clicked_result_ids UUID[] DEFAULT ARRAY[]::UUID[],
  clicked_position INTEGER[] DEFAULT ARRAY[]::INTEGER[],
  -- Search outcome
  led_to_application BOOLEAN DEFAULT false,
  led_to_contact BOOLEAN DEFAULT false,
  session_duration_sec INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
) PARTITION BY RANGE (created_at);

-- Create monthly partitions
CREATE TABLE search_analytics_2025_07 PARTITION OF search_analytics
FOR VALUES FROM ('2025-07-01') TO ('2025-08-01');

-- Indexes
CREATE INDEX idx_search_analytics_query ON search_analytics(search_query, created_at);
CREATE INDEX idx_search_analytics_performance ON search_analytics(response_time_ms, results_count);
CREATE INDEX idx_search_analytics_user ON search_analytics(user_id, created_at);
```

#### 4.3 Job Search Vectors Table
```sql
CREATE TABLE public.job_search_vectors (
  job_id UUID PRIMARY KEY REFERENCES job_listings(id) ON DELETE CASCADE,
  -- Search vectors for different languages
  search_vector_bs TSVECTOR,
  search_vector_en TSVECTOR,
  -- Weighted content for relevance
  title_weight TSVECTOR,
  category_weight TSVECTOR,
  description_weight TSVECTOR,
  location_weight TSVECTOR,
  skills_weight TSVECTOR,
  -- Search optimization
  search_keywords TEXT[] DEFAULT ARRAY[]::TEXT[],
  search_popularity INTEGER DEFAULT 0,
  last_indexed_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- GIN indexes for full-text search
CREATE INDEX idx_job_search_vectors_bs USING GIN (search_vector_bs);
CREATE INDEX idx_job_search_vectors_en USING GIN (search_vector_en);
CREATE INDEX idx_job_search_vectors_popularity ON job_search_vectors(search_popularity DESC);
```

#### 4.4 Analytics Events Table (Replaces job_views)
```sql
CREATE TABLE public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  session_id TEXT,
  event_type TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  -- Enhanced context data
  metadata JSONB DEFAULT '{}',
  user_agent TEXT,
  ip_address INET,
  referrer TEXT,
  page_url TEXT,
  -- Performance tracking
  page_load_time INTEGER,
  time_on_page INTEGER,
  scroll_depth INTEGER,
  -- Conversion tracking
  conversion_funnel_step TEXT,
  led_to_conversion BOOLEAN DEFAULT false,
  conversion_value DECIMAL(10,2),
  -- Geolocation
  city_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
) PARTITION BY RANGE (created_at);

-- Create monthly partitions
CREATE TABLE analytics_events_2025_07 PARTITION OF analytics_events
FOR VALUES FROM ('2025-07-01') TO ('2025-08-01');

-- Indexes
CREATE INDEX idx_analytics_events_type_resource ON analytics_events(event_type, resource_type, created_at);
CREATE INDEX idx_analytics_events_user_time ON analytics_events(user_id, created_at);
CREATE INDEX idx_analytics_events_conversion ON analytics_events(led_to_conversion, conversion_value);
```

#### 4.5 User Activity Summary Table
```sql
CREATE TABLE public.user_activity_summary (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  -- Job statistics
  jobs_posted_total INTEGER DEFAULT 0,
  jobs_posted_active INTEGER DEFAULT 0,
  jobs_completed_as_client INTEGER DEFAULT 0,
  jobs_completed_as_tasker INTEGER DEFAULT 0,
  -- Application statistics
  applications_sent INTEGER DEFAULT 0,
  applications_received INTEGER DEFAULT 0,
  applications_accepted INTEGER DEFAULT 0,
  -- Financial statistics
  total_earned DECIMAL(10, 2) DEFAULT 0,
  total_spent DECIMAL(10, 2) DEFAULT 0,
  -- Engagement statistics
  messages_sent INTEGER DEFAULT 0,
  profile_views INTEGER DEFAULT 0,
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Phase 5: Enhanced Tables

#### 5.1 Notifications Enhancement
**Required Changes:**
```sql
-- Add batching optimization
ALTER TABLE notifications ADD COLUMN batch_id UUID;
ALTER TABLE notifications ADD COLUMN priority INTEGER DEFAULT 5;

-- Add delivery optimization
ALTER TABLE notifications ADD COLUMN delivery_method TEXT[] DEFAULT ARRAY['in_app'];
ALTER TABLE notifications ADD COLUMN sent_at TIMESTAMPTZ;
ALTER TABLE notifications ADD COLUMN clicked_at TIMESTAMPTZ;

-- Create index for batching
CREATE INDEX idx_notifications_batch_id ON notifications(batch_id);
CREATE INDEX idx_notifications_composite ON notifications(user_id, is_read, created_at);
```

#### 5.2 Reviews Enhancement
**Required Changes:**
```sql
-- Add cached reviewer data
ALTER TABLE reviews ADD COLUMN reviewer_name TEXT;
ALTER TABLE reviews ADD COLUMN reviewer_avatar TEXT;

-- Add response system
ALTER TABLE reviews ADD COLUMN response TEXT;
ALTER TABLE reviews ADD COLUMN response_at TIMESTAMPTZ;

-- Populate cached data
UPDATE reviews SET
  reviewer_name = (SELECT name FROM users WHERE id = reviews.reviewer_id),
  reviewer_avatar = (SELECT avatar_url FROM users WHERE id = reviews.reviewer_id);
```

#### 5.3 Saved Jobs Enhancement
**Required Changes:**
```sql
-- Add enhanced tracking
ALTER TABLE saved_jobs ADD COLUMN bookmark_type TEXT DEFAULT 'saved';
ALTER TABLE saved_jobs ADD COLUMN notes TEXT;
ALTER TABLE saved_jobs ADD COLUMN reminder_date DATE;

-- Add cached job data
ALTER TABLE saved_jobs ADD COLUMN job_title TEXT;
ALTER TABLE saved_jobs ADD COLUMN job_city TEXT;
ALTER TABLE saved_jobs ADD COLUMN job_salary_min DECIMAL(10,2);
ALTER TABLE saved_jobs ADD COLUMN job_salary_max DECIMAL(10,2);
ALTER TABLE saved_jobs ADD COLUMN job_status job_status;

-- Update unique constraint
DROP INDEX saved_jobs_job_id_user_id_key;
CREATE UNIQUE INDEX saved_jobs_user_job_type_key ON saved_jobs(user_id, job_id, bookmark_type);

-- Populate cached job data
UPDATE saved_jobs SET
  job_title = (SELECT title FROM job_listings WHERE id = saved_jobs.job_id),
  job_city = (SELECT city_id FROM job_listings WHERE id = saved_jobs.job_id),
  job_salary_min = (SELECT salary_min FROM job_listings WHERE id = saved_jobs.job_id),
  job_salary_max = (SELECT salary_max FROM job_listings WHERE id = saved_jobs.job_id),
  job_status = (SELECT status FROM job_listings WHERE id = saved_jobs.job_id);
```

---

## Required Database Triggers

### 1. User Rating Aggregation Trigger
```sql
CREATE OR REPLACE FUNCTION update_user_rating() RETURNS TRIGGER AS $$
BEGIN
  UPDATE users SET 
    average_rating = (SELECT AVG(rating) FROM reviews WHERE reviewee_id = NEW.reviewee_id),
    total_reviews = (SELECT COUNT(*) FROM reviews WHERE reviewee_id = NEW.reviewee_id)
  WHERE id = NEW.reviewee_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_rating
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_user_rating();
```

### 2. Job Statistics Trigger
```sql
CREATE OR REPLACE FUNCTION update_job_stats() RETURNS TRIGGER AS $$
BEGIN
  UPDATE job_listings SET 
    application_count = (SELECT COUNT(*) FROM applications WHERE job_id = NEW.job_id),
    last_application_at = CASE 
      WHEN TG_OP = 'INSERT' THEN NEW.applied_at 
      ELSE last_application_at 
    END
  WHERE id = NEW.job_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_job_stats
  AFTER INSERT OR UPDATE OR DELETE ON applications
  FOR EACH ROW EXECUTE FUNCTION update_job_stats();
```

### 3. Application Cache Trigger
```sql
CREATE OR REPLACE FUNCTION update_application_cache() RETURNS TRIGGER AS $$
BEGIN
  -- Update cached applicant data when user changes
  IF TG_TABLE_NAME = 'users' THEN
    UPDATE applications SET 
      applicant_name = NEW.name,
      applicant_avatar = NEW.avatar_url,
      applicant_rating = NEW.average_rating,
      applicant_location = NEW.location
    WHERE user_id = NEW.id;
  END IF;
  
  -- Update cached job data when job changes
  IF TG_TABLE_NAME = 'job_listings' THEN
    UPDATE applications SET 
      job_title = NEW.title,
      job_type = NEW.job_type,
      job_city = NEW.city_id
    WHERE job_id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_application_cache_users
  AFTER UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_application_cache();

CREATE TRIGGER trigger_update_application_cache_jobs
  AFTER UPDATE ON job_listings
  FOR EACH ROW EXECUTE FUNCTION update_application_cache();
```

### 4. Search Vector Maintenance Trigger
```sql
CREATE OR REPLACE FUNCTION update_search_vectors() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO job_search_vectors (job_id, search_vector_bs, search_vector_en, 
    title_weight, description_weight, last_indexed_at)
  VALUES (
    NEW.id,
    to_tsvector('simple', NEW.title || ' ' || NEW.description),
    to_tsvector('english', NEW.title || ' ' || NEW.description),
    to_tsvector('simple', NEW.title),
    to_tsvector('simple', NEW.description),
    NOW()
  )
  ON CONFLICT (job_id) DO UPDATE SET
    search_vector_bs = to_tsvector('simple', NEW.title || ' ' || NEW.description),
    search_vector_en = to_tsvector('english', NEW.title || ' ' || NEW.description),
    title_weight = to_tsvector('simple', NEW.title),
    description_weight = to_tsvector('simple', NEW.description),
    last_indexed_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_search_vectors
  AFTER INSERT OR UPDATE ON job_listings
  FOR EACH ROW EXECUTE FUNCTION update_search_vectors();
```

### 5. Conversation Stats Trigger
```sql
CREATE OR REPLACE FUNCTION update_conversation_stats() RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations SET 
    message_count = message_count + 1,
    last_message_at = NEW.created_at,
    last_message_preview = LEFT(NEW.content, 100),
    last_sender_id = NEW.sender_id,
    updated_at = NOW()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_conversation_stats
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION update_conversation_stats();
```

---

## Migration Execution Plan

### Pre-Migration Checklist
- [ ] Backup current database
- [ ] Test all triggers in development environment
- [ ] Update application code to handle new column structures
- [ ] Prepare rollback scripts for each phase
- [ ] Set up monitoring for data consistency

### Phase 1: Foundation (Week 1-2)
1. **Day 1-2**: Users table enhancement + privacy settings migration
2. **Day 3-4**: Job listings optimization + static data migration
3. **Day 5-7**: Create and test all triggers
4. **Week 2**: Comprehensive testing and validation

### Phase 2: Communication (Week 3-4)
1. **Day 1-3**: Conversations table enhancement + participant migration
2. **Day 4-5**: Messages table optimization
3. **Day 6-7**: Drop conversation_participants table

### Phase 3: New Tables (Week 5-6)
1. **Day 1-2**: Create file_uploads and search_analytics tables
2. **Day 3-4**: Create job_search_vectors and analytics_events tables
3. **Day 5-7**: Create user_activity_summary and populate initial data

### Phase 4: Enhancements (Week 7-8)
1. **Day 1-3**: Applications table caching enhancements
2. **Day 4-5**: Notifications and reviews enhancements
3. **Day 6-7**: Saved jobs optimization

### Phase 5: Cleanup (Week 9-10)
1. **Day 1-3**: Drop eliminated tables (after verification)
2. **Day 4-5**: Final optimizations and index tuning
3. **Day 6-7**: Performance validation and documentation

---

## Data Migration Scripts

### Script 1: User Privacy Settings Migration
```sql
BEGIN;

-- Add privacy columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_visibility TEXT DEFAULT 'public';
ALTER TABLE users ADD COLUMN IF NOT EXISTS show_email BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS show_phone BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS allow_messages BOOLEAN DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS show_reviews BOOLEAN DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS show_completed_jobs BOOLEAN DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT true;

-- Migrate data from user_privacy_settings
UPDATE users SET
  profile_visibility = ups.profile_visibility,
  show_email = ups.show_contact_info,
  show_phone = ups.show_contact_info,
  allow_messages = ups.allow_direct_messages,
  show_reviews = true, -- Default value
  show_completed_jobs = true, -- Default value
  email_notifications = NOT ups.analytics_opt_out
FROM user_privacy_settings ups
WHERE users.id = ups.user_id;

-- Verify migration
SELECT 
  COUNT(*) as total_users,
  COUNT(CASE WHEN profile_visibility IS NOT NULL THEN 1 END) as migrated_privacy
FROM users;

COMMIT;
```

### Script 2: Static Data Export
```sql
-- Export cities to JSON format
\copy (
  SELECT json_agg(
    json_build_object(
      'id', key,
      'key', key,
      'name', name,
      'country', country,
      'is_active', is_active,
      'is_special', is_special
    )
  ) FROM cities ORDER BY name
) TO '/tmp/cities_export.json';

-- Export categories to JSON format
\copy (
  SELECT json_agg(
    json_build_object(
      'id', key,
      'key', key,
      'name', name,
      'parent_id', (SELECT parent.key FROM categories parent WHERE parent.id = categories.parent_id),
      'is_popular', is_popular,
      'sort_order', sort_order
    )
  ) FROM categories ORDER BY sort_order
) TO '/tmp/categories_export.json';
```

### Script 3: Job Listings ID Migration
```sql
BEGIN;

-- Create temporary mapping tables
CREATE TEMP TABLE city_mapping AS
SELECT id, key FROM cities;

CREATE TEMP TABLE category_mapping AS  
SELECT id, key FROM categories;

-- Update job_listings to use TEXT keys
UPDATE job_listings SET
  city_id = cm.key
FROM city_mapping cm
WHERE job_listings.city_id::UUID = cm.id;

UPDATE job_listings SET
  category_id = cat.key
FROM category_mapping cat
WHERE job_listings.category_id::UUID = cat.id;

UPDATE job_listings SET
  subcategory_id = sub.key
FROM category_mapping sub
WHERE job_listings.subcategory_id::UUID = sub.id;

-- Change column types
ALTER TABLE job_listings ALTER COLUMN city_id TYPE TEXT;
ALTER TABLE job_listings ALTER COLUMN category_id TYPE TEXT;
ALTER TABLE job_listings ALTER COLUMN subcategory_id TYPE TEXT;

COMMIT;
```

---

## Performance Validation Queries

### Before Migration Baseline
```sql
-- Job listing query performance
EXPLAIN ANALYZE
SELECT j.*, u.name as poster_name, COUNT(a.id) as app_count
FROM job_listings j
JOIN users u ON u.id = j.posted_by_id
LEFT JOIN applications a ON a.job_id = j.id
WHERE j.city_id = 'sarajevo'
GROUP BY j.id, u.name
LIMIT 20;

-- User profile query performance  
EXPLAIN ANALYZE
SELECT u.*, ups.*, AVG(r.rating) as avg_rating
FROM users u
LEFT JOIN user_privacy_settings ups ON ups.user_id = u.id
LEFT JOIN reviews r ON r.reviewee_id = u.id
WHERE u.id = 'sample-uuid'
GROUP BY u.id, ups.id;
```

### After Migration Validation
```sql
-- Optimized job listing query
EXPLAIN ANALYZE
SELECT j.*, j.poster_name, j.application_count
FROM job_listings j
WHERE j.city_id = 'sarajevo'
AND j.is_active = true
ORDER BY j.created_at DESC
LIMIT 20;

-- Optimized user profile query
EXPLAIN ANALYZE
SELECT u.*, u.average_rating, u.total_reviews
FROM users u
WHERE u.id = 'sample-uuid';
```

---

## Success Metrics & KPIs

### Database Performance Metrics
- **Query Count Reduction**: Target 60-90% fewer queries for common operations
- **Response Time Improvement**: Target 50%+ faster response times
- **Storage Efficiency**: Monitor storage growth (expected 15-25% increase)
- **Cache Hit Rate**: Monitor trigger performance and cached data accuracy

### Business Impact Metrics
- **Page Load Speed**: Target 40%+ improvement in job listing pages
- **User Experience**: Measure bounce rate and engagement improvements
- **Search Performance**: Target 90%+ improvement in search response times
- **Real-time Features**: Monitor messaging and notification performance

### Data Integrity Metrics
- **Cache Consistency**: Zero tolerance for stale cached data
- **Trigger Performance**: Monitor trigger execution times
- **Migration Success**: 100% data migration with zero loss
- **Rollback Capability**: Maintain ability to rollback each phase

---

## Risk Assessment & Mitigation

### High Risk Items
1. **Data Loss During Migration**: Mitigated by comprehensive backups and staged rollouts
2. **Performance Degradation**: Mitigated by extensive testing and gradual deployment
3. **Application Compatibility**: Mitigated by parallel API support during transition
4. **Trigger Performance Impact**: Mitigated by optimized trigger design and monitoring

### Medium Risk Items
1. **Storage Growth**: Monitored and optimized through data archiving strategies
2. **Complexity Increase**: Mitigated by comprehensive documentation and team training
3. **Cache Invalidation**: Mitigated by robust trigger system and monitoring

### Low Risk Items
1. **User Experience Disruption**: Minimized through zero-downtime migration approach
2. **Third-party Integration Issues**: Addressed through API versioning and documentation
3. **Maintenance Overhead**: Managed through automated monitoring and alerting

---

## Conclusion

This migration plan provides a comprehensive roadmap for optimizing the MojPoslic database structure. The changes will result in:

- **60-90% reduction** in database queries for common operations
- **Improved user experience** through faster page loads and real-time features
- **Better analytics capabilities** through dedicated tracking tables
- **Enhanced search functionality** with full-text search optimization
- **Simplified data management** through strategic denormalization

The migration is designed to be executed in phases with comprehensive testing and rollback capabilities at each stage. The expected performance improvements justify the implementation complexity and storage overhead.
