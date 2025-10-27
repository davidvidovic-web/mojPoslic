# Debug Components

This directory contains temporary debugging components to help identify and fix client component issues.

## Client Component Error Debug

The error "Event handlers cannot be passed to Client Component props" typically occurs when:
1. A Server Component tries to pass an onClick handler to a Client Component
2. A component that should be a Client Component is missing the 'use client' directive
3. A component is importing a server-only function in a client component

### How to fix:
1. Add 'use client' directive to components that need interactivity
2. Move event handlers to Client Components
3. Use Server Actions for server-side functionality