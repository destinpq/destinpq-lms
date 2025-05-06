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
}

// Function to decode JWT token
function decodeJwt(token: string): JwtPayload | null {
  try {
    const base64Url = token.split('.')[1];
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
  
  // Check for authentication token and load user on initial mount
  useEffect(() => {
    // Only run on client-side
    if (typeof window === 'undefined') return;
    
    async function authenticateUser() {
      const token = localStorage.getItem('access_token');
      const userData = localStorage.getItem('current_user');
      
      console.log('Auth context initialized with token:', token ? 'exists' : 'none');
      console.log('Saved user in localStorage:', userData);
      
      if (!token) {
        console.log('No token found, setting loading to false');
        setLoading(false);
        return;
      }
      
      try {
        // Try to load saved user data first 
        if (userData) {
          try {
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);
          } catch (err) {
            console.error('Error parsing user data:', err);
          }
        }
        
        // Try to verify with backend, but don't clear storage if it fails
        try {
          const profile = await authService.getProfile();
          setUser(profile);
          localStorage.setItem('current_user', JSON.stringify(profile));
        } catch (profileError) {
          console.error('Error fetching profile from backend:', profileError);
          
          // Don't clear auth data, just use what we have from localStorage or token
          if (!userData && token) {
            // If no user data in localStorage but we have a token, try to extract info from token
            const decodedToken = decodeJwt(token);
            if (decodedToken) {
              const tokenUser = {
                id: decodedToken.sub,
                email: decodedToken.email,
                firstName: decodedToken.email.split('@')[0],
                lastName: 'User',
                isAdmin: decodedToken.isAdmin
              };
              setUser(tokenUser);
              localStorage.setItem('current_user', JSON.stringify(tokenUser));
              console.log('Using user data extracted from token');
            }
          }
        }
      } catch (err) {
        console.error('Error authenticating user:', err);
        // Don't clear user if we already set it from localStorage
        if (!user) {
          setUser(null);
        }
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
    <AuthContext.Provider value={{ user, loading, error, signup, signin, signout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}