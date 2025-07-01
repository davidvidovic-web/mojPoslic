# Database Folder

This folder contains database migration scripts for the Poslić application.

## 📁 Files

### `comprehensive-migration.sql`
**Purpose**: Complete database migration script for updating the Prisma schema.

**Contains**:
- **Role Migration**: Updates user roles from `employer`/`employee` to `client`/`tasker`
- **Transportation Updates**: Updates transportation field terminology
- **Connections System**: Ensures connections fields are properly set up
- **Data Cleanup**: Removes invalid or orphaned data
- **Verification Queries**: Checks that migrations completed successfully

**Usage**:
```bash
# Execute via PostgreSQL client
psql your_database_url -f database/comprehensive-migration.sql

# Or via database management tool like pgAdmin, DBeaver, etc.
```

**Safety**: This script uses `DO $$ ... END $$` blocks and checks for existing columns/types before making changes, making it safe to run multiple times.

## 🗑️ Cleaned Up

The following obsolete files have been removed:
- All Supabase-specific authentication files (25+ files)
- Individual migration files (consolidated into comprehensive-migration.sql)
- Old seed data files (replaced by Prisma seeding scripts)
- Duplicate connection system setup files

## 🎯 Current Status

- ✅ **Consolidated**: All necessary migrations in one file
- ✅ **Prisma-focused**: Only Prisma-compatible SQL remains
- ✅ **Safe execution**: Idempotent operations with proper checks
- ✅ **Clean structure**: Single source of truth for database changes

## 📝 Notes

- All seeding is now handled by TypeScript scripts in `/scripts/` folder
- Database schema is managed through Prisma migrations (`prisma/migrations/`)
- This SQL file is for manual database updates when needed
