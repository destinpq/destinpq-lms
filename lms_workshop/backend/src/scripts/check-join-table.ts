import { createConnection, getConnectionOptions } from 'typeorm';

async function main() {
  try {
    // Get TypeORM connection options
    const connectionOptions = await getConnectionOptions();
    console.log('Connecting to database:', connectionOptions.database);
    
    // Create a database connection
    const connection = await createConnection();
    console.log('Connection established successfully');
    
    // Check workshop_attendees table structure
    console.log('Checking workshop_attendees table structure...');
    const tableStructure = await connection.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'workshop_attendees'
      ORDER BY ordinal_position;
    `);
    console.log('Table structure:', tableStructure);
    
    // Count entries in join table
    console.log('Counting entries in workshop_attendees table...');
    const count = await connection.query('SELECT COUNT(*) FROM workshop_attendees');
    console.log('Total entries:', count);
    
    // Get all entries
    console.log('Getting all entries from workshop_attendees table...');
    const entries = await connection.query('SELECT * FROM workshop_attendees');
    console.log('Entries:', entries);
    
    // Close the connection
    await connection.close();
    console.log('Connection closed');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

main().catch(console.error); 