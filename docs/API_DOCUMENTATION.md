# API Documentation

## Overview

This document provides comprehensive documentation for all API endpoints in the job platform. The API follows RESTful conventions and uses JWT-based authentication.

## Authentication

All API endpoints (except auth endpoints) require authentication via Auth.js session.

### Authentication Header
```typescript
// Client-side requests automatically include auth
const response = await fetch('/api/endpoint', {
  method: 'GET',
  credentials: 'include', // Include session cookies
})
```

### Role-Based Access
Some endpoints require specific user roles:
- 🛡️ **Admin**: Full system access
- 🏢 **Company**: Company dashboard access
- 👤 **Client**: Individual client access
- 🔧 **Tasker**: Job seeker access

## Base URL
- **Development**: `http://localhost:3000/api`
- **Production**: `https://yourdomain.com/api`

---

## User Endpoints

### Get Current User
Retrieve current authenticated user data.

**Endpoint**: `GET /api/user/me`  
**Auth**: Required  
**Role**: Any authenticated user

```typescript
// Response
{
  "id": "user_123",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "client",
  "profileSetupCompleted": true,
  "companyName": null
}
```

**Example Usage**:
```typescript
const response = await fetch('/api/user/me')
const user = await response.json()
```

### Complete Profile Setup
Mark user's profile setup as completed.

**Endpoint**: `PATCH /api/user/complete-profile`  
**Auth**: Required  
**Role**: Any authenticated user

```typescript
// Response
{
  "success": true
}
```

**Example Usage**:
```typescript
await fetch('/api/user/complete-profile', {
  method: 'PATCH'
})
```

---

## Admin Endpoints

All admin endpoints require `admin` role.

### Get All Users
Retrieve list of all users with statistics.

**Endpoint**: `GET /api/admin/users`  
**Auth**: Required  
**Role**: Admin only

```typescript
// Response
[
  {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "client",
    "companyName": null,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "_count": {
      "postedJobs": 5
    }
  }
]
```

### Get All Jobs
Retrieve list of all job postings with details.

**Endpoint**: `GET /api/admin/jobs`  
**Auth**: Required  
**Role**: Admin only

```typescript
// Response
[
  {
    "id": "job_123",
    "title": "Software Developer",
    "company": "Tech Corp",
    "description": "We are looking for...",
    "type": "full_time",
    "salary": "50000-60000",
    "transportation": "provided",
    "transportation_amount": 200,
    "email": "hr@techcorp.com",
    "website": "https://techcorp.com",
    "isActive": true,
    "isFeatured": false,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "city": {
      "id": "city_123",
      "name": "Sarajevo",
      "name_en": "Sarajevo",
      "name_bs": "Sarajevo"
    },
    "category": {
      "id": "cat_123",
      "name": "Technology",
      "name_en": "Technology",
      "name_bs": "Tehnologija"
    },
    "postedBy": {
      "id": "user_123",
      "name": "John Doe",
      "email": "john@example.com",
      "companyName": "Tech Corp"
    }
  }
]
```

### Get System Statistics
Retrieve dashboard statistics for admin overview.

**Endpoint**: `GET /api/admin/stats`  
**Auth**: Required  
**Role**: Admin only

```typescript
// Response
{
  "users": {
    "total": 1250,
    "admin": 2,
    "client": 800,
    "tasker": 400,
    "company": 48
  },
  "jobs": {
    "total": 856,
    "active": 723,
    "featured": 45
  },
  "growth": {
    "percentage": 15,
    "recentUsers": 125,
    "previousUsers": 108
  }
}
```

### Get Job Categories
Retrieve all job categories for management.

**Endpoint**: `GET /api/admin/categories`  
**Auth**: Required  
**Role**: Admin only

```typescript
// Response
[
  {
    "id": "cat_123",
    "key": "technology",
    "nameEN": "Technology",
    "nameBS": "Tehnologija",
    "isPopular": true,
    "sortOrder": 1,
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### Get Cities
Retrieve all cities for management.

**Endpoint**: `GET /api/admin/cities`  
**Auth**: Required  
**Role**: Admin only

```typescript
// Response
[
  {
    "id": "city_123",
    "key": "sarajevo",
    "nameEN": "Sarajevo",
    "nameBS": "Sarajevo",
    "isSpecial": true,
    "sortOrder": 1,
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

**Example Usage**:
```typescript
const response = await fetch('/api/admin/cities')
const cities = await response.json()
```

### Get Job Types (Legacy)
Retrieve job types with statistics. Note: Job types management has been removed from admin dashboard but endpoint remains for compatibility.

**Endpoint**: `GET /api/admin/types`  
**Auth**: Required  
**Role**: Admin only

```typescript
// Response
[
  {
    "key": "quick_job",
    "nameEN": "Quick Job",
    "nameBS": "Brzi Posao",
    "description": "Short-term tasks and gigs",
    "isPopular": true,
    "sortOrder": 1,
    "jobCount": 145
  }
]
```

### Get Connection Users
Retrieve all users with their connection balances for management.

**Endpoint**: `GET /api/admin/connections`  
**Auth**: Required  
**Role**: Admin only

```typescript
// Response
[
  {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "tasker",
    "connections": 10,
    "companyName": "Company Name" // Optional
  }
]
```

**Example Usage**:
```typescript
const response = await fetch('/api/admin/connections')
const users = await response.json()
```

### Grant Connections to User
Grant connections to a specific user.

**Endpoint**: `POST /api/admin/connections`  
**Auth**: Required  
**Role**: Admin only

```typescript
// Request Body
{
  "userId": "user_123",
  "amount": 5,
  "reason": "Admin grant for good performance" // Optional
}

// Response
{
  "success": true,
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe",
    "connections": 15
  },
  "message": "Successfully added 5 connections to John Doe"
}
```

**Example Usage**:
```typescript
const response = await fetch('/api/admin/connections', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    userId: 'user_123',
    amount: 5,
    reason: 'Good performance bonus'
  })
})
```

**Error Responses**:
- `400`: Invalid userId or amount
- `401`: Unauthorized (not logged in)
- `403`: Access denied (not admin)
- `500`: Internal server error

---

## Error Responses

All endpoints return consistent error responses:

### 401 Unauthorized
```typescript
{
  "error": "Unauthorized"
}
```

### 403 Forbidden
```typescript
{
  "error": "Access denied. Admin role required."
}
```

### 404 Not Found
```typescript
{
  "error": "User not found"
}
```

### 500 Internal Server Error
```typescript
{
  "error": "Internal server error"
}
```

---

## Rate Limiting

API endpoints have the following rate limits:
- **User Endpoints**: 100 requests per minute
- **Admin Endpoints**: 200 requests per minute
- **Auth Endpoints**: 10 requests per minute

---

## Request/Response Examples

### Complete User Flow Example

```typescript
// 1. Get current user
const userResponse = await fetch('/api/user/me')
const user = await userResponse.json()

// 2. Check if admin
if (user.role === 'admin') {
  // 3. Get admin statistics
  const statsResponse = await fetch('/api/admin/stats')
  const stats = await statsResponse.json()
  
  console.log(`Total users: ${stats.users.total}`)
  console.log(`Total jobs: ${stats.jobs.total}`)
}

// 4. Complete profile if needed
if (!user.profileSetupCompleted) {
  await fetch('/api/user/complete-profile', {
    method: 'PATCH'
  })
}
```

### Error Handling Example

```typescript
const fetchWithErrorHandling = async (endpoint: string) => {
  try {
    const response = await fetch(endpoint)
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Request failed')
    }
    
    return await response.json()
  } catch (error) {
    console.error('API Error:', error)
    toast.error('Failed to fetch data')
    throw error
  }
}
```

---

## TypeScript Interfaces

```typescript
// User interfaces
interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'client' | 'tasker' | 'company'
  profileSetupCompleted: boolean
  companyName?: string
  createdAt: string
  _count?: {
    postedJobs: number
  }
}

// Job interfaces
interface Job {
  id: string
  title: string
  company: string
  description: string
  type: string
  salary?: string
  transportation?: string
  transportation_amount?: number
  email: string
  website?: string
  isActive: boolean
  isFeatured: boolean
  createdAt: string
  updatedAt: string
  city?: {
    id: string
    name: string
    name_en: string
    name_bs: string
  }
  category?: {
    id: string
    name: string
    name_en: string
    name_bs: string
  }
  postedBy: {
    id: string
    name: string
    email: string
    companyName?: string
  }
}

// Admin statistics
interface AdminStats {
  users: {
    total: number
    admin: number
    client: number
    tasker: number
    company: number
  }
  jobs: {
    total: number
    active: number
    featured: number
  }
  growth: {
    percentage: number
    recentUsers: number
    previousUsers: number
  }
}

// Category interface
interface Category {
  id: string
  key: string
  nameEN: string
  nameBS: string
  isPopular: boolean
  sortOrder: number
  isActive: boolean
  createdAt: string
}

// City interface
interface City {
  id: string
  key: string
  nameEN: string
  nameBS: string
  isSpecial: boolean
  sortOrder: number
  isActive: boolean
  createdAt: string
}

// Job type interface
interface JobType {
  key: string
  nameEN: string
  nameBS: string
  description: string
  isPopular: boolean
  sortOrder: number
  jobCount: number
}
```

---

## Security Considerations

### Authentication
- All endpoints validate Auth.js session
- JWT tokens are httpOnly and secure
- Session duration: 30 days

### Authorization
- Role-based access control implemented
- Admin endpoints double-check user role
- Database queries scoped to user permissions

### Data Validation
- Input validation on all endpoints
- SQL injection prevention via Prisma
- XSS protection via proper sanitization

### Rate Limiting
- Per-endpoint rate limits
- IP-based limiting for auth endpoints
- Graceful degradation on limit exceeded

---

## Development

### Adding New Endpoints

1. Create route file in `src/app/api/`
2. Implement authentication check
3. Add role validation if needed
4. Use Prisma for database operations
5. Return consistent response format
6. Add to this documentation

### Testing Endpoints

```typescript
// Example test
describe('GET /api/admin/users', () => {
  it('requires admin role', async () => {
    const response = await fetch('/api/admin/users')
    expect(response.status).toBe(403)
  })
  
  it('returns user list for admin', async () => {
    // Mock admin session
    const response = await fetch('/api/admin/users')
    const users = await response.json()
    expect(Array.isArray(users)).toBe(true)
  })
})
```
