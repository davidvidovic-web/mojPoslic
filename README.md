# mojPoslić - Modern Job Board App

A production-ready job board application built with Next.js 15, React 19, TypeScript, and TailwindCSS v3.

## ✨ Features

- 📋 Browse and search job listings with advanced filters
- 💼 Post job opportunities with rich text editor
- 🎨 Beautiful, responsive UI with shadcn/ui components and TailwindCSS v3
- 🔍 Real-time search with location and salary filtering
- 📍 Location-based job discovery with city extraction
- 💰 Salary range display and filtering
- 🔗 Direct application system with email integration
- 📱 Fully responsive mobile-first design
- 🔐 Complete authentication system with NextAuth v5
- 👤 User profiles with role-based access control
- 🏙️ Smart city-based job filtering
- 🌙 Dark/Light mode support with next-themes
- 👥 Three distinct user roles: Admin, Client, and Tasker
- 💳 Stripe integration for premium features
- 📧 Email verification and notifications with Resend
- 📊 Google Analytics integration
- 🔄 Connection-based application system

## 👥 User Roles

### 👤 Tasker (Job Seeker)
- Browse and search all job listings
- Apply to jobs via integrated application system
- Save jobs for later viewing
- Profile management and settings
- Email notifications for new opportunities

### 🏢 Client (Job Poster)
- All tasker features
- Post and manage job listings
- Access to client dashboard
- Manage applications and candidates
- Premium connection system for enhanced visibility

### 👑 Admin (Platform Manager)
- Full system access and oversight
- User management capabilities
- Platform analytics and reporting
- Content moderation tools
- System configuration

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript 5.8
- **Styling**: TailwindCSS v3 with CSS custom properties
- **UI Components**: shadcn/ui with Radix UI primitives
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth v5 with multiple OAuth providers
- **Payments**: Stripe integration for premium features
- **Email**: Resend for transactional emails
- **Analytics**: Google Analytics 4
- **Typography**: Inter font family from Google Fonts
- **Icons**: Lucide React icon library
- **Theme**: next-themes for dark/light mode switching
- **Notifications**: Sonner for toast notifications
- **Deployment**: Vercel-optimized for production

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Environment variables (see below)

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd mojposlic
npm install
```

### 2. Database Setup

1. Create a PostgreSQL database
2. Set up your `DATABASE_URL` in environment variables
3. Run Prisma migrations:

```bash
npm run db:push
npm run db:generate
```

### 3. Environment Variables

Create a `.env` file with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/mojposlic"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secure-secret-key"

# OAuth Providers
AUTH_GOOGLE_ID="your-google-client-id"
AUTH_GOOGLE_SECRET="your-google-client-secret"
AUTH_GITHUB_ID="your-github-client-id"  
AUTH_GITHUB_SECRET="your-github-client-secret"

# Stripe (for premium features)
STRIPE_SECRET_KEY="sk_test_your-stripe-secret-key"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_your-stripe-publishable-key"

# Email (optional - for notifications)
RESEND_API_KEY="re_your-resend-api-key"
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your job board!

## 📦 Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:push` - Push database schema changes
- `npm run db:generate` - Generate Prisma client

## 📖 Usage

### Authentication & User Management
- Navigate to `/login` to sign in or create an account
- Choose from Google or GitHub OAuth providers
- Complete profile setup by selecting account type (Tasker/Client/Company)
- User profiles are automatically created with role-based access

### Job Discovery (All Users)
- Browse all active job listings on the homepage
- Use the advanced search bar to find specific opportunities
- Filter by location, job type, salary range, and employment type
- Save interesting jobs for later review
- Apply directly through the integrated application system

### Job Posting (Clients & Admins)
- Sign in and click "Post a Job" in the header
- Use the multi-step job posting form with rich text editor
- Add company details, requirements, and application instructions
- Jobs go live immediately after posting
- Manage your job listings through the dashboard

### Connection System
- Premium feature for enhanced job visibility
- Purchase connections through secure Stripe integration
- Track connection usage in your dashboard
- Monthly refresh system for active users

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Ready for production"
   git push origin main
   ```

2. **Deploy to Vercel**:
   - Connect your GitHub repository to Vercel
   - Add all environment variables in Vercel dashboard
   - Deploy automatically on every push

3. **Environment Variables for Production**:
   ```env
   DATABASE_URL="your-production-database-url"
   NEXTAUTH_URL="https://your-app.vercel.app"
   NEXTAUTH_SECRET="your-production-secret"
   # ... add all other env vars
   ```

### Other Platforms

The app can be deployed to any platform supporting Next.js:

```bash
npm run build
npm start
```

## 🔐 Authentication System

**mojPoslić** uses NextAuth v5 for secure, modern authentication.

### Authentication Features:
- ✅ OAuth with Google and GitHub
- ✅ Secure session management with database storage
- ✅ Role-based access control (Admin/Client/Tasker)
- ✅ Profile setup flow for new users
- ✅ Password reset and email verification
- ✅ Middleware-based route protection

### User Flow:
1. **Sign In**: Choose OAuth provider on `/login`
2. **Profile Setup**: Complete account type selection
3. **Role Assignment**: Automatic role-based dashboard access
4. **Job Interaction**: Post jobs or apply based on role
5. **Dashboard Access**: Personalized experience by user type

## 🎨 Customization

### Theme Configuration
- Edit colors in `src/app/globals.css` using CSS custom properties
- TailwindCSS v3 configuration in `tailwind.config.js`
- Automatic dark/light mode with system preference detection

### Component Customization
- All UI components in `src/components/ui/` 
- Built with Radix UI primitives for accessibility
- Customizable with CSS variables and TailwindCSS classes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🔧 Production Optimization

For production deployment:

```bash
# Optimize Prisma for production
npx prisma generate --no-engine

# Build and start
npm run build
npm start
```

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

---

Built with ❤️ using Next.js, TailwindCSS v3, and modern web technologies.
