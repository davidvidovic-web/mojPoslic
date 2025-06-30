import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createAdminUser() {
  try {
    console.log('Creating admin user...')

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'mail@davidvidovic.com' }
    })

    if (existingUser) {
      console.log('Admin user already exists!')
      console.log('User details:', {
        id: existingUser.id,
        email: existingUser.email,
        name: existingUser.name,
        role: existingUser.role
      })
      return
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash('vida97vida!@', 12)

    // Create the admin user
    const adminUser = await prisma.user.create({
      data: {
        email: 'mail@davidvidovic.com',
        name: 'David Vidovic',
        password: hashedPassword,
        role: 'admin'
      }
    })

    console.log('✅ Admin user created successfully!')
    console.log('User details:', {
      id: adminUser.id,
      email: adminUser.email,
      name: adminUser.name,
      role: adminUser.role
    })

  } catch (error) {
    console.error('❌ Error creating admin user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdminUser()
