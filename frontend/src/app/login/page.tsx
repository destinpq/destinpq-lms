'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { Input, Button, Typography, Alert, Form } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

// Extend Window interface for our custom property
declare global {
  interface Window {
    __authCleared?: boolean;
  }
}

// Immediately clear auth data with script to ensure it runs before React hydrates
if (typeof window !== 'undefined') {
  // Execute this as soon as the file is loaded, before the component renders
  console.log('PRE-RENDER: Force clearing all authentication data');
  localStorage.removeItem('access_token');
  localStorage.removeItem('current_user');
  
  // Set a flag to indicate we've already cleared on this page load
  window.__authCleared = true;
}

export default function Login() {
  const router = useRouter();
  const { signin, loading, user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });

  // Ensure all authentication data is cleared when the login page loads
  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log('Login page loaded, checking for existing auth data');
      
      // Get URL parameters without using useSearchParams
      const urlParams = new URLSearchParams(window.location.search);
      const forceClear = urlParams.get('forceClear') === 'true';
      const timestamp = urlParams.get('t');
      
      // Check for force clear parameter
      if (forceClear) {
        console.log('Force clear parameter detected, aggressively clearing all data');
        localStorage.clear();
        sessionStorage.clear();
        
        // Also clear cookies
        document.cookie.split(";").forEach(function(c) {
          document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });
      }
      
      // Always clear these critical items when the login page loads
      localStorage.removeItem('access_token');
      localStorage.removeItem('current_user');
      
      // Force a refresh if needed - this will help clear stale browser cache
      if (timestamp && (Date.now() - parseInt(timestamp)) > 5000) {
        // If the timestamp is more than 5 seconds old, refresh to clear any potential cache
        window.location.reload();
      }
      
      // If we still have a user in context after clearing storage, force a full page reload
      if (user) {
        console.log('User still in context after clearing storage, forcing hard reload');
        const randomParam = Math.random().toString(36).substring(7);
        window.location.href = `/login?forceClear=true&cache=${randomParam}`;
      }
    }
  }, [user]);

  // Check if user is already logged in - let AuthContext handle the redirection
  useEffect(() => {
    // We don't need to redirect here - AuthContext will handle it
    // Instead, just check if a user is logged in to prevent showing login page unnecessarily
    if (user) {
      console.log('User already logged in, redirecting via AuthContext...');
    }
  }, [user, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      console.log('Logging in with:', { email: formData.email, password: '******' });
      console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);
      setError(null);
      setIsSubmitting(true);
      
      const { email, password } = formData;
      
      if (!email || !password) {
        throw new Error('Email and password are required');
      }
      
      // Let the signin function in AuthContext handle the redirection based on user role
      await signin(email, password);
      
      // No need for manual redirect here - AuthContext will handle it
    } catch (error: Error | unknown) {
      console.error('Login error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to login. Please check your credentials.';
      setError(errorMessage);
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '32px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '450px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        padding: '40px',
        textAlign: 'center'
      }}>
        <Title level={2} style={{ 
          color: '#4F46E5',
          marginBottom: '8px'
        }}>
          Welcome Back
        </Title>
        <Text style={{ 
          display: 'block', 
          color: '#6B7280', 
          marginBottom: '32px'
        }}>
          Sign in to access your account
        </Text>

        {error && (
          <Alert
            message="Login Error"
            description={error}
            type="error"
            showIcon
            style={{ marginBottom: '24px' }}
            closable
            onClose={() => setError(null)}
          />
        )}

        <Form
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            label="Email address"
            style={{ marginBottom: '16px', textAlign: 'left' }}
          >
            <Input
              id="email"
              name="email"
              type="email"
              size="large"
              autoComplete="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Your email address"
              prefix={<MailOutlined style={{ color: '#9CA3AF' }} />}
            />
          </Form.Item>
          
          <Form.Item 
            label="Password"
            style={{ marginBottom: '8px', textAlign: 'left' }}
          >
            <Input.Password
              id="password"
              name="password"
              size="large"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Your password"
              prefix={<LockOutlined style={{ color: '#9CA3AF' }} />}
            />
          </Form.Item>

          <div style={{ textAlign: 'right', marginBottom: '24px' }}>
            <Link href="/forgot-password" style={{ 
              fontSize: '14px',
              color: '#4F46E5'
            }}>
              Forgot password?
            </Link>
          </div>

          <Button
            type="primary"
            htmlType="submit"
            size="large"
            loading={isSubmitting || loading}
            disabled={isSubmitting || loading}
            block
            style={{
              background: '#4F46E5',
              height: '48px',
              marginTop: '16px'
            }}
          >
            {isSubmitting || loading ? 'Signing in...' : 'Sign in'}
          </Button>
        </Form>

        <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #E5E7EB' }}>
          <Text style={{ color: '#6B7280' }}>
            Don&apos;t have an account?{' '}
            <Link href="/signup" style={{ 
              color: '#4F46E5',
              fontWeight: 500
            }}>
              Sign up
            </Link>
          </Text>
        </div>
      </div>
    </div>
  );
} 