const { Client } = require('pg');

(async () => {
  try {
    console.log('Connecting to PostgreSQL database...');
    const client = new Client({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      database: process.env.DB_DATABASE || 'psychology_lms',
      user: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'tiger'
    });
    
    await client.connect();
    console.log('Connected to database successfully!');

    // Check if Pratik exists (assuming ID 1)
    console.log('\nChecking if Pratik exists...');
    const userResult = await client.query('SELECT * FROM "user" WHERE id = 1');
    if (userResult.rows.length === 0) {
      console.log('User with ID 1 not found');
    } else {
      const user = userResult.rows[0];
      console.log(`Found user: ${user.firstName} ${user.lastName} (ID: ${user.id})`);
    
      // Check if workshop with ID 1 exists
      console.log('\nChecking if workshop with ID 1 exists...');
      const workshopResult = await client.query('SELECT * FROM workshop WHERE id = 1');
      if (workshopResult.rows.length === 0) {
        console.log('Workshop with ID 1 not found');
      } else {
        const workshop = workshopResult.rows[0];
        console.log(`Found workshop: ${workshop.title} (ID: ${workshop.id})`);
        
        // Check if user is already enrolled
        console.log('\nChecking if user is already enrolled...');
        const enrollmentResult = await client.query(
          'SELECT * FROM workshop_attendees WHERE "workshopId" = $1 AND "userId" = $2',
          [1, 1]
        );
        
        if (enrollmentResult.rows.length > 0) {
          console.log('User is already enrolled in this workshop!');
          console.log('Enrollment record:', enrollmentResult.rows[0]);
        } else {
          console.log('User is not enrolled yet. Adding enrollment...');
          
          // Add the enrollment
          const insertResult = await client.query(
            'INSERT INTO workshop_attendees ("workshopId", "userId") VALUES ($1, $2) RETURNING *',
            [1, 1]
          );
          
          console.log('Successfully added enrollment!');
          console.log('New enrollment record:', insertResult.rows[0]);
        }
        
        // List all current enrollments
        console.log('\nAll current workshop enrollments:');
        const allEnrollments = await client.query('SELECT * FROM workshop_attendees');
        console.log(allEnrollments.rows);
      }
    }
    
    // Close the connection
    await client.end();
    console.log('\nDatabase connection closed');
  } catch (error) {
    console.error('Error:', error);
  }
})(); 