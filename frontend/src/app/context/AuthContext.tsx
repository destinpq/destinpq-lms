'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '@/api/authService';

// Define User interface
interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  isAdmin: boolean;
}

// Interface for decoded JWT payload
interface JwtPayload {
  sub: number;
  email: string;
  isAdmin: boolean;
  iat: number;
  exp: number;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signup: (firstName: string, lastName: string, email: string, password: string) => Promise<void>;
  signin: (email: string, password: string) => Promise<void>;
  signout: () => Promise<void>;
  setUser: (user: User | null) => void;
  getToken: () => string | null;
}

// Function to decode JWT token
function decodeJwt(token: string): JwtPayload | null {
  try {
    // Make sure to strip Bearer prefix if present
    const tokenWithoutBearer = token.startsWith('Bearer ') ? token.substring(7) : token;
    const base64Url = tokenWithoutBearer.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
}

// Create context with default values
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Function to get token with consistent format
  const getToken = (): string | null => {
    const token = localStorage.getItem('access_token');
    if (!token) return null;
    return token;
  };
  
  // Check for authentication token and load user on initial mount
  useEffect(() => {
    // Only run on client-side
    if (typeof window === 'undefined') return;
    
    async function authenticateUser() {
      const token = getToken();
      const userData = localStorage.getItem('current_user');
      
      console.log('Auth context initialized with token:', token ? 'exists' : 'none');
      console.log('Saved user in localStorage:', userData);
      
      if (!token) {
        console.log('No token found, setting loading to false');
        setUser(null); // Ensure user is null if no token
        localStorage.removeItem('current_user'); // Clear any orphaned user data
        setLoading(false);
        return;
      }
      
      try {
        // Try to load saved user data first if it exists
        if (userData) {
          try {
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);
          } catch (err) {
            console.error('Error parsing user data from localStorage:', err);
            localStorage.removeItem('current_user'); // Clear corrupted data
          }
        }
        
        // ALWAYS try to verify with backend and fetch fresh profile
        try {
          console.log('[AuthContext] Attempting to fetch user profile from backend...');
          const profile = await authService.getProfile();
          setUser(profile);
          localStorage.setItem('current_user', JSON.stringify(profile));
          console.log('[AuthContext] Profile fetched successfully, user set:', profile);
        } catch (profileError) {
          console.error('[AuthContext] Error fetching profile from backend:', profileError);
          // If profile fetch fails, the token is likely invalid or expired.
          // Clear all auth-related localStorage and set user to null.
          localStorage.removeItem('access_token');
          localStorage.removeItem('current_user');
          setUser(null);
          console.log('[AuthContext] Cleared stale auth data due to profile fetch error.');
        }
      } catch (err) {
        console.error('[AuthContext] General error during initial authentication:', err);
        // Fallback for other unexpected errors during the process
        localStorage.removeItem('access_token');
        localStorage.removeItem('current_user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    
    authenticateUser();
  }, []);

  const signup = async (firstName: string, lastName: string, email: string, password: string) => {
    console.log('Signing up with email:', email);
    setLoading(true);
    setError(null);
    
    try {
      const response = await authService.register({ firstName, lastName, email, password });
      
      if (!response.access_token) {
        throw new Error('No authentication token received');
      }
      
      // Store the raw token without Bearer prefix
      localStorage.setItem('access_token', response.access_token);
      
      let userData = response.user;
      
      if (!userData) {
        try {
          userData = await authService.getProfile();
        } catch (profileError) {
          console.error('Failed to fetch user profile after registration:', profileError);
          
          // Try to create user from token
          const decodedToken = decodeJwt(response.access_token);
          if (decodedToken) {
            userData = {
              id: decodedToken.sub,
              email: decodedToken.email,
              firstName: firstName,
              lastName: lastName,
              isAdmin: decodedToken.isAdmin
            };
          } else {
            throw new Error('Failed to get user profile');
          }
        }
      }
      
      localStorage.setItem('current_user', JSON.stringify(userData));
      setUser(userData);
      
      // Redirect to the appropriate dashboard
      window.location.href = userData.isAdmin ? 
        '/admin/dashboard' : '/student/dashboard';
        
    } catch (error) {
      console.error('Error during signup:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unknown error occurred during registration');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signin = async (email: string, password: string) => {
    console.log('Signing in with email:', email);
    setLoading(true);
    setError(null);
    
    try {
      const response = await authService.login({ email, password });
      
      if (!response.access_token) {
        throw new Error('No authentication token received');
      }
      
      // Store the token without Bearer prefix
      localStorage.setItem('access_token', response.access_token);
      
      let userData = response.user;
      
      if (!userData) {
        try {
          userData = await authService.getProfile();
        } catch (profileError) {
          console.error('Failed to fetch user profile after login:', profileError);
          
          // Try to create user from token
          const decodedToken = decodeJwt(response.access_token);
          if (decodedToken) {
            userData = {
              id: decodedToken.sub,
              email: decodedToken.email,
              firstName: decodedToken.email.split('@')[0],
              lastName: 'User',
              isAdmin: decodedToken.isAdmin
            };
          } else {
            throw new Error('Failed to get user profile');
          }
        }
      }
      
      localStorage.setItem('current_user', JSON.stringify(userData));
      setUser(userData);
      
      // Redirect based on user role
      window.location.href = userData.isAdmin ? 
        '/admin/dashboard' : '/student/dashboard';
        
    } catch (error) {
      console.error('Error during signin:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unknown error occurred during login');
      }
      
      // Make sure to clean up any partial auth data
      localStorage.removeItem('access_token');
      localStorage.removeItem('current_user');
      
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signout = async () => {
    console.log('User logging out, clearing authentication data');
    
    try {
      // Clear storage data
      localStorage.removeItem('access_token');
      localStorage.removeItem('current_user');
      
      // Reset user state
      setUser(null);
      setError(null);
      
      // Hard redirect to login
      window.location.href = '/login';
    } catch (error) {
      console.error('Error during logout:', error);
      
      // Final emergency attempt
      localStorage.clear();
      sessionStorage.clear();
      window.location.replace('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, signup, signin, signout, setUser, getToken }}>
      {children}
    </AuthContext.Provider>
  );
}