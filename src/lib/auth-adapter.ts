// Server-only auth adapter configuration with username generation
export function getAuthAdapter() {
  if (typeof window !== "undefined") {
    return undefined
  }
  
  // Check if we're in edge runtime - return undefined if so
  if (process.env.NEXT_RUNTIME === 'edge') {
    return undefined
  }
  
  // Use dynamic import to prevent client-side bundling
  return (async () => {
    try {
      const { PrismaAdapter } = await import("@auth/prisma-adapter")
      const { prisma } = await import("@/lib/prisma")
      const { generateUniqueUsernameFromEmail } = await import("@/lib/username-validation")
      
      // Check if prisma is available
      if (!prisma) {
        return undefined
      }
      
      const adapter = PrismaAdapter(prisma)
    
      // Override the createUser method to generate username
      if (adapter.createUser) {
        adapter.createUser = async (user) => {
          // Generate unique username from email
          const username = await generateUniqueUsernameFromEmail(user.email!)
          
          // Create user with username directly in database
          const createdUser = await prisma.user.create({
            data: {
              id: user.id,
              name: user.name || '',
              email: user.email!,
              username,
              emailVerified: !!user.emailVerified,
              avatarUrl: user.image,
              role: 'client',
              profileSetupCompleted: false,
            }
          })
          
          return {
            id: createdUser.id,
            name: createdUser.name,
            email: createdUser.email,
            emailVerified: createdUser.emailVerified ? new Date() : null,
            image: createdUser.avatarUrl,
            role: createdUser.role,
          }
        }
      }
      
      return adapter
    } catch (error) {
      console.warn('Failed to create auth adapter:', error)
      return undefined
    }
  })()
}
