# Vercel Deployment Guide

## Overview
This guide will help you deploy mojPoslić to Vercel with Prisma database integration and Auth.js authentication.

## Prerequisites
- Vercel account
- Database (PostgreSQL recommended)
- Google OAuth App (optional)
- GitHub OAuth App (optional)

## 1. Database Setup

### Option A: Vercel Postgres (Recommended)
1. Go to your Vercel dashboard
2. Create a new project or select existing
3. Go to "Storage" tab
4. Create a "Postgres" database
5. Copy the `DATABASE_URL` from the connection details

### Option B: External Database (Neon, PlanetScale, etc.)
1. Create a PostgreSQL database on your preferred provider
2. Get the connection string

## 2. Prisma Setup

### Update Database Schema
```bash
# Push schema to database
npx prisma db push

# Generate Prisma client
npx prisma generate
```

### Verify Tables
Your database should have these tables:
- `User` - User profiles and roles
- `Account` - OAuth provider accounts  
- `Session` - User sessions
- `VerificationToken` - Email verification
- `JobListing` - Job posts
- `Application` - Job applications
- Plus other app-specific tables

## 3. OAuth Setup (Required for Authentication)

### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Set application type to "Web application"
6. Add authorized redirect URIs:
   - `http://localhost:3001/api/auth/callback/google` (development)
   - `https://your-domain.vercel.app/api/auth/callback/google` (production)
7. Copy Client ID and Client Secret

### GitHub OAuth
1. Go to [GitHub Settings](https://github.com/settings/applications/new)
2. Create a "New OAuth App"
3. Set Authorization callback URL:
   - `http://localhost:3001/api/auth/callback/github` (development)
   - `https://your-domain.vercel.app/api/auth/callback/github` (production)
4. Copy Client ID and Client Secret

## 4. Environment Variables

### Required Variables
Set these in Vercel dashboard under "Settings" → "Environment Variables":

```bash
# Database
DATABASE_URL="your-postgres-connection-string"

# Auth.js (Required)
NEXTAUTH_URL="https://your-domain.vercel.app"
NEXTAUTH_SECRET="generate-a-secure-32-character-random-string"

# OAuth Providers (At least one required)
AUTH_GOOGLE_ID="your-google-client-id"
AUTH_GOOGLE_SECRET="your-google-client-secret"
AUTH_GITHUB_ID="your-github-client-id"
AUTH_GITHUB_SECRET="your-github-client-secret"

# Email (Optional - for notifications)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASSWORD="your-app-password"
EMAIL_FROM="your-email@gmail.com"
EMAIL_FROM_NAME="mojPoslić"

# Stripe (Optional - for premium features)
STRIPE_SECRET_KEY="sk_live_your_stripe_secret_key"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_your_stripe_publishable_key"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"

# Cron Jobs (Optional)
CRON_API_KEY="your-secure-cron-api-key"
```

### Generate NEXTAUTH_SECRET
```bash
# Use this command to generate a secure secret
openssl rand -base64 32
```

## 5. Vercel Deployment

### Method 1: GitHub Integration (Recommended)
1. Push code to GitHub repository
2. Connect repository to Vercel
3. Vercel will auto-deploy on push

### Method 2: Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production deployment
vercel --prod
```

## 6. Post-Deployment Setup

### Database Migration
After first deployment, run:
```bash
# From Vercel dashboard or CLI
npx prisma db push
```

### Test Authentication
1. Visit your deployed site
2. Click "Sign In" 
3. Test OAuth providers
4. Verify user creation in database

### Admin User Setup
Create an admin user by updating the database directly:
```sql
UPDATE "User" SET role = 'admin' WHERE email = 'your-email@example.com';
```

## 7. Domain Configuration

### Custom Domain (Optional)
1. Go to Vercel project settings
2. Add your custom domain
3. Update OAuth redirect URLs to use custom domain
4. Update `NEXTAUTH_URL` environment variable

## 8. Monitoring & Debugging

### Vercel Functions
- Check function logs in Vercel dashboard
- Monitor performance in "Functions" tab
- Set up alerts for errors

### Database Monitoring
- Use Prisma Studio: `npx prisma studio`
- Monitor database performance
- Set up connection pooling if needed

## 9. Performance Optimizations for Vercel

### Prisma Connection Pooling
Already configured with `@prisma/extension-accelerate` for optimal Vercel performance.

### Serverless Function Optimization
- Functions have 30-second timeout
- Database connections are pooled
- Sessions use database storage for scalability

### Static Asset Optimization
- Images optimized with Next.js Image component
- CSS and JS automatically optimized
- CDN distribution via Vercel Edge Network

## 10. Security Checklist

- ✅ Strong `NEXTAUTH_SECRET` generated
- ✅ OAuth redirect URLs properly configured
- ✅ Database connection secured with SSL
- ✅ Environment variables set in Vercel (not in code)
- ✅ API routes protected with authentication
- ✅ Rate limiting configured (if needed)

## Troubleshooting

### Common Issues

**Auth not working:**
- Check `NEXTAUTH_URL` matches your domain
- Verify OAuth redirect URLs are correct
- Check environment variables are set

**Database connection failed:**
- Verify `DATABASE_URL` is correct
- Check if database allows connections from Vercel IPs
- Ensure Prisma schema is pushed

**Build failures:**
- Check TypeScript errors
- Verify all dependencies are installed
- Check Node.js version compatibility

### Support Resources
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Auth.js Documentation](https://authjs.dev/)
- [Prisma Vercel Guide](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)

## Summary

Your application is now optimized for Vercel deployment with:
- ✅ **No middleware required** - Auth.js handles everything via API routes
- ✅ **Database sessions** - Scalable with Prisma adapter
- ✅ **Serverless optimized** - Perfect for Vercel's function model
- ✅ **Production ready** - Security and performance configured

Ready to deploy! 🚀
