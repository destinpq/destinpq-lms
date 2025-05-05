import { createConnection } from 'typeorm';
import { Workshop } from '../entities/workshop.entity';
import { User } from '../entities/user.entity';

// Debug script to directly check workshop enrollments
async function main() {
  try {
    console.log('Connecting to database...');
    const connection = await createConnection();
    console.log('Connected successfully!');

    // Check join table for workshop enrollments
    console.log('\n--- CHECKING WORKSHOP_ATTENDEES TABLE ---');
    const joinTableResults = await connection.query(
      'SELECT * FROM workshop_attendees'
    );
    console.log('Workshop attendees rows:', joinTableResults);
    
    // Get all users to check for Pratik's ID
    console.log('\n--- LOOKING UP USER IDS ---');
    const users = await connection.getRepository(User).find();
    console.log('User IDs:');
    users.forEach(user => {
      console.log(`- ${user.id}: ${user.firstName} ${user.lastName} (${user.email})`);
    });
    
    // Check all workshops
    console.log('\n--- ALL WORKSHOPS ---');
    const workshops = await connection.getRepository(Workshop).find({
      relations: ['attendees']
    });
    console.log('Workshops with attendees:');
    workshops.forEach(workshop => {
      console.log(`Workshop #${workshop.id}: ${workshop.title} (${workshop.scheduledAt})`);
      console.log(`Attendees: ${workshop.attendees?.length || 0}`);
      if (workshop.attendees && workshop.attendees.length > 0) {
        workshop.attendees.forEach(attendee => {
          console.log(`- User #${attendee.id}: ${attendee.firstName} ${attendee.lastName}`);
        });
      }
    });
    
    // Force add Pratik to workshop ID 1
    console.log('\n--- FORCE ADD PRATIK TO WORKSHOP ---');
    const pratikUserId = users.find(u => u.firstName === 'Pratik')?.id;
    if (pratikUserId) {
      console.log(`Found Pratik's user ID: ${pratikUserId}`);
      
      // Try to find workshop ID 1
      const workshop1 = workshops.find(w => w.id === 1);
      if (workshop1) {
        console.log(`Found workshop ID 1: ${workshop1.title}`);
        
        // Check if already enrolled
        const alreadyEnrolled = await connection.query(
          'SELECT * FROM workshop_attendees WHERE "workshopId" = $1 AND "userId" = $2',
          [1, pratikUserId]
        );
        
        if (alreadyEnrolled && alreadyEnrolled.length > 0) {
          console.log('Pratik is already enrolled in this workshop');
        } else {
          // Insert directly into join table
          console.log('Adding Pratik to workshop 1...');
          await connection.query(
            'INSERT INTO workshop_attendees ("workshopId", "userId") VALUES ($1, $2)',
            [1, pratikUserId]
          );
          console.log('Successfully added Pratik to workshop 1');
        }
      } else {
        console.log('Workshop ID 1 not found');
      }
    } else {
      console.log('Could not find user with name Pratik');
    }
    
    await connection.close();
    console.log('\nConnection closed');
  } catch (error) {
    console.error('Error:', error);
  }
}

main(); 