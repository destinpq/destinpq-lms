// Use environment variable for API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://polar-lowlands-49166-189f8996c2e7.herokuapp.com/lms';

// Format token with Bearer prefix - THIS IS CRITICAL FOR ALL API CALLS
function formatToken(token: string): string {
  if (!token) return '';
  return token.startsWith('Bearer ') ? token : `Bearer ${token}`;
}

// Remove Bearer prefix if present - ONLY USED FOR STORAGE
function stripBearerPrefix(token: string): string {
  if (!token) return '';
  return token.startsWith('Bearer ') ? token.substring(7) : token;
}

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

// User type definition
export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  isAdmin: boolean;
}

// JWT payload type definition
export interface JwtPayload {
  sub: number;
  email: string;
  isAdmin: boolean;
  iat: number;
  exp: number;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    console.log('Trying to login with:', JSON.stringify(credentials));
    
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
      } catch {
        errorData = { message: errorText || 'Failed to login' };
      }
      
      // No special handling - just throw the error
      throw new Error(errorData.message || `Login failed with status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Login successful, data:', data);
    
    // Ensure token is properly formatted for storage (NO Bearer prefix)
    if (data.access_token) {
      data.access_token = stripBearerPrefix(data.access_token);
    }
    
    return data;
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    console.log('Trying to register with:', JSON.stringify(data));
    
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
      } catch {
        errorData = { message: errorText || 'Failed to register' };
      }
      throw new Error(errorData.message || `Registration failed with status: ${response.status}`);
    }

    const responseData = await response.json();
    console.log('Registration successful, data:', responseData);
    
    // Ensure token is properly formatted for storage (NO Bearer prefix)
    if (responseData.access_token) {
      responseData.access_token = stripBearerPrefix(responseData.access_token);
    }
    
    return responseData;
  },

  async getProfile(): Promise<User> {
    let token = localStorage.getItem('access_token');
    console.log('Getting profile with token:', token ? 'Token exists' : 'No token');
    
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    // Format token with Bearer prefix for API call
    token = formatToken(token);
    console.log('Using formatted token for profile request with Bearer prefix');

    const response = await fetch(`${API_URL}/users/profile/me`, {
      method: 'GET',
      headers: {
        'Authorization': token,
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
      } catch {
        errorData = { message: errorText || 'Failed to get profile' };
      }
      
      // Just throw the error, no special handling
      throw new Error(errorData.message || `Failed to get profile with status: ${response.status}`);
    }

    const profileData = await response.json();
    console.log('Profile data retrieved:', profileData);
    
    return profileData;
  },

  // Convert JWT token payload to User object
  parseToken(token: string): JwtPayload | null {
    try {
      // Make sure there's no Bearer prefix
      const cleanToken = stripBearerPrefix(token);
      const decoded = JSON.parse(atob(cleanToken.split('.')[1]));
      return decoded;
    } catch (error) {
      console.error('Failed to verify token:', error);
      return null;
    }
  },
}; 