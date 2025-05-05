import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { EntityManager } from 'typeorm';

/**
 * This script forces all workshops to be active
 * Run with: npx ts-node -r tsconfig-paths/register src/scripts/force-active-workshop.ts
 */
async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    // Get entity manager for direct SQL queries
    const entityManager = app.get(EntityManager);
    
    console.log('Forcing all workshops to be active...');

    // Get all workshops
    const workshops = await entityManager.query('SELECT id, title, "isActive" FROM workshop');
    
    console.log(`Found ${workshops.length} workshops in the database:`);
    workshops.forEach(w => {
      console.log(`- ID: ${w.id}, Title: ${w.title}, IsActive: ${w.isActive}`);
    });
    
    // Update all workshops to be active
    await entityManager.query('UPDATE workshop SET "isActive" = true');
    
    console.log('All workshops are now active!');
    
    // Verify the change
    const updatedWorkshops = await entityManager.query('SELECT id, title, "isActive" FROM workshop');
    console.log('\nVerification after update:');
    updatedWorkshops.forEach(w => {
      console.log(`- ID: ${w.id}, Title: ${w.title}, IsActive: ${w.isActive}`);
    });

    // Also check all workshop attendees
    const attendees = await entityManager.query(
      'SELECT wa."workshopId", wa."userId", u.email FROM workshop_attendees wa JOIN public.user u ON wa."userId" = u.id'
    );
    
    console.log(`\nFound ${attendees.length} workshop attendee relationships:`);
    attendees.forEach(a => {
      console.log(`- Workshop ID: ${a.workshopId}, User ID: ${a.userId}, Email: ${a.email}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await app.close();
  }
}

bootstrap(); 