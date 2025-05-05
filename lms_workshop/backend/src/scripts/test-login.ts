import { createConnection } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { config } from 'dotenv';

// Load environment variables from .env file
config();

async function testLogin() {
  console.log('Starting login test...');
  
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
    // Find admin user with password
    const userRepository = connection.getRepository(User);
    
    console.log('Looking for user: drakanksha@destinpq.com');
    
    // Get user with password column explicitly selected
    const user = await userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')  // Include password in selection
      .where('user.email = :email', { email: 'drakanksha@destinpq.com' })
      .getOne();

    if (!user) {
      console.error('User not found in database');
      return;
    }

    console.log(`User found: ${user.firstName} ${user.lastName} (ID: ${user.id}), isAdmin: ${user.isAdmin}`);
    console.log(`Password hash in database: ${user.password}`);

    // Test passwords
    const testPasswords = [
      'DestinPQ@24225',  // What's shown in the form
      'DestinPQ24225',   // Without the @ symbol
    ];

    for (const password of testPasswords) {
      const isPasswordValid = await bcrypt.compare(password, user.password);
      console.log(`Password "${password}" valid: ${isPasswordValid}`);
    }

    // Create a fresh hash for the password to be sure
    const plainPassword = 'DestinPQ@24225'; // What you're entering in the form
    const newHash = await bcrypt.hash(plainPassword, 10);
    
    console.log('\nUpdating user with freshly hashed password...');
    user.password = newHash;
    await userRepository.save(user);
    
    console.log(`User updated with new password hash: ${newHash}`);
    console.log('Please try logging in again with: drakanksha@destinpq.com / DestinPQ@24225');

  } catch (error) {
    console.error('Error testing login:', error);
  } finally {
    // Close connection
    await connection.close();
  }
}

// Run the function
testLogin()
  .then(() => console.log('Login test completed'))
  .catch(error => console.error('Failed to test login:', error)); 