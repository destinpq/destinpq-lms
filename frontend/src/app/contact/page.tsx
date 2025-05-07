'use client';

import Image from 'next/image';
import {
  Layout,
  Menu,
  Typography,
  Space,
  Button,
  Row,
  Col,
  Card,
} from 'antd';
import { 
  LoginOutlined,
  UserOutlined,
  EnvironmentOutlined, // For address icon
  PhoneOutlined,       // For phone icon
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';

const { Header, Content, Footer } = Layout;
const { Title, Paragraph, Text } = Typography;

export default function ContactPage() {
  const router = useRouter();

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
        <Menu mode="horizontal" defaultSelectedKeys={['contact']} style={{ flex: 1, justifyContent: 'center' }}>
          <Menu.Item key="home" onClick={() => router.push('/')}>Home</Menu.Item>
          <Menu.Item key="about" onClick={() => router.push('/about')}>About</Menu.Item>
          <Menu.Item key="contact" onClick={() => router.push('/contact')}>Contact</Menu.Item>
        </Menu>
        <Space>
          {/* Basic user login/signup, ideally use AuthContext for user state */}
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
        </Space>
      </Header>

      <Content style={{ padding: '50px', maxWidth: 1200, margin: '0 auto' }}>
        <Title level={1} style={{ textAlign: 'center', marginBottom: '50px' }}>Contact Us</Title>
        
        <Row gutter={[32, 48]} justify="center">
          {/* Contact Details Column */}
          <Col xs={24} md={12} lg={10}>
            <Title level={3}>Get In Touch</Title>
            <Paragraph style={{ fontSize: '16px', marginBottom: '30px' }}>
              We&apos;d love to hear from you! Whether you have questions, need to schedule a consultation, or want to discuss collaborations, please feel free to reach out through any of the methods below.
            </Paragraph>

            <div style={{ marginBottom: '20px' }}>
              <Space align="start" size="middle">
                <EnvironmentOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
                <div>
                  <Text strong style={{ display: 'block', fontSize: '16px' }}>Address</Text>
                  <Text style={{ fontSize: '16px' }}>
                    1-126, Raja Manohar Colony, Himayatnagar,<br/>
                    Hyderabad, Telangana 500029
                  </Text>
                </div>
              </Space>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <Space align="start" size="middle">
                <PhoneOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
                <div>
                  <Text strong style={{ display: 'block', fontSize: '16px' }}>Mobile</Text>
                  <Text style={{ fontSize: '16px' }}>+91 70139 83168</Text><br/>
                  <Text style={{ fontSize: '16px' }}>+91 99852 22775</Text>
                </div>
              </Space>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <Space align="start" size="middle">
                <PhoneOutlined style={{ fontSize: '24px', color: '#1890ff' }} /> {/* Using PhoneOutlined again for general phone */}
                <div>
                  <Text strong style={{ display: 'block', fontSize: '16px' }}>Phone (Landline/Other)</Text>
                  <Text style={{ fontSize: '16px' }}>+91 80-74790542</Text>
                </div>
              </Space>
            </div>
            
            {/* Placeholder for Email - you can add this if you have an email address to display */}
            {/* <div style={{ marginBottom: '20px' }}>
              <Space align="start" size="middle">
                <MailOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
                <div>
                  <Text strong style={{ display: 'block', fontSize: '16px' }}>Email</Text>
                  <Text style={{ fontSize: '16px' }}>contact@drakanksha.co</Text> 
                </div>
              </Space>
            </div> */}
          </Col>

          {/* Map Image Column - Placeholder, replace src with actual image path if you upload it */}
          <Col xs={24} md={12} lg={14}>
            <Title level={3}>Our Location</Title>
            <Card>
              {/* Replace with your map image if you have one uploaded to /public */}
              {/* For now, a placeholder indicating where the map image would go */}
              <div style={{ 
                height: '400px', 
                background: '#f0f2f5', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                borderRadius: '8px' 
              }}>
                {/* You can use an <Image> component here if you upload the map screenshot */}
                <Text type="secondary">Map Image Placeholder (e.g., /map-screenshot.png)</Text>
              </div>
            </Card>
          </Col>
        </Row>

      </Content>

      <Footer style={{ textAlign: 'center', padding: '20px' }}>
        <Typography.Text type="secondary">
          © {new Date().getFullYear()} Dr. Akanksha Agarwal&apos;s Mental Healthcare Clinic. All rights reserved.
        </Typography.Text>
      </Footer>
    </Layout>
  );
} 