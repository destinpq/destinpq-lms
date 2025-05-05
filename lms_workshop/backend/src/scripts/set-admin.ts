import { createConnection } from 'typeorm';
import { User } from '../entities/user.entity';
import { config } from 'dotenv';

// Load environment variables from .env file
config();

async function setUserAsAdmin() {
  console.log('Starting admin update process...');
  
  // Database connection using .env variables
  const connection = await createConnection({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    entities: [User],
    synchronize: false,
  });

  try {
    // Find user - check both spellings
    const userRepository = connection.getRepository(User);
    let user = await userRepository.findOne({ where: { email: 'drakanksha@destinpq.com' } });
    
    if (!user) {
      // Try alternate spelling
      user = await userRepository.findOne({ where: { email: 'drakanksha@destiinpq.com' } });
    }

    if (user) {
      console.log(`Found user: ${user.email}`);
      
      // Update admin status
      user.isAdmin = true;
      
      await userRepository.save(user);
      console.log(`User ${user.email} has been set as an admin.`);
    } else {
      console.log('User not found. Please check the email address.');
    }

  } catch (error) {
    console.error('Error updating admin status:', error);
  } finally {
    // Close connection
    await connection.close();
  }
}

// Run the function
setUserAsAdmin()
  .then(() => console.log('Admin update process completed'))
  .catch(error => console.error('Failed to update admin status:', error)); 