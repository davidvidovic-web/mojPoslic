import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Test database connection
    await prisma.$connect()
    
    // Check if admin user exists
    const adminUser = await prisma.user.findUnique({
      where: { email: 'mail@davidvidovic.com' }
    })
    
    if (!adminUser) {
      return NextResponse.json({ 
        status: 'error',
        message: 'Admin user not found' 
      }, { status: 404 })
    }
    
    // Test password verification
    const passwordValid = adminUser.password ? await bcrypt.compare('vida97vida!@', adminUser.password) : false
    
    // Get counts for auth tables
    const sessionCount = await prisma.session.count()
    const accountCount = await prisma.account.count()
    const verificationTokenCount = await prisma.verificationToken.count()
    
    return NextResponse.json({
      status: 'success',
      message: 'Authentication system is working properly',
      data: {
        adminUser: {
          id: adminUser.id,
          email: adminUser.email,
          name: adminUser.name,
          role: adminUser.role,
          createdAt: adminUser.createdAt
        },
        passwordValid,
        authTables: {
          sessions: sessionCount,
          accounts: accountCount,
          verificationTokens: verificationTokenCount
        }
      }
    })
    
  } catch (error) {
    console.error('Auth test error:', error)
    return NextResponse.json({ 
      status: 'error',
      message: 'Authentication test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
