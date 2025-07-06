'use client'

import { ThemeProvider } from "next-themes"
import { SessionProvider } from "next-auth/react"
import { AuthProvider } from "@/contexts/auth-context"

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </ThemeProvider>
    </SessionProvider>
  )
}
