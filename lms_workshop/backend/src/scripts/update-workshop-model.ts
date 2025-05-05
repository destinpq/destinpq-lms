import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { EntityManager } from 'typeorm';

/**
 * This script migrates the existing workshop data to the new model
 * Run with: npx ts-node -r tsconfig-paths/register src/scripts/update-workshop-model.ts
 */
async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    // Get entity manager for direct SQL queries
    const entityManager = app.get(EntityManager);
    
    console.log('Starting workshop model migration...');

    // 1. First, check if the new columns exist in the workshop table
    try {
      await entityManager.query(`
        SELECT "startDate", "endDate", "durationWeeks" FROM workshop LIMIT 1
      `);
      console.log('New workshop columns already exist, skipping column creation.');
    } catch (err) {
      console.log('New columns don\'t exist, creating them...');
      
      // Add new columns to workshop table
      await entityManager.query(`
        ALTER TABLE workshop 
        ADD COLUMN IF NOT EXISTS "startDate" TIMESTAMP,
        ADD COLUMN IF NOT EXISTS "endDate" TIMESTAMP,
        ADD COLUMN IF NOT EXISTS "durationWeeks" INTEGER DEFAULT 1
      `);
      console.log('New columns added to workshop table.');
    }
    
    // 2. Create workshop_session table if it doesn't exist
    try {
      await entityManager.query(`SELECT * FROM workshop_session LIMIT 1`);
      console.log('Workshop session table already exists.');
    } catch (err) {
      console.log('Creating workshop_session table...');
      
      await entityManager.query(`
        CREATE TABLE IF NOT EXISTS workshop_session (
          id SERIAL PRIMARY KEY,
          title VARCHAR NOT NULL,
          description TEXT,
          "scheduledAt" TIMESTAMP NOT NULL,
          "durationMinutes" INTEGER DEFAULT 60,
          "meetingUrl" VARCHAR,
          "sessionMaterials" TEXT,
          "isRecorded" BOOLEAN DEFAULT FALSE,
          "recordingUrl" VARCHAR,
          "workshopId" INTEGER NOT NULL REFERENCES workshop(id) ON DELETE CASCADE,
          "isActive" BOOLEAN DEFAULT TRUE,
          "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
          "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `);
      console.log('Workshop session table created.');
    }
    
    // 3. Migrate existing workshop data
    const workshops = await entityManager.query(`
      SELECT * FROM workshop WHERE "startDate" IS NULL
    `);
    
    console.log(`Found ${workshops.length} workshops to migrate...`);
    
    for (const workshop of workshops) {
      console.log(`Migrating workshop: ${workshop.title} (ID: ${workshop.id})`);
      
      // Update workshop with new fields
      await entityManager.query(`
        UPDATE workshop
        SET 
          "startDate" = "scheduledAt",
          "endDate" = (CAST("scheduledAt" AS DATE) + INTERVAL '4 weeks')::TIMESTAMP,
          "durationWeeks" = 4
        WHERE id = $1
      `, [workshop.id]);
      
      // Create a default session for this workshop
      await entityManager.query(`
        INSERT INTO workshop_session (
          title,
          description,
          "scheduledAt",
          "durationMinutes",
          "workshopId",
          "isActive"
        ) VALUES (
          $1 || ' - Session 1',
          $2,
          $3,
          60,
          $4,
          $5
        )
      `, [
        workshop.title,
        workshop.description,
        workshop.scheduledAt,
        workshop.id,
        workshop.isActive
      ]);
      
      console.log(`Created initial session for workshop ID ${workshop.id}`);
    }
    
    console.log('\nWorkshop model migration completed successfully!');
    console.log('Summary:');
    console.log(`- Updated ${workshops.length} workshops with new duration fields`);
    console.log(`- Created ${workshops.length} initial sessions for existing workshops`);
    console.log('\nNext steps:');
    console.log('1. Update frontend to handle the new workshop/session model');
    console.log('2. Add UI to manage individual sessions within a workshop');

  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    await app.close();
  }
}

bootstrap(); 