import {defineRouting} from 'next-intl/routing';

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ['bs', 'en'],

  // Used when no locale matches - Bosnian is the main language
  defaultLocale: 'bs',

  // Always use domain-based routing (no path prefixes)
  localePrefix: 'never',

  // Enable locale detection for proper domain fallback
  localeDetection: true,

  // Domain-based routing configuration
  domains: [
    {
      domain: process.env.NODE_ENV === 'development' ? 'localhost:3000' : 'mojposlic.com', // Main domain - Bosnian
      defaultLocale: 'bs',
      locales: ['bs']
    },
    {
      domain: process.env.NODE_ENV === 'development' ? 'en.localhost:3000' : 'en.mojposlic.com', // English subdomain
      defaultLocale: 'en',
      locales: ['en']
    }
  ]
});
