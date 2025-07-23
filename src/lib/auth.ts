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
    lastUpdated?: number
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
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days 
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      // If user object is provided (during sign-in), update token
      if (user) {
        if (process.env.NODE_ENV === 'development') {
          console.log('JWT Callback: Initial token setup with user:', {
            id: user.id,
            role: user.role,
            profileSetupCompleted: user.profileSetupCompleted
          })
        }
        token.role = user.role
        token.id = user.id!
        token.phone = user.phone
        token.profileSetupCompleted = user.profileSetupCompleted
        token.lastUpdated = Date.now()
        return token
      }
      
      // Refresh from database if:
      // 1. Token doesn't have lastUpdated timestamp (old token)
      // 2. It's been more than 2 minutes since last update (reduced from 5 minutes)
      // 3. The trigger is 'update' (forced refresh from client)
      const shouldRefresh = !token.lastUpdated || 
                           (Date.now() - (token.lastUpdated as number)) > 2 * 60 * 1000 ||
                           trigger === 'update'
      
      if (token.id && shouldRefresh) {
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
            const hasChanges = token.role !== dbUser.role || 
                             token.profileSetupCompleted !== dbUser.profileSetupCompleted ||
                             token.phone !== dbUser.phone
            
            // Always update the token properties with fresh data
            token.role = dbUser.role
            token.profileSetupCompleted = dbUser.profileSetupCompleted
            token.phone = dbUser.phone
            token.lastUpdated = Date.now()
            
            // Log significant changes during development
            if (hasChanges && process.env.NODE_ENV === 'development') {
              console.log('JWT Callback: Token updated with changes from database:', {
                id: token.id,
                role: token.role,
                profileSetupCompleted: token.profileSetupCompleted,
                trigger: trigger
              })
            }
          }
          
          await prisma.$disconnect()
        } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            console.error('JWT Callback: Error refreshing user data:', error)
          }
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
