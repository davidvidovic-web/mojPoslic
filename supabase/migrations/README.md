# Supabase Messaging System Setup

This directory contains the comprehensive migration for setting up the messaging system in your Supabase database.

## 🎯 **What This Solves**

The errors you were experiencing:
- `Failed to load messages: 500`
- `message.createdAt is undefined`
- Foreign key relationship errors between messaging tables and users
- CUID vs UUID format mismatches

## 📁 **Migration Files**

### Core Migrations (001-009)
- `001_create_messaging_tables.sql` - Initial messaging tables
- `002_create_rls_policies.sql` - Row Level Security policies
- `003_create_storage_setup.sql` - File attachment storage setup
- `004_fix_rls_infinite_recursion.sql` - RLS recursion fixes
- `005_comprehensive_rls_fix.sql` - Comprehensive RLS improvements
- `006_complete_messaging_rebuild.sql` - Complete table rebuild
- `007_nextauth_rls_integration.sql` - NextAuth integration
- `008_jwt_nextauth_integration.sql` - JWT integration fixes
- **`009_final_comprehensive_messaging_migration.sql`** - **THE SINGLE MIGRATION TO USE** ⭐

### Setup Files
- `setup-supabase-messaging.sh` - Automated setup script
- `README.md` - This documentation

## 🚀 **Quick Setup**

### Option 1: Use Only the Final Migration (Recommended) ⭐
```bash
# Apply only the comprehensive migration
./setup-supabase-messaging.sh
```

### Option 2: Manual Setup
1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Navigate to **SQL Editor**
3. Copy and paste the entire contents of `009_final_comprehensive_messaging_migration.sql`
4. Click **Run** to execute the migration

## ⚠️ **Important Notes**

- **Use ONLY `009_final_comprehensive_messaging_migration.sql`** - it replaces all previous migrations
- The other migrations (001-008) are kept for reference but are **NOT needed**
- The final migration includes all fixes and improvements from previous iterations
- It handles CUID format user IDs correctly

## 🔧 **What the Final Migration Does**

1. **Cleanup**: Removes all existing messaging tables, policies, and functions
2. **Tables**: Creates messaging tables with proper CUID format:
   - `conversations` - Stores conversation metadata
   - `conversation_participants` - Tracks who's in each conversation
   - `messages` - Stores actual messages with attachments
   - `message_status` - Tracks read/delivery status
3. **Security**: Sets up Row Level Security policies
4. **Storage**: Creates file attachment bucket with proper permissions
5. **Performance**: Adds optimized database indexes
6. **Functions**: Creates helper functions for security checks

## 🎯 **Schema Compatibility**

The migration is designed to work with your existing:
- **User model**: Uses CUID format (`cmdglln4300015c0yqeimwhst`)
- **JobListing model**: References job IDs in CUID format
- **Next.js app**: Compatible with your API routes and hooks
- **TypeScript interfaces**: Matches your Message and Conversation types

## 🧪 **Testing After Setup**

After running the migration, test these features:
1. ✅ Creating job conversations from application cards
2. ✅ Sending messages in conversations
3. ✅ Viewing conversation lists
4. ✅ File attachments (if implemented)

## 🐛 **Troubleshooting**

If you still see errors after the migration:

1. **Check browser console** for specific error messages
2. **Verify Supabase connection** in your app's environment variables
3. **Confirm migration applied** by checking tables in Supabase dashboard
4. **Test with simple queries** in Supabase SQL editor

## ✅ **Success Indicators**

After successful migration, you should see:
- No more 500 errors when loading messages
- No more "undefined createdAt" errors  
- Conversation creation works properly
- Message sending/receiving functions correctly
- File attachments work (if implemented)

## 🆘 **Still Having Issues?**

If problems persist after migration:
1. Check your `.env` file for correct Supabase credentials
2. Verify your Supabase project has the messaging tables
3. Test the API endpoints directly in your browser
4. Look for any remaining CUID vs UUID format issues in your code
