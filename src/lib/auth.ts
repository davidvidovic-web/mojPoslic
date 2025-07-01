import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'
import EmailProvider from 'next-auth/providers/email'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaClient, UserRole } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { emailService } from './email'

// Create a separate PrismaClient instance for auth to avoid extension conflicts
const authPrisma = new PrismaClient()

export const authOptions: NextAuthOptions = {
  debug: process.env.NODE_ENV === 'development',
  adapter: PrismaAdapter(authPrisma),
  providers: [
    EmailProvider({
      server: {
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT || '587'),
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      sendVerificationRequest: async ({ identifier: email, url }) => {
        console.log('🔗 Sending magic link to:', email)
        
        // Modify the callback URL to point to our set-password page
        const setPasswordUrl = url.replace('/callback', '/set-password')
        console.log('🔗 Magic link URL:', setPasswordUrl)
        
        // Extract user name from database if exists
        let userName = 'there'
        try {
          const user = await authPrisma.user.findUnique({
            where: { email },
            select: { name: true }
          })
          if (user?.name) {
            userName = user.name
          }
        } catch (error) {
          console.log('Could not fetch user name:', error)
        }

        const result = await emailService.sendMagicLink({
          email,
          name: userName,
          url: setPasswordUrl,
        })

        if (!result.success) {
          throw new Error(`Failed to send verification email: ${result.error}`)
        }
      },
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        console.log('🔍 NextAuth authorize called with:', { 
          email: credentials?.email, 
          hasPassword: !!credentials?.password 
        })
        
        if (!credentials?.email || !credentials?.password) {
          console.log('❌ Missing credentials:', { email: !!credentials?.email, password: !!credentials?.password })
          return null
        }

        try {
          // Try to find user by email or username
          const user = await authPrisma.user.findFirst({
            where: {
              OR: [
                { email: credentials.email },
                { username: credentials.email }
              ]
            }
          })

          if (!user || !user.password) {
            console.log('❌ User not found or no password:', { userFound: !!user, hasPassword: !!user?.password })
            return null
          }

          console.log('✅ User found:', { email: user.email, role: user.role })

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          if (!isPasswordValid) {
            console.log('❌ Invalid password for user:', user.email)
            return null
          }

          console.log('✅ Login successful for user:', user.email)
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            username: user.username,
            role: user.role,
            profileSetupCompleted: user.profileSetupCompleted,
          }
        } catch (error) {
          console.error('❌ Auth error:', error)
          return null
        }
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as { role: UserRole }).role
        token.username = (user as { username?: string }).username
        token.profileSetupCompleted = (user as { profileSetupCompleted?: boolean }).profileSetupCompleted
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as UserRole
        session.user.username = token.username as string
        session.user.profileSetupCompleted = token.profileSetupCompleted as boolean
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
    verifyRequest: '/auth/check-email',
    error: '/auth/error',
  },
}

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      username?: string | null
      role: UserRole
      profileSetupCompleted?: boolean
    }
  }

  interface User {
    username?: string | null
    role: UserRole
    profileSetupCompleted?: boolean
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string
    username?: string
    role: UserRole
    profileSetupCompleted?: boolean
  }
}
