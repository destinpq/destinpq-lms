'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import {
  Form, 
  Input, 
  Button, 
  Checkbox, 
  Radio, 
  Alert, 
  Card, 
  Typography, 
  Divider 
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  BookOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

// Add interface for form values
interface SignupFormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'student' | 'instructor';
  agreeToTerms: boolean;
}

export default function SignupPage() {
  const { signUp, loading: authLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [form] = Form.useForm<SignupFormValues>();

  const onFinish = async (values: SignupFormValues) => {
    setError(null);
    
    // Validate passwords match
    if (values.password !== values.confirmPassword) {
      form.setFields([
        {
          name: 'confirmPassword',
          errors: ["Passwords don't match"]
        }
      ]);
      return;
    }
    
    try {
      await signUp(values.email, values.password, values.role, values.name);
      setSuccess(true);
      // Redirect logic can be added here or handled by AuthContext
    } catch (err) { 
      setError(err instanceof Error ? err.message : 'An unexpected error occurred during sign up.');
    }
  };

  if (success) {
    return (
      <div className="flex items-center justify-center" style={{ width: '100vw', height: '100vh', background: '#f0f2f5' }}>
        <Card style={{ width: 400, textAlign: 'center' }}>
          <Title level={3}>Account Created Successfully!</Title>
          <Text>You can now log in.</Text>
          <Link href="/login">
            <Button type="primary" style={{ marginTop: '20px' }}>Go to Login</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div 
      className="flex items-center justify-center" 
      style={{ 
        background: 'linear-gradient(to right, #4b6cb7, #182848)', 
        width: '100vw', 
        height: '100vh' 
      }}
    >
      <Card style={{ 
        width: 450, 
        maxWidth: '95%', 
        background: 'rgba(255, 255, 255, 0.95)', 
        borderRadius: '12px',
        margin: '0 auto', 
        display: 'block',
        position: 'relative',
        padding: '24px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <BookOutlined style={{ fontSize: '32px', color: '#4b6cb7', marginBottom: '12px' }} />
          <Title level={2} style={{ color: '#182848' }}>Create an Account</Title>
        </div>

        {error && (
          <Alert 
            message="Signup Error" 
            description={error} 
            type="error" 
            showIcon 
            closable 
            style={{ marginBottom: '16px' }}
            onClose={() => setError(null)}
          />
        )}

        <Form 
          form={form}
          layout="vertical" 
          onFinish={onFinish}
          autoComplete="off"
          requiredMark
        >
          {/* Name */}
          <Form.Item
            label="Full Name"
            name="name"
            rules={[{ required: true, message: 'Name must be at least 2 characters', min: 2 }]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="Enter your full name" 
              size="large"
            />
          </Form.Item>

          {/* Email */}
          <Form.Item
            label="Email Address"
            name="email"
            rules={[
              { required: true, message: 'Please enter your email' },
              { type: 'email', message: 'Please enter a valid email' }
            ]}
          >
            <Input 
              prefix={<MailOutlined />} 
              placeholder="Enter your email" 
              size="large"
              type="email"
            />
          </Form.Item>

          {/* Password */}
          <Form.Item
            label="Password"
            name="password"
            rules={[
              { required: true, message: 'Please enter your password' },
              { min: 6, message: 'Password must be at least 6 characters' }
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="Enter your password (min. 6 characters)" 
              size="large"
            />
          </Form.Item>

          {/* Confirm Password */}
          <Form.Item
            label="Confirm Password"
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Please confirm your password' }
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="Confirm your password" 
              size="large"
            />
          </Form.Item>

          {/* Role */}
          <Form.Item
            label="I am a:"
            name="role"
            rules={[{ required: true, message: 'Please select a role' }]}
          >
            <Radio.Group>
              <Radio value="student">Student</Radio>
              <Radio value="instructor">Instructor</Radio>
            </Radio.Group>
          </Form.Item>

          {/* Agree to Terms */}
          <Form.Item
            name="agreeToTerms"
            valuePropName="checked"
            rules={[{ 
              validator: (_, value) => 
                value ? Promise.resolve() : Promise.reject('You must agree to the terms and conditions') 
            }]}
          >
            <Checkbox>
              I agree to the <Link href="/terms" target="_blank" style={{ color: '#4b6cb7' }}>Terms of Service</Link> and <Link href="/privacy" target="_blank" style={{ color: '#4b6cb7' }}>Privacy Policy</Link>
            </Checkbox>
          </Form.Item>

          {/* Submit Button */}
          <Form.Item style={{ textAlign: 'center' }}>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={authLoading}
              size="large"
              style={{ 
                background: 'linear-gradient(to right, #4b6cb7, #182848)', 
                border: 'none',
                width: '200px',
                height: '48px'
              }}
            >
              {authLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </Form.Item>
        </Form>

        <Divider>Already have an account?</Divider>

        <Text style={{ textAlign: 'center', display: 'block' }}>
          <Link href="/login">
            <Button type="default" size="large" block>Sign In</Button>
          </Link>
        </Text>
      </Card>
    </div>
  );
} 