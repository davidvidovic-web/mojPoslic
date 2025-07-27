import { redirect } from 'next/navigation'

export default function AuthRegisterFallback() {
  // This should not be reached with proper i18n routing,
  // but serves as a fallback in case of routing issues
  redirect('/auth/register')
}
