import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Facebook from "next-auth/providers/facebook"
import Apple from "next-auth/providers/apple"
import Credentials from "next-auth/providers/credentials"
import type { NextAuthConfig } from "next-auth"
import { authorizeCredentials } from "./auth-credentials"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email?: string | null
      name?: string | null
      image?: string | null
      phone?: string | null
      role?: string | null
      profileSetupCompleted?: boolean
    }
  }
  
  interface User {
    role?: string | null
    phone?: string | null
    profileSetupCompleted?: boolean
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string
    role?: string | null
    phone?: string | null
    profileSetupCompleted?: boolean
  }
}

// Configuration for NextAuth.js v5
const config: NextAuthConfig = {
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
  trustHost: true,
  
  // Configure cookies for cross-subdomain support
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' 
        ? '__Secure-next-auth.session-token' 
        : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        // Use .localhost for development, .mojposlic.com for production
        domain: process.env.NODE_ENV === 'development' 
          ? '.localhost'
          : '.mojposlic.com',
        secure: process.env.NODE_ENV === 'production',
      },
    },
    callbackUrl: {
      name: process.env.NODE_ENV === 'production' 
        ? '__Secure-next-auth.callback-url' 
        : 'next-auth.callback-url',
      options: {
        sameSite: 'lax',
        path: '/',
        domain: process.env.NODE_ENV === 'development' 
          ? '.localhost'
          : '.mojposlic.com',
        secure: process.env.NODE_ENV === 'production',
      },
    },
    csrfToken: {
      name: process.env.NODE_ENV === 'production' 
        ? '__Host-next-auth.csrf-token' 
        : 'next-auth.csrf-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Facebook({
      clientId: process.env.AUTH_FACEBOOK_ID,
      clientSecret: process.env.AUTH_FACEBOOK_SECRET,
    }),
    Apple({
      clientId: process.env.AUTH_APPLE_ID,
      clientSecret: process.env.AUTH_APPLE_SECRET,
    }),
    Credentials({
      id: "credentials",
      name: "Email and Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        return await authorizeCredentials(
          credentials.email as string,
          credentials.password as string
        )
      }
    }),
  ],
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 60, // 30 minutes (shorter for faster token refresh)
  },
  jwt: {
    maxAge: 30 * 60, // 30 minutes 
  },
  callbacks: {
    async jwt({ token, user }) {
      // If user object is provided (during sign-in), update token
      if (user) {
        console.log('JWT Callback: Initial token setup with user:', {
          id: user.id,
          role: user.role,
          profileSetupCompleted: user.profileSetupCompleted
        })
        token.role = user.role
        token.id = user.id!
        token.phone = user.phone
        token.profileSetupCompleted = user.profileSetupCompleted
        return token
      }
      
      // Always refresh user data from database when token is accessed
      // This ensures we have the latest role and profile completion status
      if (token.id) {
        console.log('JWT Callback: Refreshing token data for user:', token.id)
        try {
          const { PrismaClient } = await import('@prisma/client')
          const prisma = new PrismaClient()
          
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { 
              role: true, 
              profileSetupCompleted: true, 
              phone: true 
            }
          })
          
          if (dbUser) {
            const oldRole = token.role
            const oldProfileSetup = token.profileSetupCompleted
            
            // Force update the token properties
            token.role = dbUser.role
            token.profileSetupCompleted = dbUser.profileSetupCompleted
            token.phone = dbUser.phone
            
            console.log('JWT Callback: Token updated with fresh data:', {
              id: token.id,
              oldRole,
              newRole: token.role,
              oldProfileSetup,
              newProfileSetup: token.profileSetupCompleted,
              tokenRoleAfterUpdate: token.role
            })
          } else {
            console.log('JWT Callback: User not found in database:', token.id)
          }
          
          await prisma.$disconnect()
        } catch (error) {
          console.error('JWT Callback: Error refreshing user data:', error)
        }
      }
      
      return token
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string
        session.user.role = token.role as string | null
        session.user.phone = token.phone as string | null
        session.user.profileSetupCompleted = token.profileSetupCompleted as boolean
      }
      return session
    },
  },
}

export const { handlers, auth, signIn, signOut } = NextAuth(config)
