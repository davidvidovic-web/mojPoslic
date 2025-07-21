import { redirect } from 'next/navigation'

interface LoginPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams
  const returnUrl = params.returnUrl
  
  if (returnUrl && typeof returnUrl === 'string') {
    redirect(`/auth/signin?returnUrl=${encodeURIComponent(returnUrl)}`)
  } else {
    redirect('/auth/signin')
  }
}
