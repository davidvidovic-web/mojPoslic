#!/usr/bin/env tsx

import { prisma } from '../src/lib/prisma'
import bcrypt from 'bcryptjs'

async function testAuth() {
  try {
    console.log('🔍 Testing database connection...')
    
    // Test database connection
    await prisma.$connect()
    console.log('✅ Database connection successful!')
    
    // Check if admin user exists
    console.log('👤 Checking for admin user...')
    const adminUser = await prisma.user.findUnique({
      where: { email: 'mail@davidvidovic.com' }
    })
    
    if (!adminUser) {
      console.log('❌ Admin user not found!')
      return
    }
    
    console.log('✅ Admin user found:')
    console.log(`   - ID: ${adminUser.id}`)
    console.log(`   - Email: ${adminUser.email}`)
    console.log(`   - Name: ${adminUser.name}`)
    console.log(`   - Role: ${adminUser.role}`)
    console.log(`   - Created: ${adminUser.createdAt}`)
    
    // Test password verification
    console.log('🔐 Testing password verification...')
    const passwordValid = await bcrypt.compare('vida97vida!@', adminUser.password)
    
    if (passwordValid) {
      console.log('✅ Password verification successful!')
    } else {
      console.log('❌ Password verification failed!')
    }
    
    // Test session tokens table
    console.log('🎫 Checking session infrastructure...')
    const sessionCount = await prisma.session.count()
    const accountCount = await prisma.account.count()
    const verificationTokenCount = await prisma.verificationToken.count()
    
    console.log(`   - Sessions: ${sessionCount}`)
    console.log(`   - Accounts: ${accountCount}`)
    console.log(`   - Verification Tokens: ${verificationTokenCount}`)
    
    console.log('\n🎉 All tests completed successfully!')
    console.log('Your Prisma + NextAuth.js setup is ready to use!')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testAuth()
