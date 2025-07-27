import {getRequestConfig} from 'next-intl/server';
import {routing} from './routing';

export default getRequestConfig(async ({requestLocale}) => {
  // For domain-based routing, the locale is determined by the domain
  // requestLocale will be determined by the middleware based on domain
  const locale = (await requestLocale) ?? routing.defaultLocale;

  // Load all translation files and merge them with proper namespaces
  let messages = {};
  
  // Helper function to load translation files silently
  const loadTranslation = async (namespace: string) => {
    try {
      const translationMessages = (await import(`../../translations/${locale}/${namespace}.json`)).default;
      messages = { ...messages, [namespace]: translationMessages };
    } catch {
      // Silently fail - translation file not found
    }
  };

  // Load all translation namespaces
  await loadTranslation('common');
  await loadTranslation('dashboard');
  await loadTranslation('jobs');
  await loadTranslation('jobPost');
  await loadTranslation('navigation');
  await loadTranslation('auth');
  await loadTranslation('messaging');
  await loadTranslation('profile');
  await loadTranslation('homepage');
  await loadTranslation('header');
  await loadTranslation('filters');
  await loadTranslation('notifications');
  await loadTranslation('jobCard');
  await loadTranslation('errors');
  await loadTranslation('greetings');
  await loadTranslation('jobApplication');
  await loadTranslation('settings');
  await loadTranslation('skills');
  await loadTranslation('roleSelection'); // Add this missing namespace
  await loadTranslation('admin');
  await loadTranslation('messageTemplates');
  await loadTranslation('theme');
  await loadTranslation('purchase');

  return {
    locale,
    messages,
    timeZone: 'Europe/Sarajevo',
    now: new Date()
  };
});
