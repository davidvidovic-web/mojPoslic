export async function authorizeCredentials(email: string, password: string) {
  if (typeof window !== "undefined") {
    throw new Error("This function can only be called on the server")
  }

  // Use dynamic imports to prevent client-side bundling
  const [{ PrismaClient }, bcrypt, { resendVerificationEmail }] = await Promise.all([
    import("@prisma/client"),
    import("bcryptjs"),
    import("@/lib/resend-verification")
  ])

  const prisma = new PrismaClient()

  try {
    // Handle special auto-login case after email verification
    if (password.startsWith('__VERIFIED_AUTO_LOGIN__')) {
      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          role: true,
          emailVerified: true,
          profileSetupCompleted: true,
        }
      })

      // Only allow auto-login if email is verified
      if (!user || !user.emailVerified) {
        return null
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        profileSetupCompleted: user.profileSetupCompleted,
      }
    }

    // Regular password-based authentication
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        password: true,
        role: true,
        emailVerified: true,
        profileSetupCompleted: true,
      }
    })

    if (!user || !user.password) {
      return null
    }

    // Verify password first
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return null
    }

    // Check if email is verified for credential-based login
    if (!user.emailVerified) {
      // Automatically resend verification email
      const resendResult = await resendVerificationEmail(email)
      
      if (resendResult.success) {
        throw new Error('EMAIL_NOT_VERIFIED_RESENT')
      } else {
        throw new Error('EMAIL_NOT_VERIFIED_FAILED_TO_RESEND')
      }
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role,
      profileSetupCompleted: user.profileSetupCompleted,
    }
  } finally {
    await prisma.$disconnect()
  }
}
