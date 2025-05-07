'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import {
  Layout,
  Typography,
  Spin,
  Input,
  Button,
  Row,
  Col,
  Card,
  Form,
  message,
  Menu,
  Space,
} from 'antd';
import Image from 'next/image';
import { LoginOutlined, UserOutlined } from '@ant-design/icons';

const { Content, Header } = Layout;
const { Title, Text } = Typography;
const { TextArea } = Input;

// This list should ideally be managed dynamically if images can change.
// For now, it mirrors the list in the public About page.
const aboutPageImages = [
  { src: '/WhatsApp Image 2025-04-20 at 23.48.24 (1).jpeg', alt: 'Image 1' },
  { src: '/WhatsApp Image 2025-04-20 at 23.48.24 (2).jpeg', alt: 'Image 2' },
  { src: '/WhatsApp Image 2025-04-20 at 23.48.24 (3).jpeg', alt: 'Image 3' },
  { src: '/WhatsApp Image 2025-04-20 at 23.48.24.jpeg', alt: 'Image 4' },
  { src: '/WhatsApp Image 2025-04-20 at 23.48.25 (1).jpeg', alt: 'Image 5' },
  { src: '/WhatsApp Image 2025-04-20 at 23.48.25 (2).jpeg', alt: 'Image 6' },
  { src: '/WhatsApp Image 2025-04-20 at 23.48.25 (3).jpeg', alt: 'Image 7' },
  { src: '/WhatsApp Image 2025-04-20 at 23.48.25 (4).jpeg', alt: 'Image 8' },
  { src: '/WhatsApp Image 2025-04-20 at 23.48.25.jpeg', alt: 'Image 9' },
  { src: '/WhatsApp Image 2025-04-20 at 23.48.26.jpeg', alt: 'Image 10' },
];

interface ImageInfo {
  imageSrc: string;
  description: string | null;
}

export default function AdminPage() {
  const { user, loading: authLoading, getToken } = useAuth();
  const router = useRouter();
  const [form] = Form.useForm();
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://polar-lowlands-49166-189f8996c2e7.herokuapp.com/lms';

  // Access control effect
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
      } else if (user.email !== 'drakanksha@destinpq.com') {
        router.push('/');
      }
    }
  }, [user, authLoading, router]);

  // Fetch existing descriptions
  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoadingData(true);
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/about-page-content`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch image descriptions');
      const data: ImageInfo[] = await response.json();
      const descriptionsMap = data.reduce((acc, item) => {
        acc[item.imageSrc] = item.description;
        return acc;
      }, {} as Record<string, string | null>);
      form.setFieldsValue(descriptionsMap); // Set form initial values
    } catch (error) {
      console.error('Error fetching image data:', error);
      message.error('Failed to load image descriptions.');
    } finally {
      setLoadingData(false);
    }
  }, [user, getToken, form, API_URL]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onFinish = async (values: Record<string, string>) => {
    setSaving(true);
    const payload: ImageInfo[] = aboutPageImages.map(img => ({
      imageSrc: img.src,
      description: values[img.src] || null, // Use field value or null if empty
    }));

    console.log('Saving data:', payload);
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/about-page-content/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to save descriptions: ${errorData}`);
      }
      message.success('Descriptions saved successfully!');
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error saving descriptions:', error);
      message.error(String(error));
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loadingData) {
    return (
      <Layout style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spin size="large" />
      </Layout>
    );
  }

  if (!user || user.email !== 'drakanksha@destinpq.com') {
    return (
      <Layout style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Title level={3}>Access Denied. Redirecting...</Title>
      </Layout>
    );
  }

  return (
    <Layout>
      <Header style={{ background: '#fff', padding: '0 50px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Image 
            src="/logo.png" 
            alt="Dr. Akanksha Agarwal's Mental Healthcare Clinic"
            width={120}
            height={60}
            priority
            onClick={() => router.push('/')}
            style={{ cursor: 'pointer' }}
          />
        </div>
        <Menu mode="horizontal" defaultSelectedKeys={['admin']} style={{ flex: 1, justifyContent: 'center' }}>
          <Menu.Item key="home" onClick={() => router.push('/')}>Home</Menu.Item>
          <Menu.Item key="about" onClick={() => router.push('/about')}>About</Menu.Item>
          <Menu.Item key="contact" onClick={() => router.push('/contact')}>Contact</Menu.Item>
          {user && user.email === 'drakanksha@destinpq.com' && (
            <Menu.Item key="admin" onClick={() => router.push('/admin')}>Admin</Menu.Item>
          )}
        </Menu>
        <Space>
          {user ? (
            <Button onClick={() => { 
              localStorage.removeItem('access_token');
              localStorage.removeItem('current_user');
              router.push('/login');
            }}>
              Logout
            </Button>
          ) : (
            <>
              <Button 
                icon={<LoginOutlined />}
                onClick={() => router.push('/login')}
              >
                Login
              </Button>
              <Button 
                type="primary"
                icon={<UserOutlined />}
                onClick={() => router.push('/signup')}
              >
                Sign Up
              </Button>
            </>
          )}
        </Space>
      </Header>
      <Content style={{ padding: '20px 50px', maxWidth: 1200, margin: '0 auto' }}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: '30px' }}>
          Manage &apos;About Us&apos; Page Image Descriptions
        </Title>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Row gutter={[24, 24]}>
            {aboutPageImages.map((image) => (
              <Col key={image.src} xs={24} sm={12} md={8}>
                <Card 
                  title={<Text ellipsis={{ tooltip: image.src }}>{image.src.substring(1, 30)}...</Text>} 
                  hoverable
                >
                  <div style={{ height: 150, position: 'relative', marginBottom: 15}}>
                    <Image 
                      alt={image.alt}
                      src={image.src}
                      layout='fill'
                      objectFit='contain'
                    />
                  </div>
                  <Form.Item
                    name={image.src}
                    label={`Description for ${image.alt}`}
                  >
                    <TextArea 
                      rows={4} 
                      placeholder={`Enter description for ${image.alt}`}
                    />
                  </Form.Item>
                </Card>
              </Col>
            ))}
          </Row>
          <Form.Item style={{ marginTop: 30, textAlign: 'center' }}>
            <Button type="primary" htmlType="submit" loading={saving} size="large">
              Save All Descriptions
            </Button>
          </Form.Item>
        </Form>
      </Content>
    </Layout>
  );
} 