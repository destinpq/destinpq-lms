import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { EntityManager, Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Workshop } from '../entities/workshop.entity';
import { User } from '../entities/user.entity';

/**
 * This script checks and fixes the student-workshop relationship in the database
 * Run with: npx ts-node -r tsconfig-paths/register src/scripts/add-student-workshop.ts
 */
async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    // Get entity manager for direct SQL queries
    const entityManager = app.get(EntityManager);
    
    // User and workshop IDs - ADJUST THESE VALUES AS NEEDED
    const userId = 1; // Pratik's user ID
    const workshopId = 1; // The workshop ID
    
    console.log(`Checking database for user ${userId} and workshop ${workshopId}...`);

    // Check if the user exists
    const user = await entityManager.query('SELECT * FROM public.user WHERE id = $1', [userId]);
    if (!user || user.length === 0) {
      console.error(`User with ID ${userId} not found in database!`);
      return;
    }
    console.log(`Found user: ${user[0].firstName} ${user[0].lastName} (${user[0].email})`);

    // Check if the workshop exists
    const workshop = await entityManager.query('SELECT * FROM workshop WHERE id = $1', [workshopId]);
    if (!workshop || workshop.length === 0) {
      console.error(`Workshop with ID ${workshopId} not found in database!`);
      return;
    }
    console.log(`Found workshop: ${workshop[0].title} (${workshop[0].scheduledAt})`);

    // Check the join table directly
    const joinCheck = await entityManager.query(
      'SELECT * FROM workshop_attendees WHERE "userId" = $1 AND "workshopId" = $2', 
      [userId, workshopId]
    );
    
    console.log('Direct join table check:', joinCheck);

    if (joinCheck && joinCheck.length > 0) {
      console.log('Relationship already exists in database. Deleting it to force refresh...');
      
      // Delete the existing relationship
      await entityManager.query(
        'DELETE FROM workshop_attendees WHERE "userId" = $1 AND "workshopId" = $2',
        [userId, workshopId]
      );
      
      console.log('Existing relationship deleted.');
    }

    // Insert a new relationship
    console.log('Creating new relationship...');
    await entityManager.query(
      'INSERT INTO workshop_attendees ("userId", "workshopId") VALUES ($1, $2)',
      [userId, workshopId]
    );
    console.log('New relationship created!');

    // Verify the relationship was created
    const verifyCheck = await entityManager.query(
      'SELECT * FROM workshop_attendees WHERE "userId" = $1 AND "workshopId" = $2', 
      [userId, workshopId]
    );
    console.log('Verification check:', verifyCheck);

    // List all workshops for this user
    const userWorkshops = await entityManager.query(`
      SELECT w.* 
      FROM workshop w
      INNER JOIN workshop_attendees wa ON w.id = wa."workshopId"
      WHERE wa."userId" = $1
    `, [userId]);
    
    console.log(`Found ${userWorkshops.length} workshops for user ${userId}:`);
    userWorkshops.forEach((w, i) => {
      console.log(`${i+1}. ${w.title} (ID: ${w.id}, Scheduled: ${w.scheduledAt})`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await app.close();
  }
}

bootstrap(); 