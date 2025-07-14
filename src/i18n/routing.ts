import {defineRouting} from 'next-intl/routing';

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ['en', 'bs'],

  // Used when no locale matches - Bosnian is the main language
  defaultLocale: 'bs',

  // Disable path-based routing - use domain-based only
  localePrefix: 'never',

  // Domain-based routing configuration
  domains: [
    {
      domain: 'localhost:3000', // Main domain - Bosnian
      defaultLocale: 'bs',
      locales: ['bs']
    },
    {
      domain: 'en.localhost:3000', // English subdomain
      defaultLocale: 'en',
      locales: ['en']
    }
  ]
});
