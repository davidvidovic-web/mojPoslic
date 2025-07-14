'use client'

export default function IntegrationsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Integrations
          </h1>
          <p className="text-muted-foreground mt-2">
            Connect with external tools and services to enhance your workflow.
          </p>
        </div>

        {/* Coming Soon Message */}
        <div className="text-center py-16">
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-20 h-20 mx-auto rounded-full bg-secondary flex items-center justify-center">
              <svg className="h-10 w-10 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 11.172V5l-1-1z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold">Integrations Coming Soon</h3>
            <p className="text-muted-foreground leading-relaxed">
              We're working on integrations with popular tools and services to streamline your workflow. Stay tuned for updates!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
