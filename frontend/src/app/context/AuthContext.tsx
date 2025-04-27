'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/api/authService';

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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  // Check for authentication token and load user on initial mount
  useEffect(() => {
    // Only run on client-side
    if (typeof window === 'undefined') return;
    
    const token = localStorage.getItem('access_token');
    
    if (token) {
      // Verify token and get user profile
      authService.getProfile()
        .then(userData => {
          setUser(userData);
        })
        .catch(err => {
          console.error('Error loading user profile:', err);
          localStorage.removeItem('access_token');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  async function signup(firstName: string, lastName: string, email: string, password: string): Promise<void> {
    setLoading(true);
    setError(null);
    
    try {
      const result = await authService.register({ firstName, lastName, email, password });
      
      // Save token
      localStorage.setItem('access_token', result.access_token);
      
      // Set user if available in response
      if (result.user) {
        setUser(result.user);
      }
      
      // Redirect based on user role
      if (result.user?.isAdmin) {
        router.push('/instructor/dashboard');
      } else {
        router.push('/student/dashboard');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign up';
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
      // Direct fetch to the API without using the service
      const response = await fetch('http://localhost:23001/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Login failed with status: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Save token
      localStorage.setItem('access_token', result.access_token);
      
      // For now use a mock user since the login endpoint doesn't return user data
      if (!result.user) {
        const mockUser = {
          id: 1,
          email,
          firstName: email.split('@')[0],
          lastName: 'User',
          isAdmin: false
        };
        setUser(mockUser);
      } else {
        setUser(result.user);
      }
      
      // Redirect to dashboard
      router.push('/student/dashboard');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign in';
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
      // Remove token
      localStorage.removeItem('access_token');
      setUser(null);
      
      // Redirect to login page
      router.push('/login');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign out';
      setError(errorMessage);
      console.error('Signout error:', error);
    } finally {
      setLoading(false);
    }
  }

  const value: AuthContextType = {
    user,
    loading,
    error,
    signup,
    signin,
    signout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
} 