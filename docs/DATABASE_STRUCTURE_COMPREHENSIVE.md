# MojPoslic Database Structure Documentation

## Overview
This document provides a comprehensive overview of the MojPoslic database structure, including all tables, relationships, custom types, functions, triggers, and security policies.

**Database System**: Supabase (PostgreSQL)  
**Last Updated**: July 26, 2025  
**Migration Files Analyzed**: 18 migration files

---

## Database Extensions

The following PostgreSQL extensions are enabled:
- `uuid-ossp` - UUID generation functions
- `pg_cron` - Scheduled job execution
- `http` - HTTP client functionality

---

## Custom Types (ENUMs)

### User & Role Types
```sql
user_role AS ENUM ('admin', 'client', 'tasker', 'company')
```

### Job Related Types
```sql
job_type AS ENUM ('quick_job', 'full_time', 'part_time', 'remote')
salary_type AS ENUM ('fixed', 'hourly', 'daily', 'weekly', 'monthly', 'negotiable')
job_status AS ENUM ('active', 'inactive', 'completed', 'expired')
```

### Application & Contract Types
```sql
application_status AS ENUM ('PENDING', 'REVIEWED', 'SHORTLISTED', 'SELECTED', 'REJECTED', 'WITHDRAWN')
contract_status AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'WORK_COMPLETED', 'CONFIRMED_COMPLETED', 'COMPLETED')
```

### System Types
```sql
connection_action AS ENUM ('MONTHLY_REFRESH', 'INITIAL_SIGNUP', 'ROLE_CHANGE', 'JOB_APPLICATION', 'JOB_POST_CLIENT', 'JOB_POST_COMPANY', 'ADMIN_ADJUSTMENT', 'PURCHASE', 'JOB_POST_FREE')
notification_type AS ENUM ('NEW_MESSAGE', 'NEW_REVIEW', 'JOB_APPLICATION', 'JOB_UPDATE', 'SYSTEM')
```

---

## Database Optimization Analysis

### Current Structure Issues & Optimization Opportunities

#### 1. **Messaging System Over-Normalization**
**Current**: 3 separate tables (conversations, conversation_participants, messages)
**Issue**: Requires 3+ queries to load a simple conversation
**Solution**: Consolidate into 2 tables with embedded participant data

#### 2. **Job Listings Missing Aggregated Data**
**Current**: Separate queries needed for application counts, view counts, etc.
**Issue**: Multiple DB calls to display job cards with stats
**Solution**: Add computed columns or materialized views

#### 3. **User Profile Scattered Across Tables**
**Current**: users + user_privacy_settings + connection_history
**Issue**: 3 queries to load complete user profile
**Solution**: Embed privacy settings in users table, optimize connection tracking

#### 4. **Review System Lacks Aggregation**
**Current**: Individual review records only
**Issue**: Requires aggregation queries for user ratings
**Solution**: Add rating summaries to users table

#### 5. **Notification System Not Optimized for Bulk Operations**
**Current**: Individual notification records
**Issue**: Inefficient for bulk notifications and real-time updates
**Solution**: Add notification preferences and batching support

#### 6. **Applications Table Missing Performance Optimizations**
**Current**: Basic application table without caching
**Issue**: Requires joins to display application lists with user/job data
**Solution**: Add cached applicant and job data to applications table

#### 7. **Search and Filtering Performance Issues**
**Current**: Full-text search on job descriptions only
**Issue**: Slow searches, no search analytics, limited filtering options
**Solution**: Add search vector columns, search analytics, and filter-optimized indexes

#### 8. **File Storage References Not Optimized**
**Current**: Simple URL strings for avatars, resumes, attachments
**Issue**: No metadata, file size tracking, or cleanup management
**Solution**: Create file_uploads table with metadata and lifecycle management

---

## Proposed Optimized Database Structure

### Core Tables (Optimized)

### 1. users (Enhanced)
**Consolidated user data with embedded settings and stats**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | User ID (matches auth.users.id) |
| email | TEXT | UNIQUE NOT NULL | User email address |
| username | TEXT | UNIQUE | Unique username |
| name | TEXT | NOT NULL | Display name |
| role | user_role | DEFAULT 'client' | User role in system |
| email_verified | BOOLEAN | DEFAULT false | Email verification status |
| profile_setup_completed | BOOLEAN | DEFAULT false | Profile completion status |
| avatar_url | TEXT | | Profile picture URL |
| company_name | TEXT | | Company name (for company users) |
| position | TEXT | | Job position/title |
| bio | TEXT | | User biography |
| skills | TEXT[] | | Array of user skills |
| experience | TEXT | | Work experience description |
| preferred_job_types | TEXT | DEFAULT '' | Preferred job types |
| phone | TEXT | | Phone number |
| website | TEXT | | Personal/company website |
| location | TEXT | | User location |
| connections | INTEGER | DEFAULT 10 | Available connection points |
| connections_last_refresh | TIMESTAMPTZ | DEFAULT NOW() | Last connection refresh |
| **-- Rating aggregations --** | | | |
| average_rating | DECIMAL(3,2) | DEFAULT 0 | Computed average rating |
| total_reviews | INTEGER | DEFAULT 0 | Total reviews received |
| **-- Privacy settings (embedded) --** | | | |
| profile_visibility | TEXT | DEFAULT 'public' | Profile visibility level |
| show_email | BOOLEAN | DEFAULT false | Email visibility |
| show_phone | BOOLEAN | DEFAULT false | Phone visibility |
| allow_messages | BOOLEAN | DEFAULT true | Message permissions |
| show_reviews | BOOLEAN | DEFAULT true | Review visibility |
| show_completed_jobs | BOOLEAN | DEFAULT true | Job history visibility |
| email_notifications | BOOLEAN | DEFAULT true | Email notification preference |
| **-- Activity stats --** | | | |
| jobs_posted | INTEGER | DEFAULT 0 | Total jobs posted |
| jobs_completed | INTEGER | DEFAULT 0 | Total jobs completed |
| last_active_at | TIMESTAMPTZ | DEFAULT NOW() | Last activity timestamp |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Account creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |
| preferred_language | TEXT | DEFAULT 'bs' | UI language preference |

### 1. users
**Primary user profiles table integrated with Supabase Auth**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | User ID (matches auth.users.id) |
| email | TEXT | UNIQUE NOT NULL | User email address |
| username | TEXT | UNIQUE | Unique username |
| name | TEXT | NOT NULL | Display name |
| role | user_role | DEFAULT 'client' | User role in system |
| email_verified | BOOLEAN | DEFAULT false | Email verification status |
| profile_setup_completed | BOOLEAN | DEFAULT false | Profile completion status |
| avatar_url | TEXT | | Profile picture URL |
| company_name | TEXT | | Company name (for company users) |
| position | TEXT | | Job position/title |
| bio | TEXT | | User biography |
| skills | TEXT[] | | Array of user skills |
| experience | TEXT | | Work experience description |
| preferred_job_types | TEXT | DEFAULT '' | Preferred job types |
| phone | TEXT | | Phone number |
| website | TEXT | | Personal/company website |
| location | TEXT | | User location |
| connections | INTEGER | DEFAULT 10 | Available connection points |
| connections_last_refresh | TIMESTAMPTZ | DEFAULT NOW() | Last connection refresh |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Account creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |
| preferred_language | TEXT | DEFAULT 'bs' | UI language preference |

### 2. cities *(Provided via JSON files - not a database table)*
**Geographic locations served from static JSON files**

Cities are provided through static JSON files located at `/public/static/cities.json` instead of database tables. This approach offers:
- **Faster performance** - No database queries needed
- **Easier management** - Simple JSON file updates
- **Reduced complexity** - No foreign key constraints

**JSON Structure:**
```json
{
  "id": "0",
  "key": "remote", 
  "name": "Remote",
  "country": "Bosnia and Herzegovina",
  "is_active": true,
  "is_special": true
}
```

### 3. categories *(Provided via JSON files - not a database table)*
**Job categories served from static JSON files**

Categories are provided through static JSON files located at `/public/static/categories.json` instead of database tables. This approach offers:
- **Simplified hierarchy** - JSON-based parent-child relationships
- **Easy localization** - Multiple language support in same file
- **Quick updates** - No database migrations needed

**JSON Structure:**
```json
{
  "id": "1",
  "key": "majstorski-radovi",
  "name": "Handyman work and repairs", 
  "parent_id": null,
  "is_popular": true,
  "subcategories": [...]
}
```

### 4. job_listings (Enhanced with Stats)
**Main job postings table with embedded analytics**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Job ID |
| title | TEXT | NOT NULL | Job title |
| description | TEXT | NOT NULL | Job description |
| posted_by_id | UUID | REFERENCES users(id) ON DELETE CASCADE | Job poster |
| category_id | TEXT | | Primary category (references JSON file) |
| subcategory_id | TEXT | | Subcategory (references JSON file) |
| city_id | TEXT | | Job location (references JSON file) |
| exact_location | TEXT | | Specific address |
| latitude | DECIMAL(10, 8) | | Geographic latitude |
| longitude | DECIMAL(11, 8) | | Geographic longitude |
| job_type | job_type | NOT NULL | Employment type |
| salary_type | salary_type | | Salary structure |
| salary_amount | DECIMAL(10, 2) | | Fixed salary amount |
| salary_min | DECIMAL(10, 2) | | Minimum salary |
| salary_max | DECIMAL(10, 2) | | Maximum salary |
| currency | TEXT | DEFAULT 'BAM' | Currency code |
| is_salary_negotiable | BOOLEAN | DEFAULT false | Salary negotiation flag |
| duration_days | INTEGER | | Job duration in days |
| is_urgent | BOOLEAN | DEFAULT false | Urgent job flag |
| is_featured | BOOLEAN | DEFAULT false | Featured job flag |
| is_active | BOOLEAN | DEFAULT true | Active status |
| status | job_status | DEFAULT 'active' | Job status |
| requirements | TEXT | | Job requirements |
| benefits | TEXT | | Job benefits |
| contact_info | TEXT | | Contact information (JSON) |
| application_url | TEXT | | External application URL |
| application_deadline | TIMESTAMPTZ | | Application deadline |
| **-- Embedded analytics (reduces queries) --** | | | |
| application_count | INTEGER | DEFAULT 0 | Total applications received |
| view_count | INTEGER | DEFAULT 0 | Total views |
| last_viewed_at | TIMESTAMPTZ | | Last view timestamp |
| last_application_at | TIMESTAMPTZ | | Last application timestamp |
| **-- Cached related data --** | | | |
| poster_name | TEXT | | Cached poster name (for lists) |
| poster_rating | DECIMAL(3,2) | | Cached poster rating |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |
| duration_days | INTEGER | | Job duration in days |
| is_urgent | BOOLEAN | DEFAULT false | Urgent job flag |
| is_featured | BOOLEAN | DEFAULT false | Featured job flag |
| is_active | BOOLEAN | DEFAULT true | Active status |
| status | job_status | DEFAULT 'active' | Job status |
| requirements | TEXT | | Job requirements |
| benefits | TEXT | | Job benefits |
| contact_info | TEXT | | Contact information (JSON) |
| application_url | TEXT | | External application URL |
| application_deadline | TIMESTAMPTZ | | Application deadline |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

### 5. applications (Enhanced with Cached Data)
**Job application management with optimized display data**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Application ID |
| job_id | UUID | REFERENCES job_listings(id) ON DELETE CASCADE | Applied job |
| user_id | UUID | REFERENCES users(id) ON DELETE CASCADE | Applicant |
| status | application_status | DEFAULT 'PENDING' | Application status |
| cover_letter | TEXT | | Cover letter |
| resume_url | TEXT | | Resume file URL |
| contact_info | TEXT | | Applicant contact info |
| availability | TEXT | | Availability information |
| hourly_rate | DECIMAL(10, 2) | | Proposed hourly rate |
| estimated_duration | TEXT | | Estimated completion time |
| questions_answers | JSONB | | Custom question responses |
| client_notes | TEXT | | Client notes about application |
| **-- Cached applicant data (reduces joins) --** | | | |
| applicant_name | TEXT | | Cached applicant name |
| applicant_avatar | TEXT | | Cached applicant avatar |
| applicant_rating | DECIMAL(3,2) | | Cached applicant rating |
| applicant_location | TEXT | | Cached applicant location |
| **-- Cached job data for lists --** | | | |
| job_title | TEXT | | Cached job title |
| job_type | job_type | | Cached job type |
| job_city | TEXT | | Cached job city |
| **-- Application metrics --** | | | |
| response_time_hours | INTEGER | | Hours to respond (for analytics) |
| applied_at | TIMESTAMPTZ | DEFAULT NOW() | Application timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

### 6. job_assignments
**Contract and work assignment tracking**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Assignment ID |
| job_id | UUID | REFERENCES job_listings(id) ON DELETE CASCADE | Assigned job |
| tasker_id | UUID | REFERENCES users(id) ON DELETE CASCADE | Assigned worker |
| client_id | UUID | REFERENCES users(id) ON DELETE CASCADE | Job client |
| application_id | UUID | REFERENCES applications(id) | Related application |
| status | contract_status | DEFAULT 'PENDING' | Contract status |
| agreed_rate | DECIMAL(10, 2) | | Agreed payment rate |
| estimated_duration | TEXT | | Estimated work duration |
| start_date | DATE | | Work start date |
| end_date | DATE | | Work end date |
| work_completed_at | TIMESTAMPTZ | | Worker completion timestamp |
| client_confirmed_at | TIMESTAMPTZ | | Client confirmation timestamp |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

---

## Optimized Communication System

### 7. conversations (Simplified)
**Message conversation containers with embedded participants**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Conversation ID |
| job_id | UUID | REFERENCES job_listings(id) | Related job |
| application_id | UUID | REFERENCES applications(id) | Related application |
| created_by_id | UUID | REFERENCES users(id) | Conversation creator |
| title | TEXT | | Conversation title |
| is_active | BOOLEAN | DEFAULT true | Active status |
| **-- Embedded participant data (reduces joins) --** | | | |
| participant_ids | UUID[] | | Array of participant user IDs |
| participant_names | TEXT[] | | Cached participant names |
| participant_avatars | TEXT[] | | Cached participant avatars |
| **-- Message stats --** | | | |
| message_count | INTEGER | DEFAULT 0 | Total messages |
| last_message_at | TIMESTAMPTZ | | Last message timestamp |
| last_message_preview | TEXT | | Last message preview |
| last_sender_id | UUID | | Last message sender |
| **-- Read tracking (JSON for scalability) --** | | | |
| read_status | JSONB | DEFAULT '{}' | Per-user read timestamps |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

### 8. messages (Enhanced)
**Individual messages with cached sender data**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Message ID |
| conversation_id | UUID | REFERENCES conversations(id) ON DELETE CASCADE | Parent conversation |
| sender_id | UUID | REFERENCES users(id) ON DELETE CASCADE | Message sender |
| content | TEXT | NOT NULL | Message content |
| message_type | TEXT | DEFAULT 'text' | Message type |
| attachment_url | TEXT | | Attachment file URL |
| **-- Cached sender data (reduces joins) --** | | | |
| sender_name | TEXT | | Cached sender name |
| sender_avatar | TEXT | | Cached sender avatar |
| **-- Read optimization --** | | | |
| read_by | UUID[] | DEFAULT ARRAY[]::UUID[] | Users who read this message |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

*Note: Removed conversation_participants table - data embedded in conversations*

## Optimized System Features

### 9. notifications (Enhanced for Bulk Operations)
**System notification management with batching support**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Notification ID |
| user_id | UUID | REFERENCES users(id) ON DELETE CASCADE | Notification recipient |
| type | notification_type | NOT NULL | Notification type |
| title | TEXT | NOT NULL | Notification title |
| message | TEXT | NOT NULL | Notification message |
| data | JSONB | | Additional data payload |
| is_read | BOOLEAN | DEFAULT false | Read status |
| **-- Batching optimization --** | | | |
| batch_id | UUID | | Group related notifications |
| priority | INTEGER | DEFAULT 5 | Priority (1=highest, 10=lowest) |
| **-- Delivery optimization --** | | | |
| delivery_method | TEXT[] | DEFAULT ARRAY['in_app'] | Delivery channels |
| sent_at | TIMESTAMPTZ | | Email/SMS send timestamp |
| clicked_at | TIMESTAMPTZ | | Click tracking |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

### 10. reviews (Enhanced with Aggregation Triggers)
**User review system with automatic user rating updates**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Review ID |
| job_id | UUID | REFERENCES job_listings(id) ON DELETE CASCADE | Reviewed job |
| reviewer_id | UUID | REFERENCES users(id) ON DELETE CASCADE | Review author |
| reviewee_id | UUID | REFERENCES users(id) ON DELETE CASCADE | Review subject |
| assignment_id | UUID | REFERENCES job_assignments(id) | Related assignment |
| rating | INTEGER | CHECK (rating >= 1 AND rating <= 5) | 1-5 star rating |
| comment | TEXT | | Review comment |
| **-- Cached reviewer data --** | | | |
| reviewer_name | TEXT | | Cached reviewer name |
| reviewer_avatar | TEXT | | Cached reviewer avatar |
| **-- Response system --** | | | |
| response | TEXT | | Reviewee response |
| response_at | TIMESTAMPTZ | | Response timestamp |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

*Note: Triggers automatically update average_rating and total_reviews in users table*

### 11. user_activity_summary (New - Analytics Optimization)
**Aggregated user activity data for dashboard queries**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| user_id | UUID | PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE | User |
| **-- Job statistics --** | | | |
| jobs_posted_total | INTEGER | DEFAULT 0 | Total jobs posted |
| jobs_posted_active | INTEGER | DEFAULT 0 | Currently active jobs |
| jobs_completed_as_client | INTEGER | DEFAULT 0 | Jobs completed as client |
| jobs_completed_as_tasker | INTEGER | DEFAULT 0 | Jobs completed as tasker |
| **-- Application statistics --** | | | |
| applications_sent | INTEGER | DEFAULT 0 | Applications sent |
| applications_received | INTEGER | DEFAULT 0 | Applications received |
| applications_accepted | INTEGER | DEFAULT 0 | Applications accepted |
| **-- Financial statistics --** | | | |
| total_earned | DECIMAL(10, 2) | DEFAULT 0 | Total earnings |
| total_spent | DECIMAL(10, 2) | DEFAULT 0 | Total spending |
| **-- Engagement statistics --** | | | |
| messages_sent | INTEGER | DEFAULT 0 | Messages sent |
| profile_views | INTEGER | DEFAULT 0 | Profile views |
| last_activity_at | TIMESTAMPTZ | DEFAULT NOW() | Last activity |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update |

*Note: Updated via triggers and scheduled jobs*

### 13. file_uploads (New - File Management Optimization)
**Centralized file metadata and lifecycle management**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | File ID |
| uploader_id | UUID | REFERENCES users(id) ON DELETE SET NULL | File uploader |
| original_filename | TEXT | NOT NULL | Original file name |
| stored_filename | TEXT | NOT NULL | Storage filename |
| file_path | TEXT | NOT NULL | Full file path/URL |
| file_type | TEXT | NOT NULL | MIME type |
| file_size | BIGINT | NOT NULL | File size in bytes |
| **-- File categorization --** | | | |
| category | TEXT | NOT NULL | File category (avatar, resume, attachment, etc.) |
| related_table | TEXT | | Related table name |
| related_id | UUID | | Related record ID |
| **-- File lifecycle --** | | | |
| is_temporary | BOOLEAN | DEFAULT true | Temporary upload flag |
| confirmed_at | TIMESTAMPTZ | | When file was confirmed in use |
| expires_at | TIMESTAMPTZ | | Expiration date for cleanup |
| **-- File metadata --** | | | |
| alt_text | TEXT | | Image alt text |
| image_width | INTEGER | | Image width (if applicable) |
| image_height | INTEGER | | Image height (if applicable) |
| download_count | INTEGER | DEFAULT 0 | Download counter |
| **-- Security --** | | | |
| is_public | BOOLEAN | DEFAULT false | Public access flag |
| access_token | TEXT | | Access token for private files |
| virus_scan_status | TEXT | DEFAULT 'pending' | Virus scan result |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Upload timestamp |

### 14. search_analytics (New - Search Performance Optimization)
**Search query analytics and performance tracking**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Search ID |
| user_id | UUID | REFERENCES users(id) ON DELETE SET NULL | Searcher (nullable) |
| session_id | TEXT | | Anonymous session tracking |
| **-- Search query data --** | | | |
| search_query | TEXT | NOT NULL | Search terms used |
| search_type | TEXT | NOT NULL | Search type (jobs, users, categories) |
| filters_applied | JSONB | DEFAULT '{}' | Applied filters |
| **-- Search context --** | | | |
| user_location | TEXT | | User's location context |
| user_role | TEXT | | User's role context |
| results_count | INTEGER | | Number of results returned |
| **-- Performance metrics --** | | | |
| response_time_ms | INTEGER | | Query response time |
| clicked_result_ids | UUID[] | DEFAULT ARRAY[]::UUID[] | Results user clicked |
| clicked_position | INTEGER[] | DEFAULT ARRAY[]::INTEGER[] | Position of clicked results |
| **-- Search outcome --** | | | |
| led_to_application | BOOLEAN | DEFAULT false | Search led to job application |
| led_to_contact | BOOLEAN | DEFAULT false | Search led to contact |
| session_duration_sec | INTEGER | | Time spent on results |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Search timestamp |

### 15. saved_jobs (Enhanced)
**User job bookmarking and interest tracking with better organization**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Saved job ID |
| user_id | UUID | REFERENCES users(id) ON DELETE CASCADE | User who saved |
| job_id | UUID | REFERENCES job_listings(id) ON DELETE CASCADE | Saved job |
| **-- Enhanced tracking --** | | | |
| bookmark_type | TEXT | DEFAULT 'saved' | Type: saved, interested, applied |
| notes | TEXT | | User's private notes |
| reminder_date | DATE | | Optional reminder date |
| **-- Cached job data for quick lists --** | | | |
| job_title | TEXT | | Cached job title |
| job_city | TEXT | | Cached job city |
| job_salary_min | DECIMAL(10,2) | | Cached salary range |
| job_salary_max | DECIMAL(10,2) | | Cached salary range |
| job_status | job_status | | Cached job status |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Save timestamp |

**Unique constraint**: (user_id, job_id, bookmark_type)

### 16. job_search_vectors (New - Full-Text Search Optimization)
**Optimized search vectors for job listings**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| job_id | UUID | PRIMARY KEY REFERENCES job_listings(id) ON DELETE CASCADE | Job reference |
| **-- Search vectors for different languages --** | | | |
| search_vector_bs | TSVECTOR | | Bosnian search vector |
| search_vector_en | TSVECTOR | | English search vector |
| **-- Weighted content for relevance --** | | | |
| title_weight | TSVECTOR | | Title content (highest weight) |
| category_weight | TSVECTOR | | Category content (high weight) |
| description_weight | TSVECTOR | | Description content (medium weight) |
| location_weight | TSVECTOR | | Location content (medium weight) |
| skills_weight | TSVECTOR | | Skills content (low weight) |
| **-- Search optimization --** | | | |
| search_keywords | TEXT[] | DEFAULT ARRAY[]::TEXT[] | Extracted keywords |
| search_popularity | INTEGER | DEFAULT 0 | Search result click count |
| last_indexed_at | TIMESTAMPTZ | DEFAULT NOW() | Last indexing update |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

*Note: Automatically maintained via triggers when job_listings table is updated*

### 17. analytics_events (Enhanced)
**Consolidated event tracking with better performance analysis**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Event ID |
| user_id | UUID | REFERENCES users(id) ON DELETE SET NULL | User (nullable) |
| session_id | TEXT | | Anonymous session tracking |
| event_type | TEXT | NOT NULL | Event type (job_view, profile_view, search, etc.) |
| resource_type | TEXT | | Resource type (job, user, category) |
| resource_id | TEXT | | Resource identifier |
| **-- Context data --** | | | |
| metadata | JSONB | DEFAULT '{}' | Event metadata |
| user_agent | TEXT | | Browser information |
| ip_address | INET | | IP address |
| referrer | TEXT | | Referrer URL |
| **-- Geolocation --** | | | |
| session_id | TEXT | | Anonymous session tracking |
| event_type | TEXT | NOT NULL | Event type (job_view, profile_view, search, etc.) |
| resource_type | TEXT | | Resource type (job, user, category) |
| resource_id | TEXT | | Resource identifier |
| **-- Enhanced context data --** | | | |
| metadata | JSONB | DEFAULT '{}' | Event metadata |
| user_agent | TEXT | | Browser information |
| ip_address | INET | | IP address |
| referrer | TEXT | | Referrer URL |
| page_url | TEXT | | Current page URL |
| **-- Performance tracking --** | | | |
| page_load_time | INTEGER | | Page load time in ms |
| time_on_page | INTEGER | | Time spent on page in seconds |
| scroll_depth | INTEGER | | Scroll depth percentage |
| **-- Conversion tracking --** | | | |
| conversion_funnel_step | TEXT | | Funnel step identifier |
| led_to_conversion | BOOLEAN | DEFAULT false | Event led to conversion |
| conversion_value | DECIMAL(10,2) | | Conversion value (if applicable) |
| **-- Geolocation --** | | | |
| city_id | TEXT | | User's city context |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Event timestamp |

*Note: Replaces job_views table and adds comprehensive web analytics*

---

## Additional Performance Optimizations

### Table Partitioning Strategy
```sql
-- Partition analytics_events by month for better performance
CREATE TABLE analytics_events (
  -- columns as defined above
) PARTITION BY RANGE (created_at);

-- Create monthly partitions
CREATE TABLE analytics_events_2025_07 PARTITION OF analytics_events
FOR VALUES FROM ('2025-07-01') TO ('2025-08-01');

-- Partition search_analytics by month  
CREATE TABLE search_analytics (
  -- columns as defined above  
) PARTITION BY RANGE (created_at);
```

### Materialized Views for Heavy Queries
```sql
-- Popular jobs materialized view (refreshed hourly)
CREATE MATERIALIZED VIEW popular_jobs AS
SELECT 
  j.*,
  COUNT(ae.id) as total_views,
  COUNT(a.id) as total_applications
FROM job_listings j
LEFT JOIN analytics_events ae ON ae.resource_id = j.id::TEXT 
  AND ae.event_type = 'job_view'
  AND ae.created_at > NOW() - INTERVAL '7 days'
LEFT JOIN applications a ON a.job_id = j.id
WHERE j.is_active = true
GROUP BY j.id
ORDER BY total_views DESC, total_applications DESC;

-- User activity summary materialized view (refreshed daily)
CREATE MATERIALIZED VIEW user_stats_summary AS
SELECT 
  u.id,
  u.name,
  u.average_rating,
  uas.jobs_posted_total,
  uas.total_earned,
  COUNT(DISTINCT r.id) as reviews_given,
  MAX(ae.created_at) as last_activity
FROM users u
LEFT JOIN user_activity_summary uas ON uas.user_id = u.id
LEFT JOIN reviews r ON r.reviewer_id = u.id
LEFT JOIN analytics_events ae ON ae.user_id = u.id
GROUP BY u.id, u.name, u.average_rating, uas.jobs_posted_total, uas.total_earned;
```

---

## Removed/Consolidated Tables

### Tables Eliminated in Optimization:
- **user_privacy_settings** → Merged into `users` table
- **conversation_participants** → Embedded in `conversations` table as arrays
- **job_views** → Consolidated into `analytics_events` table

### New Tables Added for Optimization:
- **file_uploads** → Centralized file management with metadata and lifecycle tracking
- **search_analytics** → Search performance tracking and query optimization
- **job_search_vectors** → Full-text search optimization with multi-language support

### Tables Enhanced with Significant Changes:
- **applications** → Added cached applicant and job data for faster list loading
- **analytics_events** → Enhanced with conversion tracking, performance metrics, and funnel analysis
- **saved_jobs** → Better organization with bookmark types and cached job data

### Tables Kept with Minimal Changes:
- **job_assignments** - Contract tracking, kept as-is
- **stripe_transactions** - Payment records, no optimization needed
- **connection_history** - Audit trail, kept for compliance
- **pending_registrations** - Temporary table, kept as-is
- **account_deletion_requests** - Admin functionality, kept as-is

---

## Performance Impact Summary (Updated)

### Database Call Reductions:

### Database Call Reductions:

#### Before Optimization:
```sql
-- Load job list with stats (5 queries)
SELECT * FROM job_listings WHERE city_id = '1';
SELECT COUNT(*) FROM applications WHERE job_id IN (...);
SELECT COUNT(*) FROM job_views WHERE job_id IN (...);
SELECT name, rating FROM users WHERE id IN (...);
SELECT name FROM cities WHERE id = '1';
```

#### After Optimization:
```sql
-- Load job list with stats (1 query)
SELECT *, poster_name, poster_rating, application_count, view_count 
FROM job_listings WHERE city_id = '1';
```

#### Before Optimization:
```sql
-- Load user profile (3 queries)
SELECT * FROM users WHERE id = ?;
SELECT * FROM user_privacy_settings WHERE user_id = ?;
SELECT AVG(rating) FROM reviews WHERE reviewee_id = ?;
```

#### After Optimization:
```sql
-- Load user profile (1 query)
SELECT * FROM users WHERE id = ?;
-- (includes privacy settings and cached rating)
```

#### Before Optimization:
```sql
-- Load conversation (3 queries)
SELECT * FROM conversations WHERE id = ?;
SELECT * FROM conversation_participants WHERE conversation_id = ?;
SELECT name, avatar_url FROM users WHERE id IN (...);
```

#### After Optimization:
```sql
-- Load conversation (1 query)
SELECT * FROM conversations WHERE id = ?;
-- (includes participant_names and participant_avatars)
```

#### Before Optimization:
```sql
-- Load application list (4 queries)
SELECT * FROM applications WHERE job_id = ?;
SELECT name, avatar_url, location FROM users WHERE id IN (...);
SELECT title, city_id FROM job_listings WHERE id IN (...);
SELECT AVG(rating) FROM reviews WHERE reviewee_id IN (...);
```

#### After Optimization:
```sql
-- Load application list (1 query)
SELECT *, applicant_name, applicant_avatar, applicant_rating, 
       job_title, job_city FROM applications WHERE job_id = ?;
```

#### Before Optimization:
```sql
-- Search jobs with analytics (5+ queries)
SELECT * FROM job_listings WHERE description ILIKE '%keyword%';
INSERT INTO job_views (job_id, user_id, ...) VALUES (...);
SELECT COUNT(*) FROM applications WHERE job_id IN (...);
SELECT name FROM users WHERE id IN (...);
SELECT name FROM categories WHERE id IN (...);
```

#### After Optimization:
```sql
-- Search jobs with analytics (2 queries)
SELECT j.*, jv.search_vector_bs FROM job_listings j 
JOIN job_search_vectors jv ON jv.job_id = j.id 
WHERE jv.search_vector_bs @@ to_tsquery('keyword');
INSERT INTO analytics_events (...) VALUES (...);
```

### Expected Performance Improvements (Updated):
- **Job listing pages**: 70-80% fewer queries
- **User profiles**: 66% fewer queries  
- **Messaging system**: 66% fewer queries
- **Dashboard analytics**: 90% fewer queries (using user_activity_summary)
- **Search results**: 75% fewer queries (cached data + search vectors)
- **Application lists**: 75% fewer queries (cached applicant/job data)
- **File operations**: 85% fewer queries (centralized file_uploads table)

### Additional Performance Benefits:
- **Full-text search**: 90% faster with pre-computed search vectors
- **Analytics queries**: 95% faster with partitioned tables
- **Popular content**: Near-instant with materialized views
- **File management**: Automated cleanup and optimized storage
- **Search analytics**: Real-time insights without impacting core queries

### Trade-offs (Updated):
- **Increased storage**: ~20-25% more storage due to cached/denormalized data
- **Write complexity**: More triggers needed to maintain cached data consistency
- **Data consistency**: Risk of cached data becoming stale (mitigated by comprehensive triggers)
- **Maintenance overhead**: Materialized views need periodic refresh
- **Initial migration**: Complex migration required to implement all optimizations

## Payment & Connection System (Unchanged)

### 18. stripe_transactions
**Payment transaction tracking**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Transaction ID |
| user_id | UUID | REFERENCES users(id) ON DELETE CASCADE | Transaction user |
| stripe_payment_intent_id | TEXT | UNIQUE | Stripe payment intent |
| amount | DECIMAL(10, 2) | NOT NULL | Transaction amount |
| currency | TEXT | DEFAULT 'BAM' | Currency code |
| connections_purchased | INTEGER | NOT NULL | Connections bought |
| status | TEXT | NOT NULL | Transaction status |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

### 19. connection_history
**Connection point tracking and audit**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | History ID |
| user_id | UUID | REFERENCES users(id) ON DELETE CASCADE | User |
| action | connection_action | NOT NULL | Action type |
| connections_before | INTEGER | NOT NULL | Balance before |
| connections_after | INTEGER | NOT NULL | Balance after |
| amount_changed | INTEGER | NOT NULL | Change amount |
| reason | TEXT | | Change reason |
| job_id | UUID | REFERENCES job_listings(id) | Related job |
| admin_id | UUID | REFERENCES users(id) | Admin who made change |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

--- 

## Required Database Triggers for Optimization (Enhanced)

### 1. User Rating Aggregation
```sql
-- Update user average_rating when review is added/updated/deleted
CREATE OR REPLACE FUNCTION update_user_rating() RETURNS TRIGGER AS $$
BEGIN
  UPDATE users SET 
    average_rating = (SELECT AVG(rating) FROM reviews WHERE reviewee_id = NEW.reviewee_id),
    total_reviews = (SELECT COUNT(*) FROM reviews WHERE reviewee_id = NEW.reviewee_id)
  WHERE id = NEW.reviewee_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### 2. Job Statistics Updates
```sql
-- Update job application_count when application is added/removed
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
```

### 3. Application Cached Data Updates
```sql
-- Update cached applicant data when user profile changes
CREATE OR REPLACE FUNCTION update_application_cache() RETURNS TRIGGER AS $$
BEGIN
  UPDATE applications SET 
    applicant_name = NEW.name,
    applicant_avatar = NEW.avatar_url,
    applicant_rating = NEW.average_rating,
    applicant_location = NEW.location
  WHERE user_id = NEW.id;
  
  -- Also update cached job data when job changes
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
```

### 4. Search Vector Maintenance
```sql
-- Update search vectors when job is created/updated
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
```

### 5. File Upload Lifecycle Management
```sql
-- Cleanup temporary files and manage file lifecycle
CREATE OR REPLACE FUNCTION manage_file_lifecycle() RETURNS TRIGGER AS $$
BEGIN
  -- Mark file as confirmed when referenced
  UPDATE file_uploads SET 
    is_temporary = false,
    confirmed_at = NOW(),
    expires_at = NULL
  WHERE file_path = NEW.avatar_url OR file_path = NEW.resume_url;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### 6. Enhanced Conversation Updates
```sql
-- Update conversation last_message data when message is added
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
```

### 4. Analytics Event Processing
```sql
### 6. Enhanced Conversation Updates
```sql
-- Update conversation last_message data when message is added
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
```

### 7. Enhanced Analytics Event Processing
```sql
-- Update view_count and process analytics events
CREATE OR REPLACE FUNCTION process_analytics_event() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.event_type = 'job_view' AND NEW.resource_type = 'job' THEN
    UPDATE job_listings SET 
      view_count = view_count + 1,
      last_viewed_at = NEW.created_at
    WHERE id = NEW.resource_id::UUID;
    
    -- Update search vectors popularity
    UPDATE job_search_vectors SET 
      search_popularity = search_popularity + 1
    WHERE job_id = NEW.resource_id::UUID;
  END IF;
  
  -- Update user activity summary
  IF NEW.user_id IS NOT NULL THEN
    INSERT INTO user_activity_summary (user_id, last_activity_at)
    VALUES (NEW.user_id, NEW.created_at)
    ON CONFLICT (user_id) DO UPDATE SET
      last_activity_at = NEW.created_at;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## Database Indexes (Enhanced)
```

---

## Privacy & Security

### 16. user_privacy_settings
**User privacy preferences**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Settings ID |
| user_id | UUID | REFERENCES users(id) ON DELETE CASCADE UNIQUE | Settings owner |
| profile_visibility | TEXT | DEFAULT 'public' | Profile visibility level |
| show_email | BOOLEAN | DEFAULT false | Email visibility |
| show_phone | BOOLEAN | DEFAULT false | Phone visibility |
| allow_messages | BOOLEAN | DEFAULT true | Message permissions |
| show_reviews | BOOLEAN | DEFAULT true | Review visibility |
| show_completed_jobs | BOOLEAN | DEFAULT true | Job history visibility |
| email_notifications | BOOLEAN | DEFAULT true | Email notification preference |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

---

## Registration & Account Management

### 17. pending_registrations
**Email verification for new registrations**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Registration ID |
| email | TEXT | UNIQUE NOT NULL | Registration email |
| hashed_password | TEXT | NOT NULL | Hashed password |
| verification_code | TEXT | NOT NULL | Email verification code |
| verification_expires | TIMESTAMPTZ | NOT NULL | Code expiration |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

### 18. account_deletion_requests
**Account deletion request tracking**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Request ID |
| user_id | UUID | REFERENCES users(id) ON DELETE CASCADE | User requesting deletion |
| reason | TEXT | | Deletion reason |
| requested_at | TIMESTAMPTZ | DEFAULT NOW() | Request timestamp |
| processed_at | TIMESTAMPTZ | | Processing timestamp |
| processed_by_id | UUID | REFERENCES users(id) | Admin who processed |

---

## Database Functions & Triggers

### Auth Integration
- **handle_new_user()**: Automatically creates user profile when Supabase auth user is created
- **on_auth_user_created**: Trigger that executes handle_new_user() on auth.users INSERT

### Business Logic Functions
- **calculate_job_similarity()**: AI-powered job matching algorithm
- **get_user_analytics()**: User performance metrics
- **get_job_analytics()**: Job posting analytics
- **send_notification()**: Notification dispatch system
- **manage_user_connections()**: Connection point management
- **calculate_platform_fee()**: Fee calculation for transactions

### Automated Tasks
- **refresh_user_connections()**: Monthly connection refresh
- **cleanup_expired_jobs()**: Remove expired job postings
- **send_reminder_notifications()**: Automated reminder system

---

## Database Indexes

## Database Indexes (Enhanced)

### Performance Indexes
```sql
-- User indexes
idx_users_email, idx_users_role, idx_users_location
idx_users_average_rating, idx_users_last_active_at

-- Job listings indexes  
idx_job_listings_status, idx_job_listings_city, idx_job_listings_category
idx_job_listings_posted_by, idx_job_listings_created_at
idx_job_listings_active (WHERE is_active = true)
idx_job_listings_application_url (WHERE application_url IS NOT NULL)
idx_job_listings_composite (city_id, category_id, is_active, created_at)

-- Applications indexes (enhanced)
idx_applications_job_id, idx_applications_user_id, idx_applications_status
idx_applications_composite (job_id, status, applied_at)
idx_applications_cached_data (applicant_name, applicant_rating)

-- Messages indexes
idx_messages_conversation_id, idx_messages_created_at
idx_messages_sender (sender_id, created_at)

-- Notifications indexes
idx_notifications_user_id, idx_notifications_is_read
idx_notifications_composite (user_id, is_read, created_at)
idx_notifications_batch_id

-- Search optimization indexes
idx_job_search_vectors_bs USING GIN (search_vector_bs)
idx_job_search_vectors_en USING GIN (search_vector_en)
idx_job_search_vectors_popularity (search_popularity DESC)

-- Analytics indexes (with partitioning support)
idx_analytics_events_type_resource (event_type, resource_type, created_at)
idx_analytics_events_user_time (user_id, created_at)
idx_analytics_events_conversion (led_to_conversion, conversion_value)

-- File management indexes  
idx_file_uploads_category (category, is_temporary)
idx_file_uploads_lifecycle (expires_at, is_temporary)
idx_file_uploads_uploader (uploader_id, created_at)

-- Search analytics indexes
idx_search_analytics_query (search_query, created_at)
idx_search_analytics_performance (response_time_ms, results_count)
idx_search_analytics_user (user_id, created_at)
```

*Note: No indexes needed for cities/categories as they're served from static JSON files*

---

## Row Level Security (RLS) Policies

### Security Model
All tables have RLS enabled with comprehensive policies:

- **users**: Users can manage own profile, public read for basic info, admin full access
- **job_listings**: Public read, poster management, admin oversight
- **applications**: User can manage own applications, job poster can view
- **conversations/messages**: Participants only access
- **notifications**: User can view own notifications
- **reviews**: Public read, reviewer can manage own
- **privacy settings**: User manages own settings
- **financial data**: User access to own data, admin oversight

*Note: Cities and categories are served from static JSON files and don't require database security policies*

---

## Current Database Status

### Seeded Data
- **Cities**: Provided via `/public/static/cities.json` with 95+ cities in Bosnia and Herzegovina
- **Categories**: Provided via `/public/static/categories.json` with 13 main categories and hierarchical subcategories
- **Core categories include**: Handyman work, Cleaning, Creative/Design, IT Development, Delivery/Transport, Education, Events, Healthcare, Sales/Marketing

*Note: Cities and categories are not stored in database tables but served from static JSON files for improved performance*

### Recent Changes (July 26, 2025)
- Added `application_url` column to job_listings
- Implemented comprehensive city and category seeding
- Enhanced RLS policies for better security
- Added performance indexes for key operations

### Key Features
- **Multi-language support** (Bosnian/English)
- **Geographic-based job matching**
- **Hierarchical category system**
- **Real-time messaging**
- **Payment integration with Stripe**
- **Connection-based job application system**
- **Comprehensive analytics tracking**
- **Advanced security with RLS**

---

## API Integration Notes

### Frontend Integration Architecture
- **Static Data Approach**: Cities and categories served from JSON files instead of database queries
- **Performance Benefits**: No database round-trips for location/category lookups
- **Job Creation**: Frontend sends integer IDs (0,1,2,3) which reference static JSON entries
- **Contact Info**: Database stores contact_info as JSON, not individual columns
- **Field Mapping**: API routes handle field conversion (type→job_type, salaryType→salary_type)

### Current API Route Pattern
```
Frontend (JSON file integer IDs) → API Route (direct storage) → Database (TEXT fields)
```

This simplified architecture removes UUID complexity while maintaining data integrity and improving performance.

---

## Implementation Roadmap

### Phase 1: Foundation Optimizations (Week 1-2)
**Priority: High - Immediate Performance Gains**

1. **Users Table Enhancement**
   - Add privacy settings columns to users table
   - Add rating aggregation columns (average_rating, total_reviews)
   - Create triggers for automatic rating updates
   - Migrate data from user_privacy_settings table

2. **Basic Caching Implementation**
   - Add application_count and view_count to job_listings
   - Create basic update triggers for job statistics
   - Add composite indexes for common query patterns

3. **Search Vector Setup**
   - Create job_search_vectors table
   - Implement basic full-text search with tsvector
   - Add GIN indexes for search performance

### Phase 2: Messaging & Communication (Week 3-4)
**Priority: Medium - User Experience Improvements**

1. **Conversation Optimization**
   - Add participant arrays to conversations table
   - Implement cached participant data
   - Create message stats columns (message_count, last_message_at)
   - Migrate conversation_participants data

2. **Enhanced Notifications**
   - Add batching support to notifications table
   - Implement priority system and delivery tracking
   - Add notification analytics columns

### Phase 3: Advanced Analytics (Week 5-6)
**Priority: Medium - Business Intelligence**

1. **Analytics Events Enhancement**
   - Replace job_views with comprehensive analytics_events
   - Add conversion tracking and performance metrics
   - Implement table partitioning by month
   - Create search_analytics table for query optimization

2. **User Activity Summaries**
   - Create user_activity_summary table
   - Implement scheduled jobs for data aggregation
   - Add materialized views for popular content

### Phase 4: File Management & Advanced Features (Week 7-8)
**Priority: Low - Infrastructure Improvements**

1. **File Upload Optimization**
   - Create file_uploads table with metadata
   - Implement file lifecycle management
   - Add automated cleanup procedures
   - Migrate existing file references

2. **Application Enhancement**
   - Add cached applicant and job data to applications
   - Implement response time tracking
   - Add application analytics

### Phase 5: Performance Optimization (Week 9-10)
**Priority: Low - Fine-tuning**

1. **Materialized Views**
   - Create popular_jobs materialized view
   - Implement user_stats_summary view
   - Set up automated refresh schedules

2. **Advanced Indexing**
   - Add composite indexes for complex queries
   - Optimize search vector indexes
   - Fine-tune query performance

### Migration Strategy

#### Data Migration Approach:
1. **Additive Changes First**: Add new columns without removing old ones
2. **Parallel Updates**: Run both old and new systems temporarily
3. **Gradual Migration**: Move data in batches during low-traffic periods
4. **Rollback Plan**: Keep old tables until migration is verified successful

#### Zero-Downtime Migration Steps:
```sql
-- Example: User privacy settings migration
-- Step 1: Add columns to users table
ALTER TABLE users ADD COLUMN profile_visibility TEXT DEFAULT 'public';
-- ... add other privacy columns

-- Step 2: Copy data from old table
UPDATE users SET 
  profile_visibility = ups.profile_visibility,
  show_email = ups.show_email
FROM user_privacy_settings ups 
WHERE users.id = ups.user_id;

-- Step 3: Verify data integrity
-- Step 4: Update application to use new columns
-- Step 5: Drop old table (after verification period)
```

### Performance Testing Plan

#### Before Implementation:
- Benchmark current query performance
- Measure average response times for key operations
- Document current database size and query patterns

#### After Each Phase:
- Compare query performance improvements
- Measure reduction in database calls
- Monitor storage growth from denormalization
- Validate data consistency with triggers

#### Success Metrics:
- **75%+ reduction** in database queries for job listings
- **60%+ reduction** in database queries for user profiles  
- **90%+ improvement** in search performance
- **Zero data inconsistencies** in cached data

### Risk Mitigation

#### Potential Risks:
1. **Data Inconsistency**: Cached data becoming stale
2. **Storage Growth**: Significant increase in database size
3. **Migration Complexity**: Complex data migration procedures
4. **Performance Impact**: Triggers slowing down write operations

#### Mitigation Strategies:
1. **Comprehensive Testing**: Full test suite for all triggers
2. **Monitoring**: Real-time monitoring of data consistency
3. **Rollback Plans**: Ability to revert each optimization phase
4. **Gradual Rollout**: Implement changes in non-critical areas first

---
