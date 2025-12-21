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
      domain: 'mojposlic.com', // Main domain - Bosnian
      defaultLocale: 'bs',
      locales: ['bs']
    },
    {
      domain: 'en.mojposlic.com', // English subdomain
      defaultLocale: 'en', 
      locales: ['en']
    }
  ]
});
