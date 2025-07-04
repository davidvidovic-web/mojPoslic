import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'mail@davidvidovic.com' }
    });

    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash('Vida97vida!@', 12);

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email: 'mail@davidvidovic.com',
        name: 'David Vidovic',
        password: hashedPassword,
        role: 'admin',
        emailVerified: true,
        profileSetupCompleted: true,
      }
    });

    console.log('Admin user created successfully:', {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      emailVerified: admin.emailVerified
    });

  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
