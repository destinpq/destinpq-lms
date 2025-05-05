// Use environment variable or fallback to default
// routeHelper has been removed, we'll use direct path construction instead

// Use the environment variable configured in .env or fall back to a default
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001';

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

// Helper function to check if token is expired
const isTokenExpired = (token: string): boolean => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('Invalid token format');
      return true;
    }
    
    const payload = JSON.parse(atob(parts[1]));
    if (!payload || typeof payload !== 'object') {
      console.error('Invalid token payload');
      return true;
    }
    
    if (!payload.exp || isNaN(Number(payload.exp))) {
      console.error('Missing or invalid expiration in token');
      return true;
    }
    
    const exp = payload.exp * 1000; // Convert to milliseconds
    return Date.now() >= exp;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true; // Assume expired if we can't validate
  }
};

// Get and validate token
export const getValidToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  const token = localStorage.getItem('access_token');
  if (!token) return null;
  
  // Check if token is expired
  if (isTokenExpired(token)) {
    console.warn('Token is expired or invalid, removing from storage');
    localStorage.removeItem('access_token');
    localStorage.removeItem('admin_user_override');
    return null;
  }
  
  return token;
};

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    console.log('Trying to login with:', JSON.stringify(credentials));
    console.log('Using API URL:', API_URL);
    
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
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (_) {
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
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (_) {
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

  async getProfile(): Promise<AuthResponse['user']> {
    const token = getValidToken();
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
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (_) {
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
  
  logout(): void {
    console.log('Logging out user and clearing all tokens');
    // Clear all authentication tokens
    localStorage.removeItem('access_token');
    localStorage.removeItem('admin_user_override');
    // Clear any session storage that might exist
    sessionStorage.clear();
    // Redirect to login page directly
    window.location.href = '/login';
  }
}; 