# Development Guidelines and Instructions

## 🚨 CRITICAL RULES - READ BEFORE ANY CHANGES

### API and Routes Policy
**⛔ DO NOT TOUCH API OR ROUTES WITHOUT EXPLICIT PERMISSION ⛔**

- **Never modify existing API routes** (`/src/app/api/**/*.ts`) without asking permission first
- **Never modify existing page routes** (`/src/app/[locale]/**/*.tsx`) without asking permission first
- **Only exception**: When building completely new features where the API/route doesn't exist yet
- **Always ask first** if you're unsure whether an API or route exists

### Safe Modification Areas
✅ **You CAN freely modify these without asking:**
- Components (`/src/components/**`) - **EXCEPT protected components listed below**
- Hooks (`/src/hooks/**`)
- Libraries (`/src/lib/**`)
- Types (`/src/types/**`)
- Translations (`/translations/**`)
- Static data files (`/public/cache/**`)
- Documentation (`/docs/**`)
- Configuration files (tailwind, typescript, etc.)

### 🔒 Protected Components (DO NOT MODIFY WITHOUT PERMISSION)
⛔ **These components are complete and stable - ask before modifying:**
- `/src/components/ui/skills-bubble-input.tsx` - Complete skills selection with 4 key features
  - Popular categories display (all parent categories)
  - Subcategories show when parent selected  
  - Cumulative subcategories from multiple parents
  - Custom skill input capability
  - Max 10 skills limit
  - Integrated with static data system
- `/src/components/dashboard/tasker-dashboard.tsx` - Main tasker dashboard with proper translations
- `/src/components/dashboard/tasker/tasker-quick-actions.tsx` - Quick actions (Learning Center removed)
- `/src/middleware.ts` - Authentication and routing middleware (recently fixed profile setup flow)

### When Building New Features
✅ **You CAN create new APIs/routes when:**
- The feature is completely new
- No existing API handles the functionality
- You're building from scratch

❌ **You CANNOT modify existing APIs/routes even for new features if:**
- There's already an API that handles similar functionality
- The route already exists but needs modification
- You're extending existing functionality

## 🏗️ Current Architecture Status

### Static Data System (COMPLETED)
- ✅ Cities and categories use static JSON files (`/public/cache/`)
- ✅ No database dependencies for reference data
- ✅ API routes (`/api/cities`, `/api/categories`) serve from cache files only
- ⚠️ **DO NOT modify these APIs** - they are working correctly

### Authentication System (STABLE)
- ✅ NextAuth.js implementation
- ✅ Complete redirect flow
- ✅ Email verification system
- ⚠️ **DO NOT modify auth routes** without permission

### Profile Setup System (STABLE)
- ✅ Role-based profile setup
- ✅ Skills bubble input with 4 key features
- ✅ Cities and categories integration
- ⚠️ **DO NOT modify profile setup API** without permission

## 🔧 Component Guidelines

### ✅ Skills Bubble Input Component (COMPLETE & PROTECTED)
- ✅ **FINALIZED**: All 4 key features implemented and working
  1. ✅ All parent categories display (not just popular ones)
  2. ✅ Subcategories show when parent categories are selected
  3. ✅ Cumulative subcategories from multiple parent selections
  4. ✅ Custom skill input capability with common tech skills
- ✅ **Max 10 skills limit** (changed from 20)
- ✅ **Only subcategories in search suggestions** (no parent categories)
- ✅ **Parent categories visible until max limit reached**
- ✅ Uses static data hooks only - no API calls
- ⛔ **DO NOT MODIFY** without explicit permission - component is complete

### Static Data Integration
```
Static JSON Files → Static Data Hooks → Components
/public/cache/ → /src/hooks/use-static-data.ts → UI Components
```

## 🚫 What NOT to Touch

### Critical Stable APIs
- `/src/app/api/cities/route.ts` - Static data serving
- `/src/app/api/categories/route.ts` - Static data serving  
- `/src/app/api/auth/**` - Authentication system
- `/src/app/api/users/**` - User management
- Any existing job-related APIs

### Critical Stable Routes
- `/src/app/[locale]/profile-setup/page.tsx` - Profile setup flow
- `/src/app/[locale]/dashboard/**` - Dashboard pages
- Authentication pages (login, register, etc.)

## 📝 Before Making Changes Checklist

1. **Is this an API or route modification?**
   - ❌ If YES → Ask permission first
   - ✅ If NO → Proceed with caution

2. **Is this a new feature?**
   - ✅ If completely new → You can create new APIs
   - ❌ If extending existing → Ask permission for API changes

3. **Are you unsure?**
   - 🤔 Always ask when in doubt
   - 📋 Better safe than breaking working functionality

## 🎯 Current Working Systems

### ✅ What's Working Well
- Static data system (cities/categories)
- Authentication and user registration
- Profile setup with skills selection
- Email verification system
- Translation system (English/Bosnian)
- Component library and UI system

### 🚧 Areas Under Development
- Job posting system
- Messaging system
- Payment integration
- Advanced filtering

## 🔄 Workflow Protocol

1. **Identify the change scope**
2. **Check if it involves APIs/routes**
3. **If YES → Ask permission**
4. **If NO → Proceed with testing**
5. **Always run TypeScript checks after changes**
6. **Verify translations if UI changes are made**

---

**Remember: When in doubt, ask first. It's better to confirm than to break working functionality.**

**Last Updated**: 2025-07-20
**Status**: Active Guidelines
