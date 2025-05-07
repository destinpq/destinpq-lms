'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  Button, 
  Layout,
  Menu,
  Typography,
  Space,
  Card, 
  Row, 
  Col
} from 'antd';
import { 
  RocketOutlined, 
  BulbOutlined, 
  SmileOutlined,
  ArrowRightOutlined,
  ExperimentOutlined,
  HeartOutlined,
  UserOutlined,
  LoginOutlined
} from '@ant-design/icons';

const { Header, Content, Footer } = Layout;
const { Title, Paragraph, Text } = Typography;

export default function Home() {
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
                />
              </div>
        <Menu mode="horizontal" defaultSelectedKeys={['home']} style={{ flex: 1, justifyContent: 'center' }}>
          <Menu.Item key="home" onClick={() => router.push('/')}>Home</Menu.Item>
          <Menu.Item key="workshops" onClick={() => router.push('/workshops')}>Workshops</Menu.Item>
          <Menu.Item key="about" onClick={() => router.push('/about')}>About</Menu.Item>
          <Menu.Item key="contact" onClick={() => router.push('/contact')}>Contact</Menu.Item>
        </Menu>
        <Space>
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

      <Content>
        {/* Hero Section */}
        <div style={{ textAlign: 'center', padding: '60px 50px', background: '#2d3f7c' }}>
          <Title level={1} style={{ color: 'white', marginBottom: 0 }}>Psychology</Title>
          <Title level={2} style={{ color: 'rgba(255, 255, 255, 0.85)', fontWeight: 'normal', marginTop: 8 }}>Learning Platform</Title>
          
          <Paragraph style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: 16, maxWidth: 700, margin: '20px auto' }}>
                  Access high-quality psychology workshops, interactive content, and assessments to enhance your learning experience.
                </Paragraph>
                
          <Space size="large">
                    <Button 
                      size="large"
              icon={<ArrowRightOutlined />}
                      onClick={() => router.push('/login')}
              style={{ backgroundColor: 'white', color: '#2d3f7c' }}
                    >
                      Get Started
                    </Button>
                    <Button 
                      size="large"
                      onClick={() => router.push('/signup')}
              ghost
                    >
                      Sign Up
                    </Button>
          </Space>
              </div>

        <div style={{ padding: '20px 0', textAlign: 'center' }}>
          <Title level={3}>Healing Through Understanding</Title>
            </div>

        {/* Featured Workshops */}
        <div style={{ padding: '0 50px 50px 50px', maxWidth: 1200, margin: '0 auto' }}>
          <Title level={2} style={{ textAlign: 'center', marginBottom: 40 }}>Featured Workshops</Title>
              
              <Row gutter={[24, 24]}>
                <Col xs={24} md={8}>
              <Card hoverable>
                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                  <div style={{ margin: '0 auto 20px', width: 70, height: 70, borderRadius: 35, background: '#4c5fac', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <BulbOutlined style={{ fontSize: 30, color: 'white' }} />
                  </div>
                  <Title level={4}>Cognitive Behavioral Techniques</Title>
                  <Paragraph>
                    Learn practical CBT methods to identify, challenge, and overcome negative thought patterns.
                  </Paragraph>
                      </div>
                <Button type="link">Learn More →</Button>
                  </Card>
                </Col>
            
                <Col xs={24} md={8}>
              <Card hoverable>
                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                  <div style={{ margin: '0 auto 20px', width: 70, height: 70, borderRadius: 35, background: '#5b45a8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ExperimentOutlined style={{ fontSize: 30, color: 'white' }} />
                  </div>
                  <Title level={4}>Neuroscience Fundamentals</Title>
                  <Paragraph>
                    Explore brain-behavior connections and understand how neural processes influence our psychology.
                  </Paragraph>
                      </div>
                <Button type="link">Learn More →</Button>
                  </Card>
                </Col>
            
                <Col xs={24} md={8}>
              <Card hoverable>
                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                  <div style={{ margin: '0 auto 20px', width: 70, height: 70, borderRadius: 35, background: '#0c9f6a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <SmileOutlined style={{ fontSize: 30, color: 'white' }} />
                  </div>
                  <Title level={4}>Positive Psychology</Title>
                  <Paragraph>
                    Discover the science of wellbeing and happiness through evidence-based approaches to positive mental health.
                  </Paragraph>
                      </div>
                <Button type="link">Learn More →</Button>
                  </Card>
                </Col>
              </Row>
            </div>
            
        {/* Why Choose Us */}
        <div style={{ padding: '50px', background: '#f7f9fc', maxWidth: 1200, margin: '0 auto' }}>
          <Title level={2} style={{ textAlign: 'center', marginBottom: 40 }}>Why Choose Our Platform</Title>
          
              <Row gutter={[32, 32]}>
                <Col xs={24} md={8}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ margin: '0 auto 20px', width: 60, height: 60, borderRadius: 30, background: '#eef1f8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <RocketOutlined style={{ fontSize: 24, color: '#2d3f7c' }} />
                      </div>
                <Title level={4}>Interactive Learning</Title>
                <Paragraph>
                  Engage with dynamic content designed to enhance understanding and retention.
                </Paragraph>
                  </div>
                </Col>
            
                <Col xs={24} md={8}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ margin: '0 auto 20px', width: 60, height: 60, borderRadius: 30, background: '#eef1f8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BulbOutlined style={{ fontSize: 24, color: '#2d3f7c' }} />
                      </div>
                <Title level={4}>Expert Instructors</Title>
                <Paragraph>
                  Learn from leading professionals in the field of psychology.
                </Paragraph>
                  </div>
                </Col>
            
                <Col xs={24} md={8}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ margin: '0 auto 20px', width: 60, height: 60, borderRadius: 30, background: '#eef1f8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <HeartOutlined style={{ fontSize: 24, color: '#2d3f7c' }} />
                      </div>
                <Title level={4}>Practical Skills</Title>
                <Paragraph>
                  Develop applicable techniques that translate to real-world scenarios.
                </Paragraph>
                  </div>
                </Col>
              </Row>
            </div>
            
        {/* Call to Action */}
        <div style={{ padding: '60px 50px', background: '#2d3f7c', textAlign: 'center' }}>
          <Title level={2} style={{ color: 'white', marginBottom: 20 }}>Begin Your Journey To Better Mental Health</Title>
          <Paragraph style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: 16, maxWidth: 700, margin: '0 auto 30px' }}>
                Join our community of learners and practitioners dedicated to psychological wellbeing and growth.
              </Paragraph>
              <Button 
                size="large"
                onClick={() => router.push('/signup')}
            style={{ backgroundColor: 'white', color: '#2d3f7c' }}
              >
                Start Your Free Trial
              </Button>
            </div>
      </Content>
      
      <Footer style={{ textAlign: 'center', padding: '20px' }}>
        <Text type="secondary">
                © {new Date().getFullYear()} Dr. Akanksha Agarwal&apos;s Mental Healthcare Clinic. All rights reserved.
        </Text>
      </Footer>
    </Layout>
  );
}
