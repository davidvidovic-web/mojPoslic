# Database Seeding Scripts

This directory contains comprehensive seeding scripts for the job posting platform. All scripts include support for the enhanced transportation feature with four options and compensation amounts.

## Main Seed Script

### `seed-all.ts` - Master Seeding Script

The main seeding script that orchestrates all seeding operations in the correct order.

#### Usage

```bash
# Complete seeding (recommended for fresh setup)
npx tsx scripts/seed-all.ts

# Alternative: explicitly specify 'all'
npx tsx scripts/seed-all.ts all

# Basic data only (cities + categories)
npx tsx scripts/seed-all.ts basic

# Development data (cities + categories + users + many jobs for pagination testing)
npx tsx scripts/seed-all.ts dev
```

#### What it seeds

**Complete seeding (`all`):**
1. **Cities** - 88+ Bosnian cities including major cities and remote option
2. **Categories** - Job categories with hierarchical structure
3. **Users** - All user types except admin:
   - 15 Employers (individual employers)
   - 5 Companies (business accounts)
   - 20 Job seekers (employees)
4. **Jobs** - 20 sample jobs with transportation fields

**Basic seeding (`basic`):**
- Cities and categories only

**Development seeding (`dev`):**
- Basic data + users + 50 jobs for pagination testing

## Individual Seed Scripts

### Core Scripts

- **`seed-cities.ts`** - Seeds 88+ Bosnian cities
- **`seed-categories.ts`** - Seeds job categories with hierarchical structure
- **`seed-users.ts`** - Creates users for all roles except admin
- **`seed-jobs-simple.ts`** - Creates 20 sample jobs with transportation data
- **`seed-jobs.ts`** - Alternative job seeding with more detailed data
- **`seed-many-jobs.ts`** - Creates 50+ jobs for pagination testing

### Utility Scripts

- **`seed-basic-data.ts`** - Simple cities and categories seeding
- **`test-job-edit.ts`** - Test script for job editing functionality
- **`update-job-statuses.ts`** - Utility for updating job statuses

## Transportation Feature

All job seeding scripts now include the enhanced transportation feature with four options:

1. **`provided`** - Company provides transportation
2. **`not_provided`** - No transportation provided (default)
3. **`employee_responsible`** - Employee handles own transportation
4. **`compensated`** - Company pays for transportation (with amount 50-500 BAM)

### Transportation Distribution

Jobs are randomly assigned transportation options with realistic distribution:
- ~25% each for provided, not_provided, employee_responsible
- ~25% compensated with random amounts between 50-500 BAM

## User Types Created

The seeding creates comprehensive test accounts:

### Employers (16 accounts)
Individual employers representing various companies:
- Email: `marko@techcorp.ba` (password: `password123`)
- Email: `ana@webdev.ba` (password: `password123`)
- And 13 more...

### Companies (5 accounts)
Business accounts for larger organizations:
- Email: `info@bihtech.ba` (password: `password123`)
- Email: `contact@sarajevodigital.ba` (password: `password123`)
- And 3 more...

### Job Seekers (20 accounts)
Employee accounts for testing job applications:
- Email: `petar.markovic@gmail.com` (password: `password123`)
- Email: `milena.stanic@outlook.com` (password: `password123`)
- And 18 more...

### Admin Accounts
❌ **No admin accounts are created by seeding scripts**  
Admin accounts should be created manually for security reasons.

## Database Summary After Complete Seeding

- **👥 Users**: 41 total (16 employers + 5 companies + 20 job seekers + 0 admins)
- **💼 Jobs**: 20-25 total with transportation data
- **📍 Cities**: 88+ Bosnian cities
- **🏷️ Categories**: Comprehensive job categories
- **🚗 Transportation**: All jobs have transportation fields populated

## Prerequisites

1. Database connection configured in `.env`
2. Prisma schema migrated: `npx prisma migrate dev`
3. Dependencies installed: `npm install`

## Recommended Seeding Order

For new projects, run in this order:

```bash
# 1. Run migrations first
npx prisma migrate dev

# 2. Complete seeding
npx tsx scripts/seed-all.ts

# 3. Create admin account manually (recommended)
npx tsx scripts/create-admin.ts
```

## Notes

- All seeding scripts check for existing data and skip duplicates
- Transportation fields are required and have default values
- User passwords are hashed with bcrypt (default: `password123`)
- All scripts use TypeScript with tsx for execution
- Scripts include comprehensive error handling and progress reporting

## Troubleshooting

### Common Issues

1. **Prisma Client out of date**: Run `npx prisma generate`
2. **Migration needed**: Run `npx prisma migrate dev`
3. **Connection issues**: Check `.env` database configuration
4. **Unique constraint errors**: Scripts handle existing data gracefully

### Resetting Data

To start fresh:

```bash
# Reset database (caution: deletes all data)
npx prisma migrate reset

# Run complete seeding
npx tsx scripts/seed-all.ts
```
