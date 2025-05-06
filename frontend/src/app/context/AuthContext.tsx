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
  const router = useRouter();
  
  // Check for authentication token and load user on initial mount
  useEffect(() => {
    // Only run on client-side
    if (typeof window === 'undefined') return;
    
    const token = localStorage.getItem('access_token');
    
    if (token) {
      // First try to decode the token directly to check admin status
      const decodedToken = decodeJwt(token);
      console.log('Decoded token:', decodedToken);
      
      if (decodedToken) {
        // Check if token contains admin status
        const isAdmin = decodedToken.isAdmin === true;
        console.log('User admin status from token:', isAdmin);
        
        // Redirect based on admin status from token
        if (isAdmin) {
          console.log('Admin user detected in token, redirecting to admin dashboard');
          router.push('/admin/dashboard');
        }
      }
      
      // Also verify token with backend and get full user profile
      authService.getProfile()
        .then(userData => {
          console.log('User profile from API:', userData);
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
  }, [router]);

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
      
      // Try to decode token for admin status
      const decodedToken = decodeJwt(result.access_token);
      const isAdmin = decodedToken?.isAdmin === true || (result.user?.isAdmin === true);
      
      // Redirect based on user role
      if (isAdmin) {
        router.push('/admin/dashboard');
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
      // Use the auth service instead of direct fetch
      const result = await authService.login({ email, password });
      
      // Save token
      localStorage.setItem('access_token', result.access_token);
      
      // Parse the JWT token to check admin status directly
      const decodedToken = decodeJwt(result.access_token);
      console.log('Decoded token during signin:', decodedToken);
      
      // Check if admin status can be determined from token
      let isAdmin = false;
      if (decodedToken) {
        isAdmin = decodedToken.isAdmin === true;
        console.log('Admin status from token:', isAdmin);
      }
      
      // Use real user data from API or create a temporary user
      let userData: User;
      
      if (result.user) {
        // Use the user data from the response
        userData = result.user;
        isAdmin = isAdmin || result.user.isAdmin; // Use either token or user data for admin status
      } else {
        // Create user from token if possible
        if (decodedToken) {
          userData = {
            id: decodedToken.sub,
            email: decodedToken.email,
            firstName: email.split('@')[0], // Fallback
            lastName: 'User', // Fallback
            isAdmin: isAdmin
          };
        } else {
          // Fallback to getting user profile with the token
          try {
            userData = await authService.getProfile();
            isAdmin = isAdmin || userData.isAdmin;
          } catch (profileError) {
            console.error('Error fetching user profile:', profileError);
            
            // Last resort: create a temporary user based on login email
            userData = {
              id: 1,
              email,
              firstName: email.split('@')[0],
              lastName: 'User',
              isAdmin: email === 'admin@example.com' || email === 'drakanksha@destinpq.com' || isAdmin
            };
          }
        }
      }
      
      // Force admin for drakanksha@destinpq.com as backup
      if (email === 'drakanksha@destinpq.com') {
        console.log('FORCING ADMIN STATUS for drakanksha@destinpq.com');
        userData.isAdmin = true;
        isAdmin = true;
      }
      
      setUser(userData);
      
      console.log('Final admin status before redirect:', isAdmin);
      
      // Redirect based on user role
      if (isAdmin) {
        console.log('Redirecting to admin dashboard...');
        router.push('/admin/dashboard');
      } else {
        console.log('Redirecting to student dashboard...');
        router.push('/student/dashboard');
      }
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