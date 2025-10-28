import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

export default async function ForgotPasswordRedirect() {
  // Get the host to determine locale based on domain
  const headersList = await headers()
  const host = headersList.get('host') || ''
  
  // Use domain-based locale detection
  const locale = host.startsWith('en.') ? 'en' : 'bs'
  
  // Redirect to the localized version
  redirect(`/${locale}/auth/forgot-password`)
}
