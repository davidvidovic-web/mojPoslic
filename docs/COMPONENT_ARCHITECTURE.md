# Component Architecture Guide

## Overview

This guide documents the new component architecture established during the refactoring project. It serves as a reference for developers working with the refactored components and provides guidelines for future development.

---

## 🏗️ Architecture Patterns

### 1. Component Composition Pattern

**Before**: Large monolithic components
```tsx
// ❌ Old Pattern - Everything in one file
export function LargeDashboard() {
  // 500+ lines of mixed concerns
  // - State management
  // - Data fetching  
  // - UI rendering
  // - Business logic
  return <div>...</div>
}
```

**After**: Composed components
```tsx
// ✅ New Pattern - Composed of focused components
export function Dashboard() {
  return (
    <div>
      <DashboardHeader />
      <DashboardStats />
      <DashboardContent />
    </div>
  )
}
```

### 2. Custom Hook Pattern

**State Management Extraction**:
```tsx
// ✅ Extracted state logic
export function useJobFormState(props) {
  const [formData, setFormData] = useState(...)
  const [validations, setValidations] = useState(...)
  
  const updateFormData = (field, value) => {
    // Complex state logic here
  }
  
  return { formData, validations, updateFormData }
}

// ✅ Clean component using the hook
export function JobForm() {
  const { formData, validations, updateFormData } = useJobFormState()
  return <form>...</form>
}
```

### 3. Utility Module Pattern

**Before**: Inline utility functions
```tsx
// ❌ Utilities mixed with component logic
export function Component() {
  const formatPrice = (price) => { /* complex logic */ }
  const validateEmail = (email) => { /* validation logic */ }
  // ... component logic
}
```

**After**: Extracted utility modules
```tsx
// ✅ Dedicated utility files
// src/lib/formatting/price-utils.ts
export function formatPrice(price: number): string { ... }

// src/lib/validation/email-utils.ts  
export function validateEmail(email: string): boolean { ... }

// ✅ Clean component
export function Component() {
  // Component focuses only on UI logic
}
```

---

## 📁 File Organization Standards

### Dashboard Components
```
src/components/dashboard/
├── admin-dashboard.tsx           # Main admin dashboard
├── employee-dashboard.tsx        # Main employee dashboard
├── employer-dashboard.tsx        # Main employer dashboard
├── company-dashboard.tsx         # Main company dashboard
├── admin/                        # Admin-specific components
│   ├── admin-stats-cards.tsx
│   ├── user-management-tab.tsx
│   ├── job-management-tab.tsx
│   └── system-management-tab.tsx
├── employee/                     # Employee-specific components
│   ├── employee-stats-cards.tsx
│   ├── applications-section.tsx
│   ├── saved-jobs-section.tsx
│   └── recommended-jobs-section.tsx
├── employer/                     # Employer-specific components
│   ├── dashboard-header.tsx
│   ├── dashboard-stats-cards.tsx
│   ├── jobs-list-section.tsx
│   ├── job-card.tsx
│   └── job-card-actions.tsx
└── company/                      # Company-specific components
    ├── company-stats-cards.tsx
    ├── overview-tab.tsx
    ├── jobs-management-tab.tsx
    └── applications-analytics-tabs.tsx
```

### Form Components
```
src/components/job-post-form/
├── job-form-base.tsx             # Main form orchestrator
├── basic-details-step.tsx        # Form steps
├── location-transportation-compensation-step.tsx
├── review-step.tsx
├── step-indicator.tsx            # Shared form UI
├── types.ts                      # Form type definitions
├── use-job-form-state.ts         # State management hook
├── use-job-form-navigation.ts    # Navigation hook
├── form-validation.ts            # Validation utilities
├── location-section.tsx          # Section components
├── transportation-section.tsx
├── schedule-section.tsx
├── compensation-section.tsx
├── contact-information-section.tsx
└── payment-utils.ts              # Utility functions
```

### Utility Libraries
```
src/lib/
├── connections/                  # Connection system
│   ├── index.ts                 # Main exports
│   ├── types.ts                 # Type definitions
│   ├── utils.ts                 # Pure functions
│   └── database.ts              # Database operations
├── location/                     # Location utilities
│   ├── index.ts
│   ├── character-mapping.ts
│   ├── text-normalization.ts
│   ├── city-extraction.ts
│   └── validation.ts
└── city-coordinates.ts           # Static data
```

### Settings Components
```
src/components/settings/
├── profile-settings-card.tsx
├── account-info-card.tsx
├── appearance-card.tsx
├── security-card.tsx
└── help-support-card.tsx
```

### Authentication Components
```
src/components/auth/
├── social-login-section.tsx
├── login-form-section.tsx
├── signup-form-section.tsx
└── role-selection-section.tsx
```

---

## 🔧 Component Design Principles

### 1. Single Responsibility
Each component should have one clear purpose:

```tsx
// ✅ Good - Single responsibility
export function UserStatsCard({ userCount }: { userCount: number }) {
  return (
    <Card>
      <CardHeader>User Statistics</CardHeader>
      <CardContent>{userCount} users</CardContent>
    </Card>
  )
}

// ❌ Bad - Multiple responsibilities
export function DashboardEverything() {
  // Handles stats, user management, job management, etc.
}
```

### 2. Composition over Large Components
Build complex UIs by composing smaller components:

```tsx
// ✅ Good - Composition
export function AdminDashboard() {
  return (
    <div>
      <AdminStatsCards stats={stats} />
      <Tabs>
        <UserManagementTab users={users} />
        <JobManagementTab jobs={jobs} />
        <SystemManagementTab categories={categories} />
      </Tabs>
    </div>
  )
}
```

### 3. Props Interface Design
Use clear, typed interfaces for all components:

```tsx
// ✅ Clear prop interfaces
interface UserManagementTabProps {
  users: AdminUser[]
  setUsers: (users: AdminUser[]) => void
  currentUserId?: string
}

export function UserManagementTab(props: UserManagementTabProps) {
  // Component implementation
}
```

### 4. State Management Separation
Extract complex state logic into custom hooks:

```tsx
// ✅ State logic in custom hook
export function useJobFormState(props: UseJobFormStateProps) {
  const [formData, setFormData] = useState<CreateJobData>(...)
  const [validations, setValidations] = useState<Record<string, boolean>>(...)
  
  const updateFormData = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }, [])
  
  return { formData, validations, updateFormData }
}

// ✅ Component focuses on UI
export function JobForm() {
  const { formData, validations, updateFormData } = useJobFormState()
  return <form>{/* UI only */}</form>
}
```

---

## 🎯 Best Practices

### Component Size Guidelines
- **Target**: Keep components under 200 lines
- **Maximum**: 300 lines before considering refactoring
- **Focus**: If a component handles multiple concerns, extract them

### Import Organization
```tsx
// ✅ Organized imports
// React imports first
import { useState, useEffect } from 'react'

// External library imports
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

// Internal imports (hooks, utilities)
import { useAuth } from '@/contexts/prisma-auth-context'
import { validateFormData } from './form-validation'

// Local component imports
import { UserManagementTab } from './admin/user-management-tab'
```

### Error Handling
Maintain consistent error handling patterns:

```tsx
// ✅ Consistent error handling
const fetchData = async () => {
  try {
    const response = await fetch('/api/data')
    if (!response.ok) {
      throw new Error('Failed to fetch data')
    }
    const data = await response.json()
    setData(data)
  } catch (error) {
    console.error('Error fetching data:', error)
    toast.error('Failed to load data')
  }
}
```

### Type Safety
Use proper TypeScript throughout:

```tsx
// ✅ Proper typing
interface AdminUser {
  id: string
  email: string
  name: string
  role: 'admin' | 'client' | 'tasker' | 'company'
  createdAt: string
}

interface UserTableProps {
  users: AdminUser[]
  onUserUpdate: (user: AdminUser) => void
}
```

---

## 🚀 Usage Examples

### Using Dashboard Components
```tsx
import { AdminDashboard } from '@/components/dashboard/admin-dashboard'
import { EmployeeDashboard } from '@/components/dashboard/employee-dashboard'

// Components are ready to use with proper data fetching
function DashboardPage() {
  const { user } = useAuth()
  
  if (user?.role === 'admin') {
    return <AdminDashboard />
  }
  
  return <EmployeeDashboard />
}
```

### Using Form Components
```tsx
import { JobFormBase } from '@/components/job-post-form/job-form-base'

function CreateJobPage() {
  const handleSubmit = async (formData: CreateJobData) => {
    // Submit logic
  }
  
  return (
    <JobFormBase
      onSubmit={handleSubmit}
      submitButtonText="Create Job"
      submittingText="Creating..."
    />
  )
}
```

### Using Utility Functions
```tsx
import { validateLocationInCity } from '@/lib/location'
import { formatConnectionAction } from '@/lib/connections'

function MyComponent() {
  const validation = validateLocationInCity(address, city)
  const actionText = formatConnectionAction('JOB_APPLICATION')
  
  return <div>{/* Use validation and actionText */}</div>
}
```

---

## 🔄 Migration Guide

### For Existing Code
1. **Import Updates**: Update import paths to use new component locations
2. **Prop Changes**: Check if component props have been simplified
3. **State Management**: Consider using extracted hooks for complex state

### For New Development
1. **Follow Patterns**: Use the established component composition patterns
2. **Size Limits**: Keep new components under 200 lines
3. **Extract Early**: Extract utilities and hooks as soon as complexity grows
4. **Type Safety**: Always use proper TypeScript interfaces

---

## 📋 Checklist for New Components

- [ ] Component has single responsibility
- [ ] File is under 200 lines
- [ ] Proper TypeScript interfaces defined
- [ ] State logic extracted to hooks if complex
- [ ] Error handling implemented consistently
- [ ] Imports organized properly
- [ ] Component is testable
- [ ] Documentation includes usage examples

---

*This architecture provides a solid foundation for maintainable, scalable React components. Follow these patterns to ensure consistency across the codebase.*
