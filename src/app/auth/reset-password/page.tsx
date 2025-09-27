import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

export default async function ResetPasswordRedirect() {
  // Get the locale from headers or default to 'bs'
  const headersList = await headers()
  const acceptLanguage = headersList.get('accept-language') || ''
  const isEnglish = acceptLanguage.toLowerCase().includes('en')
  const locale = isEnglish ? 'en' : 'bs'
  
  // Redirect to the localized version
  redirect(`/${locale}/auth/reset-password`)
}
