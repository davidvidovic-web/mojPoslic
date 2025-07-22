# Job Acceptance System Implementation

## 🎯 Overview

This document details the complete implementation of the job acceptance workflow in the mojPoslić platform. When a client accepts a tasker for a job, the system automatically locks the job, sends notifications, and creates an active job assignment for the tasker to track.

## 📋 Table of Contents

- [Features](#-features)
- [Architecture](#-architecture)
- [API Endpoints](#-api-endpoints)
- [Database Schema](#-database-schema)
- [Frontend Components](#-frontend-components)
- [React Hooks](#-react-hooks)
- [Messaging Integration](#-messaging-integration)
- [User Flows](#-user-flows)
- [Testing](#-testing)
- [Deployment Notes](#-deployment-notes)

## ✨ Features

### Core Functionality
- ✅ **One-Click Job Acceptance**: Clients can accept taskers with additional terms
- ✅ **Automatic Job Locking**: Jobs become unavailable once a tasker is accepted
- ✅ **Bulk Application Rejection**: All other applications are automatically rejected
- ✅ **Instant Notifications**: Email and in-app notifications for all parties
- ✅ **Active Jobs Dashboard**: Taskers can track their accepted assignments
- ✅ **Messaging Integration**: Automatic conversation creation with celebration messages
- ✅ **Contract Management**: Salary agreements, start dates, and special instructions

### Business Logic
- **Single Assignment**: Each job can only have one accepted tasker
- **Atomic Operations**: All database changes happen in a single transaction
- **Status Tracking**: Complete audit trail from application to completion
- **Privacy Aware**: Respects user privacy settings for notifications
- **Bilingual Support**: Bosnian/English email and messaging support

## 🏗 Architecture

### System Flow
```
Client Reviews Application → Accept Tasker → Job Locked → Tasker Notified → Active Job Created
```

### Components Overview
```
Frontend Components
├── JobAcceptanceDialog (Client Interface)
├── ActiveJobsList (Tasker Dashboard)
└── NotificationCenter (Real-time Updates)

Backend Services
├── Job Acceptance API (/api/jobs/[id]/applications/[applicationId]/accept)
├── Active Jobs API (/api/tasker/active-jobs)
├── Messaging Integration Service
└── Email Notification Service

Database Models
├── JobAssignment (New assignments)
├── Application (Status updates)
├── JobListing (Job locking)
└── Conversation (Messaging)
```

## 🔌 API Endpoints

### 1. Job Acceptance Endpoint

**POST** `/api/jobs/[id]/applications/[applicationId]/accept`

Accepts a tasker for a job and handles all related business logic.

#### Request Body
```typescript
{
  agreedSalary?: number;     // Optional agreed salary
  startDate?: string;        // Optional start date (ISO string)
  notes?: string;           // Optional client notes
}
```

#### Response
```typescript
{
  success: true,
  message: "Tasker successfully accepted for the job",
  application: ApplicationWithDetails,
  assignment: JobAssignment
}
```

#### Business Logic
1. **Validation**: Checks job ownership and application existence
2. **Duplicate Prevention**: Ensures job isn't already assigned
3. **Atomic Transaction**:
   - Updates application status to `SELECTED`
   - Creates `JobAssignment` record
   - Sets job status to `completed` (locked)
   - Rejects all other applications
4. **Notifications**: Sends acceptance email to tasker
5. **Messaging**: Creates conversation with celebration message
6. **Cleanup**: Sends rejection emails to other applicants

#### Error Handling
- **401**: Unauthorized access
- **404**: Job/application not found
- **400**: Job already assigned
- **500**: Database or email service errors

### 2. Active Jobs Endpoint

**GET** `/api/tasker/active-jobs`

Retrieves all active job assignments for the authenticated tasker.

#### Response
```typescript
{
  success: true,
  activeJobs: ActiveJob[],
  total: number
}
```

#### ActiveJob Interface
```typescript
interface ActiveJob {
  assignmentId: string;
  jobId: string;
  title: string;
  company: string;
  description: string;
  salary?: string;
  agreedSalary?: number;
  startDate?: string;
  contractStatus: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'COMPLETED';
  assignedAt: string;
  client: {
    id: string;
    name?: string;
    email?: string;
    companyName?: string;
  };
  // ... additional fields
}
```

## 🗄 Database Schema

### JobAssignment Model
```prisma
model JobAssignment {
  id                    String         @id @default(cuid())
  jobId                 String         @unique @map("job_id")
  selectedApplicationId String         @unique @map("selected_application_id")
  contractStatus        ContractStatus @default(PENDING)
  assignedAt            DateTime       @default(now()) @map("assigned_at")
  startDate             DateTime?      @map("start_date")
  agreedSalary          Int?           @map("agreed_salary")
  notes                 String?
  createdAt             DateTime       @default(now()) @map("created_at")
  updatedAt             DateTime       @updatedAt @map("updated_at")
  
  job                   JobListing     @relation(fields: [jobId], references: [id])
  selectedApplication   Application    @relation("SelectedApplication", fields: [selectedApplicationId], references: [id])

  @@map("job_assignments")
}
```

### Enhanced Application Model
```prisma
model Application {
  // ... existing fields
  status        ApplicationStatus @default(PENDING)
  selectedAt    DateTime?         @map("selected_at")
  assignment    JobAssignment?    @relation("SelectedApplication")
}

enum ApplicationStatus {
  PENDING
  REVIEWED
  SHORTLISTED
  SELECTED    // ← New status for accepted applications
  REJECTED
  WITHDRAWN
}
```

### Enhanced JobListing Model
```prisma
model JobListing {
  // ... existing fields
  status       JobStatus      @default(active)
  assignment   JobAssignment?
}

enum JobStatus {
  active
  inactive
  completed    // ← Used to lock jobs when assigned
  expired
}
```

## 🎨 Frontend Components

### 1. Job Acceptance Dialog

**Location**: `src/components/jobs/job-acceptance-dialog.tsx`

A multi-step dialog for clients to accept taskers with additional terms.

#### Features
- **Step 1**: Acceptance form with salary/date/notes
- **Step 2**: Confirmation screen with summary
- **Step 3**: Success state with next steps
- **Validation**: Form validation and error handling
- **Loading States**: Proper UX during API calls

#### Usage
```tsx
<JobAcceptanceDialog
  applicationId="app_123"
  jobId="job_456"
  taskerName="John Doe"
  jobTitle="Web Developer"
  isOpen={isOpen}
  onOpenChange={setIsOpen}
  onAccepted={(result) => {
    // Handle successful acceptance
    refreshApplications();
  }}
/>
```

### 2. Active Jobs List

**Location**: `src/components/jobs/active-jobs-list.tsx`

A comprehensive dashboard for taskers to view their active job assignments.

#### Features
- **Job Cards**: Detailed cards showing job info, client details, terms
- **Status Badges**: Visual indicators for contract status
- **Timeline**: Application → Selection → Assignment timeline
- **Quick Actions**: Message client, view job details buttons
- **Empty State**: Friendly message when no active jobs
- **Loading State**: Skeleton loading for better UX

#### Integration
```tsx
// Page usage
<ActiveJobsList />

// Direct component usage
import { ActiveJobsList } from '@/components/jobs/active-jobs-list'
```

### 3. Active Jobs Page

**Location**: `src/app/[locale]/dashboard/jobs/active/page.tsx`

A dedicated page for taskers to access their active jobs dashboard.

#### Features
- **Role Protection**: Only accessible to taskers
- **Authentication**: Requires completed profile setup
- **Responsive Design**: Works on all device sizes
- **Navigation Integration**: Accessible from dashboard menu

## 🪝 React Hooks

### useJobAcceptance Hook

**Location**: `src/hooks/use-job-acceptance.ts`

A comprehensive hook for managing job acceptance workflow and active jobs.

#### API
```typescript
const {
  // States
  isAccepting,
  activeJobs,
  isLoadingActiveJobs,
  
  // Actions
  acceptTasker,
  fetchActiveJobs,
  hasActiveJobs,
  getActiveJob,
  handleJobAcceptanceNotification,
} = useJobAcceptance()
```

#### Key Functions

##### acceptTasker
```typescript
const acceptTasker = async (
  jobId: string,
  applicationId: string,
  acceptanceData: {
    agreedSalary?: number;
    startDate?: string;
    notes?: string;
  } = {}
) => Promise<AcceptanceResult>
```

##### fetchActiveJobs
```typescript
const fetchActiveJobs = async () => Promise<ActiveJob[]>
```

##### handleJobAcceptanceNotification
```typescript
const handleJobAcceptanceNotification = (
  jobTitle: string,
  clientName?: string
) => void
```

#### Usage Examples
```tsx
// Accept a tasker
await acceptTasker('job_123', 'app_456', {
  agreedSalary: 1500,
  startDate: '2025-08-01',
  notes: 'Please bring your own laptop'
});

// Fetch active jobs
const activeJobs = await fetchActiveJobs();

// Handle notification (typically from WebSocket/SSE)
handleJobAcceptanceNotification('Web Developer', 'ABC Company');
```

## 💬 Messaging Integration

### Enhanced Messaging Service

**Location**: `src/lib/messaging/messaging-integration.ts`

#### New ACCEPTED Status Support
```typescript
// Welcome messages for accepted applications
const messages = {
  SHORTLISTED: "Vaša prijava je shortlistovana...",
  SELECTED: "Čestitamo! Odabrani ste...",
  ACCEPTED: "🎉 Čestitamo! Oficijalno ste prihvaćeni za posao...", // New
  DEFAULT: "Želimo razgovarati s vama..."
}
```

#### Automatic Conversation Creation
- **Job-Specific Conversations**: Each job gets a dedicated conversation thread
- **Participant Management**: Automatically adds client and tasker as participants
- **Celebration Messages**: Sends congratulatory message when tasker is accepted
- **Status Updates**: Updates conversation with job acceptance status

#### Privacy Integration
- **Privacy Checks**: Respects user privacy settings before creating conversations
- **Opt-out Support**: Users can disable messaging notifications
- **Graceful Degradation**: System works even if messaging fails

## 👥 User Flows

### Client Flow (Job Poster)

1. **View Applications**
   - Navigate to job details page
   - Review list of applications
   - See tasker profiles and application messages

2. **Accept Tasker**
   - Click "Accept" button on chosen application
   - Fill acceptance form (optional salary, start date, notes)
   - Review acceptance summary
   - Confirm acceptance

3. **Post-Acceptance**
   - Receive confirmation toast
   - Job is automatically locked
   - Can message accepted tasker
   - Other applicants automatically rejected

### Tasker Flow (Job Seeker)

1. **Receive Notification**
   - Get email notification of acceptance
   - See in-app notification with celebration message
   - Receive toast notification when logging in

2. **View Active Job**
   - Navigate to `/dashboard/jobs/active`
   - See detailed job card with assignment info
   - View client contact information
   - Check assignment terms and timeline

3. **Ongoing Management**
   - Message client directly from active job card
   - View original job details
   - Track contract status (PENDING → ACCEPTED → COMPLETED)
   - Access all job-related information in one place

### Notification Flow

#### Email Notifications
- **Acceptance Email**: Sent to accepted tasker with job details
- **Rejection Emails**: Automatically sent to other applicants
- **Bilingual Support**: Emails sent in user's preferred language
- **Professional Templates**: Branded email templates with clear CTAs

#### In-App Notifications
- **Real-time Toast**: Immediate feedback for client actions
- **Notification Center**: Persistent notifications with action buttons
- **Celebration Messages**: Special formatting for job acceptance
- **Navigation Links**: Quick access to relevant pages

## 🧪 Testing

### API Testing
```bash
# Test job acceptance
curl -X POST /api/jobs/job123/applications/app456/accept \
  -H "Content-Type: application/json" \
  -d '{"agreedSalary": 1500, "startDate": "2025-08-01"}'

# Test active jobs retrieval
curl -X GET /api/tasker/active-jobs \
  -H "Authorization: Bearer <token>"
```

### Component Testing
```tsx
// Test acceptance dialog
import { JobAcceptanceDialog } from '@/components/jobs/job-acceptance-dialog'

test('should accept tasker with terms', async () => {
  render(
    <JobAcceptanceDialog
      applicationId="test_app"
      jobId="test_job"
      taskerName="Test User"
      jobTitle="Test Job"
      isOpen={true}
      onAccepted={mockOnAccepted}
    />
  )
  
  // Fill form and submit
  await userEvent.type(screen.getByLabelText('Agreed Salary'), '1500')
  await userEvent.click(screen.getByText('Accept Tasker'))
  
  // Verify acceptance
  expect(mockOnAccepted).toHaveBeenCalled()
})
```

### Database Testing
```typescript
// Test job assignment creation
test('should create job assignment on acceptance', async () => {
  const result = await acceptTasker(jobId, applicationId, {
    agreedSalary: 1500,
    startDate: '2025-08-01'
  })
  
  // Verify assignment exists
  const assignment = await prisma.jobAssignment.findUnique({
    where: { jobId }
  })
  
  expect(assignment).toBeTruthy()
  expect(assignment.agreedSalary).toBe(1500)
})
```

## 🚀 Deployment Notes

### Environment Variables
```bash
# Required for email notifications
SMTP_HOST=your-smtp-host
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password

# Required for messaging
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Required for authentication
NEXTAUTH_SECRET=your-nextauth-secret
```

### Database Migrations
```bash
# Apply job assignment schema
npx prisma migrate dev --name add_job_assignments

# Generate Prisma client
npx prisma generate
```

### Supabase Setup
```sql
-- Enable Row Level Security
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for job conversations
CREATE POLICY "Users can view job conversations they participate in"
ON conversations FOR SELECT
USING (
  type = 'job_related' AND 
  id IN (
    SELECT conversation_id FROM conversation_participants 
    WHERE user_id = auth.uid()
  )
);
```

### Monitoring
- **Error Tracking**: Monitor job acceptance failures
- **Email Delivery**: Track email notification success rates
- **Performance**: Monitor API response times for acceptance flow
- **Database**: Track job assignment creation and status changes

## 🔍 Error Handling

### Common Issues

#### Job Already Assigned
```typescript
// Error: Job already has an assignment
{
  error: "Job is already assigned to another tasker",
  status: 400
}
```
**Solution**: Check for existing assignments before showing accept button

#### Email Delivery Failure
```typescript
// Warning: Email failed but acceptance succeeded
console.warn('Failed to send acceptance email, but job was accepted')
```
**Solution**: Log error and show success message, email failure is non-critical

#### Messaging Service Unavailable
```typescript
// Error: Supabase messaging tables don't exist
console.error('Supabase messaging tables are not set up')
```
**Solution**: Run database migrations or disable messaging features

### Rollback Procedures

#### Failed Job Acceptance
If job acceptance fails partway through:
1. Check database transaction rollback
2. Verify no partial state exists
3. Allow user to retry acceptance
4. Log error for investigation

#### Email Service Outage
If email service is down:
1. Job acceptance still succeeds
2. Queue emails for later delivery
3. Show success message to user
4. Send recovery emails when service restored

## 📈 Analytics & Metrics

### Key Metrics to Track
- **Acceptance Rate**: Percentage of applications that get accepted
- **Time to Accept**: Average time from application to acceptance
- **Email Delivery**: Success rate of notification emails
- **User Engagement**: Active jobs page views and interactions
- **Conversion Rate**: Applications that lead to active assignments

### Suggested Events
```typescript
// Track job acceptance
analytics.track('Job Acceptance', {
  jobId,
  applicationId,
  agreedSalary,
  timeToAccept: Date.now() - applicationCreatedAt
})

// Track active jobs engagement
analytics.track('Active Jobs Viewed', {
  userId,
  activeJobsCount,
  viewDuration
})
```

## 🔮 Future Enhancements

### Short Term
- [ ] **Bulk Accept/Reject**: Accept multiple taskers for larger jobs
- [ ] **Auto-Reminder**: Remind clients to review applications
- [ ] **Calendar Integration**: Sync start dates with calendar apps
- [ ] **Payment Integration**: Handle deposits and payments

### Long Term
- [ ] **Contract Templates**: Reusable contract terms for similar jobs
- [ ] **Performance Tracking**: Track tasker performance on assignments
- [ ] **Rating System**: Allow clients to rate completed assignments
- [ ] **Advanced Matching**: AI-powered tasker recommendations

## 📞 Support

### Documentation
- **API Reference**: `/docs/api/job-acceptance`
- **Component Docs**: Storybook documentation for all components
- **Database Schema**: Prisma schema documentation

### Contact
- **Technical Issues**: Create GitHub issue with `job-acceptance` label
- **Business Logic Questions**: Contact product team
- **Performance Issues**: Contact DevOps team

---

*Last Updated: July 22, 2025*  
*Version: 1.0.0*  
*Author: Development Team*
