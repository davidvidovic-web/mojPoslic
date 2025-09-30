'use client'

import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ThemeProvider } from "next-themes"
import { SupabaseAuthProvider } from "@/contexts/supabase-auth-context"
import { Toaster } from "sonner"
import { queryClient } from '@/lib/query-client'
import { GlobalDialogs } from '@/components/global-dialogs'
import { JobDetailsDrawer } from '@/components/jobs/job-details-drawer'
import { useJobDetailsDrawer } from '@/hooks/use-job-details-drawer'

interface ProvidersProps {
  children: React.ReactNode
}

function JobDetailsDrawerProvider() {
  const { isOpen, jobId, closeDrawer } = useJobDetailsDrawer()
  
  return (
    <JobDetailsDrawer
      jobId={jobId || ''}
      isOpen={isOpen}
      onClose={closeDrawer}
    />
  )
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <SupabaseAuthProvider>
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
            <GlobalDialogs />
            <JobDetailsDrawerProvider />
          </div>
        </SupabaseAuthProvider>
      </ThemeProvider>
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  )
}
