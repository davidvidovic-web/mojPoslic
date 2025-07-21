# Messaging System Setup Guide

## Overview
The messaging system uses Supabase for real-time communication between clients and taskers when applications are shortlisted.

## Prerequisites
1. Supabase project created
2. Environment variables set in `.env.development` or `.env.local`

## Environment Variables
Add these to your `.env.development` file:

```bash
# Supabase Configuration for Messaging System
NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

## Database Setup
The messaging system requires several tables in Supabase. Run the migrations in this order:

1. **Create messaging tables**: `supabase/migrations/001_create_messaging_tables.sql`
2. **Set up RLS policies**: `supabase/migrations/002_setup_rls_policies.sql`
3. **Create helper functions**: `supabase/migrations/003_create_helper_functions.sql`
4. **Fix RLS recursion**: `supabase/migrations/004_fix_rls_infinite_recursion.sql`
5. **Fix user ID types**: `supabase/migrations/FIX_USER_ID_TYPES.sql`

### Quick Setup with Supabase CLI
```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Run all migrations
supabase db push
```

### Manual Setup (if CLI not available)
1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Run each migration file in order
4. Verify tables are created: `conversations`, `conversation_participants`, `messages`, `message_status`, `typing_users`, `user_presence`

## Testing the Setup
1. Start your development server: `npm run dev`
2. Visit: `http://localhost:3000/api/test-supabase`
3. Should return `{"success": true, "message": "Supabase connection working"}`

## Troubleshooting

### Common Issues:

1. **"relation does not exist" error**
   - Tables haven't been created
   - Run the migration files in order

2. **"JWT expired" or authentication errors**
   - Check your Supabase keys are correct
   - Verify project URL matches your Supabase project

3. **RLS policy errors**
   - Run the RLS migration files
   - Check that user IDs match between your main database and Supabase

4. **Messaging not working after shortlisting**
   - Check console for error messages
   - Verify all migration files have been run
   - Test the `/api/test-supabase` endpoint

### Graceful Degradation
If Supabase is not set up, the messaging system will fail gracefully:
- Shortlisting will still work
- No conversations will be created
- Error messages will be logged to console
- Users will not receive real-time messaging features

## Features Requiring Messaging System
- Automatic conversation creation when applications are shortlisted
- Real-time messaging between clients and taskers
- Message notifications
- Typing indicators
- Online/offline status

## Production Deployment
Ensure these environment variables are set in your production environment:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (for server-side operations)
