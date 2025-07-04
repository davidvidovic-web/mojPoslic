# Admin Dashboard API Fixes

## Overview
This document describes the fixes applied to the admin dashboard API endpoints to resolve data loading errors and implement the connections management system.

## Issues Fixed

### 1. Categories API (`/api/admin/categories`)
**Problem**: Field mapping mismatch between Prisma schema and API response
- API was trying to access `category.name_en` and `category.name_bs`
- Prisma schema uses `nameEN` and `nameBS` (mapped from database fields)

**Solution**:
```typescript
// Fixed field mapping in response transformation
const formattedCategories = categories.map((category: any) => ({
  id: category.id,
  key: category.key,
  nameEN: category.nameEN,  // Was: category.name_en
  nameBS: category.nameBS,  // Was: category.name_bs
  isPopular: category.isPopular,
  sortOrder: category.sortOrder,
  isActive: category.isActive,
  createdAt: category.createdAt.toISOString()
}))
```

### 2. Cities API (`/api/admin/cities`)
**Problem**: File corruption and incorrect field mapping
- Import statements were corrupted
- Field mapping issues similar to categories

**Solution**:
- Recreated the entire file with correct structure
- Fixed field mapping to use `nameEN`/`nameBS`
- Added proper TypeScript error handling

### 3. Stats API (`/api/admin/stats`)
**Problem**: Incorrect Prisma model reference
- Using `prisma.job` instead of `prisma.jobListing`
- Database table is `job_listings`, Prisma model is `jobListing`

**Solution**:
```typescript
// Fixed Prisma model references
const totalJobs = await prisma.jobListing.count()
const activeJobs = await prisma.jobListing.count({
  where: { isActive: true }
})
const featuredJobs = await prisma.jobListing.count({
  where: { isFeatured: true }
})
```

### 4. Job Types API (`/api/admin/types`)
**Problem**: Incorrect Prisma model reference
- Using `prisma.job.groupBy()` instead of `prisma.jobListing.groupBy()`

**Solution**:
```typescript
// Fixed Prisma model reference
const jobTypeStats = await prisma.jobListing.groupBy({
  by: ['type'],
  _count: {
    type: true
  }
})
```

### 5. Connections API (`/api/admin/connections`)
**Problem**: Parameter validation mismatch
- Frontend sending `amount` field
- API expecting `connections` field

**Solution**:
```typescript
// Fixed parameter destructuring and validation
const { userId, amount, reason } = await request.json()

if (!userId || typeof amount !== 'number') {
  return NextResponse.json({ 
    error: 'Invalid request. userId and amount are required.' 
  }, { status: 400 })
}

// Fixed all references throughout the function
await prisma.connectionHistory.create({
  data: {
    userId: userId,
    action: 'ADMIN_ADJUSTMENT',  // Using correct enum value
    amount: amount,  // Was: connections
    description: reason || `Admin granted ${amount} connections`,
    createdAt: new Date()
  }
})
```

### 6. Connection Action Enum Fix
**Problem**: Using incorrect enum value for connection history logging
- API was using `admin_grant` which doesn't exist in the `ConnectionAction` enum
- Prisma schema defines `ADMIN_ADJUSTMENT` for admin-initiated connection changes

**Solution**:
```typescript
// Fixed to use correct enum value
await prisma.connectionHistory.create({
  data: {
    userId: userId,
    action: 'ADMIN_ADJUSTMENT',  // Correct enum value
    amount: amount,
    description: reason || `Admin granted ${amount} connections`,
    createdAt: new Date()
  }
})
```

### 7. Enhanced Connection Management System

#### **Connection Grant History Component**
**Added**: `/src/components/dashboard/admin/connection-grant-history.tsx`
- **Paginated History**: Display all connection grants with pagination
- **Advanced Filtering**: Filter by action type, search users/descriptions
- **Sorting Options**: Sort by date (newest/oldest first)
- **Action Types**: Support for all ConnectionAction enum values
- **User Details**: Show user name, email, role for each transaction
- **Amount Display**: Clear formatting with +/- indicators
- **Real-time Updates**: Refresh functionality for latest data

**API Endpoint**: `GET /api/admin/connection-history`
- Fetches all connection history with user details
- Includes action, amount, description, timestamps
- Ordered by creation date (newest first)
- Admin role authentication required

#### **Billing Management System**
**Added**: `/src/components/dashboard/admin/billing-management-tab.tsx`
- **Revenue Analytics**: Total and monthly revenue tracking
- **Transaction Management**: View all Stripe transactions
- **Customer Analytics**: Top paying customers list
- **Payment Statistics**: Success/failure rates, average transaction values
- **Export Functionality**: CSV export of transaction data
- **Advanced Filtering**: Filter by status, search transactions
- **Real-time Data**: Refresh billing data on demand

**API Endpoints**:
- `GET /api/admin/billing/stats` - Revenue and transaction statistics
- `GET /api/admin/billing/transactions` - All Stripe transaction details

**Database Schema Addition**:
```prisma
model StripeTransaction {
  id                    String   @id @default(cuid())
  stripePaymentIntentId String   @unique
  userId                String
  amount                Int      // Amount in cents
  currency              String   @default("usd")
  status                String   // succeeded, pending, failed, etc.
  description           String?
  metadata              Json?
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  user                  User     @relation(fields: [userId], references: [id])
}
```

### 8. Jobs API (`/api/admin/jobs`)
**Problem**: Incorrect Prisma model reference and field mapping
- Using `prisma.job` instead of `prisma.jobListing`
- Using incorrect field names for city and category relations
- API was trying to access `name`, `name_en`, `name_bs` which don't exist in the schema

**Solution**:
```typescript
// Fixed Prisma model reference
const jobs = await prisma.jobListing.findMany({
  include: {
    city: {
      select: {
        id: true,
        key: true,
        nameEN: true,  // Was: name_en
        nameBS: true   // Was: name_bs
      }
    },
    category: {
      select: {
        id: true,
        key: true,
        nameEN: true,  // Was: name_en  
        nameBS: true   // Was: name_bs
      }
    },
    postedBy: {
      select: {
        id: true,
        name: true,
        email: true,
        companyName: true
      }
    }
  },
  orderBy: {
    createdAt: 'desc'
  }
})
```

**Field Mapping Corrections**:
- Database uses `job_listings` table, Prisma model is `JobListing`
- City fields: `nameEN` and `nameBS` (not `name_en`, `name_bs`, or `name`)
- Category fields: `nameEN` and `nameBS` (not `name_en`, `name_bs`, or `name`)

### 9. Job Description HTML Rendering Fix
**Problem**: Job descriptions displaying visible HTML tags like `<p>` instead of formatted text
- Job descriptions are stored as HTML content (from rich text editor)
- Components were rendering HTML as plain text using `{job.description}`
- This caused visible `<p>`, `<br>`, and other HTML tags in the UI

**Solution**:
Fixed job card components to properly render HTML content:

```typescript
// Before: Plain text rendering (shows HTML tags)
<p className="text-sm text-muted-foreground line-clamp-2">
  {job.description}
</p>

// After: Proper HTML rendering
<div 
  className="text-sm text-muted-foreground line-clamp-2 prose prose-sm max-w-none"
  dangerouslySetInnerHTML={{ __html: job.description }}
/>
```

**Files Updated**:
- `/src/components/job-card-list.tsx` - Main job listing cards
- `/src/components/dashboard/client/job-card.tsx` - Client dashboard job cards  
- `/src/components/job-card-new.tsx` - New job card component

**Benefits**:
- Job descriptions now display properly formatted text
- HTML tags are no longer visible to users
- Consistent with other job detail components that already use `dangerouslySetInnerHTML`
- Added `prose` classes for better typography

## Security Considerations
