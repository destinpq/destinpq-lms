'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { Input, Button, Typography, Alert, Space, Form } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

export default function Login() {
  const router = useRouter();
  const { signin, loading, user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [directApiResult, setDirectApiResult] = useState<string | null>(null);

  // Check if user is already logged in
  useEffect(() => {
    if (user) {
      router.push('/student/dashboard');
    }
  }, [user, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setError(null);
      setIsSubmitting(true);
      
      const { email, password } = formData;
      
      if (!email || !password) {
        throw new Error('Email and password are required');
      }
      
      console.log('Attempting to sign in with:', { email, password });
      
      await signin(email, password);
      
      // Manual redirect as backup
      setTimeout(() => {
        router.push('/student/dashboard');
      }, 500);
    } catch (error: unknown) {
      console.error('Login error details:', error);
      if (error instanceof Error) {
        setError(error.message || 'Failed to login. Please try again.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Direct API test function
  const testDirectApi = async () => {
    setDirectApiResult("Testing API directly...");
    try {
      const response = await fetch('http://localhost:15001/lms/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123',
        }),
      });
      
      const responseText = await response.text();
      console.log('Direct API Response:', response.status, responseText);
      
      if (response.ok) {
        setDirectApiResult(`Success! Status: ${response.status}, Response: ${responseText}`);
      } else {
        setDirectApiResult(`Error: ${response.status}, Response: ${responseText}`);
      }
    } catch (error) {
      console.error('Direct API test error:', error);
      setDirectApiResult(`Fetch error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-8 px-4" style={{
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
    }}>
      <div className="w-full max-w-md" style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
        padding: '32px',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background gradient effect for the card */}
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          background: 'linear-gradient(45deg, rgba(45, 63, 124, 0.03) 0%, rgba(91, 69, 168, 0.06) 100%)',
          zIndex: 0
        }} />
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="mb-8 text-center">
            <Title level={2} style={{ 
              color: '#2d3f7c', 
              textAlign: 'center',
              margin: '0 auto 16px',
              background: 'linear-gradient(90deg, #2d3f7c 0%, #5b45a8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Welcome Back
            </Title>
            <Text style={{ display: 'block', textAlign: 'center', color: '#666' }}>
              Sign in to access your account
            </Text>
          </div>

          {error && (
            <Alert
              message="Login Error"
              description={error}
              type="error"
              showIcon
              className="mb-6"
              closable
              onClose={() => setError(null)}
            />
          )}

          {directApiResult && (
            <Alert
              message="Direct API Test Result"
              description={directApiResult}
              type="info"
              showIcon
              className="mb-6"
              closable
              onClose={() => setDirectApiResult(null)}
            />
          )}

          <Form
            layout="vertical"
            onFinish={handleSubmit}
            style={{ textAlign: 'center' }}
          >
            <Form.Item
              label={<div style={{ textAlign: 'center', width: '100%' }}>Email address</div>}
              style={{ marginBottom: 16 }}
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
                prefix={<MailOutlined className="text-gray-400 mr-2" />}
              />
            </Form.Item>
            
            <Form.Item 
              label={<div style={{ textAlign: 'center', width: '100%' }}>Password</div>}
              style={{ marginBottom: 6 }}
            >
              <Input.Password
                id="password"
                name="password"
                size="large"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Your password"
                prefix={<LockOutlined className="text-gray-400 mr-2" />}
              />
            </Form.Item>

            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Link href="/forgot-password" style={{ 
                fontSize: '14px',
                background: 'linear-gradient(90deg, #2d3f7c 0%, #5b45a8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Forgot password?
              </Link>
            </div>

            <Space direction="vertical" style={{ width: '100%' }}>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={isSubmitting || loading}
                disabled={isSubmitting || loading}
                block
                style={{
                  background: 'linear-gradient(90deg, #2d3f7c 0%, #5b45a8 100%)',
                  border: 'none',
                  height: '48px',
                  marginTop: '16px'
                }}
              >
                {isSubmitting || loading ? 'Signing in...' : 'Sign in'}
              </Button>

              <Button 
                onClick={testDirectApi} 
                type="default" 
                size="large" 
                block
              >
                Test Direct API Connection
              </Button>
            </Space>
          </Form>

          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <Text style={{ color: '#666' }}>
              Don&apos;t have an account?{' '}
              <Link href="/signup" style={{ 
                color: '#2d3f7c',
                fontWeight: 500,
                background: 'linear-gradient(90deg, #2d3f7c 0%, #5b45a8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Sign up
              </Link>
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
} 