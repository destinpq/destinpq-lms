const API_URL = 'http://localhost:15001/lms';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  user?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    isAdmin: boolean;
  };
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    console.log('Trying to login with:', JSON.stringify(credentials));
    
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      console.log('Login response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Login error text:', errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { message: errorText || 'Login failed' };
        }
        throw new Error(errorData.message || `Login failed with status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Login successful, data:', data);
      return data;
    } catch (error) {
      console.error('Login fetch error:', error);
      throw error;
    }
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    console.log('Trying to register with:', JSON.stringify(data));
    
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      console.log('Register response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Register error text:', errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { message: errorText || 'Registration failed' };
        }
        throw new Error(errorData.message || `Registration failed with status: ${response.status}`);
      }

      const responseData = await response.json();
      console.log('Registration successful, data:', responseData);
      return responseData;
    } catch (error) {
      console.error('Register fetch error:', error);
      throw error;
    }
  },

  async getProfile(): Promise<any> {
    const token = localStorage.getItem('access_token');
    console.log('Getting profile with token:', token ? 'Token exists' : 'No token');
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    try {
      const response = await fetch(`${API_URL}/users/profile/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Profile response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Profile error text:', errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { message: errorText || 'Failed to get profile' };
        }
        throw new Error(errorData.message || `Failed to get profile with status: ${response.status}`);
      }

      const profileData = await response.json();
      console.log('Profile data retrieved:', profileData);
      return profileData;
    } catch (error) {
      console.error('Profile fetch error:', error);
      throw error;
    }
  },
}; 