# mojPoslić - Modern Job Board Platform v0.1.1

[![Next.js](https://img.shields.io/badge/Next.js-15.3.4-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.12.0-2D3748?style=flat&logo=prisma)](https://www.prisma.io/)
[![NextAuth](https://img.shields.io/badge/NextAuth-5.0.0--beta.29-purple?style=flat)](https://next-auth.js.org/)
[![Vercel](https://img.shields.io/badge/Deployed-Vercel-black?style=flat&logo=vercel)](https://vercel.com/)

A modern, feature-rich job board platform specifically designed for Bosnia and Herzegovina, offering bilingual support and a comprehensive job marketplace experience.

## 🌟 Key Features

### 🚀 **Modern Technology Stack**
- **Next.js 15** with App Router and Edge Runtime support
- **TypeScript** for type-safe development
- **Tailwind CSS** + **shadcn/ui** for beautiful, responsive design
- **Prisma ORM** with PostgreSQL database
- **NextAuth v5** for secure authentication
- **Vercel deployment** with global CDN

### 🔐 **Advanced Authentication System**
- **Multiple Auth Providers**: Email/Password, Google, Facebook, Apple
- **Email Verification**: Secure registration with 6-digit verification codes
- **Cross-Domain Sessions**: Seamless authentication between language domains
- **Role-Based Access**: Tasker, Client, Company, and Admin roles
- **JWT Security**: 30-minute sessions with automatic refresh
- **Edge Runtime Compatible**: Fast authentication checks worldwide

### 🌍 **Bilingual Domain-Based Routing**
- **Primary Domain**: `mojposlic.com` (Bosnian - bs)
- **English Subdomain**: `en.mojposlic.com` (English - en)
- **No URL Prefixes**: Clean URLs without `/bs/` or `/en/` paths
- **Seamless Language Switching**: Maintains authentication across domains
- **Localized Content**: Complete translations for both languages

### 👥 **Multi-Role User System**

#### **Taskers** (Service Providers)
- Browse and apply for job opportunities
- Create detailed profiles showcasing skills
- Connection-based application system
- Real-time application status tracking

#### **Clients** (Job Posters)
- Post job listings with detailed requirements
- Manage applications and candidates
- Direct communication with applicants
- Flexible pricing and project management

#### **Companies** (Enterprise Users)
- Multiple job posting capabilities
- Team management features
- Advanced analytics and reporting
- Bulk operations and workflow automation

#### **Administrators**
- User management and moderation
- Connection system administration
- Platform analytics and monitoring
- Content management and oversight

### 💼 **Comprehensive Job Management**
- **Smart Job Listings**: Categorized with location and skill filters
- **Advanced Search**: Multi-criteria filtering and sorting
- **Application Tracking**: Real-time status updates
- **Connection System**: Fair usage limits for applications
- **Featured Jobs**: Premium listing promotion
- **Responsive Design**: Perfect on all device sizes

### 🏃‍♂️ **Performance & UX Optimizations**
- **6x Faster Role Selection**: Optimized from 5+ seconds to 800ms
- **Edge Runtime**: Global performance with Vercel Edge Network
- **Caching Strategy**: 30-minute TTL for static data
- **Lazy Loading**: Optimized bundle splitting
- **Mobile-First**: Responsive design for all screen sizes

---

## 🛠️ **Technical Architecture**

### **Frontend Architecture**
```
src/
├── app/                    # Next.js 15 App Router
│   ├── [locale]/          # Internationalized routes
│   ├── api/               # API endpoints
│   └── globals.css        # Global styles
├── components/             # Reusable UI components
│   ├── ui/                # shadcn/ui components
│   ├── auth/              # Authentication components
│   └── job/               # Job-related components
├── contexts/              # React contexts for state
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions
├── stores/                # Zustand state stores
└── types/                 # TypeScript type definitions
```

### **Authentication Flow**
```mermaid
graph TD
    A[User Registration] --> B[Email Verification]
    B --> C[Auto-Login]
    C --> D[Role Selection]
    D --> E[Profile Setup]
    E --> F[Dashboard Access]
    F --> G[Full Platform Access]
```

### **Database Schema Highlights**
```sql
-- Core Tables
users                 -- User accounts with optional roles
pending_registrations -- Email verification queue
jobs                  -- Job postings with full metadata
applications          -- Job application tracking
connections           -- User connection/credit system
categories            -- Job categories (cached)
cities                -- Location data (cached)
```

---

## 🚀 **Getting Started**

### **Prerequisites**
- Node.js 18.17 or later
- PostgreSQL database
- Git

### **Environment Setup**
```bash
# Clone the repository
git clone https://github.com/davidvidovic-web/mojPoslic.git
cd mojPoslic

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration
```

### **Required Environment Variables**
```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/mojposlic"

# NextAuth Configuration
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# OAuth Providers (optional)
AUTH_GOOGLE_ID="your-google-client-id"
AUTH_GOOGLE_SECRET="your-google-client-secret"
AUTH_FACEBOOK_ID="your-facebook-app-id"
AUTH_FACEBOOK_SECRET="your-facebook-app-secret"
AUTH_APPLE_ID="your-apple-service-id"
AUTH_APPLE_SECRET="your-apple-private-key"

# Email Service
RESEND_API_KEY="your-resend-api-key"
```

### **Database Setup**
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Optional: Run migrations
npx prisma migrate deploy
```

### **Development**
```bash
# Start development server
npm run dev

# Open in browser
# Bosnian: http://localhost:3000
# English: http://en.localhost:3000
```

### **Production Build**
```bash
# Build for production
npm run build

# Start production server
npm start
```

---

## 🌟 **Feature Highlights**

### **🔥 Recently Completed (v0.1.1)**
- ✅ **Authentication System**: Complete end-to-end authentication with JWT
- ✅ **Infinite Redirect Fix**: Resolved all redirect loop issues
- ✅ **Performance Optimization**: 6x faster role selection process
- ✅ **Cross-Domain Auth**: Seamless language switching between domains
- ✅ **Edge Runtime**: Full compatibility with Vercel Edge Runtime
- ✅ **Production Ready**: Comprehensive cleanup and optimization

### **🎯 User Experience**
- **Streamlined Onboarding**: Role selection → Profile setup → Dashboard (< 2 minutes)
- **Instant Feedback**: Real-time success notifications and progress indicators
- **Mobile Optimized**: Touch-friendly interface with responsive design
- **Fast Loading**: Optimized performance with lazy loading and caching
- **Error Handling**: User-friendly error messages and graceful fallbacks

### **🔐 Security Features**
- **Secure Authentication**: Industry-standard JWT with NextAuth v5
- **Email Verification**: Required for account activation
- **CSRF Protection**: Built-in protection against cross-site attacks
- **Role-Based Access**: Server-side validation for all protected routes
- **Secure Cookies**: Production-ready cookie configuration

### **🌐 Internationalization**
- **Complete Translations**: All UI text available in Bosnian and English
- **Cultural Adaptation**: Localized date formats, currencies, and conventions
- **SEO Optimization**: Proper meta tags and structured data per language
- **Domain-Based Routing**: Professional domain structure for each language

---

## 📊 **System Status**

### **✅ Production Ready Features**
| Feature | Status | Performance | Notes |
|---------|--------|-------------|-------|
| Authentication | ✅ Complete | Excellent | JWT with 30min refresh |
| Role Management | ✅ Complete | Fast | Sub-second role selection |
| Job Listings | ✅ Complete | Good | Cached categories/cities |
| Applications | ✅ Complete | Good | Real-time status updates |
| Bilingual Support | ✅ Complete | Excellent | Domain-based routing |
| Mobile Experience | ✅ Complete | Good | Responsive design |
| Admin Panel | ✅ Complete | Good | Full user management |

### **🔧 Recent Performance Improvements**
- **Role Selection**: 83% faster (5000ms → 800ms)
- **Authentication**: Zero redirect loops
- **Page Load**: Optimized with lazy loading
- **API Response**: Edge Runtime global performance
- **Database**: Optimized queries with Prisma

### **🚀 Deployment Status**
- **Environment**: Production Ready
- **Build**: Optimized & Verified
- **Security**: Production Hardened
- **Performance**: Globally Optimized
- **Monitoring**: Comprehensive Logging

---

## 📚 **Documentation**

### **📋 Available Documentation**
- **[Critical Systems Info](./docs/CRITICAL-SYSTEMS-INFO.md)** - Essential system architecture
- **[Latest Changelog](./docs/changelog-2025-07-20.md)** - Recent changes and improvements
- **[Migration Guides](./docs/complete-migration-guide.md)** - Database and system migrations
- **[API Documentation](./docs/api-documentation.md)** - Endpoint specifications
- **[Deployment Guide](./docs/production-build-structure.md)** - Production deployment

### **🔧 Development Guides**
- **[State Management](./docs/state-management-analysis.md)** - Zustand + TanStack Query
- **[Authentication Setup](./docs/authentication-implementation.md)** - NextAuth v5 configuration
- **[Internationalization](./docs/domain-based-localization-setup.md)** - Bilingual setup
- **[Database Schema](./docs/database-to-json-migration-guide.md)** - Prisma setup

---

## 🤝 **Contributing**

### **Development Workflow**
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and test thoroughly
4. Commit with descriptive messages: `git commit -m 'Add amazing feature'`
5. Push to your branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

### **Code Standards**
- **TypeScript**: Strict type checking enabled
- **ESLint**: Next.js recommended configuration
- **Prettier**: Consistent code formatting
- **Testing**: Critical paths must be tested
- **Documentation**: Update docs for significant changes

### **Before Contributing**
- Read the **[Critical Systems Info](./docs/CRITICAL-SYSTEMS-INFO.md)** document
- Review recent **[changelogs](./docs/)** for context
- Test in development environment thoroughly
- Ensure all linting and type checks pass

---

## 🐛 **Issues & Support**

### **Reporting Issues**
- **GitHub Issues**: Use issue templates for bug reports and feature requests
- **Security Issues**: Email privately for security concerns
- **Documentation**: Improvements and corrections welcome

### **Getting Help**
1. Check the **[documentation](./docs/)** first
2. Search **existing issues** for similar problems
3. Review **[changelogs](./docs/)** for recent changes
4. Create a **detailed issue** if needed

---

## 📈 **Roadmap**

### **🔮 Upcoming Features (v0.2.0)**
- **Real-time Messaging**: Chat system between clients and taskers
- **Advanced Search**: AI-powered job matching
- **Payment Integration**: Stripe payment processing
- **Mobile App**: React Native mobile application
- **Analytics Dashboard**: Advanced reporting and insights

### **🚀 Future Enhancements**
- **API Rate Limiting**: Enhanced security measures
- **PWA Features**: Offline support and push notifications
- **Advanced Caching**: Redis caching layer
- **Microservices**: Scalable architecture evolution

---

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 **Acknowledgments**

- **Next.js Team** for the amazing framework
- **Vercel** for hosting and deployment platform
- **shadcn/ui** for beautiful component library
- **Prisma** for developer-friendly database toolkit
- **NextAuth** for comprehensive authentication

---

## 🔗 **Links**

- **Production Site**: [mojposlic.com](https://mojposlic.com) (Bosnian)
- **English Site**: [en.mojposlic.com](https://en.mojposlic.com)
- **GitHub Repository**: [mojPoslic](https://github.com/davidvidovic-web/mojPoslic)
- **Documentation**: [/docs](./docs/)
- **Issues**: [GitHub Issues](https://github.com/davidvidovic-web/mojPoslic/issues)

---

<div align="center">

**Built with ❤️ for the Bosnia and Herzegovina job market**

[🏠 Homepage](https://mojposlic.com) • [📧 Contact](mailto:contact@mojposlic.com) • [🐛 Report Bug](https://github.com/davidvidovic-web/mojPoslic/issues) • [💡 Request Feature](https://github.com/davidvidovic-web/mojPoslic/issues)

</div>
