import 'next-intl'

declare module 'next-intl' {
  interface Messages {
    common: typeof import('../translations/en/common.json')
    dashboard: typeof import('../translations/en/dashboard.json')
    jobs: typeof import('../translations/en/jobs.json')
    jobPost: typeof import('../translations/en/jobPost.json')
    navigation: typeof import('../translations/en/navigation.json')
    auth: typeof import('../translations/en/auth.json')
    messaging: typeof import('../translations/en/messaging.json')
    profile: typeof import('../translations/en/profile.json')
    homepage: typeof import('../translations/en/homepage.json')
    header: typeof import('../translations/en/header.json')
    filters: typeof import('../translations/en/filters.json')
    notifications: typeof import('../translations/en/notifications.json')
    jobCard: typeof import('../translations/en/jobCard.json')
    errors: typeof import('../translations/en/errors.json')
    greetings: typeof import('../translations/en/greetings.json')
    jobApplication: typeof import('../translations/en/jobApplication.json')
    settings: typeof import('../translations/en/settings.json')
    skills: typeof import('../translations/en/skills.json')
    roleSelection: typeof import('../translations/en/roleSelection.json')
    admin: typeof import('../translations/en/admin.json')
    messageTemplates: typeof import('../translations/en/messageTemplates.json')
    theme: typeof import('../translations/en/theme.json')
    purchase: typeof import('../translations/en/purchase.json')
  }
}
