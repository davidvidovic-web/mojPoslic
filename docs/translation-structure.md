# Translation Structure Documentation

## Overview

The mojPoslić application now uses a modular translation system with separate files for each namespace, organized in the `translations/` folder instead of the previous `messages/` folder.

## Folder Structure

```
translations/
├── bs/                          # Bosnian translations
│   ├── auth.json               # Authentication & user management
│   ├── common.json             # Common UI elements & utilities
│   ├── dashboard.json          # Dashboard components & navigation
│   ├── errors.json             # Error messages & validation
│   ├── greetings.json          # Time-based greetings & salutations
│   ├── homepage.json           # Homepage content & features
│   ├── jobs.json               # Job-related functionality
│   ├── messaging.json          # Messaging system & conversations
│   ├── navigation.json         # Navigation & menu items
│   └── profile.json            # Profile setup & settings
└── en/                          # English translations
    ├── auth.json
    ├── common.json
    ├── dashboard.json
    ├── errors.json
    ├── greetings.json
    ├── homepage.json
    ├── jobs.json
    ├── messaging.json
    ├── navigation.json
    └── profile.json
```

## Translation Namespaces

### 1. `auth` - Authentication & User Management
- Login/register forms
- Password management
- Email verification
- Account setup
- Security features

### 2. `common` - Common UI Elements
- Buttons (save, cancel, delete, etc.)
- Status indicators (loading, success, error)
- Time formatting
- Form validation messages
- Empty states
- General messages

### 3. `dashboard` - Dashboard Components
- Dashboard navigation
- Statistics and metrics
- Quick actions
- Section titles
- Tab labels

### 4. `errors` - Error Handling
- API error messages
- Validation errors
- Authentication errors
- General error states

### 5. `greetings` - Time-based Greetings
- Morning/afternoon/evening/night greetings
- Welcome messages
- Seasonal greetings

### 6. `homepage` - Homepage Content
- Hero section
- Features
- How it works
- Call-to-action sections
- Site statistics

### 7. `jobs` - Job Management
- Job posting forms
- Job listings
- Job types and categories
- Application management
- Job statuses

### 8. `messaging` - Messaging System
- Conversation management
- Message composition
- Templates
- Notifications
- Status indicators

### 9. `navigation` - Navigation & Menus
- Main navigation items
- Breadcrumbs
- Menu toggles
- Tab navigation

### 10. `profile` - Profile & Settings
- Profile setup forms
- Account settings
- Personal information
- Preferences

## Usage in Components

Components can access translations using the `useTranslations` hook with the appropriate namespace:

```tsx
import { useTranslations } from 'next-intl';

const MyComponent = () => {
  const t = useTranslations('common');           // Common UI elements
  const tAuth = useTranslations('auth');         // Authentication
  const tJobs = useTranslations('jobs');         // Job-related
  const tDashboard = useTranslations('dashboard'); // Dashboard
  const tErrors = useTranslations('errors');     // Error messages
  const tGreetings = useTranslations('greetings'); // Greetings
  const tHomepage = useTranslations('homepage'); // Homepage
  const tMessaging = useTranslations('messaging'); // Messaging
  const tNavigation = useTranslations('navigation'); // Navigation
  const tProfile = useTranslations('profile');   // Profile

  return (
    <div>
      <h1>{tGreetings('morning')}</h1>
      <button>{t('buttons.save')}</button>
      <p>{tErrors('general.somethingWentWrong')}</p>
    </div>
  );
};
```

## Benefits of This Structure

1. **Modularity**: Each feature has its own translation file
2. **Maintainability**: Easier to find and update specific translations
3. **Scalability**: Easy to add new namespaces for new features
4. **Organization**: Clear separation of concerns
5. **Performance**: Only loads the translations needed for each component
6. **Collaboration**: Multiple developers can work on different translation files simultaneously

## Migration from Old Structure

The old structure used:
- `messages/bs.json` and `messages/en.json` (large monolithic files)
- `messages/bs/*.json` and `messages/en/*.json` (some modular files)

The new structure:
- Completely modular with `translations/bs/*.json` and `translations/en/*.json`
- No more large monolithic files
- Better organization and maintainability

## Adding New Translations

To add new translations:

1. **For existing namespaces**: Add keys to the appropriate file in both `translations/bs/` and `translations/en/`
2. **For new features**: Create new files like `translations/bs/newfeature.json` and `translations/en/newfeature.json`
3. **Update i18n config**: Add the new file to the loading logic in `src/i18n/request.ts`

## Validation

All translation files are validated for:
- Valid JSON syntax
- Consistent structure between languages
- Required keys present in both languages
- Proper nesting and organization 