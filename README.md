# Poslić - Simple Job Board App

A modern job board application built with Next.js, shadcn/ui, and Supabase.

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
- 👥 Three user types: Admin, Employer, and Employee

## User Roles

### 👤 Employee (Default)
- Browse and search job listings
- Apply to jobs via external links or email
- View all public job information

### 🏢 Employer
- All employee features
- Post new job opportunities
- Manage job postings
- Access employer dashboard

### 👑 Admin
- All employer features
- Full system access
- User management capabilities
- Platform oversight

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI Components**: shadcn/ui with Radix UI primitives
- **Styling**: Tailwind CSS with custom theming
- **Typography**: Inter font family from Google Fonts
- **Icons**: Lucide React
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with OAuth (Google, Apple)
- **Theme**: next-themes for dark/light mode
- **Notifications**: Sonner

## Getting Started

### Prerequisites

- Node.js 18+ 
- A Supabase account and project

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd poslici
npm install
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and anon key
3. In the SQL Editor, run the following SQL files in order:
   - `database/profiles.sql` - Creates user profiles and role system
   - `seed-data.sql` - Creates job listings schema and sample data
4. Configure OAuth providers (optional):
   - Go to Authentication > Providers
   - Enable Google and/or Apple OAuth
   - Add your OAuth app credentials

### 3. Environment Variables

Copy the `.env.example` file to `.env.local` and update with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
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
