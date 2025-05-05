import { createConnection } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { config } from 'dotenv';

// Load environment variables from .env file
config();

async function updateAdminPassword() {
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
    // Find admin user
    const userRepository = connection.getRepository(User);
    const existingAdmin = await userRepository.findOne({ where: { email: 'drakanksha@destinpq.com' } });

    if (existingAdmin) {
      console.log('Admin user found. Updating password...');
      
      // Update with exact password from form - DestinPQ@24225
      const plainPassword = 'DestinPQ@24225';
      const hashedPassword = await bcrypt.hash(plainPassword, 10);
      
      // Update the password
      existingAdmin.password = hashedPassword;
      
      await userRepository.save(existingAdmin);
      console.log(`Admin password updated successfully to: ${plainPassword}`);
    } else {
      console.log('Admin user not found. Creating new admin user...');
      
      // Create new admin user with the password from the form
      const plainPassword = 'DestinPQ@24225';
      const hashedPassword = await bcrypt.hash(plainPassword, 10);
      
      const adminUser = userRepository.create({
        firstName: 'Admin',
        lastName: 'User',
        email: 'drakanksha@destinpq.com',
        password: hashedPassword,
        isAdmin: true,
      });
      
      await userRepository.save(adminUser);
      console.log(`Admin user created successfully with password: ${plainPassword}`);
    }

  } catch (error) {
    console.error('Error updating admin password:', error);
  } finally {
    // Close connection
    await connection.close();
  }
}

// Run the function
updateAdminPassword()
  .then(() => console.log('Admin password update process completed'))
  .catch(error => console.error('Failed to update admin password:', error)); 