'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService, getValidToken } from '@/api/authService';
import { getRoute } from '@/utils/routeHelper';

// Define User interface
interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  isAdmin: boolean;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signup: (firstName: string, lastName: string, email: string, password: string) => Promise<void>;
  signin: (email: string, password: string) => Promise<void>;
  signout: () => Promise<void>;
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

// Function to validate user object and ensure it has proper ID
interface UserData {
  id: string | number;
  email?: string;
  firstName?: string;
  lastName?: string;
  isAdmin?: boolean;
}

const validateUser = (userData: UserData): User | null => {
  if (!userData) return null;
  
  // Ensure ID is a valid number
  const id = parseInt(String(userData.id));
  if (isNaN(id)) {
    console.error('Invalid user ID detected:', userData.id);
    return null;
  }
  
  return {
    id,
    email: userData.email || '',
    firstName: userData.firstName || '',
    lastName: userData.lastName || '',
    isAdmin: !!userData.isAdmin
  };
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  // Check for authentication token and load user on initial mount
  useEffect(() => {
    // Only run on client-side
    if (typeof window === 'undefined') return;
    
    // Add a small delay to ensure consistent client/server rendering
    const loadAuthState = setTimeout(() => {
      const token = getValidToken();
      
      if (token) {
        // Verify token and get user profile
        authService.getProfile()
          .then(userData => {
            // Validate user data before setting
            const validatedUser = validateUser(userData);
            if (validatedUser) {
              setUser(validatedUser);
              
              // For admin redirects, only do it once at login time
              // Don't do unnecessary redirects during general app usage
              // This part is handled in the signin/signup functions
            } else {
              // Handle invalid user data
              console.error('Invalid user data received:', userData);
              localStorage.removeItem('access_token');
              router.push('/login');
            }
          })
          .catch(err => {
            console.error('Error loading user profile:', err);
            // Clear token if invalid
            localStorage.removeItem('access_token');
            router.push('/login');
          })
          .finally(() => {
            setLoading(false);
          });
      } else {
        setLoading(false);
        // If no valid token and not on login/signup page, redirect to login
        const currentPath = window.location.pathname;
        if (!currentPath.includes('/login') && !currentPath.includes('/signup')) {
          router.push('/login');
        }
      }
    }, 0);
    
    return () => clearTimeout(loadAuthState);
  }, [router]);

  async function signup(firstName: string, lastName: string, email: string, password: string): Promise<void> {
    setLoading(true);
    setError(null);
    
    try {
      const result = await authService.register({ firstName, lastName, email, password });
      
      // Save token
      localStorage.setItem('access_token', result.access_token);
      
      // Validate and set user if available in response
      if (result.user) {
        const validatedUser = validateUser(result.user);
        if (validatedUser) {
          setUser(validatedUser);
          
          // Redirect based on user role
          if (validatedUser.isAdmin) {
            router.push('/admin/dashboard');
          } else {
            router.push('/student/dashboard');
          }
        } else {
          throw new Error('Invalid user data received from server');
        }
      } else {
        throw new Error('No user data received from server');
      }
    } catch (error) {
      let errorMessage = 'Failed to sign up';
      
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Check for common error messages and make them more user-friendly
        if (errorMessage.includes('Email already registered') || 
            errorMessage.includes('duplicate key') || 
            errorMessage.includes('already exists')) {
          errorMessage = 'This email is already registered. Please try logging in instead.';
        }
      }
      
      setError(errorMessage);
      console.error('Signup error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  async function signin(email: string, password: string): Promise<void> {
    setLoading(true);
    setError(null);
    
    try {
      const result = await authService.login({ email, password });
      
      // Save token
      localStorage.setItem('access_token', result.access_token);
      
      // Set user data
      if (!result.user) {
        // Try to fetch user profile if not included in login response
        try {
          const profile = await authService.getProfile();
          console.log('User profile after login:', profile);
          
          // Validate user data
          const validatedUser = validateUser(profile);
          if (validatedUser) {
            setUser(validatedUser);
            
            // Redirect based on user role
            if (validatedUser.isAdmin) {
              console.log('Redirecting admin user to admin courses page');
              router.push('/admin/workshops/courses');
            } else {
              router.push('/student/dashboard');
            }
          } else {
            throw new Error('Invalid user data received from server');
          }
        } catch (profileError) {
          console.error('Error fetching profile after login:', profileError);
          // Log the user out and redirect to login page
          localStorage.removeItem('access_token');
          router.push('/login');
          throw new Error('Could not load user profile');
        }
      } else {
        console.log('User provided in login response:', result.user);
        
        // Validate user data
        const validatedUser = validateUser(result.user);
        if (validatedUser) {
          setUser(validatedUser);
          
          // Redirect based on user role
          if (validatedUser.isAdmin) {
            console.log('Redirecting admin user to admin courses page');
            router.push('/admin/workshops/courses');
          } else {
            router.push('/student/dashboard');
          }
        } else {
          throw new Error('Invalid user data received from server');
        }
      }
    } catch (error) {
      let errorMessage = 'Failed to sign in';
      
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Make error messages more user-friendly
        if (errorMessage.includes('Invalid credentials') || 
            errorMessage.includes('Unauthorized')) {
          errorMessage = 'Invalid email or password. Please try again.';
        }
      }
      
      setError(errorMessage);
      console.error('Signin error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  async function signout(): Promise<void> {
    setLoading(true);
    
    try {
      authService.logout();
      setUser(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign out';
      setError(errorMessage);
      console.error('Signout error:', error);
    } finally {
      setLoading(false);
    }
  }

  const value: AuthContextType = {
    // Safely ensure we don't pass a direct user object that could be accidentally rendered
    // Instead, pass only the specific properties components should use
    user,
    loading,
    error,
    signup,
    signin,
    signout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
} 