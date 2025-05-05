import { createConnection } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { config } from 'dotenv';

// Load environment variables from .env file
config();

async function createAdminUser() {
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
    // Check if admin user already exists
    const userRepository = connection.getRepository(User);
    const existingAdmin = await userRepository.findOne({ where: { email: 'drakanksha@destinpq.com' } });

    if (existingAdmin) {
      console.log('Admin user already exists. Updating details...');
      
      // Update user to ensure it has admin privileges
      existingAdmin.isAdmin = true;
      existingAdmin.firstName = 'Admin';
      existingAdmin.lastName = 'User';
      
      // Update password
      const hashedPassword = await bcrypt.hash('DestinPQ24225', 10);
      existingAdmin.password = hashedPassword;
      
      await userRepository.save(existingAdmin);
      console.log('Admin user updated successfully');
    } else {
      // Create new admin user
      console.log('Creating new admin user...');
      const hashedPassword = await bcrypt.hash('DestinPQ24225', 10);
      
      const adminUser = userRepository.create({
        firstName: 'Admin',
        lastName: 'User',
        email: 'drakanksha@destinpq.com',
        password: hashedPassword,
        isAdmin: true,
      });
      
      await userRepository.save(adminUser);
      console.log('Admin user created successfully');
    }

  } catch (error) {
    console.error('Error creating/updating admin user:', error);
  } finally {
    // Close connection
    await connection.close();
  }
}

// Run the function
createAdminUser()
  .then(() => console.log('Admin user creation process completed'))
  .catch(error => console.error('Failed to create admin user:', error)); 