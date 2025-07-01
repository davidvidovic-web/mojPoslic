# User Role Migration Guide

This guide outlines the steps to migrate the user roles in the database from 'employer'/'employee' to 'client'/'tasker'.

## Prerequisites

- Access to the PostgreSQL database
- Admin permissions to run SQL queries

## Migration Steps

### 1. Run the Enum Migration in Database Console

1. Log in to your PostgreSQL database
2. Navigate to the SQL console/terminal
3. Copy the contents of `database/migrate-enum-values.sql`
4. Paste it into the SQL console and execute the query

This will:
- Create a new enum type with the updated values
- Add a temporary column with the new enum type
- Migrate data from old roles to new roles
- Replace the old column with the new one
- Update the enum type in the database

### 2. Verify the Migration

1. Run the check script to verify the migration:

```bash
npx tsx scripts/check-user-roles.ts
```

This will confirm if the database schema has been updated correctly.

### 3. Update Data References

1. Run the data reference update script:

```bash
npx tsx scripts/update-role-references.ts
```

This will update any references to the old roles in your data (like transportation_responsibility in job_listings).

### 4. Update Prisma Schema (if needed)

The Prisma schema should already be updated to use the new role names. If it isn't, update the UserRole enum in `prisma/schema.prisma` to match:

```prisma
enum UserRole {
  admin
  client
  tasker
  company
}
```

### 5. Regenerate Prisma Client

After confirming the database migration is successful, regenerate the Prisma client:

```bash
npx prisma generate
```

### 6. Restart the Development Server

```bash
npm run dev
```

## Troubleshooting

- If you encounter permission errors when running SQL, make sure you're using an account with admin privileges.
- If the enum values don't match between Prisma and the database, you may need to manually update the Prisma schema and regenerate the client.
- If application code still expects the old enum values, check that all code has been properly updated to use 'client' and 'tasker' instead of 'employer' and 'employee'.
