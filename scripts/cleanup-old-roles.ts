import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupOldRoles() {
  try {
    console.log('🧹 Starting cleanup of old role values...');
    
    // Step 1: Update all remaining 'employee' roles to 'tasker'
    const employeeUpdate = await prisma.$executeRaw`
      UPDATE "users" 
      SET "role" = 'tasker' 
      WHERE "role" = 'employee'
    `;
    console.log(`✅ Updated ${employeeUpdate} employee records to tasker`);
    
    // Step 2: Update all remaining 'employer' roles to 'client'
    const employerUpdate = await prisma.$executeRaw`
      UPDATE "users" 
      SET "role" = 'client' 
      WHERE "role" = 'employer'
    `;
    console.log(`✅ Updated ${employerUpdate} employer records to client`);
    
    // Step 3: Update ConnectionAction enum values
    const connectionUpdate = await prisma.$executeRaw`
      UPDATE "connection_history" 
      SET "action" = 'JOB_POST_CLIENT' 
      WHERE "action" = 'JOB_POST_EMPLOYER'
    `;
    console.log(`✅ Updated ${connectionUpdate} connection history records from JOB_POST_EMPLOYER to JOB_POST_CLIENT`);
    
    // Step 4: Update transportation enum values from employee_responsible to tasker_responsible
    const transportUpdate = await prisma.$executeRaw`
      UPDATE "job_listings" 
      SET "transportation" = 'tasker_responsible' 
      WHERE "transportation" = 'employee_responsible'
    `;
    console.log(`✅ Updated ${transportUpdate} transportation records from employee_responsible to tasker_responsible`);
    
    // Step 5: Check remaining old values
    const remainingUsers = await prisma.$queryRaw`
      SELECT "role", COUNT(*) as count 
      FROM "users" 
      WHERE "role" IN ('employee', 'employer')
      GROUP BY "role"
    `;
    
    const remainingConnections = await prisma.$queryRaw`
      SELECT "action", COUNT(*) as count 
      FROM "connection_history" 
      WHERE "action" = 'JOB_POST_EMPLOYER'
      GROUP BY "action"
    `;
    
    const remainingTransport = await prisma.$queryRaw`
      SELECT "transportation", COUNT(*) as count 
      FROM "job_listings" 
      WHERE "transportation" = 'employee_responsible'
      GROUP BY "transportation"
    `;
    
    console.log('📊 Remaining old values:');
    console.log('Users:', remainingUsers);
    console.log('Connections:', remainingConnections);
    console.log('Transportation:', remainingTransport);
    
    console.log('🎉 Cleanup completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupOldRoles();
