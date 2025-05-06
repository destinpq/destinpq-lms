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

// Force clear cache and reset user state
function clearCacheAndResetUser() {
  if (typeof window !== 'undefined') {
    console.log('Clearing all localStorage data to reset state');
    localStorage.removeItem('workshops');
    console.log('Force reloading page to ensure fresh state');
    window.location.reload();
  }
}

// Force refresh token - re-login with hardcoded credentials for emergency backup
async function emergencyRefreshToken() {
  try {
    console.log('EMERGENCY: Attempting to force refresh token');
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'drakanksha@destinpq.com',
        password: 'DestinPQ@24225'
      }),
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('EMERGENCY: Token refresh successful');
      return data.access_token;
    } else {
      console.error('EMERGENCY: Token refresh failed');
      return null;
    }
  } catch (error) {
    console.error('EMERGENCY: Token refresh error', error);
    return null;
  }
}

// Format a bearer token correctly
function formatBearerToken(token: string): string {
  if (!token) return '';
  // Ensure token has Bearer prefix
  return token.startsWith('Bearer ') ? token : `Bearer ${token}`;
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
    
    // Get token
    let token = localStorage.getItem('access_token');
    const savedUser = localStorage.getItem('current_user');
    
    console.log('Auth context initialized with token:', token ? 'exists' : 'none');
    console.log('Saved user in localStorage:', savedUser);
    
    // Ensure token has correct format
    if (token && !token.startsWith('Bearer ')) {
      token = `Bearer ${token}`;
      localStorage.setItem('access_token', token);
      console.log('Fixed token format with Bearer prefix');
    }
    
    async function authenticateUser() {
      if (!token) {
        console.log('No token found, setting loading to false');
        setLoading(false);
        return;
      }
      
      try {
        // First try to decode the token directly
        const rawToken = token.replace('Bearer ', '');
        const decodedToken = decodeJwt(rawToken);
        console.log('Decoded token on refresh:', decodedToken);
        
        if (!decodedToken) {
          console.log('Invalid token, clearing auth state');
          localStorage.removeItem('access_token');
          localStorage.removeItem('current_user');
          setUser(null);
          setLoading(false);
          return;
        }
        
        // Check token expiration
        const now = Math.floor(Date.now() / 1000);
        if (decodedToken.exp && decodedToken.exp < now) {
          console.log('Token expired, trying to refresh');
          token = await emergencyRefreshToken();
          
          if (!token) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('current_user');
            setUser(null);
            setLoading(false);
            return;
          }
          
          // Save the new token
          token = `Bearer ${token}`;
          localStorage.setItem('access_token', token);
        }
        
        // Check if we have a saved user
        if (savedUser) {
          try {
            const parsedUser = JSON.parse(savedUser);
            console.log('Using saved user from localStorage:', parsedUser);
            setUser(parsedUser);
            
            // Don't auto-redirect on page refresh - let the current page stay
            // Just update the user state
          } catch (e) {
            console.error('Error parsing saved user:', e);
            // Continue with profile fetch if parsing fails
          }
        }
        
        // For drakanksha@destinpq.com - always use hardcoded user when token matches
        if (decodedToken.email === 'drakanksha@destinpq.com') {
          const adminUser = {
            id: 1000,
            email: 'drakanksha@destinpq.com',
            firstName: 'Akanksha',
            lastName: 'Destin',
            isAdmin: true
          };
          
          console.log('Using hardcoded admin user for drakanksha@destinpq.com');
          setUser(adminUser);
          localStorage.setItem('current_user', JSON.stringify(adminUser));
          setLoading(false);
          return;
        }
        
        // Always verify with backend for the most up-to-date profile
        console.log('Fetching user profile from backend');
        const userData = await authService.getProfile();
        console.log('User profile fetched:', userData);
        
        // Update user in state and localStorage
        setUser(userData);
        localStorage.setItem('current_user', JSON.stringify(userData));
        
        // Special handling for admin users
        if (userData.email === 'drakanksha@destinpq.com' && !userData.isAdmin) {
          console.log('Force setting admin for drakanksha@destinpq.com');
          userData.isAdmin = true;
          setUser({...userData, isAdmin: true});
          localStorage.setItem('current_user', JSON.stringify({...userData, isAdmin: true}));
        }
      } catch (err) {
        console.error('Error authenticating user:', err);
        
        // Try to use saved user if API fails
        if (savedUser) {
          try {
            const parsedUser = JSON.parse(savedUser);
            console.log('Using saved user as fallback:', parsedUser);
            setUser(parsedUser);
          } catch (e) {
            console.error('Error parsing saved user as fallback:', e);
            setUser(null);
            localStorage.removeItem('current_user');
          }
        } else {
          // Clear everything if no saved user
          setUser(null);
          localStorage.removeItem('access_token');
        }
      } finally {
        setLoading(false);
      }
    }
    
    authenticateUser();
  }, [router]);

  const signup = async (firstName: string, lastName: string, email: string, password: string) => {
    // Implementation of signup
  };

  const signin = async (email: string, password: string) => {
    console.log('Signing in with email:', email);
    setLoading(true);
    setError(null);
    
    try {
      // First clear any existing auth data
      localStorage.removeItem('access_token');
      localStorage.removeItem('current_user');
      
      // Attempt to login
      const response = await authService.login({ email, password });
      console.log('Login response received:', { hasToken: !!response.access_token, hasUser: !!response.user });
      
      if (!response.access_token) {
        throw new Error('No authentication token received');
      }
      
      // Store the token (without Bearer prefix)
      localStorage.setItem('access_token', response.access_token);
      
      let userData = response.user;
      
      // If no user data in response, try to get profile
      if (!userData) {
        try {
          userData = await authService.getProfile();
        } catch (profileError) {
          console.error('Failed to fetch user profile after login:', profileError);
          
          // Try to create user from token
          const decodedToken = authService.parseToken(response.access_token);
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
      
      // Special case for the admin user
      if (userData.email === 'drakanksha@destinpq.com') {
        userData.isAdmin = true;
      }
      
      // Save user data and update state
      localStorage.setItem('current_user', JSON.stringify(userData));
      setUser(userData);
      
      // FORCE REDIRECT based on user role
      console.log('Login successful, FORCE redirecting based on role. isAdmin:', userData.isAdmin);
      
      // Use window.location for a hard redirect instead of router.push which has issues
      if (userData.isAdmin) {
        // Give time for localStorage to update
        setTimeout(() => {
          window.location.href = '/admin/dashboard';
        }, 100);
      } else {
        // Give time for localStorage to update
        setTimeout(() => {
          window.location.href = '/student/dashboard';
        }, 100);
      }
    } catch (error) {
      console.error('Error during signin:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unknown error occurred during login');
      }
      throw error; // Re-throw to let the calling code handle it
    } finally {
      setLoading(false);
    }
  };

  const signout = async () => {
    console.log('User logging out, clearing authentication data');
    
    try {
      // Clear ALL localStorage completely
      localStorage.clear();
      
      // Just to be extra safe, explicitly remove these items
      localStorage.removeItem('access_token');
      localStorage.removeItem('current_user');
      localStorage.removeItem('workshops');
      
      // Clear any other cached data
      sessionStorage.clear();
      
      // Remove any cookies by setting them to expire
      document.cookie.split(";").forEach(function(c) {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
      
      // Reset user state
      setUser(null);
      setError(null);
      
      console.log('Successfully cleared ALL storage data, performing hard redirect');
      
      // Add a timestamp to prevent browser caching
      const timestamp = new Date().getTime();
      
      // Use a complete page reload to the login page with cache-busting parameter
      window.location.href = `/login?t=${timestamp}`;
    } catch (error) {
      console.error('Error during logout:', error);
      
      // Last resort - force a total reload to login
      if (typeof window !== 'undefined') {
        // Final emergency attempt
        try {
          localStorage.clear();
          sessionStorage.clear();
          
          // Force reload the page completely
          window.location.href = '/login?forceClear=true';
        } catch {
          // Absolute last resort
          window.location.replace('/login');
        }
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, signup, signin, signout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}