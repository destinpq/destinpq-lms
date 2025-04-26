'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { FirebaseError } from 'firebase/app';
import { Input, Button, Typography, Alert } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const { login, loading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError(null);
      setIsSubmitting(true);
      await login(data.email, data.password);
      // Redirect will be handled by the AuthContext
    } catch (error: unknown) {
      console.error('Login error:', error);
      if (error instanceof FirebaseError) {
        setError(error.message || 'Failed to login. Please try again.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4" style={{
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
    }}>
      <div className="max-w-md mx-auto" style={{
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
          <div className="mb-8">
            <Title level={2} style={{ 
              color: '#2d3f7c', 
              textAlign: 'center',
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
            />
          )}

          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">
                  Email address
                </label>
                <Input
                  id="email"
                  type="email"
                  size="large"
                  autoComplete="email"
                  {...register('email')}
                  placeholder="Your email address"
                  prefix={<MailOutlined className="text-gray-400 mr-2" />}
                  status={errors.email ? "error" : ""}
                />
                {errors.email && (
                  <Text type="danger" className="mt-1 text-sm">{errors.email.message}</Text>
                )}
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="password" className="block text-sm font-medium">
                    Password
                  </label>
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
                <Input.Password
                  id="password"
                  size="large"
                  autoComplete="current-password"
                  {...register('password')}
                  placeholder="Your password"
                  prefix={<LockOutlined className="text-gray-400 mr-2" />}
                  status={errors.password ? "error" : ""}
                />
                {errors.password && (
                  <Text type="danger" className="mt-1 text-sm">{errors.password.message}</Text>
                )}
              </div>
            </div>

            <div>
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
            </div>
          </form>

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