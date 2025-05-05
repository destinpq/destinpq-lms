const { Client } = require('pg');

async function main() {
  try {
    console.log('EMERGENCY FIX: FORCING USER WORKSHOP ENROLLMENT');
    const client = new Client({
      host: 'localhost',
      port: 5432,
      database: 'psychology_lms',
      user: 'postgres',
      password: 'tiger'
    });
    
    await client.connect();
    console.log('Connected to database');

    // VERIFY ENROLLMENT EXISTS
    const check = await client.query(
      'SELECT * FROM workshop_attendees WHERE "workshopId" = $1 AND "userId" = $1',
      [1]
    );
    
    console.log(`Current enrollment records: ${check.rows.length}`);
    console.log(check.rows);
    
    // FORCE INSERT NEW RECORD IF NONE EXISTS
    if (check.rows.length === 0) {
      console.log('NO ENROLLMENT FOUND! FORCING DIRECT DB INSERT...');
      await client.query(
        'INSERT INTO workshop_attendees ("workshopId", "userId") VALUES ($1, $2)',
        [1, 1]
      );
      console.log('FORCED ENROLLMENT INSERTED!');
    } else {
      console.log('ENROLLMENT EXISTS ALREADY! SOMETHING ELSE IS BROKEN!');
    }
    
    // DIRECTLY VALIDATE SQL QUERY RETURNS DATA
    const testQuery = `
      SELECT w.* 
      FROM workshop w
      INNER JOIN workshop_attendees wa ON w.id = wa."workshopId"
      WHERE wa."userId" = $1
    `;
    
    const results = await client.query(testQuery, [1]);
    
    console.log('\n\nDIRECT SQL TEST:');
    console.log(`Rows found: ${results.rows.length}`);
    console.log(JSON.stringify(results.rows, null, 2));
    
    await client.end();
  } catch (error) {
    console.error('ERROR: ', error);
  }
}

main(); 