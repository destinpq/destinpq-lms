import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { EntityManager, DataSource } from 'typeorm';
import { Workshop } from '../entities/workshop.entity';
import { User } from '../entities/user.entity';

/**
 * This script performs comprehensive debugging of the student workshop query process
 * Run with: npx ts-node -r tsconfig-paths/register src/scripts/debug-student-workshop.ts <userId>
 */
async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    // Get entity manager and data source
    const entityManager = app.get(EntityManager);
    const dataSource = app.get(DataSource);
    
    // Get userId from command line or default to 1
    const userId = process.argv[2] ? parseInt(process.argv[2]) : 1;
    
    console.log('\n=== COMPREHENSIVE DIAGNOSTIC REPORT ===');
    console.log(`\nTarget User ID: ${userId}`);
    
    // 1. Check if user exists
    console.log('\n[1] Verifying user existence...');
    const user = await entityManager.query('SELECT * FROM public.user WHERE id = $1', [userId]);
    
    if (!user || user.length === 0) {
      console.error(`❌ User with ID ${userId} not found in database!`);
      return;
    }
    
    console.log(`✅ User found: ${user[0].firstName} ${user[0].lastName} (${user[0].email})`);
    
    // 2. Check for workshops in the database
    console.log('\n[2] Checking all workshops in database...');
    const allWorkshops = await entityManager.query('SELECT * FROM workshop');
    
    if (!allWorkshops || allWorkshops.length === 0) {
      console.error('❌ No workshops found in the database at all!');
      return;
    }
    
    console.log(`✅ Found ${allWorkshops.length} total workshops in database`);
    allWorkshops.forEach((w, i) => {
      console.log(`   ${i+1}. ID: ${w.id}, Title: ${w.title}, IsActive: ${w.isActive}, Scheduled: ${w.scheduledAt}`);
    });
    
    // 3. Check workshop attendee relationship
    console.log('\n[3] Checking workshop attendee relationships for this user...');
    const attendees = await entityManager.query(
      'SELECT wa.*, w.title FROM workshop_attendees wa JOIN workshop w ON wa."workshopId" = w.id WHERE wa."userId" = $1',
      [userId]
    );
    
    if (!attendees || attendees.length === 0) {
      console.error(`❌ No workshop attendee relationships found for user ID ${userId}!`);
      console.log('\n💡 Attempting to create a relationship...');
      
      // Insert a relationship if possible
      if (allWorkshops.length > 0) {
        try {
          await entityManager.query(
            'INSERT INTO workshop_attendees ("userId", "workshopId") VALUES ($1, $2)',
            [userId, allWorkshops[0].id]
          );
          console.log(`✅ Created new relationship between user ${userId} and workshop ${allWorkshops[0].id}`);
        } catch (err) {
          console.error(`❌ Failed to create relationship: ${err.message}`);
        }
      }
    } else {
      console.log(`✅ Found ${attendees.length} workshop relationships:`);
      attendees.forEach((a, i) => {
        console.log(`   ${i+1}. Workshop ID: ${a.workshopId}, Title: ${a.title}`);
      });
    }
    
    // 4. Try the exact query used in the student service
    console.log('\n[4] Testing the student service query directly...');
    try {
      // Normal active-only query
      const queryActive = `
        SELECT w.* 
        FROM workshop w
        INNER JOIN workshop_attendees wa ON w.id = wa."workshopId"
        WHERE wa."userId" = $1
        AND w."isActive" = true
        ORDER BY w."scheduledAt" ASC
      `;
      
      console.log(`Executing query with isActive=true filter:`);
      console.log(queryActive);
      
      const workshopsActive = await entityManager.query(queryActive, [userId]);
      console.log(`Query results (Active only): ${JSON.stringify(workshopsActive, null, 2)}`);
      
      // Query without active filter
      const queryAll = `
        SELECT w.* 
        FROM workshop w
        INNER JOIN workshop_attendees wa ON w.id = wa."workshopId"
        WHERE wa."userId" = $1
        ORDER BY w."scheduledAt" ASC
      `;
      
      console.log(`\nExecuting query without isActive filter:`);
      console.log(queryAll);
      
      const workshopsAll = await entityManager.query(queryAll, [userId]);
      console.log(`Query results (All workshops): ${JSON.stringify(workshopsAll, null, 2)}`);
      
      if (workshopsAll.length > 0 && workshopsActive.length === 0) {
        console.log('\n💡 Some workshops exist but are not active. Activating them...');
        
        for (const w of workshopsAll) {
          await entityManager.query(
            'UPDATE workshop SET "isActive" = true WHERE id = $1',
            [w.id]
          );
          console.log(`   ✅ Activated workshop ID: ${w.id}`);
        }
      }
    } catch (err) {
      console.error(`❌ SQL Error: ${err.message}`);
    }
    
    // 5. Check student controller method
    console.log('\n[5] Test fallback query in student controller...');
    try {
      const queryRunner = dataSource.createQueryRunner();
      await queryRunner.connect();
      
      try {
        // Direct data query as in controller
        const rawWorkshops = await queryRunner.query(`
          SELECT w.* 
          FROM workshop w
          INNER JOIN workshop_attendees wa ON w.id = wa."workshopId"
          WHERE wa."userId" = $1
          ORDER BY w."scheduledAt" ASC
        `, [userId]);
        
        console.log(`Controller fallback query results: ${JSON.stringify(rawWorkshops, null, 2)}`);
      } finally {
        await queryRunner.release();
      }
    } catch (err) {
      console.error(`❌ Controller Query Error: ${err.message}`);
    }
    
    console.log('\n=== END OF DIAGNOSTIC REPORT ===');
    console.log('\nIf you still have issues after these fixes:');
    console.log('1. Restart the backend server');
    console.log('2. Clear browser cache or try in incognito mode');
    console.log('3. Check for any foreign key constraints or schema issues');

  } catch (error) {
    console.error('Fatal Error:', error);
  } finally {
    await app.close();
  }
}

bootstrap(); 