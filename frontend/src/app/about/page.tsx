'use client';

import { useEffect, useState } from 'react';
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
  Spin,
  Divider
} from 'antd';
import { 
  LoginOutlined,
  UserOutlined
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';

const { Header, Content, Footer } = Layout;
const { Title, Paragraph } = Typography;

const images = [
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

interface ImageInfoData {
  imageSrc: string;
  description: string | null;
}

export default function AboutPage() {
  const router = useRouter();
  const [imageDescriptions, setImageDescriptions] = useState<Record<string, string | null>>({});
  const [loadingDescriptions, setLoadingDescriptions] = useState(true);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://polar-lowlands-49166-189f8996c2e7.herokuapp.com/lms';

  useEffect(() => {
    const fetchDescriptions = async () => {
      setLoadingDescriptions(true);
      try {
        const response = await fetch(`${API_URL}/about-page-content`);
        if (!response.ok) {
          throw new Error('Failed to fetch image descriptions');
        }
        const data: ImageInfoData[] = await response.json();
        const descriptionsMap = data.reduce((acc, item) => {
          acc[item.imageSrc] = item.description;
          return acc;
        }, {} as Record<string, string | null>);
        setImageDescriptions(descriptionsMap);
      } catch (error) {
        console.error('Error fetching descriptions for About page:', error);
        // Not showing an error message on public page, but logging it.
      } finally {
        setLoadingDescriptions(false);
      }
    };
    fetchDescriptions();
  }, [API_URL]);

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
        <Menu mode="horizontal" defaultSelectedKeys={['about']} style={{ flex: 1, justifyContent: 'center' }}>
          <Menu.Item key="home" onClick={() => router.push('/')}>Home</Menu.Item>
          {/* <Menu.Item key="workshops" onClick={() => router.push('/workshops')}>Workshops</Menu.Item> */}
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

      <Content style={{ padding: '50px', maxWidth: 1200, margin: '0 auto' }}>
        <Title level={1} style={{ textAlign: 'center', marginBottom: '50px' }}>About Dr. Akanksha Agarwal</Title>
        
        <Row justify="center" style={{ marginBottom: '40px' }}>
          <Col xs={24} md={20} lg={18}>
            <Title level={3} style={{marginTop: '20px'}}>Who are you?</Title>
            <Paragraph style={{ fontSize: '16px', lineHeight: '1.8' }}>
              Hi. I&apos;m Dr. Akanksha Agarwal, a Licensed Clinical & Counseling Psychologist with over a decade of experience in the field of Mental Healthcare and Psychology.
            </Paragraph>

            <Title level={3} style={{marginTop: '20px'}}>What is your area of expertise?</Title>
            <Paragraph style={{ fontSize: '16px', lineHeight: '1.8' }}>
              I specialize in Cognitive Behavior Therapy, Neuropsychology, Fourth wave therapies, Psycho-Oncology and use evidenced based practices to help clients/patients ranging from pediatric to geriatric. I pay strong emphasis on accurate diagnosis and tailor-made treatment.
            </Paragraph>

            <Title level={3} style={{marginTop: '20px'}}>What services do you offer?</Title>
            <Paragraph style={{ fontSize: '16px', lineHeight: '1.8' }}>
              I provide offline and online consultations for assessments, diagnostic clarifications, psychotherapy. I also provide training and supervision, teaching, workshop collaborations.
            </Paragraph>

            <Title level={3} style={{marginTop: '20px'}}>Who do you work with?</Title>
            <Paragraph style={{ fontSize: '16px', lineHeight: '1.8' }}>
              I work with pediatrics to geriatrics, providing interventions suitable on case-basis.
            </Paragraph>

            <Title level={3} style={{marginTop: '20px'}}>What is your approach or philosophy?</Title>
            <Paragraph style={{ fontSize: '16px', lineHeight: '1.8' }}>
              I strongly believe that every human has the potential to be the best of their abilities. I practice confidentiality, informed consent, utmost respect and dignity, empathy and understanding, non- judgemental attitude and cultural competence.
            </Paragraph>

            <Title level={3} style={{marginTop: '20px'}}>Why should someone choose you?</Title>
            <Paragraph style={{ fontSize: '16px', lineHeight: '1.8' }}>
              I believe in delivering to the best of my abilities. I do not shy away from exploring and learning. I give my 200% to each case. My approach is not time bound where the focus is on finishing the season in under 50 minutes. It is beyond materiality. Any change occurs only through awareness and acceptance and that is what I help my clients/ patients discover and achieve.
            </Paragraph>

            <Title level={3} style={{marginTop: '20px'}}>How can people get in touch with you?</Title>
            <Paragraph style={{ fontSize: '16px', lineHeight: '1.8' }}>
              You can get in touch by exploring the workshops and services offered on this platform, or by reaching out through the <a href="/contact">Contact page</a> for consultations or collaborations.
            </Paragraph>
          </Col>
        </Row>

        <Divider />

        <Title level={2} style={{ textAlign: 'center', margin: '40px 0' }}>Gallery</Title>
        {loadingDescriptions ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Spin size="large" />
          </div>
        ) : (
          <Row gutter={[16, 16]}>
            {images.map((image, index) => (
              <Col key={index} xs={24} sm={12} md={8} lg={6}>
                <Card
                  hoverable
                  cover={<Image alt={image.alt} src={image.src} width={400} height={300} style={{ objectFit: 'cover' }} />}
                >
                  {imageDescriptions[image.src] && (
                    <Card.Meta description={imageDescriptions[image.src]} style={{ padding: '10px 0'}} />
                  )}
                </Card>
              </Col>
            ))}
          </Row>
        )}

      </Content>

      <Footer style={{ textAlign: 'center', padding: '20px' }}>
        <Typography.Text type="secondary">
          © {new Date().getFullYear()} Dr. Akanksha Agarwal&apos;s Mental Healthcare Clinic. All rights reserved.
        </Typography.Text>
      </Footer>
    </Layout>
  );
} 