// Use environment variable for API URL - no need to add /lms to localhost as it's already in the URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:15001/lms';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
}

export const userService = {
  async getAllUsers(): Promise<User[]> {
    console.log('Fetching all users from API');
    
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    try {
      const response = await fetch(`${API_URL}/users`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Users API response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Users API error:', errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText || 'Failed to fetch users' };
        }
        throw new Error(errorData.message || `Failed to fetch users with status: ${response.status}`);
      }

      const users = await response.json();
      console.log('Users fetched successfully:', users.length);
      return users;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'> & { password: string }): Promise<User> {
    console.log('Creating new user:', userData.email);
    
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    try {
      const response = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      console.log('Create user response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Create user error:', errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText || 'Failed to create user' };
        }
        throw new Error(errorData.message || `Failed to create user with status: ${response.status}`);
      }

      const newUser = await response.json();
      console.log('User created successfully:', newUser);
      return newUser;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  async deleteUser(userId: number): Promise<void> {
    console.log('Deleting user:', userId);
    
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    try {
      const response = await fetch(`${API_URL}/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Delete user response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Delete user error:', errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText || 'Failed to delete user' };
        }
        throw new Error(errorData.message || `Failed to delete user with status: ${response.status}`);
      }

      console.log('User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  async updateUser(userId: number, userData: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'> & { password?: string }>): Promise<User> {
    console.log('Updating user:', userId);
    
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    try {
      const response = await fetch(`${API_URL}/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      console.log('Update user response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Update user error:', errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText || 'Failed to update user' };
        }
        throw new Error(errorData.message || `Failed to update user with status: ${response.status}`);
      }

      const updatedUser = await response.json();
      console.log('User updated successfully:', updatedUser);
      return updatedUser;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }
}; 