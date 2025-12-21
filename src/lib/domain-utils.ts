import { headers } from 'next/headers';

/**
 * Get the appropriate base URL based on domain-based routing
 * Returns the correct domain for Bosnian or English content
 */
export async function getBaseUrl(): Promise<{ bs: string; en: string; current: string }> {
  const headersList = await headers();
  const host = headersList.get('host') || '';
  
  // Development environment
  if (process.env.NODE_ENV === 'development') {
    return {
      bs: 'http://localhost:3000',
      en: 'http://en.localhost:3000',
      current: host.includes('en.') ? 'http://en.localhost:3000' : 'http://localhost:3000'
    };
  }
  
  // Production environment
  const bsUrl = 'https://mojposlic.com';
  const enUrl = 'https://en.mojposlic.com';
  
  return {
    bs: bsUrl,
    en: enUrl,
    current: host.includes('en.mojposlic.com') ? enUrl : bsUrl
  };
}

/**
 * Get the current locale based on the domain
 */
export async function getCurrentLocale(): Promise<'bs' | 'en'> {
  const headersList = await headers();
  const host = headersList.get('host') || '';
  
  return host.includes('en.') ? 'en' : 'bs';
}

/**
 * Generate structured data URLs for the current domain
 */
export async function getStructuredDataUrls() {
  const { current } = await getBaseUrl();
  const locale = await getCurrentLocale();
  
  return {
    signin: `${current}/auth/signin`,
    register: `${current}/auth/register`, 
    dokumentacija: `${current}/dokumentacija`,
    podrska: `${current}/podrska`,
    search: `${current}/jobs?search={search_term_string}`,
    base: current,
    locale
  };
}

/**
 * Get domain-appropriate URL for a given locale (client-side)
 * For use in client components
 */
export function getClientDomainUrl(locale?: 'bs' | 'en'): string {
  if (typeof window === 'undefined') {
    throw new Error('getClientDomainUrl can only be used on client-side');
  }
  
  const currentOrigin = window.location.origin;
  
  // If no locale specified, return current origin
  if (!locale) {
    return currentOrigin;
  }
  
  // Development environment
  if (process.env.NODE_ENV === 'development') {
    if (locale === 'en') {
      return currentOrigin.includes('en.localhost') ? currentOrigin : 'http://en.localhost:3000';
    } else {
      return currentOrigin.includes('en.localhost') ? 'http://localhost:3000' : currentOrigin;
    }
  }
  
  // Production environment
  if (locale === 'en') {
    return 'https://en.mojposlic.com';
  } else {
    return 'https://mojposlic.com';
  }
}