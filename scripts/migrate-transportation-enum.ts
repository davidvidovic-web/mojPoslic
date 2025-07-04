import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateTransportationEnum() {
  try {
    console.log('Starting transportation enum migration...');
    
    // First check if the JobListing table exists and what values we have
    const currentValues = await prisma.$queryRaw`
      SELECT transportation, COUNT(*) as count 
      FROM "JobListing" 
      WHERE transportation = 'employee_responsible'
      GROUP BY transportation;
    `;
    
    console.log('Current employee_responsible values:', currentValues);
    
    // Update all jobs that have 'employee_responsible' to 'tasker_responsible'
    const result = await prisma.$executeRaw`
      UPDATE "JobListing" 
      SET transportation = 'tasker_responsible' 
      WHERE transportation = 'employee_responsible';
    `;
    
    console.log(`✅ Updated ${result} jobs from 'employee_responsible' to 'tasker_responsible'`);
    
    // Check if there are any remaining old values
    const remaining = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM "JobListing" 
      WHERE transportation = 'employee_responsible';
    `;
    
    console.log('Remaining old values:', remaining);
    
  } catch (error) {
    console.error('❌ Error during migration:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateTransportationEnum();
