# Dashboard System Documentation

## Overview
The Poslić.ba application now features a comprehensive dashboard system with role-based access control. Each user type (Admin, Employer, Employee) has a customized dashboard tailored to their specific needs and permissions.

## Dashboard Features

### 🏢 **Employer Dashboard** (`/dashboard` for employers)
**Purpose**: Manage job postings and track recruitment efforts

**Features**:
- **Job Statistics**: Total jobs, active jobs, monthly postings
- **Job Management**: 
  - View all posted jobs with full details
  - Delete job postings
  - Edit job postings (coming soon)
  - Post new jobs directly from dashboard
- **Job Cards**: Display job title, description, location, salary, posting date, and tags
- **Empty State**: Helpful guidance for first-time job posters
- **Search & Filter**: Quick access to specific job postings

**Key Components**:
- Job posting statistics cards
- Interactive job management interface
- Integrated job posting form
- Responsive grid layout

### 👤 **Employee Dashboard** (`/dashboard` for employees)
**Purpose**: Track job applications and discover new opportunities

**Features**:
- **Application Tracking**:
  - View all submitted applications
  - Application status tracking (Pending, Reviewed, Accepted, Rejected)
  - Application dates and job details
- **Saved Jobs**: Bookmark interesting positions for later
- **Recommended Jobs**: Personalized job suggestions with search
- **Statistics**: Applications sent, pending responses, saved jobs, profile views
- **Job Discovery**: Search and filter recommended positions

**Key Components**:
- Application status dashboard
- Saved jobs management
- Recommended jobs with filtering
- Application statistics overview

### 👑 **Admin Dashboard** (`/dashboard` for admins)
**Purpose**: Platform administration and content moderation

**Features**:
- **User Management**:
  - View all registered users
  - Change user roles (Employee → Employer → Admin)
  - Delete user accounts
  - User search and filtering
  - User statistics by role
- **Job Management**:
  - View all job postings across the platform
  - Delete inappropriate job postings
  - Edit job details (coming soon)
  - Job search and filtering
- **Platform Statistics**: Total users, employers, jobs, and growth metrics
- **Role-based Actions**: Prevent self-deletion, role management

**Key Components**:
- Tabbed interface (Users/Jobs)
- User role management system
- Job moderation tools
- Platform analytics overview

## Technical Implementation

### File Structure
```
src/
├── app/
│   └── dashboard/
│       └── page.tsx                 # Main dashboard router
├── components/
│   ├── dashboard/
│   │   ├── admin-dashboard.tsx      # Admin management interface
│   │   ├── employer-dashboard.tsx   # Employer job management
│   │   └── employee-dashboard.tsx   # Employee application tracking
│   ├── role-based.tsx              # Role-based conditional rendering
│   └── user-menu.tsx               # Updated with dashboard link
└── types/
    └── user.ts                     # User role types and interfaces
```

### Database Requirements
- **profiles table**: User profiles with role management
- **jobs table**: Job postings with user relationships
- **job_applications table**: (Future) Application tracking
- **saved_jobs table**: (Future) User bookmarked jobs

### Role-Based Access Control
```typescript
// Dashboard routing logic
switch (profile.role) {
  case 'admin': return <AdminDashboard />
  case 'employer': return <EmployerDashboard />
  case 'employee': return <EmployeeDashboard />
}
```

### Key Features
- **Responsive Design**: Mobile-friendly layouts for all dashboards
- **Real-time Data**: Live statistics and job listings
- **Role Enforcement**: UI adapts based on user permissions
- **Search & Filter**: Quick data discovery across all interfaces
- **Action Confirmation**: Safe deletion with confirmation dialogs
- **Error Handling**: Graceful error states and user feedback

## Access Control

### Navigation
- Dashboard link appears in user menu for all authenticated users
- URL: `/dashboard` redirects to appropriate role-based dashboard
- Unauthenticated users redirected to login page

### Permissions
- **Employees**: Read-only access to jobs, application tracking
- **Employers**: Can manage own job postings, view applications
- **Admins**: Full platform access, user/job management

### Security
- Role validation on every page load
- Database-level permissions via Row Level Security (RLS)
- Protected API endpoints with role checking

## Future Enhancements
1. **Application System**: Full job application workflow
2. **Analytics**: Advanced reporting and insights
3. **Notifications**: Real-time updates and alerts
4. **Messaging**: Direct communication between employers/employees
5. **Profile Management**: Enhanced user profile editing
6. **Bulk Operations**: Batch job/user management for admins
7. **Export Features**: Data export for reporting
8. **Advanced Filtering**: More sophisticated search options

## Usage Examples

### Employer Workflow
1. Login as employer
2. Access dashboard via user menu
3. View job posting statistics
4. Create new job posting
5. Manage existing job listings
6. Track job performance

### Employee Workflow
1. Login as employee
2. Access dashboard via user menu
3. Review application status
4. Browse recommended jobs
5. Save interesting positions
6. Apply to new opportunities

### Admin Workflow
1. Login as admin
2. Access dashboard via user menu
3. Monitor platform statistics
4. Manage user roles and accounts
5. Moderate job postings
6. Handle user reports/issues

The dashboard system provides a comprehensive management interface that scales with user needs while maintaining clean separation of concerns and robust security.
