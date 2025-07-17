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
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.id = user.id!
        token.profileSetupCompleted = user.profileSetupCompleted
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.profileSetupCompleted = token.profileSetupCompleted as boolean
      }
      return session
    },
  },
}

export const { handlers, auth, signIn, signOut } = NextAuth(config)
