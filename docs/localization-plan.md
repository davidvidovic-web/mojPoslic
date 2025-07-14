# mojPoslic App Localization Plan

## 1. Overview

This document outlines the localization strategy for the mojPoslic job platform, supporting Bosnian (BS) and English (EN) languages.

## 2. Supported Languages

- **Primary Language**: Bosnian (BS) - `bs`
- **Secondary Language**: English (EN) - `en`

## 3. Localization Framework

### 3.1 Technology Stack
- **Library**: `next-intl` (recommended for Next.js 14+ App Router)
- **File Format**: JSON for translation files
- **Fallback**: English as fallback language
- **Detection**: URL-based language detection (`/bs/` and `/en/` prefixes)

### 3.2 Folder Structure
```
src/
├── locales/
│   ├── bs/
│   │   ├── common.json
│   │   ├── auth.json
│   │   ├── dashboard.json
│   │   ├── jobs.json
│   │   ├── applications.json
│   │   ├── messaging.json
│   │   ├── profile.json
│   │   └── errors.json
│   ├── en/
│   │   ├── common.json
│   │   ├── auth.json
│   │   ├── dashboard.json
│   │   ├── jobs.json
│   │   ├── applications.json
│   │   ├── messaging.json
│   │   ├── profile.json
│   │   └── errors.json
│   └── index.ts
├── lib/
│   └── i18n.ts
└── middleware.ts (updated for i18n)
```

## 4. Translation Categories

### 4.1 Common (`common.json`)
- Navigation items
- Buttons (Save, Cancel, Submit, etc.)
- Loading states
- Success/error messages
- Form labels
- Time/date formats

### 4.2 Authentication (`auth.json`)
- Login/Register forms
- Email verification
- Password reset
- Role selection
- Account setup

### 4.3 Dashboard (`dashboard.json`)
- Dashboard sections
- Statistics labels
- Quick actions
- Greeting messages
- Tab names

### 4.4 Jobs (`jobs.json`)
- Job posting forms
- Job types
- Salary types
- Transportation options
- Job categories
- Location data
- Job statuses

### 4.5 Applications (`applications.json`)
- Application statuses
- Application forms
- Review processes
- Candidate information
- Interview scheduling

### 4.6 Messaging (`messaging.json`)
- Chat interface
- Message status
- Conversation types
- Notification messages

### 4.7 Profile (`profile.json`)
- Profile forms
- User roles
- Skills and experience
- Company information
- Settings

### 4.8 Errors (`errors.json`)
- Validation messages
- API error messages
- Not found pages
- Permission errors

## 5. Database Localization

### 5.1 Multi-language Fields
Database fields that require localization:

#### Cities Table
```sql
- name_bs (Bosnian name)
- name_en (English name)
```

#### Categories Table
```sql
- name_bs (Bosnian name)
- name_en (English name)
```

### 5.2 Dynamic Content
- Job descriptions (stored in user's preferred language)
- Company descriptions
- User bios
- Application messages

## 6. URL Structure

### 6.1 Routing Pattern
```
/bs/dashboard         - Bosnian dashboard
/en/dashboard         - English dashboard
/bs/jobs             - Bosnian jobs page
/en/jobs             - English jobs page
```

### 6.2 Default Language
- Default to Bosnian (`/bs/`) for local users
- Detect browser language for first-time visitors
- Allow manual language switching

## 7. Implementation Plan

### Phase 1: Setup Infrastructure
1. Install and configure `next-intl`
2. Set up folder structure
3. Configure middleware for language routing
4. Create base translation files

### Phase 2: Core Translations
1. Common UI elements
2. Navigation and layout
3. Authentication flows
4. Basic dashboard elements

### Phase 3: Feature-Specific Translations
1. Job posting and management
2. Application processes
3. Messaging system
4. Profile management

### Phase 4: Data Localization
1. Update database queries to use localized field names
2. Implement language-aware data fetching
3. Add language switcher component

## 8. Translation Keys Structure

### 8.1 Naming Convention
Use dot notation for nested keys:
```json
{
  "navigation": {
    "dashboard": "Dashboard",
    "jobs": "Jobs",
    "applications": "Applications"
  },
  "buttons": {
    "save": "Save",
    "cancel": "Cancel",
    "submit": "Submit"
  }
}
```

### 8.2 Pluralization
Support for plural forms:
```json
{
  "jobs": {
    "count": {
      "one": "{{count}} job",
      "other": "{{count}} jobs"
    }
  }
}
```

## 9. Language Switcher

### 9.1 Placement
- Header/navigation bar
- Footer (optional)
- Settings page

### 9.2 Design
- Flag icons + language code
- Dropdown or toggle format
- Persistent selection (localStorage)

## 10. SEO Considerations

### 10.1 Meta Tags
- Language-specific meta descriptions
- hreflang tags for search engines
- Translated page titles

### 10.2 Sitemap
- Separate sitemaps for each language
- Proper canonical URLs

## 11. Quality Assurance

### 11.1 Translation Review
- Native speaker review for Bosnian content
- Technical term consistency
- Cultural appropriateness

### 11.2 Testing
- Automated tests for missing translations
- Visual testing for text overflow
- RTL/LTR layout testing (if needed in future)

## 12. Content Guidelines

### 12.1 Bosnian Translations
- Use formal tone for professional contexts
- Maintain consistency with local job market terminology
- Consider regional variations (Bosnia, Herzegovina, Serbia, Croatia)

### 12.2 English Translations
- Use international English
- Professional, clear, and concise language
- Avoid colloquialisms

## 13. Performance Considerations

### 13.1 Bundle Optimization
- Load only required language bundles
- Lazy loading for non-critical translations
- Tree shaking for unused translations

### 13.2 Caching
- Static generation for translation files
- CDN caching for better performance
- Browser caching for translation data

## 14. Future Considerations

### 14.1 Additional Languages
- Croatian (HR)
- Serbian (SR)
- Montenegrin (ME)

### 14.2 Advanced Features
- Region-specific content
- Currency localization
- Number format localization
- Time zone handling

## 15. Implementation Checklist

- [ ] Install next-intl
- [ ] Configure middleware
- [ ] Create translation file structure
- [ ] Implement language routing
- [ ] Add language switcher
- [ ] Translate common components
- [ ] Translate authentication flows
- [ ] Translate dashboard
- [ ] Translate job management
- [ ] Translate application management
- [ ] Update database queries
- [ ] Add SEO meta tags
- [ ] Test all translations
- [ ] Review with native speakers

## 16. Maintenance

### 16.1 Adding New Translations
1. Add key to all language files
2. Test in both languages
3. Update type definitions if using TypeScript

### 16.2 Translation Updates
- Version control for translation changes
- Review process for content updates
- Automated checks for missing keys

---

This localization plan provides a comprehensive framework for implementing multi-language support in the mojPoslic application, ensuring a seamless experience for both Bosnian and English-speaking users.
