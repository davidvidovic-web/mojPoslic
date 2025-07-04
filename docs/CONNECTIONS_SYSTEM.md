# Connections Management System

## Overview
The connections management system allows administrators to grant connections to users and provides a comprehensive interface for managing user connection balances across the platform.

## Features

### Admin Dashboard Integration
- **Location**: Admin Dashboard → System Management → Connections tab
- **Access**: Admin role required
- **Real-time Updates**: Immediate reflection of changes

### Connection Granting
- **User Selection**: Dropdown with all platform users
- **Amount Input**: Numeric field for connection amount
- **Reason Field**: Optional description for audit trail
- **Validation**: Comprehensive input validation and error handling

### User Management
- **User List**: Display all users with current connection balances
- **User Details**: Name, email, role, company (if applicable)
- **Connection Display**: Current connection count for each user
- **Role Badges**: Visual indicators for user roles

## Technical Implementation

### API Endpoints

#### GET `/api/admin/connections`
**Purpose**: Fetch all users with their connection balances

**Authentication**: Admin role required

**Response**:
```json
[
  {
    "id": "user_id",
    "email": "user@example.com", 
    "name": "User Name",
    "role": "tasker",
    "connections": 10,
    "companyName": "Company Name" // Optional
  }
]
```

#### POST `/api/admin/connections`
**Purpose**: Grant connections to a specific user

**Authentication**: Admin role required

**Request Body**:
```json
{
  "userId": "user_id",
  "amount": 5,
  "reason": "Admin grant for good performance" // Optional
}
```

**Response**:
```json
{
  "success": true,
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name", 
    "connections": 15
  },
  "message": "Successfully added 5 connections to User Name"
}
```

### Database Schema

#### User Model
```prisma
model User {
  id                     String    @id @default(cuid())
  email                  String    @unique
  name                   String?
  role                   UserRole  @default(tasker)
  connections            Int       @default(5)
  // ... other fields
}
```

#### Connection History Model
```prisma
model ConnectionHistory {
  id          String           @id @default(cuid())
  userId      String           @map("user_id")
  action      ConnectionAction
  amount      Int
  description String?
  createdAt   DateTime         @default(now()) @map("created_at")
  user        User             @relation(fields: [userId], references: [id], onDelete: Cascade)
}

enum ConnectionAction {
  MONTHLY_REFRESH
  INITIAL_SIGNUP
  JOB_APPLICATION
  JOB_POST_CLIENT
  JOB_POST_COMPANY
  ADMIN_ADJUSTMENT
  PURCHASE
}
```

### Frontend Components

#### System Management Tab
**File**: `/src/components/dashboard/admin/system-management-tab.tsx`

**Key Features**:
- Tabbed interface (Categories, Cities, Connections)
- User selection dropdown
- Amount input with validation
- Reason text field
- Grant connections button
- User list with connection displays

**State Management**:
```typescript
const [connectionUsers, setConnectionUsers] = useState<ConnectionUser[]>([])
const [selectedUserId, setSelectedUserId] = useState('')
const [connectionAmount, setConnectionAmount] = useState('')
const [reason, setReason] = useState('')
const [loadingConnections, setLoadingConnections] = useState(false)
const [grantingConnections, setGrantingConnections] = useState(false)
```

## User Experience

### Admin Workflow
1. Navigate to Admin Dashboard
2. Click "System Management" tab
3. Select "Connections" sub-tab
4. View list of all users with current connection balances
5. Select user from dropdown
6. Enter connection amount
7. Optionally add reason for granting
8. Click "Grant Connections"
9. See success message and updated user list

### Validation & Error Handling
- **User Selection**: Must select a valid user
- **Amount Validation**: Must be a positive number
- **Authentication**: Admin role verification
- **Network Errors**: Proper error messages and toast notifications
- **Loading States**: Visual feedback during operations

### Real-time Updates
- User list refreshes after granting connections
- Connection counts update immediately
- Success/error toast notifications
- Form resets after successful grant

## Security & Audit

### Authorization
- Admin role verification on all endpoints
- Session-based authentication
- Proper error responses for unauthorized access

### Audit Trail
- All connection grants logged in `ConnectionHistory`
- Includes user ID, amount, reason, and timestamp
- Action type tracking for different connection events
- Immutable history for compliance

### Input Validation
- Server-side validation for all parameters
- Type checking for numeric amounts
- User existence verification
- Sanitization of reason text

## Integration Points

### Dashboard System
- Integrated into admin system management tab
- Consistent UI with other admin tools
- Responsive design for all screen sizes

### User Management
- Links with existing user management system
- Role-based display and filtering
- Company information integration

### Connection Economy
- Foundation for future paid features
- Job posting cost deduction
- Application fee system
- Refund capabilities

## Future Enhancements

### Planned Features
- Bulk connection grants
- Connection usage analytics
- Automated connection rewards
- Connection transfer between users
- Usage history and reporting

### API Extensibility
- Connection cost configuration
- Rate limiting for grants
- Scheduled connection grants
- Integration with payment systems

## Testing

### Unit Tests
- API endpoint validation
- Database operations
- Authentication checks
- Input sanitization

### Integration Tests
- End-to-end connection granting flow
- User list loading and refresh
- Error handling scenarios
- Role-based access control

### Manual Testing
- Admin dashboard navigation
- Connection granting workflow
- Real-time updates verification
- Mobile responsiveness

## Documentation Updates
- Added to admin dashboard documentation
- Updated API documentation
- Enhanced database schema docs
- Security documentation updates

The connections management system provides a robust foundation for managing user connections with proper security, audit trails, and user experience considerations.