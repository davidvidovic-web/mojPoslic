import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAdmin() {
  try {
    const admin = await prisma.user.findUnique({
      where: { email: 'mail@davidvidovic.com' }
    });

    if (admin) {
      console.log('✓ Admin user exists:', {
        id: admin.id,
        email: admin.email,
        role: admin.role,
        emailVerified: admin.emailVerified,
        profileSetupCompleted: admin.profileSetupCompleted
      });
    } else {
      console.log('✗ Admin user not found');
    }
  } catch (error) {
    console.error('Error checking admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdmin();
