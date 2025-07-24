# Complete Prisma to Supabase Migration Plan

**Date:** July 25, 2025 - Updated Analysis  
**Project:** mojPoslić v0.1.2  
**Current State:** Hybrid Prisma + Supabase (messaging only)  
**Target State:** Full Supabase with native real-time messaging and edge functions  

## 🎯 Migration Overview

This document outlines the complete migration from the current Prisma + PostgreSQL setup to a full Supabase implementation, leveraging all Supabase features including Edge Functions, Storage, Real-time, and Auth. Since this is a development project without live users, we'll implement a clean, from-scratch approach to maximize Supabase's capabilities.

### Current Architecture Issues
- **Dual Database Setup**: Prisma as main DB + Supabase for messaging only
- **Authentication Conflicts**: NextAuth JWT vs Supabase auth incompatibility
- **Data Synchronization**: Complex sync between Prisma and Supabase tables
- **Real-time Limitations**: Only messaging has real-time, rest uses polling
- **RLS Policy Mismatches**: Policies written for wrong schema structure
- **State Management Complexity**: Multiple data fetching patterns and cache layers
- **Performance Bottlenecks**: Polling-based updates instead of real-time subscriptions

### Migration Benefits
- ✅ **Native Real-time**: Live updates across all features via Supabase Realtime
- ✅ **Unified Authentication**: Single Supabase auth system with social providers
- ✅ **Edge Functions**: Server-side logic deployed globally on Deno runtime
- ✅ **Built-in Storage**: File uploads with automatic CDN and image transformations
- ✅ **Database Functions**: Custom PostgreSQL functions and triggers
- ✅ **Auto-generated APIs**: PostgREST for instant RESTful API
- ✅ **Better Scaling**: Automatic scaling and performance optimization
- ✅ **Simplified Stack**: No separate server infrastructure needed
- ✅ **Real-time Subscriptions**: WebSocket connections for live data

---

## 📊 Current Feature Inventory

### 🔐 Authentication System
**Current Implementation:** NextAuth v5 with comprehensive security architecture
- **Providers:** Credentials, Google, Facebook, Apple OAuth integration
- **Features:** Email verification workflow, role selection system, profile setup flow
- **Session Management:** JWT with 30-day expiration and automatic refresh
- **Cross-domain:** Cookie sharing across subdomains (.mojposlic.com)
- **Middleware:** Simplified auth-only middleware with registration flow guards
- **Security:** bcrypt password hashing (12 rounds), CSRF protection, rate limiting

**Authentication Architecture:**
- **NextAuth Configuration:** Cross-subdomain cookie support with secure production settings
- **Registration Flow:** Multi-step verification with auto-login post-verification
- **Role-based Guards:** Component-level and route-level protection systems
- **Session Persistence:** 30-day JWT with automatic token refresh
- **Transfer Tokens:** Cross-domain authentication for subdomain switching
- **Error Handling:** JWT error recovery with cookie cleanup and redirect

**Guard System Components:**
- `RegistrationFlowGuard` - Database-driven onboarding flow orchestration
- `OnboardingPageGuard` - Prevents completed users from accessing setup pages
- `RoleGuard` - Component-level role and profile completion checks
- `AuthGuard` - Higher-order component for protected pages
- `middleware.ts` - Route-level authentication with simplified logic

**Security Features:**
- **Password Security:** bcrypt with 12 rounds, rate limiting on changes (3 attempts/15min)
- **Email Verification:** 6-digit codes with 15-minute expiration
- **Auto-login:** Secure post-verification authentication flow
- **Cross-domain Auth:** Transfer tokens for subdomain language switching
- **Session Management:** Comprehensive cookie configuration for production security

### 👤 User Management
**Current Implementation:** Complex user profiles with privacy controls
- **Roles:** admin, client, tasker, company
- **Profile Features:** Bio, skills, experience, location, avatar
- **Privacy Settings:** Comprehensive privacy controls
- **Verification:** Email verification workflow with auto-login
- **Guards:** Role-based access control with component guards

**Tables:**
- `user_privacy_settings` - Comprehensive privacy controls

### 💼 Job Management System
**Current Implementation:** Full-featured job board
- **Job Types:** quick_job, full_time, part_time, remote
- **Categories:** Hierarchical category system (22 main + subcategories)
- **Locations:** City-based with coordinates and geocoding
- **Features:** Featured listings, salary ranges, job duration
- **Status Tracking:** active, inactive, completed, expired
- **Analytics:** Job view tracking, application statistics

**Tables:**
- `job_listings` - Core job data with location and metadata
- `categories` - Hierarchical job categories
- `cities` - Location data with coordinates
- `job_views` - Analytics tracking

### 📝 Application System
**Current Implementation:** Advanced application workflow
- **Status Flow:** PENDING → REVIEWED → SHORTLISTED → SELECTED/REJECTED
- **Features:** Resume uploads, custom messages, client feedback
- **Notifications:** Email notifications for status changes
- **Assignment:** Job acceptance and contract management
- **Bulk Operations:** Bulk application management for clients

**Tables:**
- `applications` - Job applications with status tracking
- `job_assignments` - Contract management and completion
- `saved_jobs` - User job bookmarks

### 💬 Messaging System
**Current Implementation:** Hybrid Prisma/Supabase messaging
- **Real-time:** Supabase real-time via WebSocket subscriptions
- **Types:** Direct messaging, job-related conversations
- **Privacy:** Privacy-aware conversation creation
- **Integration:** Auto-creation for shortlisted applications
- **Features:** Message templates, optimized real-time hooks

**Tables:**
- Prisma: `conversations`, `messages` (simplified schema)
- Supabase: Enhanced messaging tables with real-time capabilities

### 🔔 Notification System
**Current Implementation:** Email + in-app notifications
- **Types:** NEW_MESSAGE, NEW_REVIEW, JOB_APPLICATION, JOB_UPDATE, SYSTEM
- **Delivery:** Email via Resend API + database storage
- **Localization:** English and Bosnian translations
- **Real-time:** Push notifications for live updates

**Tables:**
- `notifications` - In-app notification storage

### ⭐ Review System
**Current Implementation:** Job completion reviews
- **Features:** Rating, comments, job-specific reviews
- **Relationship:** Between reviewers and reviewees
- **Integration:** Tied to completed job assignments

**Tables:**
- `reviews` - Rating and feedback system

### 💳 Payment Integration
**Current Implementation:** Stripe integration for connections
- **Features:** Connection purchases, payment tracking
- **Webhooks:** Stripe webhook handling
- **History:** Transaction and connection usage tracking
- **Types:** Monthly refresh, job applications, admin adjustments

**Tables:**
- `stripe_transactions` - Payment tracking
- `connection_history` - Connection usage tracking

### 🏢 Multi-tenancy Features
**Current Implementation:** Multi-role system
- **Client Dashboard:** Job posting, application management
- **Tasker Dashboard:** Job browsing, application tracking
- **Company Dashboard:** Enhanced job management
- **Admin Panel:** System administration with comprehensive stats

### 🔄 State Management & Data Layer
**Current Implementation:** Sophisticated hybrid architecture with TanStack Query readiness
- **Server State:** Context API + custom hooks with documented TanStack Query patterns
- **UI State:** 6 dedicated Zustand stores for comprehensive state management
- **Static Data:** Advanced static data manager with 1-hour caching and fallback strategies
- **Real-time:** Optimized WebSocket hooks with connection pooling
- **Cache Management:** Multi-layer cache system with localStorage persistence

**State Architecture Components:**

**Core State Management:**
- `AuthContext` - NextAuth integration with database synchronization
- `staticDataManager` - File-based JSON caching system (cities/categories)
- **TanStack Query Documentation:** 1000+ lines covering queries, mutations, optimistic updates

**Zustand Store Architecture (6 Stores):**
- `useDialogStore()` - Modal/dialog state management (job posts, edit, delete, mobile menu)
- `useFilterStore()` - Search & filter persistence (job filters, admin filters, pagination)
- `useNavigationStore()` - Tab navigation (dashboard, admin, system tabs with history)
- `useFormStateStore()` - Multi-step form navigation (job posting, profile setup)
- `useUIPreferencesStore()` - Theme, layout, and user preferences with persistence
- `useNotificationStore()` - In-app notification state management

**Static Data Management:**
- **File-Based System:** JSON files in `/public/static/` (cities.json, categories.json)
- **Cache Strategy:** 1-hour client-side cache with automatic refresh
- **Fallback Chain:** Static files → API routes → Database (resilient loading)
- **Hierarchical Processing:** Category tree structure with parent-child relationships

**Advanced Features:**
- **Cache Validation:** Timestamp-based expiration with manual invalidation
- **Error Handling:** Graceful degradation across multiple data sources
- **Performance:** Selective Zustand subscriptions prevent unnecessary re-renders
- **Persistence:** LocalStorage sync for user preferences and filter states

### 🛡️ Security & Middleware
**Current Implementation:** Multi-layered security architecture with advanced patterns
- **Middleware:** Simplified authentication-only with early return optimization
- **Guards:** Component-level role and profile completion enforcement
- **API Protection:** Route-level authentication with role validation
- **Rate Limiting:** Password change protection (3 attempts/15min window, 30min block)
- **Input Validation:** Comprehensive Zod schemas for all API endpoints
- **Session Security:** JWT error handling with cookie cleanup and redirect recovery

**Security Architecture Components:**

**Middleware System:**
- **Path Filtering:** Intelligent static file and API route exclusion
- **Auth Flow:** Database-driven registration state validation
- **Redirect Prevention:** Eliminates redirect loops with simplified logic
- **Performance:** Early returns and optimized path matching

**API Security Patterns:**
- **Authentication Enforcement:** 198+ API routes with auth validation
- **Role Validation:** Server-side role checks for admin operations
- **Error Handling:** Comprehensive error responses with proper status codes
- **Database Protection:** Prisma client safety checks and timeout handling

**Advanced Security Features:**
- **Transfer Tokens:** JWT-based cross-domain authentication
- **Rate Limiting:** Multi-endpoint protection with memory-based tracking
- **Password Security:** bcrypt with 12 rounds + rate limiting
- **Session Recovery:** Automatic cookie cleanup on JWT errors
- **CSRF Protection:** Built-in NextAuth CSRF token validation

**Component Guards:**
- **Registration Flow Guard:** Database-driven state validation
- **Role Selection Guard:** Prevents access based on completion state
- **Profile Setup Guard:** Multi-step form protection
- **Dashboard Guard:** Combined auth + role + profile requirements

### 🌍 Internationalization
**Current Implementation:** Next.js i18n with domain-based routing
- **Languages:** Bosnian (default), English
- **Domain Setup:** en.mojposlic.com for English
- **Localization:** 15+ translation files covering all features
- **Static Generation:** Static params for both locales

### � Advanced Systems & Infrastructure

**Static Data System:**
- **Architecture:** File-based JSON system with sophisticated caching
- **Files:** `/public/static/` directory (cities.json, categories.json, metadata.json)
- **Cache Strategy:** 1-hour client-side cache with automatic refresh
- **Fallback Chain:** Static files → API routes → Database (resilient loading)
- **Performance:** Eliminates database queries for reference data

**Component Architecture:**
- **482+ React Components** with TypeScript strict mode
- **UI Library:** shadcn/ui with custom component extensions
- **Form Handling:** Multi-step forms with Zustand state management
- **Responsive Design:** Mobile-first with adaptive layouts

**API Architecture:**
- **198+ API Routes** with comprehensive error handling
- **Route Patterns:** RESTful design with role-based access control
- **Error Handling:** Consistent error responses across all endpoints
- **Validation:** Zod schema validation for all request/response cycles

**File Management:**
- **Custom Upload System:** Multi-provider file handling with validation
- **Types:** Avatars, resumes, company logos with size/type restrictions
- **Processing:** Client-side validation with server-side verification
- **Storage:** Currently custom (planned Supabase Storage migration)

**Geocoding & Maps:**
- **Google Maps Integration:** Location selection and display
- **Geocoding Cache:** localStorage-based caching with expiration
- **City Validation:** Static data validation for job locations
- **Coordinate Storage:** Latitude/longitude for precise positioning

**Analytics & Monitoring:**
- **Job Views:** IP-based tracking with user agent logging
- **User Analytics:** Registration flow, completion rates, engagement
- **Admin Dashboard:** Real-time system monitoring and statistics
- **Performance:** Component render tracking and optimization

---

## 🏗️ Modern Supabase-First Migration Strategy

### Phase 1: Complete Supabase Setup (Week 1)

#### 1.1 Fresh Supabase Project with All Features
```sql
-- Enable all required Supabase extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_cron";
CREATE EXTENSION IF NOT EXISTS "http";

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'client', 'tasker', 'company');
CREATE TYPE job_type AS ENUM ('quick_job', 'full_time', 'part_time', 'remote');
CREATE TYPE salary_type AS ENUM ('fixed', 'hourly', 'daily', 'weekly', 'monthly', 'negotiable');
CREATE TYPE job_status AS ENUM ('active', 'inactive', 'completed', 'expired');
CREATE TYPE application_status AS ENUM ('PENDING', 'REVIEWED', 'SHORTLISTED', 'SELECTED', 'REJECTED', 'WITHDRAWN');

-- Users table with Supabase auth integration
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
  bio TEXT,
  skills TEXT[],
  experience TEXT,
  phone TEXT,
  website TEXT,
  location TEXT,
  connections INTEGER DEFAULT 10,
  connections_last_refresh TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  preferred_language TEXT DEFAULT 'bs'
);

-- Link to Supabase auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

#### 1.2 Supabase Storage Setup
```typescript
// Create storage buckets with policies
const createStorageBuckets = async () => {
  const { data: avatars, error: avatarsError } = await supabase.storage
    .createBucket('avatars', {
      public: true,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
      fileSizeLimit: 5242880, // 5MB
    })

  const { data: resumes, error: resumesError } = await supabase.storage
    .createBucket('resumes', {
      public: false,
      allowedMimeTypes: ['application/pdf', 'application/msword'],
      fileSizeLimit: 10485760, // 10MB
    })

  const { data: attachments, error: attachmentsError } = await supabase.storage
    .createBucket('message-attachments', {
      public: false,
      allowedMimeTypes: ['image/*', 'application/pdf'],
      fileSizeLimit: 5242880, // 5MB
    })
}

// Storage policies
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own files" ON storage.objects
  FOR SELECT USING (auth.uid()::text = (storage.foldername(name))[1]);
```

### Phase 2: Edge Functions for Business Logic (Week 1-2)

#### 2.1 Job Matching Algorithm Edge Function
```typescript
// supabase/functions/job-matching/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const { userId } = await req.json()
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  // Get user preferences and skills
  const { data: user } = await supabase
    .from('users')
    .select('skills, location, preferred_job_types')
    .eq('id', userId)
    .single()

  // Run sophisticated matching algorithm
  const { data: matchedJobs } = await supabase
    .from('job_listings')
    .select(`
      *,
      posted_by:users(name, company_name),
      similarity_score:calculate_job_similarity(${userId})
    `)
    .eq('status', 'active')
    .order('similarity_score', { ascending: false })
    .limit(20)

  return new Response(JSON.stringify({ jobs: matchedJobs }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
```

#### 2.2 Email Notifications Edge Function
```typescript
// supabase/functions/send-email/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Resend } from 'https://esm.sh/resend@2.0.0'

serve(async (req) => {
  const { to, subject, template, data } = await req.json()
  
  const resend = new Resend(Deno.env.get('RESEND_API_KEY'))
  
  const emailTemplates = {
    'new-application': (data: any) => `
      <h2>New Application Received!</h2>
      <p>You've received a new application for your job: ${data.jobTitle}</p>
      <p>Applicant: ${data.applicantName}</p>
    `,
    'application-status': (data: any) => `
      <h2>Application Status Update</h2>
      <p>Your application status has been updated to: ${data.status}</p>
    `
  }
  
  const html = emailTemplates[template]?.(data) || data.html
  
  const { data: result, error } = await resend.emails.send({
    from: 'noreply@mojposlic.com',
    to,
    subject,
    html
  })
  
  return new Response(JSON.stringify({ success: !error }))
})
```

#### 2.3 Real-time Notification Edge Function
```typescript
// supabase/functions/send-notification/index.ts
serve(async (req) => {
  const { userId, type, title, message, data } = await req.json()
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  // Insert notification
  const { data: notification } = await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      type,
      title,
      message,
      data
    })
    .select()
    .single()

  // Send real-time notification
  await supabase.realtime
    .channel(`user:${userId}`)
    .send({
      type: 'broadcast',
      event: 'notification',
      payload: notification
    })

  return new Response(JSON.stringify({ success: true }))
})
```

### Phase 3: Database Functions & Triggers (Week 2)

#### 3.1 Advanced Database Functions
```sql
-- Job similarity calculation function
CREATE OR REPLACE FUNCTION calculate_job_similarity(user_id UUID)
RETURNS TABLE(job_id UUID, similarity_score FLOAT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    jl.id as job_id,
    (
      -- Skills match weight (40%)
      CASE 
        WHEN u.skills && string_to_array(jl.requirements, ',') 
        THEN 0.4 * (array_length(u.skills & string_to_array(jl.requirements, ','), 1)::float / array_length(u.skills, 1))
        ELSE 0
      END +
      -- Location match weight (30%)
      CASE WHEN u.location = jl.city_id THEN 0.3 ELSE 0 END +
      -- Job type preference weight (20%)
      CASE 
        WHEN u.preferred_job_types LIKE '%' || jl.job_type || '%' 
        THEN 0.2 
        ELSE 0 
      END +
      -- Recency bonus (10%)
      (0.1 * (1 - EXTRACT(EPOCH FROM (NOW() - jl.created_at)) / (7 * 24 * 3600)))
    ) as similarity_score
  FROM job_listings jl, users u
  WHERE u.id = user_id AND jl.status = 'active'
  ORDER BY similarity_score DESC;
END;
$$ LANGUAGE plpgsql;

-- Auto-update job status based on deadline
CREATE OR REPLACE FUNCTION update_expired_jobs()
RETURNS void AS $$
BEGIN
  UPDATE job_listings 
  SET status = 'expired', updated_at = NOW()
  WHERE application_deadline < NOW() 
    AND status = 'active';
END;
$$ LANGUAGE plpgsql;

-- Schedule job expiration check (using pg_cron)
SELECT cron.schedule('expire-jobs', '0 0 * * *', 'SELECT update_expired_jobs();');
```

#### 3.2 Real-time Triggers
```sql
-- Trigger for real-time application notifications
CREATE OR REPLACE FUNCTION notify_new_application()
RETURNS TRIGGER AS $$
BEGIN
  -- Get job owner
  SELECT posted_by_id INTO job_owner_id
  FROM job_listings 
  WHERE id = NEW.job_id;
  
  -- Send notification via Edge Function
  PERFORM net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/send-notification',
    headers := jsonb_build_object('Authorization', 'Bearer ' || current_setting('app.service_role_key')),
    body := jsonb_build_object(
      'userId', job_owner_id,
      'type', 'NEW_APPLICATION',
      'title', 'New Application Received',
      'message', 'You have a new application for your job posting',
      'data', jsonb_build_object('applicationId', NEW.id, 'jobId', NEW.job_id)
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER application_notification_trigger
AFTER INSERT ON applications
FOR EACH ROW
EXECUTE FUNCTION notify_new_application();
```

### Phase 4: Modern Frontend Integration (Week 2-3)

#### 4.1 Enhanced Supabase Client Setup
```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Edge function caller
export const callEdgeFunction = async (functionName: string, payload: any) => {
  const { data, error } = await supabase.functions.invoke(functionName, {
    body: payload
  })
  
  if (error) throw error
  return data
}
```

#### 4.2 Real-time Hooks with Supabase
```typescript
// hooks/useRealtimeJobs.ts
export function useRealtimeJobs(filters: JobFilters) {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Initial data fetch
    const fetchJobs = async () => {
      const { data } = await supabase
        .from('job_listings')
        .select(`
          *,
          posted_by:users(name, company_name, avatar_url),
          applications:applications(count),
          _count:job_views(count)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
      
      setJobs(data || [])
      setLoading(false)
    }

    fetchJobs()

    // Real-time subscription
    const subscription = supabase
      .channel('jobs')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'job_listings' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setJobs(prev => [payload.new as Job, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setJobs(prev => prev.map(job => 
              job.id === payload.new.id ? { ...job, ...payload.new } : job
            ))
          } else if (payload.eventType === 'DELETE') {
            setJobs(prev => prev.filter(job => job.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [filters])

  return { jobs, loading, refetch: fetchJobs }
}
```

#### 4.3 Smart File Upload with Supabase Storage
```typescript
// hooks/useFileUpload.ts
export function useFileUpload() {
  const uploadFile = async (
    file: File, 
    bucket: 'avatars' | 'resumes' | 'message-attachments',
    folder?: string
  ) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/${folder ? folder + '/' : ''}${Date.now()}.${fileExt}`

    // Upload with automatic image optimization for avatars
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      })

    if (error) throw error

    // Get public URL with transformations for images
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path, {
        transform: bucket === 'avatars' ? {
          width: 200,
          height: 200,
          resize: 'cover',
          quality: 80
        } : undefined
      })

    return publicUrl
  }

  return { uploadFile }
}
```

### Phase 5: Advanced Real-time Features (Week 3)

#### 5.1 Real-time Messaging with Presence
```typescript
// hooks/useRealtimeChat.ts
export function useRealtimeChat(conversationId: string) {
  const [messages, setMessages] = useState<Message[]>([])
  const [onlineUsers, setOnlineUsers] = useState<string[]>([])

  useEffect(() => {
    const channel = supabase.channel(`conversation:${conversationId}`, {
      config: {
        presence: {
          key: conversationId,
        },
      },
    })

    // Join presence
    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          await channel.track({
            user_id: user.id,
            online_at: new Date().toISOString(),
          })
        }
      }
    })

    // Listen to presence changes
    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState()
      setOnlineUsers(Object.keys(state))
    })

    // Listen to new messages
    channel.on('postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages' },
      (payload) => {
        if (payload.new.conversation_id === conversationId) {
          setMessages(prev => [...prev, payload.new as Message])
        }
      }
    )

    return () => {
      channel.unsubscribe()
    }
  }, [conversationId])

  const sendMessage = async (content: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('messages').insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content
    })
  }

  return { messages, onlineUsers, sendMessage }
}
```

#### 5.2 Live Analytics Dashboard
```typescript
// hooks/useRealtimeAnalytics.ts
export function useRealtimeAnalytics() {
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalApplications: 0,
    activeUsers: 0,
    recentActivity: []
  })

  useEffect(() => {
    // Real-time stats updates
    const subscription = supabase
      .channel('analytics')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'job_listings' },
        () => updateJobStats()
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'applications' },
        () => updateApplicationStats()
      )
      .subscribe()

    return () => subscription.unsubscribe()
  }, [])

  return stats
}
```

### Phase 6: Advanced Supabase Features (Week 3-4)

#### 6.1 Database Webhooks for External Integrations
```sql
-- Webhook for Stripe integration
CREATE OR REPLACE FUNCTION handle_stripe_webhook()
RETURNS TRIGGER AS $$
BEGIN
  -- Send webhook to external service
  PERFORM net.http_post(
    url := 'https://your-app.vercel.app/api/webhooks/stripe',
    headers := jsonb_build_object('Content-Type', 'application/json'),
    body := jsonb_build_object(
      'event', TG_OP,
      'table', TG_TABLE_NAME,
      'data', row_to_json(NEW)
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER stripe_transaction_webhook
AFTER INSERT OR UPDATE ON stripe_transactions
FOR EACH ROW
EXECUTE FUNCTION handle_stripe_webhook();
```

#### 6.2 Advanced RLS with Dynamic Policies
```sql
-- Dynamic RLS based on user subscription level
CREATE POLICY "Premium users see all jobs" ON job_listings
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND (u.subscription_tier = 'premium' OR posted_by_id = auth.uid())
  )
);

-- Geographic restrictions
CREATE POLICY "Regional access control" ON job_listings
FOR SELECT TO authenticated
USING (
  city_id = ANY(
    SELECT unnest(allowed_regions) 
    FROM user_preferences 
    WHERE user_id = auth.uid()
  )
  OR posted_by_id = auth.uid()
);
```

#### 6.3 Supabase CLI for Development Workflow
```bash
# Initialize Supabase project
npx supabase init

# Start local development
npx supabase start

# Generate TypeScript types
npx supabase gen types typescript --local > types/supabase.ts

# Deploy Edge Functions
npx supabase functions deploy job-matching
npx supabase functions deploy send-email
npx supabase functions deploy send-notification

# Database migrations
npx supabase db diff -f create_initial_schema
npx supabase db push

# Generate seed data
npx supabase db seed
```

## 🔧 Simplified Technical Implementation

### Environment Variables (Supabase Only)
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Edge Function Secrets (stored in Supabase Dashboard)
RESEND_API_KEY=your-resend-key
STRIPE_SECRET_KEY=your-stripe-key
GOOGLE_MAPS_API_KEY=your-maps-key

# No more database URLs, auth secrets, or connection strings!
```

### Package.json Simplified
```json
{
  "dependencies": {
    // Core Supabase
    "@supabase/supabase-js": "^2.50.3",
    "@supabase/auth-helpers-nextjs": "^0.8.7",
    "@supabase/auth-helpers-react": "^0.4.2",
    
    // State Management
    "@tanstack/react-query": "^5.0.0",
    "zustand": "^4.4.7",
    
    // UI & Framework
    "next": "15.3.4",
    "react": "^19.0.0",
    "tailwindcss": "^3.4.0",
    
    // Removed: All Prisma packages, NextAuth, database drivers
  },
  "devDependencies": {
    "supabase": "^1.200.0" // Supabase CLI for local development
  }
}
```

### Supabase Feature Usage Map
```typescript
// Feature utilization across the application

// 1. Database: All tables with RLS
// 2. Auth: Social providers + email
// 3. Storage: File uploads with transformations
// 4. Edge Functions: Business logic
// 5. Realtime: Live updates everywhere
// 6. Functions: Database triggers
// 7. Extensions: pg_cron, http, uuid-ossp

export const supabaseFeatures = {
  database: {
    tables: 22,
    views: 5,
    functions: 8,
    triggers: 12,
    policies: 45
  },
  auth: {
    providers: ['google', 'facebook', 'apple', 'email'],
    mfa: true,
    sessionManagement: 'automatic'
  },
  storage: {
    buckets: ['avatars', 'resumes', 'attachments'],
    transformations: true,
    cdn: true
  },
  edgeFunctions: [
    'job-matching',
    'send-email',
    'send-notification',
    'process-payments',
    'generate-reports'
  ],
  realtime: {
    channels: ['jobs', 'applications', 'messages', 'notifications'],
    presence: ['chat-rooms', 'live-cursors'],
    broadcast: ['system-alerts']
  }
}
```

### Phase 3: TanStack Query + API Route Migration (Week 2-3)

#### 3.1 Implement TanStack Query Layer
```typescript
// New query client setup
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error) => {
        if (error?.status >= 400 && error?.status < 500) {
          return false // Don't retry client errors
        }
        return failureCount < 3
      },
      refetchOnWindowFocus: false,
    },
  },
})

// Query keys factory
export const queryKeys = {
  jobs: {
    all: ['jobs'] as const,
    lists: () => [...queryKeys.jobs.all, 'list'] as const,
    list: (filters: JobFilters) => [...queryKeys.jobs.lists(), filters] as const,
    details: () => [...queryKeys.jobs.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.jobs.details(), id] as const,
    applications: (jobId: string) => [...queryKeys.jobs.detail(jobId), 'applications'] as const,
  },
  users: {
    all: ['users'] as const,
    lists: () => [...queryKeys.users.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.users.all, 'detail', id] as const,
    profile: (id: string) => [...queryKeys.users.detail(id), 'profile'] as const,
  }
}
```

#### 3.2 Replace API Routes with Supabase Queries
```typescript
// Before: Prisma-based API route
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export async function GET() {
  const jobs = await prisma.jobListing.findMany({
    include: { postedBy: true }
  })
  return NextResponse.json(jobs)
}

// After: TanStack Query hook with Supabase
export function useJobsQuery(filters: JobFilters = {}) {
  return useQuery({
    queryKey: queryKeys.jobs.list(filters),
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('job_listings')
        .select(`
          *,
          posted_by:users(*),
          applications:applications(count)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// Job creation with optimistic updates
export function useCreateJobMutation() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (jobData: CreateJobData) => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('job_listings')
        .insert([jobData])
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: (newJob) => {
      // Invalidate and refetch job lists
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.lists() })
      
      // Optimistically add to cache
      queryClient.setQueryData(queryKeys.jobs.detail(newJob.id), newJob)
      
      toast.success('Job posted successfully!')
    },
    onError: (error) => {
      toast.error(`Failed to post job: ${error.message}`)
    },
  })
}
```

#### 3.3 Advanced State Management Migration
```typescript
// Enhanced Zustand integration with TanStack Query
export function useJobManager() {
  const { 
    jobSearch, 
    jobCityFilter, 
    jobCategoryFilter, 
    jobTypeFilter,
    currentPage,
    itemsPerPage,
    viewMode,
    sortBy,
    sortOrder
  } = useFilterStore()
  
  const filters: JobFilters = {
    search: jobSearch || undefined,
    city: jobCityFilter !== 'all' ? jobCityFilter : undefined,
    category: jobCategoryFilter !== 'all' ? jobCategoryFilter : undefined,
    type: jobTypeFilter !== 'all' ? jobTypeFilter : undefined,
    page: currentPage,
    limit: itemsPerPage,
  }
  
  const jobsQuery = useJobsQuery(filters)
  const createMutation = useCreateJobMutation()
  const updateMutation = useUpdateJobMutation()
  const deleteMutation = useDeleteJobMutation()
  
  return {
    // Query data with Zustand filter integration
    jobs: jobsQuery.data?.data || [],
    totalJobs: jobsQuery.data?.total || 0,
    totalPages: Math.ceil((jobsQuery.data?.total || 0) / itemsPerPage),
    
    // Query states
    isLoading: jobsQuery.isLoading,
    isError: jobsQuery.isError,
    error: jobsQuery.error,
    isFetching: jobsQuery.isFetching,
    
    // Mutations with optimistic updates
    createJob: createMutation.mutate,
    updateJob: updateMutation.mutate,
    deleteJob: deleteMutation.mutate,
    
    // Mutation states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    
    // Utility functions
    refetch: jobsQuery.refetch,
    invalidate: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.lists() })
    },
  }
}

// Static data migration with TanStack Query
export function useCitiesQuery() {
  return useQuery({
    queryKey: ['cities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cities')
        .select('*')
        .eq('is_active', true)
        .order('name')
      
      if (error) throw error
      return data
    },
    staleTime: 24 * 60 * 60 * 1000, // 24 hours - cities rarely change
    gcTime: 7 * 24 * 60 * 60 * 1000, // 7 days
    // Keep existing cache system as fallback during migration
    initialData: () => staticDataManager.getCities(),
  })
}

// Enhanced dialog state management integration
export function useJobPostDialog() {
  const { 
    isJobPostDialogOpen, 
    openJobPostDialog, 
    closeJobPostDialog 
  } = useDialogStore()
  
  const createMutation = useCreateJobMutation({
    onSuccess: () => {
      closeJobPostDialog()
      // Clear form state
      useFormStateStore.getState().resetSteps()
    }
  })
  
  return {
    isOpen: isJobPostDialogOpen,
    open: openJobPostDialog,
    close: closeJobPostDialog,
    createJob: createMutation.mutate,
    isCreating: createMutation.isPending,
  }
}
```

### Phase 4: Real-time Enhancement (Week 3)

#### 4.1 Add Real-time to All Features
```typescript
// Real-time job applications
export function useJobApplicationsRealtime(jobId: string) {
  const queryClient = useQueryClient()
  
  useEffect(() => {
    const supabase = createClient()
    
    const subscription = supabase
      .channel('job_applications')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'applications',
        filter: `job_id=eq.${jobId}`
      }, (payload) => {
        // Update applications in real-time
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.jobs.applications(jobId) 
        })
        
        // Show toast for new applications
        if (payload.eventType === 'INSERT') {
          toast.success('New application received!')
        }
      })
      .subscribe()
    
    return () => {
      subscription.unsubscribe()
    }
  }, [jobId, queryClient])
}

// Real-time notifications
export function useNotificationsRealtime() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  
  useEffect(() => {
    if (!user?.id) return
    
    const supabase = createClient()
    
    const subscription = supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        // Update notifications cache
        queryClient.invalidateQueries({ 
          queryKey: ['notifications', user.id] 
        })
        
        // Show real-time toast notification
        showNotification(payload.new)
      })
      .subscribe()
    
    return () => {
      subscription.unsubscribe()
    }
  }, [user?.id, queryClient])
}
```

#### 4.2 Enhanced Features with Real-time
- **Live Application Updates**: See applications in real-time
- **Instant Notifications**: Real-time notification delivery
- **Live Job Views**: Real-time view count updates
- **Connection Updates**: Live connection balance updates
- **Status Changes**: Real-time application status updates

### Phase 5: File Storage Migration (Week 4)

#### 5.1 Replace Custom File Handling with Supabase Storage
```typescript
// Before: Custom file upload handling
// After: Supabase Storage

const uploadAvatar = async (file: File) => {
  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(`${userId}/${Date.now()}-${file.name}`, file)

  if (error) throw error
  
  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(data.path)
    
  return publicUrl
}

// Storage buckets to create:
// - avatars (user profile pictures)
// - resumes (job application files)
// - company-logos (company branding)
// - attachments (message attachments)
```

### Phase 6: Edge Functions (Week 4)

#### 6.1 Move Heavy Processing to Edge Functions
```typescript
// Email sending, notifications, and heavy processing
// Create Supabase Edge Functions for:

// 1. Email notifications
export const sendNotificationEmail = async (req: Request) => {
  const { userId, type, data } = await req.json()
  
  // Send email via Resend
  // Update notification status
  // Return response
}

// 2. Job matching algorithm
export const getRecommendedJobs = async (req: Request) => {
  const { userId } = await req.json()
  
  // Run job matching algorithm
  // Return personalized job recommendations
}

// 3. Analytics processing
export const processJobViews = async (req: Request) => {
  // Process job view analytics
  // Update metrics
}
```

---

## 🔧 Technical Implementation Details

### Environment Variables Update
```bash
# Remove Prisma variables
# DATABASE_URL (Prisma)
# NEXTAUTH_SECRET (NextAuth)
# NEXTAUTH_URL (NextAuth)

# Add/Keep Supabase variables
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Keep existing integrations
RESEND_API_KEY=your-resend-key
STRIPE_SECRET_KEY=your-stripe-key
STRIPE_WEBHOOK_SECRET=your-webhook-secret
AUTH_GOOGLE_ID=your-google-id
AUTH_GOOGLE_SECRET=your-google-secret
AUTH_FACEBOOK_ID=your-facebook-id
AUTH_FACEBOOK_SECRET=your-facebook-secret
AUTH_APPLE_ID=your-apple-id
AUTH_APPLE_SECRET=your-apple-secret

# Optional
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-maps-key
NEXT_PUBLIC_GA_MEASUREMENT_ID=your-ga4-id
```

### Package.json Changes
```json
{
  "dependencies": {
    // Remove
    // "@prisma/client": "^6.12.0",
    // "@prisma/extension-accelerate": "^2.0.1", 
    // "@auth/prisma-adapter": "^2.10.0",
    // "next-auth": "^5.0.0-beta.29",
    // "prisma": "^6.12.0",

    // Add/Keep
    "@supabase/supabase-js": "^2.50.3",
    "@supabase/auth-helpers-nextjs": "^0.8.7",
    "@supabase/auth-helpers-react": "^0.4.2",
    "@tanstack/react-query": "^5.0.0",
    "@tanstack/react-query-devtools": "^5.0.0",
    "zustand": "^4.4.7",
    
    // Keep existing
    "@stripe/stripe-js": "^7.4.0",
    "resend": "^4.6.0",
    "next": "15.3.4",
    "react": "^19.0.0",
    "next-intl": "^3.22.0",
    "tailwindcss": "^3.4.0",
    "sonner": "^1.4.0"
  }
}
```

### Static Data Management Migration
```typescript
// Current: Custom static data manager
// After: TanStack Query with Supabase

// Before: staticDataManager with file-based caching
export function useStaticCities() {
  const [cities, setCities] = useState<City[]>([])
  const [loading, setLoading] = useState(true)
  // Custom caching logic...
}

// After: TanStack Query with Supabase
export function useCitiesQuery() {
  return useQuery({
    queryKey: ['cities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cities')
        .select('*')
        .eq('is_active', true)
        .order('name')
      
      if (error) throw error
      return data
    },
    staleTime: 24 * 60 * 60 * 1000, // 24 hours - cities rarely change
    gcTime: 7 * 24 * 60 * 60 * 1000, // 7 days
  })
}

// Keep file-based static data for fallback
// Migrate to Supabase tables for real-time updates
```

### Database Schema Migration Script
```sql
-- Create all enums
CREATE TYPE user_role AS ENUM ('admin', 'client', 'tasker', 'company');
CREATE TYPE job_type AS ENUM ('quick_job', 'full_time', 'part_time', 'remote');
CREATE TYPE salary_type AS ENUM ('fixed', 'hourly', 'daily', 'weekly', 'monthly', 'negotiable');
CREATE TYPE job_status AS ENUM ('active', 'inactive', 'completed', 'expired');
CREATE TYPE application_status AS ENUM ('PENDING', 'REVIEWED', 'SHORTLISTED', 'SELECTED', 'REJECTED', 'WITHDRAWN');
CREATE TYPE contract_status AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'WORK_COMPLETED', 'CONFIRMED_COMPLETED', 'COMPLETED');
CREATE TYPE connection_action AS ENUM ('MONTHLY_REFRESH', 'INITIAL_SIGNUP', 'ROLE_CHANGE', 'JOB_APPLICATION', 'JOB_POST_CLIENT', 'JOB_POST_COMPANY', 'ADMIN_ADJUSTMENT', 'PURCHASE', 'JOB_POST_FREE');
CREATE TYPE notification_type AS ENUM ('NEW_MESSAGE', 'NEW_REVIEW', 'JOB_APPLICATION', 'JOB_UPDATE', 'SYSTEM');

-- Create all tables (22 tables total)
-- Users table with profile and privacy settings
CREATE TABLE users (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  name TEXT NOT NULL,
  password TEXT,
  role user_role,
  email_verified BOOLEAN DEFAULT false,
  profile_setup_completed BOOLEAN DEFAULT false,
  avatar_url TEXT,
  company_name TEXT,
  position TEXT,
  bio TEXT,
  skills TEXT,
  experience TEXT,
  preferred_job_types TEXT DEFAULT '',
  phone TEXT,
  website TEXT,
  location TEXT,
  connections INTEGER DEFAULT 10,
  connections_last_refresh TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  preferred_language TEXT DEFAULT 'bs'
);

-- Cities and categories as tables for real-time updates
CREATE TABLE cities (
  id TEXT PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  country TEXT DEFAULT 'Bosnia and Herzegovina',
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  is_active BOOLEAN DEFAULT true,
  is_special BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  parent_id TEXT REFERENCES categories(id),
  is_popular BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Job listings with enhanced features
CREATE TABLE job_listings (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  posted_by_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  category_id TEXT REFERENCES categories(id),
  subcategory_id TEXT REFERENCES categories(id),
  city_id TEXT REFERENCES cities(id),
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
  application_deadline TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Applications with enhanced workflow
CREATE TABLE applications (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  job_id TEXT REFERENCES job_listings(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
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

-- Job assignments for contract management
CREATE TABLE job_assignments (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  job_id TEXT REFERENCES job_listings(id) ON DELETE CASCADE,
  tasker_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  client_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  application_id TEXT REFERENCES applications(id),
  status contract_status DEFAULT 'PENDING',
  agreed_rate DECIMAL(10, 2),
  estimated_duration TEXT,
  start_date DATE,
  end_date DATE,
  work_completed_at TIMESTAMPTZ,
  client_confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enhanced messaging system
CREATE TABLE conversations (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  job_id TEXT REFERENCES job_listings(id),
  application_id TEXT REFERENCES applications(id),
  created_by_id TEXT REFERENCES users(id),
  title TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE conversation_participants (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  conversation_id TEXT REFERENCES conversations(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  last_read_at TIMESTAMPTZ,
  UNIQUE(conversation_id, user_id)
);

CREATE TABLE messages (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  conversation_id TEXT REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text',
  attachment_url TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications system
CREATE TABLE notifications (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews system
CREATE TABLE reviews (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  job_id TEXT REFERENCES job_listings(id) ON DELETE CASCADE,
  reviewer_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  reviewee_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  assignment_id TEXT REFERENCES job_assignments(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment and connection tracking
CREATE TABLE stripe_transactions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  stripe_payment_intent_id TEXT UNIQUE,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'BAM',
  connections_purchased INTEGER NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE connection_history (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  action connection_action NOT NULL,
  connections_before INTEGER NOT NULL,
  connections_after INTEGER NOT NULL,
  amount_changed INTEGER NOT NULL,
  reason TEXT,
  job_id TEXT REFERENCES job_listings(id),
  admin_id TEXT REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User privacy settings
CREATE TABLE user_privacy_settings (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  profile_visibility TEXT DEFAULT 'public',
  show_email BOOLEAN DEFAULT false,
  show_phone BOOLEAN DEFAULT false,
  allow_messages BOOLEAN DEFAULT true,
  show_reviews BOOLEAN DEFAULT true,
  show_completed_jobs BOOLEAN DEFAULT true,
  email_notifications BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Job views analytics
CREATE TABLE job_views (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  job_id TEXT REFERENCES job_listings(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  ip_address INET,
  user_agent TEXT,
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Saved jobs
CREATE TABLE saved_jobs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  job_id TEXT REFERENCES job_listings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, job_id)
);

-- Pending registrations for email verification
CREATE TABLE pending_registrations (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email TEXT UNIQUE NOT NULL,
  hashed_password TEXT NOT NULL,
  verification_code TEXT NOT NULL,
  verification_expires TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Account deletion requests
CREATE TABLE account_deletion_requests (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT,
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  processed_by_id TEXT REFERENCES users(id)
);

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_privacy_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_jobs ENABLE ROW LEVEL SECURITY;
-- Cities and categories can be public read-only
```

### RLS Policies for Multi-tenancy
```sql
-- User access control
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Job access control  
CREATE POLICY "Anyone can view active jobs" ON job_listings
  FOR SELECT USING (status = 'active' AND is_active = true);

CREATE POLICY "Job owners can manage own jobs" ON job_listings
  FOR ALL USING (posted_by_id = auth.uid());

CREATE POLICY "Admins can manage all jobs" ON job_listings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Application access control
CREATE POLICY "Users can view own applications" ON applications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Job owners can view applications" ON applications
  FOR SELECT USING (
    job_id IN (
      SELECT id FROM job_listings WHERE posted_by_id = auth.uid()
    )
  );

CREATE POLICY "Users can create applications" ON applications
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Job owners can update application status" ON applications
  FOR UPDATE USING (
    job_id IN (
      SELECT id FROM job_listings WHERE posted_by_id = auth.uid()
    )
  );

-- Messaging access (enhanced from existing)
CREATE POLICY "Users can view own conversations" ON conversations
  FOR SELECT USING (
    id IN (
      SELECT conversation_id FROM conversation_participants 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view own messages" ON messages
  FOR SELECT USING (
    conversation_id IN (
      SELECT conversation_id FROM conversation_participants 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages to their conversations" ON messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND
    conversation_id IN (
      SELECT conversation_id FROM conversation_participants 
      WHERE user_id = auth.uid()
    )
  );

-- Notification access
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

-- Privacy settings access
CREATE POLICY "Users can manage own privacy" ON user_privacy_settings
  FOR ALL USING (user_id = auth.uid());

-- Public read access for reference data
CREATE POLICY "Anyone can view cities" ON cities
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view categories" ON categories
  FOR SELECT USING (true);

-- Admin policies for management
CREATE POLICY "Admins can manage users" ON users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

---

## 🏗️ Infrastructure & Deployment

### 5.1 Advanced Security Migration
```sql
-- Comprehensive RLS policies matching current authentication patterns
CREATE POLICY "Users can view own profile" ON profiles
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Authenticated users can view active jobs" ON jobs
FOR SELECT TO authenticated USING (
  status = 'active' OR 
  created_by = auth.uid() OR
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND role IN ('admin', 'moderator')
  )
);

CREATE POLICY "Role-based job management" ON jobs
FOR ALL TO authenticated USING (
  created_by = auth.uid() OR
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND role IN ('admin', 'moderator')
  )
);

-- Geographic access patterns
CREATE POLICY "Regional job access" ON jobs
FOR SELECT TO authenticated USING (
  status = 'active' AND (
    city = ANY(
      SELECT unnest(allowed_cities) 
      FROM profiles 
      WHERE id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  )
);
```

### 5.2 Static Data System Migration
```typescript
// Migrate static data system to Supabase with fallback
export class HybridDataManager {
  private supabaseCache = new Map<string, { data: any; timestamp: number }>()
  private readonly CACHE_DURATION = 60 * 60 * 1000 // 1 hour
  
  async getCities(): Promise<City[]> {
    try {
      // Try Supabase first
      const cached = this.supabaseCache.get('cities')
      if (cached && (Date.now() - cached.timestamp) < this.CACHE_DURATION) {
        return cached.data
      }
      
      const { data, error } = await supabase
        .from('cities')
        .select('*')
        .eq('is_active', true)
        .order('name')
      
      if (error) throw error
      
      this.supabaseCache.set('cities', { 
        data, 
        timestamp: Date.now() 
      })
      
      return data
    } catch (error) {
      // Fallback to static JSON during migration
      console.warn('Supabase cities failed, using static fallback:', error)
      return staticDataManager.getCities()
    }
  }
  
  async getJobCategories(): Promise<JobCategory[]> {
    // Similar pattern for categories, regions, etc.
  }
  
  // Preload critical data on app start
  async preloadStaticData() {
    await Promise.allSettled([
      this.getCities(),
      this.getJobCategories(),
      this.getRegions(),
    ])
  }
}
```

### 5.3 Performance Optimization & Caching
```typescript
// Enhanced query key factory with geographic awareness
export const queryKeys = {
  jobs: {
    all: ['jobs'] as const,
    lists: () => [...queryKeys.jobs.all, 'list'] as const,
    list: (filters: JobFilters) => [...queryKeys.jobs.lists(), filters] as const,
    details: () => [...queryKeys.jobs.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.jobs.details(), id] as const,
    byCity: (city: string) => [...queryKeys.jobs.all, 'city', city] as const,
    byCategory: (category: string) => [...queryKeys.jobs.all, 'category', category] as const,
    featured: () => [...queryKeys.jobs.all, 'featured'] as const,
  },
  staticData: {
    all: ['staticData'] as const,
    cities: () => [...queryKeys.staticData.all, 'cities'] as const,
    categories: () => [...queryKeys.staticData.all, 'categories'] as const,
    regions: () => [...queryKeys.staticData.all, 'regions'] as const,
  },
  user: {
    all: ['user'] as const,
    profile: () => [...queryKeys.user.all, 'profile'] as const,
    applications: () => [...queryKeys.user.all, 'applications'] as const,
    messages: () => [...queryKeys.user.all, 'messages'] as const,
  },
} as const

// Geographic query optimization
export function useJobsByRegion(region: string) {
  return useQuery({
    queryKey: queryKeys.jobs.byCity(region),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          profiles!jobs_created_by_fkey(
            id,
            display_name,
            company_name,
            verification_status
          )
        `)
        .eq('status', 'active')
        .in('city', getRegionCities(region))
        .order('created_at', { ascending: false })
        .limit(50)
      
      if (error) throw error
      return data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  })
}
```

### 5.4 Advanced Authentication Integration
```typescript
// Supabase auth integration with existing guard patterns
export async function createServerSupabaseClient() {
  const cookieStore = cookies()
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )
}

// Enhanced middleware with Supabase auth
export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  
  // Apply existing guard logic
  if (isProtectedRoute(request.nextUrl.pathname)) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    
    // Role-based protection
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, onboarding_completed')
      .eq('id', user.id)
      .single()
    
    if (requiresOnboarding(request.nextUrl.pathname) && !profile?.onboarding_completed) {
      return NextResponse.redirect(new URL('/onboarding', request.url))
    }
    
    if (requiresAdminRole(request.nextUrl.pathname) && profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }
  }
  
  return response
}
```

### 5.5 Vercel & Domain Configuration
- Enhanced environment variable management for multi-environment setup
- Configure edge runtime for optimal geographic distribution
- Set up branch-specific environments with automatic Supabase project provisioning
- Update CORS settings for cross-subdomain authentication
- Configure proper session handling across subdomains

### 5.6 Monitoring & Analytics Integration
- Migrate existing analytics tracking to work with Supabase auth
- Set up performance monitoring for query optimization
- Implement error tracking for migration-related issues
- Configure alerts for authentication and database connectivity

---

## 📋 Simplified Migration Checklist

### Week 1: Fresh Supabase Setup
- [ ] **Create New Supabase Project**: Fresh project with all features enabled
- [ ] **Database Schema**: Create all tables, functions, triggers, and policies
- [ ] **Storage Buckets**: Set up file storage with policies and transformations
- [ ] **Authentication**: Configure social providers and email auth
- [ ] **Edge Functions**: Deploy all business logic functions
- [ ] **Local Development**: Set up Supabase CLI and local development environment

### Week 2: Frontend Migration
- [ ] **Remove Old Dependencies**: Prisma, NextAuth, database packages
- [ ] **Install Supabase**: Full Supabase client setup
- [ ] **Auth Integration**: Replace NextAuth with Supabase auth
- [ ] **API Migration**: Replace all API routes with Supabase queries
- [ ] **Real-time Setup**: Implement live subscriptions
- [ ] **File Upload**: Migrate to Supabase Storage

### Week 3: Advanced Features
- [ ] **Real-time Messaging**: Live chat with presence
- [ ] **Notifications**: Real-time notification system
- [ ] **Analytics**: Live dashboard with real-time stats
- [ ] **Job Matching**: AI-powered job recommendations
- [ ] **Email System**: Edge function email notifications
- [ ] **Testing**: Comprehensive feature testing

### Week 4: Polish & Deploy
- [ ] **Performance**: Optimize queries and subscriptions
- [ ] **Security**: Final security audit and RLS testing
- [ ] **Documentation**: Update all documentation
- [ ] **Deployment**: Deploy to production
- [ ] **Monitoring**: Set up error tracking and analytics

---

## 🚨 Simplified Risk Assessment

### Minimal Risk Areas (Fresh Start Benefits)
1. **No Data Loss Risk**: Starting fresh with seed data
2. **No Downtime Concerns**: Development environment only  
3. **No Migration Complexity**: Clean implementation from scratch
4. **No Backward Compatibility**: Can use latest Supabase features

### Focus Areas for Success
1. **Learning Curve**: Team familiarity with Supabase features
   - **Mitigation**: Comprehensive documentation and examples provided

2. **Feature Completeness**: Ensuring all current features are implemented
   - **Mitigation**: Detailed feature mapping and testing checklist

3. **Performance Optimization**: Real-time subscriptions and query performance
   - **Mitigation**: Built-in Supabase optimizations and monitoring

---

## 📈 Expected Improvements with Full Supabase

### Performance Gains
- **Native Real-time**: WebSocket connections for all live features
- **Edge Functions**: Global compute with 0ms cold starts
- **Auto-generated APIs**: PostgREST for optimal query performance
- **Built-in CDN**: Global file delivery with image transformations
- **Connection Pooling**: Automatic database connection management

### Developer Experience
- **Single Platform**: Database, auth, storage, functions in one place
- **Type Generation**: Automatic TypeScript types from database schema
- **Local Development**: Full Supabase stack running locally
- **CLI Tools**: Database migrations, function deployment, type generation
- **Real-time Dashboard**: Live monitoring and debugging

### Operational Benefits
- **Zero Infrastructure**: No servers to manage or maintain
- **Automatic Scaling**: Handles traffic spikes automatically  
- **Built-in Monitoring**: Performance metrics and error tracking
- **Security by Default**: RLS, auth, and encryption built-in
- **Global Distribution**: Edge functions and CDN worldwide

### Cost Benefits
- **No Infrastructure Costs**: No servers, databases, or CDN costs
- **Predictable Pricing**: Clear usage-based pricing model
- **Development Efficiency**: 50% faster development with built-in features
- **Maintenance Free**: No DevOps or infrastructure management needed

---

## 🎯 Success Metrics

### Technical Metrics
- **Real-time Latency**: <50ms for all live updates
- **API Response Time**: <100ms average via PostgREST
- **File Upload Speed**: <2s for 5MB files via global CDN
- **Function Cold Start**: <10ms via Deno edge runtime

### Developer Metrics  
- **Development Speed**: 50% faster feature development
- **Code Reduction**: 40% less backend code needed
- **Bug Reduction**: 60% fewer infrastructure-related issues
- **Deploy Time**: <30s for full application deployment

### User Experience Metrics
- **Page Load Time**: <1s initial load with edge caching
- **Real-time Updates**: Instant live updates across all features
- **File Access**: Global CDN for fast file delivery
- **Authentication**: <500ms login with social providers

---

## 🚀 Next Steps

1. **Create Supabase Project**: Set up new project with all features
2. **Database Setup**: Implement schema with functions and triggers  
3. **Edge Functions**: Deploy business logic to Deno runtime
4. **Frontend Migration**: Replace all backend calls with Supabase
5. **Testing & Polish**: Comprehensive testing and optimization

**Estimated Timeline**: 3-4 weeks  
**Team Required**: 1-2 developers  
**Downtime**: 0 (fresh start)  
**Data Migration**: Not needed (seed data generation)

This migration will transform mojPoslić into a modern, serverless, real-time platform leveraging the full power of Supabase's integrated platform - resulting in faster development, better performance, and zero infrastructure management.
