export async function authorizeCredentials(email: string, password: string) {
  if (typeof window !== "undefined") {
    throw new Error("This function can only be called on the server")
  }

  // Use dynamic imports to prevent client-side bundling
  const [{ prisma }, bcrypt] = await Promise.all([
    import("@/lib/prisma"),
    import("bcryptjs")
  ])

  // Handle special auto-login case after email verification
  if (password.startsWith('__VERIFIED_AUTO_LOGIN__')) {
    if (!prisma) {
      return null
    }

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

  if (!prisma) {
    return null
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

  // Check if email is verified for credential-based login
  if (!user.emailVerified) {
    throw new Error('Please verify your email before signing in')
  }

  const isPasswordValid = await bcrypt.compare(password, user.password)

  if (!isPasswordValid) {
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
