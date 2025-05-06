'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { Input, Button, Typography, Alert, Form } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

export default function Login() {
  const { signin, loading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      setError(null);
      setIsSubmitting(true);
      
      const { email, password } = formData;
      
      if (!email || !password) {
        throw new Error('Email and password are required');
      }
      
      // Call the signin function
      await signin(email, password);
      
      // The signin function will handle redirection
    } catch (error: unknown) {
      console.error('Login error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to login. Please check your credentials.';
      setError(errorMessage);
    } finally {
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