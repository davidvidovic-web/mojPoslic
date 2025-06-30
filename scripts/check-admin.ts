#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkAdminUser() {
  try {
    console.log('🔍 Checking for admin users...\n')

    // Check for admin users
    const adminUsers = await prisma.user.findMany({
      where: { role: 'admin' }
    })

    console.log(`Found ${adminUsers.length} admin user(s):`)
    
    adminUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email}) - ID: ${user.id}`)
      console.log(`   Created: ${user.createdAt.toISOString()}`)
      console.log(`   Has password: ${user.password ? 'Yes' : 'No'}`)
      console.log('')
    })

    if (adminUsers.length === 0) {
      console.log('❌ No admin users found!')
      console.log('Run: npm run create-admin')
    } else {
      console.log('✅ Admin users found. You should be able to login with:')
      adminUsers.forEach(user => {
        console.log(`   Email: ${user.email}`)
      })
    }

    // Also check all users for debugging
    const allUsers = await prisma.user.findMany()
    console.log(`\n📊 Total users in database: ${allUsers.length}`)
    
    const usersByRole = await prisma.user.groupBy({
      by: ['role'],
      _count: { role: true }
    })
    
    console.log('Users by role:')
    usersByRole.forEach(group => {
      console.log(`   ${group.role}: ${group._count.role}`)
    })

  } catch (error) {
    console.error('❌ Error checking admin users:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkAdminUser()
