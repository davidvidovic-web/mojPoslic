import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Google from "next-auth/providers/google"
import Facebook from "next-auth/providers/facebook"
import Apple from "next-auth/providers/apple"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import type { NextAuthConfig } from "next-auth"
import bcrypt from "bcryptjs"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email?: string | null
      name?: string | null
      image?: string | null
      role?: string
      profileSetupCompleted?: boolean
    }
  }
  
  interface User {
    role: string
    profileSetupCompleted?: boolean
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string
    role: string
    profileSetupCompleted?: boolean
  }
}

// Optimized configuration for Vercel serverless functions
const config = {
  adapter: PrismaAdapter(prisma),
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

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
          select: {
            id: true,
            email: true,
            name: true,
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

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          profileSetupCompleted: user.profileSetupCompleted,
        }
      }
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  // Handle development environments with dynamic ports
  trustHost: true,
  callbacks: {
    async jwt({ token, user }) {
      // Add user role to JWT token on sign in
      if (user) {
        token.role = user.role
        token.id = user.id!
        token.profileSetupCompleted = user.profileSetupCompleted
      }
      return token
    },
    async session({ session, token }) {
      // Add user role from JWT token to session
      if (session.user && token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.profileSetupCompleted = token.profileSetupCompleted as boolean
      }
      return session
    },
    async signIn({ user, account, profile }) {
      // Auto-assign default role on first sign-in
      if (account && profile) {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
          })
          
          if (!existingUser) {
            // First time user - will be created by adapter with default role
            return true
          }
        } catch (error) {
          console.error('Error checking user:', error)
        }
      }
      return true
    },
  },
} satisfies NextAuthConfig

export const { handlers, auth, signIn, signOut } = NextAuth(config)
