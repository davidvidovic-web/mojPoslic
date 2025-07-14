'use client'

import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { SessionProvider } from "next-auth/react"
import { ThemeProvider } from "next-themes"
import { AuthProvider } from "@/contexts/auth-context"
import { MessagingProvider } from "@/contexts/messaging-context"
import { Toaster } from "sonner"
import { queryClient } from '@/lib/query-client'

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          suppressHydrationWarning
        >
          <AuthProvider>
            <MessagingProvider>
              <div className="min-h-screen bg-background">
                <Toaster 
                  position="top-right" 
                  richColors={false}
                  closeButton
                  duration={4000}
                  theme="system"
                  toastOptions={{
                    style: {
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '500',
                    },
                    className: 'toast-custom',
                  }}
                />
                {children}
              </div>
            </MessagingProvider>
          </AuthProvider>
        </ThemeProvider>
      </SessionProvider>
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  )
}
