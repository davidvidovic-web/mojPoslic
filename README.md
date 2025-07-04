# mojPoslić - Simple Job Board App

A modern job board application built with Next.js, shadcn/ui, and PostgreSQL.

## Features

- 📋 Browse job listings with search and filters
- 💼 Post new job opportunities  
- 🎨 Beautiful, responsive UI with shadcn/ui components
- 🔍 Search jobs by title, company, or description
- 📍 Filter by location and job type
- 💰 Salary range display
- 🔗 Direct application links or email contact
- 📱 Mobile-friendly design
- 🔐 User authentication with email/password and social login (Google, Apple)
- 👤 User profiles with role-based access control
- 🏙️ City-based job filtering
- � Dark/Light mode support
- 👥 Three user types: Admin, Client, and Tasker

## User Roles

### 👤 Tasker (Default)
- Browse and search job listings
- Apply to jobs via external links or email
- View all public job information

### 🏢 Client
- All tasker features
- Post new job opportunities
- Manage job postings
- Access client dashboard

### 👑 Admin
- All client features
- Full system access
- User management capabilities
- Platform oversight

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI Components**: shadcn/ui with Radix UI primitives
- **Styling**: Tailwind CSS with custom theming
- **Typography**: Inter font family from Google Fonts
- **Icons**: Lucide React
- **Database**: PostgreSQL
- **Authentication**: Third-party authentication service (to be implemented)
- **Theme**: next-themes for dark/light mode
- **Notifications**: Sonner

## Getting Started

### Prerequisites

- Node.js 18+ 
- A PostgreSQL database

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd mojposlic
npm install
```

### 2. Set up the Database

1. Create a PostgreSQL database
2. In the database console, run the following SQL files in order:
   - `database/profiles.sql` - Creates user profiles and role system
   - `database/seed-data.sql` - Creates job listings schema and sample data
3. Configure your database connection string in the environment variables

### 3. Environment Variables

Copy the `.env.example` file to `.env.local` and update with your database credentials:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/mojposlic
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your job board!

## Database Schema

The app uses the following tables:

- `cities` - Cities where jobs are located
- `job_listings` - Job postings with company, location, salary, etc.
- `profiles` - User profiles linked to auth.users
- `job_applications` - Applications submitted by users
- `saved_jobs` - Jobs saved by users for later

See `MIGRATION.md` for detailed schema information and migration instructions.

## Usage

### Authentication
- Navigate to `/login` to sign in or create an account
- Use email/password or sign in with Google/Apple
- User profiles are automatically created on first login

### Viewing Jobs
- Browse all active job listings on the homepage
- Use the search bar to find specific jobs
- Filter by location and job type
- Click "Apply Now" to apply via external link or email

### Posting Jobs
- Sign in and click "Post a Job" in the header
- Fill out the job posting form with company details
- Jobs are immediately visible after posting

## Deployment

The app can be deployed to Vercel, Netlify, or any platform that supports Next.js:

```bash
npm run build
npm start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - feel free to use this project for personal or commercial purposes.

## 🔐 Authentication - **COMPLETED ✅**

**mojPoslić** now uses [Clerk](https://clerk.com/) for modern, secure authentication with Next.js App Router.

### **Authentication Features:**
- ✅ Sign up/Sign in with email and password
- ✅ Social authentication (configurable through Clerk dashboard)
- ✅ User profile management via Clerk's UserButton
- ✅ Secure session management
- ✅ Role-based access control integration
- ✅ Automatic user synchronization

### **Implementation Details:**
- **Provider**: Clerk (latest Next.js App Router integration)
- **Middleware**: `clerkMiddleware()` for route protection
- **Components**: `<SignInButton>`, `<SignUpButton>`, `<UserButton>`, `<SignedIn>`, `<SignedOut>`
- **Server Auth**: `auth()` from `@clerk/nextjs/server` for API routes
- **Client Auth**: `useUser()` hook integrated with custom auth context

### **User Flow:**
1. **Sign Up/Sign In**: Click buttons in header to authenticate via Clerk
2. **Profile Setup**: Complete account type selection (client/tasker/company)
3. **Job Posting**: Authenticated users can post jobs (free with connection system)
4. **Dashboard Access**: Role-based access to admin and user dashboards

**Environment Variables Required:**
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```
