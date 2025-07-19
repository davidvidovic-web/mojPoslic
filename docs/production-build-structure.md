# Production Build Structure Guide - Updated July 19, 2025

## Overview
This document defines the clean, production-ready folder and file structure for mojPoslić based on the current codebase snapshot. Use this as a reference for future builds and deployment preparation.

## Root Directory Structure

```
mojPoslić/
├── .env                          # Production environment variables
├── .env.example                  # Environment template
├── .gitignore                    # Git ignore rules
├── components.json               # shadcn/ui configuration
├── eslint.config.mjs            # ESLint configuration
├── next-env.d.ts                # Next.js TypeScript declarations
├── next.config.ts               # Next.js configuration
├── package.json                 # Dependencies and scripts
├── package-lock.json            # Locked dependency versions
├── postcss.config.js            # PostCSS configuration
├── tailwind.config.js           # Tailwind CSS configuration
├── tsconfig.json                # TypeScript configuration
├── vercel.json                  # Deployment configuration
├── docs/                        # Documentation (see below)
├── prisma/                      # Database schema and migrations
├── public/                      # Static assets
├── src/                         # Application source code
├── supabase/                    # Supabase migrations
└── translations/                # Internationalization files
```

## Source Code Structure (`src/`)

### Application Routes (`src/app/`)
```
src/app/
├── layout.tsx                   # Root layout
├── middleware.ts                # Next.js middleware
├── [locale]/                    # Internationalized routes
│   ├── layout.tsx               # Locale-specific layout
│   ├── page.tsx                 # Homepage
│   ├── account-type/            # Account type selection
│   │   └── page.tsx
│   ├── admin/                   # Admin-only pages
│   │   └── packages/page.tsx
│   ├── auth/                    # Authentication pages
│   │   ├── register/page.tsx
│   │   ├── set-password/page.tsx
│   │   ├── signin/page.tsx
│   │   └── verify-email/page.tsx
│   ├── connections/             # Professional connections
│   │   └── page.tsx
│   ├── dashboard/               # User dashboards
│   │   ├── page.tsx             # Main dashboard
│   │   ├── applications/page.tsx
│   │   ├── connections/page.tsx
│   │   ├── jobs/page.tsx
│   │   ├── messages/page.tsx
│   │   └── overview/            # Dashboard overview
│   │       ├── page.tsx
│   │       ├── page-old.tsx     # Legacy version
│   │       └── page-redirect.tsx
│   ├── jobs/                    # Job listings and details
│   │   ├── page.tsx             # Job listings
│   │   └── [id]/                # Individual job pages
│   │       ├── page.tsx         # Job details
│   │       └── applications/page.tsx # Job applications
│   ├── login/page.tsx           # Login page
│   ├── messages/                # Messaging interface
│   │   ├── page.tsx             # Current messages
│   │   ├── page-new.tsx         # New implementation
│   │   └── page-old.tsx         # Legacy version
│   ├── profile-setup/           # Profile completion
│   │   ├── page.tsx             # Current setup
│   │   └── page-new.tsx         # New implementation
│   ├── role-selection/page.tsx  # Role selection
│   └── settings/page.tsx        # User settings
└── api/                         # API routes
    ├── admin/                   # Admin API endpoints
    │   ├── billing/
    │   │   ├── stats/route.ts
    │   │   └── transactions/route.ts
    │   ├── categories/route.ts
    │   ├── cities/route.ts
    │   ├── connection-history/route.ts
    │   ├── connections/route.ts
    │   ├── jobs/route.ts
    │   ├── stats/route.ts
    │   ├── types/route.ts
    │   └── users/route.ts
    ├── applications/            # Job application APIs
    │   └── [id]/
    │       ├── route.ts
    │       └── withdraw/route.ts
    ├── assignments/             # Task assignment APIs
    │   └── [id]/route.ts
    ├── auth/                    # Authentication APIs
    │   ├── [...nextauth]/route.ts
    │   ├── auto-login/route.ts
    │   ├── create-transfer-token/route.ts
    │   ├── register/route.ts
    │   ├── resend-verification/route.ts
    │   ├── session/route.ts
    │   ├── transfer/route.ts
    │   └── verify-email/route.ts
    ├── cache/                   # Cache management
    │   ├── cron/route.ts
    │   └── update/route.ts
    ├── categories/route.ts      # Category management
    ├── cities/route.ts          # City data APIs
    ├── client/                  # Client-specific APIs
    │   └── applications/route.ts
    ├── company/                 # Company APIs
    │   ├── jobs/route.ts
    │   └── stats/route.ts
    ├── geocode/route.ts         # Geocoding services
    ├── jobs/                    # Job management APIs
    │   ├── [id]/                # Individual job APIs
    │   │   ├── route.ts
    │   │   ├── applications/
    │   │   │   ├── route.ts
    │   │   │   ├── [applicationId]/route.ts
    │   │   │   ├── bulk/route.ts
    │   │   │   └── count/route.ts
    │   │   ├── apply/route.ts
    │   │   ├── assign/route.ts
    │   │   ├── feature/route.ts
    │   │   ├── shortlist/
    │   │   │   ├── route.ts
    │   │   │   └── [applicationId]/route.ts
    │   │   ├── status/route.ts
    │   │   └── view/route.ts
    │   ├── route.ts
    │   ├── applications/counts/route.ts
    │   ├── create/route.ts
    │   ├── data-transformers.ts
    │   ├── my-jobs/route.ts
    │   ├── recommended/route.ts
    │   ├── today-count/route.ts
    │   └── utils.ts
    ├── profile/setup/route.ts   # Profile APIs
    ├── search/                  # Search functionality
    │   ├── route.ts
    │   └── route-new.ts         # New implementation
    ├── stats/route.ts           # Statistics APIs
    ├── stripe/                  # Payment processing
    │   ├── checkout/route.ts
    │   └── webhook/route.ts
    ├── tasker/                  # Tasker-specific APIs
    │   └── applications/route.ts
    └── user/                    # User management APIs
        ├── applications/route.ts
        ├── change-password/route.ts
        ├── check-username/route.ts
        ├── complete-profile/route.ts
        ├── connections/
        │   ├── route.ts
        │   ├── history/route.ts
        │   ├── refresh/route.ts
        │   └── simple/route.ts
        ├── delete/route.ts
        ├── language-preference/route.ts
        ├── me/route.ts
        ├── profile/route.ts
        ├── profile-status/route.ts
        ├── role/route.ts
        └── saved-jobs/route.ts
```

### Components (`src/components/`)
```
src/components/
├── providers.tsx               # Main context providers
├── site-stats.tsx             # Site statistics component
├── job-card.tsx               # Main job listing card
├── job-card-skeleton.tsx      # Loading skeleton
├── job-card-list.tsx          # Job card list wrapper
├── job-list.tsx               # Job listing component
├── job-post-form.tsx          # Job posting form
├── unified-job-card.tsx       # Unified job card component
├── header.tsx                 # Legacy header
├── categories-filter.tsx      # Category filtering
├── auth/                      # Authentication components
│   ├── auth-form.tsx
│   ├── change-password-form.tsx
│   ├── password-strength-indicator.tsx
│   └── prisma-auth-form.tsx
├── common/                    # Common components
│   ├── connections-display.tsx
│   ├── language-switcher.tsx
│   ├── purchase-connections.tsx
│   └── site-stats.tsx
├── core/                      # Core UI components
│   ├── header.tsx             # Main navigation
│   ├── header-skeleton.tsx    # Header loading state
│   ├── dashboard-footer.tsx   # Dashboard footer
│   ├── language-switcher.tsx  # Language switching
│   ├── optimized-header.tsx   # Optimized header
│   ├── optimized-job-post-dialog.tsx
│   ├── optimized-notification-center.tsx
│   ├── providers.tsx          # Core providers
│   ├── theme-toggle-button.tsx
│   └── theme-toggle.tsx
├── dashboard/                 # Dashboard components
│   ├── admin-dashboard.tsx    # Admin dashboard
│   ├── client-dashboard.tsx   # Client dashboard
│   ├── company-dashboard.tsx  # Company dashboard
│   ├── company-dashboard-new.tsx
│   ├── tasker-dashboard.tsx   # Tasker dashboard
│   ├── unified-dashboard-header.tsx
│   ├── advanced-filters.tsx
│   ├── application-details-modal.tsx
│   ├── application-manager.tsx
│   ├── candidate-comparison-view.tsx
│   ├── client-application-manager.tsx
│   ├── client-jobs-list.tsx
│   ├── comprehensive-application-manager.tsx
│   ├── connections-section.tsx
│   ├── dashboard-application-manager.tsx
│   ├── dashboard-layout.tsx
│   ├── dashboard-navigation.tsx
│   ├── enhanced-application-dashboard.tsx
│   ├── interview-scheduling.tsx
│   ├── message-templates.tsx
│   ├── shortlist-manager.tsx
│   ├── admin/                 # Admin-specific components
│   │   ├── admin-stats-cards.tsx
│   │   ├── billing-management-tab.tsx
│   │   ├── connection-grant-history.tsx
│   │   ├── job-management-tab.tsx
│   │   ├── system-management-tab.tsx
│   │   └── user-management-tab.tsx
│   ├── client/                # Client-specific components
│   │   ├── client-quick-actions.tsx
│   │   ├── client-quick-stats.tsx
│   │   ├── dashboard-stats-cards.tsx
│   │   ├── finances-section.tsx
│   │   ├── job-applications-manager.tsx
│   │   ├── job-card-actions.tsx
│   │   ├── job-card.tsx
│   │   ├── jobs-list-section.tsx
│   │   ├── messages-section.tsx
│   │   └── unified-jobs-section.tsx
│   ├── company/               # Company-specific components
│   │   ├── applications-analytics-tabs.tsx
│   │   ├── client-quick-actions.tsx
│   │   ├── client-quick-stats.tsx
│   │   ├── company-finances-section.tsx
│   │   ├── company-messages-section.tsx
│   │   ├── company-quick-actions.tsx
│   │   ├── company-quick-stats.tsx
│   │   ├── company-stats-cards.tsx
│   │   ├── dashboard-header.tsx
│   │   ├── dashboard-stats-cards.tsx
│   │   ├── finances-section.tsx
│   │   ├── job-applications-manager.tsx
│   │   ├── job-card-actions.tsx
│   │   ├── job-card.tsx
│   │   ├── jobs-list-section.tsx
│   │   ├── jobs-management-tab.tsx
│   │   ├── messages-section.tsx
│   │   ├── overview-tab.tsx
│   │   └── unified-jobs-section.tsx
│   ├── connections/           # Connection-related components
│   │   ├── connection-activity.tsx
│   │   ├── connection-balance.tsx
│   │   ├── connection-costs.tsx
│   │   ├── connection-costs-simple.tsx
│   │   ├── connection-history-simple.tsx
│   │   ├── connection-refresh-button.tsx
│   │   ├── connections-badge.tsx
│   │   ├── connections-full-history.tsx
│   │   ├── connections-widget.tsx
│   │   ├── low-connections-warning.tsx
│   │   ├── monthly-refresh-info.tsx
│   │   └── purchase-connections-section.tsx
│   └── tasker/                # Tasker-specific components
│       ├── application-tracker.tsx
│       ├── applications-section.tsx
│       ├── applications-section-new.tsx
│       ├── applied-jobs-section.tsx
│       ├── client-quick-actions.tsx
│       ├── client-quick-stats.tsx
│       ├── dashboard-header.tsx
│       ├── dashboard-stats-cards.tsx
│       ├── finances-section.tsx
│       ├── job-applications-manager.tsx
│       ├── job-card-actions.tsx
│       ├── job-card.tsx
│       ├── jobs-list-section.tsx
│       ├── messages-section.tsx
│       ├── recommended-jobs-section.tsx
│       ├── saved-jobs-section.tsx
│       ├── shortlisted-jobs-section.tsx
│       ├── tasker-quick-actions.tsx
│       ├── tasker-quick-stats.tsx
│       ├── tasker-stats-cards.tsx
│       ├── tasker-stats-cards-new.tsx
│       └── unified-jobs-section.tsx
├── filters/                   # Filter components
│   ├── categories-filter.tsx
│   └── cities-filter.tsx
├── job-list/                  # Job list components
│   ├── job-filters.tsx
│   ├── jobs-empty-state.tsx
│   ├── jobs-pagination.tsx
│   └── jobs-view-controls.tsx
├── job-post-form/             # Job posting form components
│   ├── compensation-section.tsx
│   ├── contact-information-section.tsx
│   ├── job-post-form.tsx
│   ├── review-step.tsx
│   └── use-job-form-state.ts
├── jobs/                      # Job-related components
│   ├── google-job-location-map.tsx
│   ├── google-job-location-map-new.tsx
│   ├── job-application-form.tsx
│   ├── job-card.tsx
│   ├── job-card-list.tsx
│   ├── job-card-skeleton.tsx
│   ├── job-list.tsx
│   ├── job-post-form.tsx
│   ├── job-status-manager.tsx
│   ├── unified-job-card.tsx
│   ├── job/                   # Individual job components
│   │   ├── job-application-sidebar.tsx
│   │   ├── job-content.tsx
│   │   ├── job-details-sidebar.tsx
│   │   ├── job-header.tsx
│   │   ├── job-location.tsx
│   │   └── job-timeline.tsx
│   ├── job-list/              # Job listing components
│   │   ├── job-filters.tsx
│   │   ├── jobs-empty-state.tsx
│   │   ├── jobs-pagination.tsx
│   │   └── jobs-view-controls.tsx
│   └── job-post-form/         # Job posting form
│       ├── basic-details-step.tsx
│       ├── basic-info-step.tsx
│       ├── basic-information-section.tsx
│       ├── compensation-section.tsx
│       ├── compensation-step.tsx
│       ├── contact-info-step.tsx
│       ├── contact-information-section.tsx
│       ├── contact-section.tsx
│       ├── description-section.tsx
│       ├── form-validation.ts
│       ├── index.ts
│       ├── job-cost-info.tsx
│       ├── job-details-section.tsx
│       ├── job-details-step.tsx
│       ├── job-edit-form.tsx
│       ├── job-form-base.tsx
│       ├── job-post-form.tsx
│       ├── location-compensation-step.tsx
│       ├── location-schedule-step.tsx
│       ├── location-section.tsx
│       ├── location-transportation-compensation-step.tsx
│       ├── multi-step-job-form.tsx
│       ├── payment-utils.ts
│       ├── review-step.tsx
│       ├── salary-section.tsx
│       ├── schedule-section.tsx
│       ├── step-indicator.tsx
│       ├── transportation-section.tsx
│       ├── types.ts
│       ├── use-job-form-navigation.ts
│       └── use-job-form-state.ts
├── messaging/                 # Messaging system
│   ├── conversation-list.tsx
│   ├── conversation-view.tsx
│   ├── index.ts
│   ├── message-area.tsx
│   ├── message-bubble.tsx
│   ├── message-input.tsx
│   └── messaging-integration.tsx
├── profile/                   # User profile components
│   ├── location-display.tsx
│   └── skills-display.tsx
├── providers/                 # Context providers
│   └── gsap-provider.tsx
├── settings/                  # Settings components
│   ├── account-info-card.tsx
│   ├── appearance-card.tsx
│   ├── help-support-card.tsx
│   ├── profile-settings-card.tsx
│   └── security-card.tsx
└── ui/                        # Reusable UI components
    ├── alert.tsx
    ├── animated-button.tsx
    ├── animated-card.tsx
    ├── animated-gradient-text.tsx
    ├── animated-hamburger.tsx
    ├── animated-page.tsx
    ├── application-status-badge.tsx
    ├── avatar.tsx
    ├── badge.tsx
    ├── button.tsx
    ├── calendar.tsx
    ├── card.tsx
    ├── checkbox.tsx
    ├── code-input.tsx
    ├── collapsible.tsx
    ├── date-picker.tsx
    ├── date-time-picker.tsx
    ├── dialog.tsx
    ├── dropdown-menu.tsx
    ├── duration-picker.tsx
    ├── form.tsx
    ├── google-maps-wrapper.tsx
    ├── input.tsx
    ├── label.tsx
    ├── location-picker.tsx
    ├── location-picker-new.tsx
    ├── notification-center.tsx
    ├── optimized-google-map.tsx
    ├── pagination.tsx
    ├── password-requirements.tsx
    ├── popover.tsx
    ├── progress.tsx
    ├── radio-group.tsx
    ├── rich-text-editor.tsx
    ├── scroll-area.tsx
    ├── select.tsx
    ├── separator.tsx
    ├── simple-rich-text-editor.tsx
    ├── skeleton.tsx
    ├── skills-bubble-input.tsx
    ├── slider.tsx
    ├── switch.tsx
    ├── tabs.tsx
    ├── textarea.tsx
    ├── time-picker.tsx
    └── username-input.tsx
```

### Business Logic (`src/lib/`)
```
src/lib/
├── auth.ts                    # Authentication logic
├── auth-adapter.ts            # Auth adapter configuration
├── auth-credentials.ts        # Credential handling
├── auth-error-handler.ts      # Auth error management
├── cache-manager.ts           # Cache management
├── cache-utils.ts             # Cache utilities
├── city-coordinates.ts        # Geographic data
├── cleanup-transfer.ts        # Data cleanup utilities
├── email.ts                   # Email services
├── geocode-cache.ts           # Geocoding cache
├── geolocation.ts             # Location services
├── google-maps-loader.ts      # Google Maps integration
├── gsap-animations.ts         # Animation utilities
├── job-helpers.ts             # Job utility functions
├── job-utils.ts               # Job processing utilities
├── language-middleware.ts     # Language handling
├── localized-greetings.ts     # Localized greeting messages
├── location-format.ts         # Location formatting
├── location-utils.ts          # Location utilities
├── monthly-refresh.ts         # Monthly data refresh
├── password-validation.ts     # Password validation logic
├── prisma.ts                  # Database client
├── profile-format.ts          # Profile formatting
├── query-client.ts            # React Query setup
├── role-utils.ts              # Role management utilities
├── static-data.ts             # Static data management
├── static-data-types.ts       # Static data type definitions
├── stripe.ts                  # Payment processing
├── toast.ts                   # Notification system
├── username-validation.ts     # Username validation
├── utils.ts                   # General utility functions
├── connections/               # Connection management
│   ├── database.ts            # Connection database operations
│   ├── index.ts               # Connection exports
│   ├── types.ts               # Connection types
│   └── utils.ts               # Connection utilities
├── location/                  # Location services
│   ├── character-mapping.ts   # Character mapping utilities
│   ├── city-extraction.ts     # City extraction logic
│   ├── index.ts               # Location exports
│   ├── text-normalization.ts  # Text normalization
│   └── validation.ts          # Location validation
└── messaging/                 # Messaging services
    ├── conversation-service.ts # Conversation management
    ├── file-upload-service.ts  # File upload handling
    ├── message-service.ts      # Message operations
    ├── messaging-utils.ts      # Messaging utilities
    ├── realtime-service.ts     # Real-time messaging
    └── supabase.ts             # Supabase integration
```

### Type Definitions (`src/types/`)
```
src/types/
├── application.ts             # Application types
├── job.ts                     # Job types
├── messaging.ts               # Message types
└── user.ts                    # User types
```

### State Management (`src/stores/`)
```
src/stores/
├── dialog-store.ts            # Dialog state management
├── filter-store.ts            # Filter state management
├── form-state-store.ts        # Form state management
├── navigation-store.ts        # Navigation state
├── notification-store.ts      # Notification state
└── ui-preferences-store.ts    # UI preferences state
```

### Context Providers (`src/contexts/`)
```
src/contexts/
├── auth-context.tsx           # Authentication context
├── data-context.tsx           # Data context
├── jobs-context.tsx           # Jobs context
├── messaging-context.tsx      # Messaging context
└── prisma-auth-context.tsx    # Prisma auth context
```

### Custom Hooks (`src/hooks/`)
```
src/hooks/
├── use-admin.ts               # Admin hooks
├── use-applications.ts        # Application hooks
├── use-data.ts                # Data hooks
├── use-geolocation.ts         # Location hooks
├── use-job-applications.ts    # Job application hooks
├── use-jobs.ts                # Job hooks
├── use-messaging.ts           # Messaging hooks
├── use-static-data.ts         # Static data hooks
├── use-translations.ts        # Translation hooks
├── useAuth.ts                 # Authentication hook
├── useAuthTransfer.ts         # Auth transfer hook
├── useHamburgerAnimation.ts   # Animation hooks
└── useLanguagePreference.ts   # Language preference hook
```

### Internationalization (`src/i18n/`)
```
src/i18n/
├── navigation.ts              # Navigation i18n
├── request.ts                 # Request handling
└── routing.ts                 # Routing configuration
```

## Database Structure (`prisma/`)
```
prisma/
├── schema.prisma              # Database schema
└── migrations/                # Database migrations
    ├── migration_lock.toml    # Migration lock file
    ├── 20250705230938_init/   # Initial migration
    ├── 20250705231418_fix_verification_tokens_replica_identity/
    ├── 20250705233504_add_saved_jobs/
    ├── 20250717200706_add_user_language_preference/
    ├── 20250719142604_add_negotiable_salary_type/
    ├── 20250719143410_remove_city_category_foreign_keys/
    └── fix_verification_tokens_replica_identity/
```

## Static Assets (`public/`)
```
public/
└── cache/                     # Cached static data
    ├── categories.json        # Category data
    ├── cities.json            # City data
    └── metadata.json          # Cache metadata
```

## Documentation (`docs/`)
```
docs/
├── README.md                                              # Documentation index
├── production-build-structure.md                         # This file
├── production-cleanup-2025-07-19.md                      # Cleanup documentation
├── application-management-implementation.md              # Implementation guides
├── caveats-and-attention-points.md                       
├── complete-migration-guide.md                           
├── complete-styling-consistency-update-2025-01-07.md     
├── database-to-json-migration-guide.md                   
├── database-to-json-migration-implementation.md          
├── domain-based-localization-setup.md                    
├── final-theme-consistency-fixes-2025-01-07.md           
├── google-maps-setup.md                                  
├── job-application-system-implementation-guide.md        
├── localization-audit-2025-07-14.md                      
├── localization-plan.md                                  
├── messaging-system-implementation-plan.md               
├── messaging-system-summary.md                           
├── mobile-auth-buttons-fix.md                            
├── state-management-analysis.md                          
├── state-management-upgrade-plan.md                      
├── tanstack-query-implementation.md                      
├── theme-implementation-audit-2025-01-07.md              
├── toast-notification-styling-update-2025-01-07.md       
├── translation-structure.md                              
├── zustand-store-patterns.md                             
├── CHANGELOG-ARCHITECTURE.md                             # Architecture changes
├── MIGRATION-PROGRESS.md                                 # Migration tracking
├── URGENT-MIGRATION-PLAN.md                              # Urgent migration tasks
└── changelog-*.md                                        # Detailed changelogs
    ├── changelog-2025-01-14.md
    ├── changelog-2025-01-15.md
    ├── changelog-2025-07-06.md
    ├── changelog-2025-07-07.md
    ├── changelog-2025-07-13.md
    └── changelog-2025-07-19.md
```

## Internationalization Files
```
translations/
├── bs/                        # Bosnian translations
│   ├── admin.json             # Admin interface
│   ├── auth.json              # Authentication
│   ├── common.json            # Common elements
│   ├── dashboard.json         # Dashboard
│   ├── errors.json            # Error messages
│   ├── filters.json           # Filter options
│   ├── greetings.json         # Greeting messages
│   ├── header.json            # Header navigation
│   ├── homepage.json          # Homepage content
│   ├── jobApplication.json    # Job application
│   ├── jobCard.json           # Job card display
│   ├── jobPost.json           # Job posting
│   ├── jobs.json              # Job listings
│   ├── messageTemplates.json  # Message templates
│   ├── messaging.json         # Messaging system
│   ├── navigation.json        # Navigation menus
│   ├── notifications.json     # Notifications
│   ├── profile.json           # User profiles
│   ├── settings.json          # Settings page
│   ├── skills.json            # Skills management
│   └── theme.json             # Theme settings
└── en/                        # English translations
    ├── admin.json
    ├── auth.json
    ├── common.json
    ├── dashboard.json
    ├── errors.json
    ├── filters.json
    ├── greetings.json
    ├── header.json
    ├── homepage.json
    ├── jobApplication.json
    ├── jobCard.json
    ├── jobPost.json
    ├── jobs.json
    ├── messageTemplates.json
    ├── messaging.json
    ├── navigation.json
    ├── notifications.json
    ├── profile.json
    ├── settings.json
    ├── skills.json
    └── theme.json
```

## Supabase Integration
```
supabase/
└── migrations/                # Supabase database migrations
```

## Configuration Files

### Essential Configuration
- **`.env`** - Production environment variables (sensitive)
- **`.env.example`** - Environment template (safe to commit)
- **`vercel.json`** - Deployment configuration
- **`next.config.ts`** - Next.js framework configuration
- **`tailwind.config.js`** - CSS framework configuration
- **`tsconfig.json`** - TypeScript compiler configuration
- **`eslint.config.mjs`** - Code linting rules
- **`postcss.config.js`** - CSS processing configuration
- **`components.json`** - UI component library configuration

### Package Management
- **`package.json`** - Project dependencies and scripts
- **`package-lock.json`** - Locked dependency versions

## Files That Should NEVER Exist in Production

### ❌ Development Artifacts
```
❌ .env.development
❌ .env.local
❌ .env.*.example (except .env.example)
❌ test-*.js
❌ check-*.js
❌ *.test.ts
❌ *.spec.ts
❌ tsconfig.tsbuildinfo
❌ *-new.tsx (development versions)
❌ *-old.tsx (legacy versions - review needed)
❌ page-redirect.tsx (redirect pages - review needed)
```

### ❌ Development Folders
```
❌ dev/
❌ tests/
❌ __tests__/
❌ .next/ (build cache)
❌ node_modules/ (managed by package manager)
```

### ❌ Debug and Test Pages
```
❌ src/app/[locale]/debug/
❌ src/app/api/debug/
❌ src/app/[locale]/test-*/
❌ src/components/*/examples.tsx
```

### ❌ Backup and Temporary Files
```
❌ *.backup
❌ *.old
❌ *.tmp
❌ *.new
❌ *~
❌ .DS_Store
```

## Build Process Checklist

### Pre-Build Cleanup
- [ ] Remove all development scripts
- [ ] Delete debug pages and API endpoints
- [ ] Clean environment files (keep only .env and .env.example)
- [ ] Remove build artifacts (.next/, tsconfig.tsbuildinfo)
- [ ] Delete temporary and backup files

### Build Verification
- [ ] Run `npm run lint` - no errors
- [ ] Run `npm run type-check` - no type errors
- [ ] Run `npm run build` - successful build
- [ ] Verify no 404s for removed pages
- [ ] Check all imports are valid

### Security Check
- [ ] No sensitive data in committed files
- [ ] No debug endpoints accessible
- [ ] Environment variables properly configured
- [ ] No development dependencies in production bundle

## Deployment Notes

### Vercel Deployment
- Builds automatically from this structure
- Uses `vercel.json` for configuration
- Environment variables set in Vercel dashboard
- Build command: `npm run build`
- Install command: `npm ci`

### Environment Variables Required
```
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
GOOGLE_MAPS_API_KEY=
```

## Maintenance Guidelines

### Regular Cleanup Tasks
1. **Monthly**: Review and remove unused components
2. **Before each release**: Run production cleanup checklist
3. **After major features**: Update this structure document
4. **Quarterly**: Review and optimize bundle size

### Code Organization Principles
- Group related functionality together
- Keep components close to their usage
- Maintain clear separation of concerns
- Use consistent naming conventions
- Document complex business logic

This structure ensures a clean, maintainable, and production-ready codebase that's optimized for performance and security.
