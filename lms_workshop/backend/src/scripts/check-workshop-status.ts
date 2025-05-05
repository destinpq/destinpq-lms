import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { EntityManager } from 'typeorm';

/**
 * This script checks the status of a workshop
 * Run with: npx ts-node -r tsconfig-paths/register src/scripts/check-workshop-status.ts
 */
async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    // Get entity manager for direct SQL queries
    const entityManager = app.get(EntityManager);
    
    // Workshop ID - Use command line arg if provided or default to 1
    const workshopId = process.argv[2] ? parseInt(process.argv[2]) : 1;
    
    console.log(`Checking status for workshop ID: ${workshopId}`);

    // Check if the workshop exists and its status
    const workshop = await entityManager.query('SELECT * FROM workshop WHERE id = $1', [workshopId]);
    
    if (!workshop || workshop.length === 0) {
      console.error(`Workshop with ID ${workshopId} not found in database!`);
      return;
    }
    
    console.log('Workshop details:');
    console.log(`- ID: ${workshop[0].id}`);
    console.log(`- Title: ${workshop[0].title}`);
    console.log(`- Instructor: ${workshop[0].instructor}`);
    console.log(`- Scheduled At: ${workshop[0].scheduledAt}`);
    console.log(`- IsActive: ${workshop[0].isActive}`);
    console.log(`- Created At: ${workshop[0].createdAt}`);
    console.log(`- Updated At: ${workshop[0].updatedAt}`);
    
    if (workshop[0].isActive === false) {
      console.log('\n⚠️ Workshop is inactive! This might be why it doesn\'t appear on the student dashboard.');
      
      // Update to make it active if needed
      console.log('\nUpdating workshop to active status...');
      await entityManager.query(
        'UPDATE workshop SET "isActive" = true WHERE id = $1',
        [workshopId]
      );
      console.log('Workshop is now active!');
    }

    // Check attendees
    const attendees = await entityManager.query(
      'SELECT * FROM workshop_attendees WHERE "workshopId" = $1',
      [workshopId]
    );
    
    console.log(`\nWorkshop has ${attendees.length} attendees:`);
    
    if (attendees.length > 0) {
      // Get user details for these attendees
      for (let i = 0; i < attendees.length; i++) {
        const userId = attendees[i].userId;
        const user = await entityManager.query('SELECT * FROM public.user WHERE id = $1', [userId]);
        
        if (user && user.length > 0) {
          console.log(`- User ID: ${userId}, Name: ${user[0].firstName} ${user[0].lastName}, Email: ${user[0].email}`);
        } else {
          console.log(`- User ID: ${userId} (user not found in database)`);
        }
      }
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await app.close();
  }
}

bootstrap(); 