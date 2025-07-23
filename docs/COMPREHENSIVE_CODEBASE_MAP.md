# MojPoslic - Comprehensive Codebase Architecture Map

## 🏗️ **Overview**
MojPoslic is a Next.js 15 job marketplace application built with TypeScript, using a modern tech stack including NextAuth.js v5, Prisma, Supabase, TanStack Query, Zustand, and Tailwind CSS.

## 📁 **Root Structure**
```
mojPoslic/
├── 📂 prisma/                    # Database schema & migrations
├── 📂 public/                    # Static assets
├── 📂 scripts/                   # Build & deployment scripts
├── 📂 src/                       # Main application source
├── 📂 supabase/                  # Supabase configuration
├── 📂 translations/              # Internationalization files
├── 📂 docs/                      # Documentation & guides
├── 📄 package.json               # Dependencies & scripts
├── 📄 next.config.ts             # Next.js configuration
├── 📄 tailwind.config.js         # Tailwind CSS configuration
└── 📄 tsconfig.json              # TypeScript configuration
```

## 🗂️ **Core Application Structure**

### **1. App Router (`src/app/`)**
```
app/
├── 📂 [locale]/                  # Internationalized routes
│   ├── 📂 dashboard/             # Main dashboard (role-based)
│   ├── 📂 jobs/                  # Job listings & details
│   ├── 📂 messages/              # Messaging system
│   ├── 📂 auth/                  # Authentication pages
│   ├── 📂 admin/                 # Admin panel
│   ├── 📂 profile-setup/         # User onboarding
│   ├── 📂 role-selection/        # Role selection
│   └── 📂 settings/              # User settings
├── 📂 api/                       # API routes (serverless functions)
│   ├── 📂 auth/                  # Authentication endpoints
│   ├── 📂 jobs/                  # Job CRUD operations
│   ├── 📂 applications/          # Application management
│   ├── 📂 messages/              # Messaging endpoints
│   ├── 📂 user/                  # User profile management
│   ├── 📂 admin/                 # Admin operations
│   └── 📂 stripe/                # Payment processing
├── 📄 layout.tsx                 # Root layout
└── 📄 globals.css                # Global styles
```

### **2. Components (`src/components/`)**
```
components/
├── 📂 auth/                      # Authentication components
│   ├── 📄 role-guard.tsx         # Route protection
│   ├── 📄 password-strength-indicator.tsx
│   └── 📄 oauth-providers.tsx
├── 📂 dashboard/                 # Dashboard components
│   ├── 📄 admin-dashboard.tsx    # Admin-specific dashboard
│   ├── 📄 client-dashboard.tsx   # Client-specific dashboard
│   ├── 📄 tasker-dashboard.tsx   # Tasker-specific dashboard
│   ├── 📄 company-dashboard.tsx  # Company-specific dashboard
│   └── 📄 dashboard-layout.tsx   # Shared dashboard layout
├── 📂 jobs/                      # Job-related components
│   ├── 📄 job-card.tsx          # Job listing card
│   ├── 📄 job-list.tsx          # Job listings container
│   ├── 📂 job-post-form/        # Multi-step job posting
│   └── 📄 unified-job-card.tsx  # Unified job card component
├── 📂 messaging/                 # Chat & messaging
│   ├── 📄 conversation-list.tsx
│   ├── 📄 message-thread.tsx
│   └── 📄 chat-interface.tsx
├── 📂 ui/                        # Reusable UI components (shadcn/ui)
│   ├── 📄 button.tsx
│   ├── 📄 dialog.tsx
│   ├── 📄 card.tsx
│   └── 📄 ... (50+ UI components)
├── 📂 core/                      # Core app components
│   ├── 📄 header.tsx            # Main navigation header
│   ├── 📄 global-footer.tsx    # Application footer
│   └── 📄 theme-provider.tsx   # Theme management
└── 📂 providers/                 # Context providers
    ├── 📄 providers.tsx         # Combined providers
    └── 📄 query-provider.tsx   # TanStack Query provider
```

### **3. State Management (`src/stores/` - Zustand)**
```
stores/
├── 📄 dialog-store.ts           # Modal/dialog state management
├── 📄 filter-store.ts           # Search & filter state
├── 📄 form-state-store.ts       # Multi-step form state
├── 📄 navigation-store.ts       # Tab & navigation state
├── 📄 notification-store.ts     # In-app notifications
└── 📄 ui-preferences-store.ts   # User preferences & theme
```

### **4. Data Layer (`src/hooks/` - TanStack Query)**
```
hooks/
├── 📄 use-jobs.ts              # Job data queries & mutations
├── 📄 use-applications.ts       # Application management
├── 📄 use-admin.ts             # Admin panel data
├── 📄 use-messaging.ts         # Chat & messaging queries
├── 📄 use-data.ts              # Static data (cities, categories)
├── 📄 use-static-data.ts       # Optimized static data hooks
├── 📄 useAuth.ts               # Authentication state
└── 📄 useSupabaseClient.ts     # Supabase client hook
```

### **5. Context Providers (`src/contexts/`)**
```
contexts/
├── 📄 auth-context.tsx         # User authentication & profile
└── 📄 prisma-auth-context.tsx  # Legacy auth context (deprecated)
```

### **6. Utilities & Configurations (`src/lib/`)**
```
lib/
├── 📄 auth.ts                  # NextAuth.js v5 configuration
├── 📄 prisma.ts                # Prisma client setup
├── 📄 supabase-server.ts       # Supabase server client
├── 📄 query-client.ts          # TanStack Query configuration
├── 📄 utils.ts                 # Utility functions
├── 📄 toast.ts                 # Toast notification helpers
├── 📄 static-data.ts           # Static reference data
├── 📂 connections/             # Connection/credit system
├── 📂 messaging/               # Messaging utilities
└── 📂 location/                # Location & geocoding utilities
```

### **7. Type Definitions (`src/types/`)**
```
types/
├── 📄 job.ts                   # Job & category interfaces
├── 📄 application.ts           # Application & assignment types
├── 📄 user.ts                  # User profile types
├── 📄 messaging.ts             # Chat & messaging types
└── 📄 database.ts              # Database schema types
```

## 🔗 **Data Flow & Architecture Connections**

### **Authentication Flow**
```
User Request → middleware.ts → Auth Check → Role Validation → Page Access
             ↓
NextAuth.js v5 ← Prisma Database ← Supabase (JWT validation)
             ↓
AuthContext → Dashboard Components (role-based)
```

### **Data Management Architecture**
```
UI Components ←→ TanStack Query Hooks ←→ API Routes ←→ Prisma ←→ Database
             ↓                       ↓
Zustand Stores (UI State)    Cache Management
```

### **Key Data Relationships**
```
Users ←→ Applications ←→ Jobs
  ↓         ↓           ↓
Roles   Messages    Categories/Cities
  ↓         ↓           ↓
Permissions Conversations Reviews
```

## 📊 **Core Data Models & Relationships**

### **User Management**
- **Users** (roles: client, tasker, company, admin)
- **User Profiles** (skills, experience, preferences)
- **Authentication** (NextAuth.js sessions, email verification)
- **Connections** (credit system for job applications)

### **Job Management**
- **Job Listings** (title, description, salary, location)
- **Categories** (hierarchical job categories)
- **Cities** (location reference data)
- **Job Applications** (application status, messages)
- **Job Assignments** (contract management)

### **Messaging System**
- **Conversations** (between users)
- **Messages** (threaded messaging)
- **Notifications** (in-app alerts)

### **Payment & Billing**
- **Stripe Integration** (connection purchases)
- **Connection History** (transaction tracking)
- **Monthly Refresh** (automatic connection allocation)

## 🔄 **State Management Patterns**

### **TanStack Query (Server State)**
```typescript
// Query Keys Structure
queryKeys = {
  jobs: {
    all: ['jobs'],
    lists: () => [...queryKeys.jobs.all, 'list'],
    list: (filters) => [...queryKeys.jobs.lists(), filters],
    detail: (id) => [...queryKeys.jobs.all, 'detail', id]
  }
}

// Usage Pattern
const { data: jobs, isLoading } = useJobsQuery(filters)
const createJob = useCreateJobMutation()
```

### **Zustand (Client State)**
```typescript
// Store Pattern
const useDialogStore = create((set) => ({
  isJobPostDialogOpen: false,
  openJobPostDialog: () => set({ isJobPostDialogOpen: true }),
  closeJobPostDialog: () => set({ isJobPostDialogOpen: false })
}))

// Component Usage
const { isJobPostDialogOpen, openJobPostDialog } = useDialogStore()
```

## 🛣️ **Routing & Navigation**

### **Route Structure**
```
/[locale]/                      # Language-specific routes
  ├── /                         # Home page
  ├── /dashboard                # Role-based dashboard
  ├── /jobs                     # Job listings
  ├── /jobs/[id]                # Job details
  ├── /messages                 # Messaging interface
  ├── /auth/signin              # Authentication
  ├── /auth/register            # User registration
  ├── /profile-setup            # Onboarding
  ├── /role-selection           # Role selection
  ├── /admin                    # Admin panel
  └── /settings                 # User settings
```

### **Role-Based Access Control**
```typescript
// Middleware Protection
if (!userRole && requiresAuth) {
  redirect('/auth/signin')
}

if (userRole && !profileSetupCompleted) {
  redirect('/profile-setup')
}

// Component Protection
<RoleGuard allowedRoles={['client', 'admin']}>
  <AdminPanel />
</RoleGuard>
```

## 🔧 **API Architecture**

### **API Route Patterns**
```
/api/
├── /auth/[...nextauth]        # NextAuth.js handlers
├── /jobs                      # Job CRUD operations
├── /jobs/[id]                 # Individual job operations
├── /applications              # Application management
├── /applications/[id]/withdraw # Application actions
├── /user/profile              # User profile management
├── /messages                  # Messaging endpoints
├── /admin/users               # Admin user management
└── /stripe/create-payment     # Payment processing
```

### **API Response Patterns**
```typescript
// Standard Response Format
{
  success: boolean
  data?: any
  error?: string
  message?: string
}

// Paginated Response Format
{
  data: T[]
  total: number
  page: number
  limit: number
  hasNextPage: boolean
}
```

## 🎨 **Styling & UI Architecture**

### **CSS Architecture**
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Component library
- **CSS Variables** - Theme system
- **Responsive Design** - Mobile-first approach

### **Theme System**
```typescript
// Theme Configuration
const themes = {
  light: { primary: 'hsl(222.2 84% 4.9%)', ... },
  dark: { primary: 'hsl(210 40% 98%)', ... }
}

// Usage
className="bg-background text-foreground border-border"
```

## 🌐 **Internationalization (i18n)**

### **Translation Structure**
```
translations/
├── 📂 en/                     # English translations
│   ├── 📄 common.json         # Common terms
│   ├── 📄 dashboard.json      # Dashboard UI
│   ├── 📄 auth.json           # Authentication
│   └── 📄 jobs.json           # Job-related terms
└── 📂 bs/                     # Bosnian translations
    ├── 📄 common.json
    ├── 📄 dashboard.json
    ├── 📄 auth.json
    └── 📄 jobs.json
```

### **Usage Pattern**
```typescript
import { useTranslations } from 'next-intl'

const t = useTranslations('dashboard')
return <h1>{t('welcome')}</h1>
```

## 📱 **Mobile & Responsive Design**

### **Breakpoint Strategy**
- **Mobile First** - Base styles for mobile
- **Responsive Utilities** - `sm:`, `md:`, `lg:`, `xl:` prefixes
- **Adaptive Navigation** - Hamburger menu on mobile
- **Touch-Friendly** - Optimized for touch interactions

## 🔒 **Security & Authentication**

### **Security Layers**
1. **NextAuth.js v5** - Session management
2. **Middleware** - Route protection
3. **CSRF Protection** - Built-in token validation
4. **Rate Limiting** - API endpoint protection
5. **Input Validation** - Zod schema validation

### **Permission System**
```typescript
// Role Hierarchy
enum UserRole {
  TASKER = 'tasker',     # Can apply to jobs
  CLIENT = 'client',     # Can post jobs
  COMPANY = 'company',   # Enterprise client
  ADMIN = 'admin'        # System administrator
}
```

## 📊 **Performance Optimizations**

### **Data Fetching**
- **TanStack Query** - Intelligent caching & background updates
- **Static Data** - Optimized JSON files for reference data
- **Incremental Static Regeneration** - For job listings
- **Prefetching** - Critical route prefetching

### **Bundle Optimization**
- **Code Splitting** - Route-based splitting
- **Tree Shaking** - Unused code elimination
- **Image Optimization** - Next.js image component
- **Font Optimization** - Google Fonts optimization

## 🚀 **Deployment & Infrastructure**

### **Deployment Stack**
- **Vercel** - Frontend hosting & serverless functions
- **Supabase** - PostgreSQL database & real-time features
- **Stripe** - Payment processing
- **Resend** - Email services

### **Environment Configuration**
```
NEXTAUTH_SECRET=xxx
DATABASE_URL=xxx
NEXT_PUBLIC_SUPABASE_URL=xxx
STRIPE_SECRET_KEY=xxx
RESEND_API_KEY=xxx
```

## 🔮 **Future Architecture Considerations**

### **Planned Enhancements**
1. **Real-time Features** - Supabase real-time subscriptions
2. **Advanced Caching** - Redis for session storage
3. **Microservices** - Separate messaging service
4. **AI Integration** - Job matching algorithms
5. **Mobile App** - React Native companion

### **Scalability Patterns**
- **Database Optimization** - Query optimization & indexing
- **CDN Integration** - Static asset delivery
- **Caching Layers** - Multi-level caching strategy
- **API Rate Limiting** - Advanced rate limiting
- **Monitoring** - Application performance monitoring

---

## 📈 **Key Metrics & KPIs**

### **Technical Metrics**
- **Core Web Vitals** - Performance monitoring
- **Bundle Size** - JavaScript bundle optimization
- **API Response Times** - Endpoint performance
- **Error Rates** - Application stability

### **Business Metrics**
- **User Registration** - Onboarding funnel
- **Job Post Success** - Employer satisfaction
- **Application Conversion** - Job seeker success
- **Revenue Metrics** - Connection sales

---

This comprehensive map provides a complete view of the MojPoslic codebase architecture, showing how all components, data flows, and systems interconnect to create a robust job marketplace platform.
