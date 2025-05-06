'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { 
  Button, 
  Card, 
  Layout, 
  Typography, 
  Space, 
  Divider, 
  Avatar,
  Descriptions,
  Spin,
  Alert,
  Tabs
} from 'antd';
import { ArrowLeftOutlined, UserOutlined, CalendarOutlined, TeamOutlined, FilePdfOutlined } from '@ant-design/icons';
import { useAuth } from '@/app/context/AuthContext';

const { Content, Header } = Layout;
const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

export default function WorkshopPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [workshopData, setWorkshopData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    // In a real application, you would fetch data from your API
    // For now, we'll simulate with mock data based on the ID
    setTimeout(() => {
      // Mock data for demonstration
      if (id === 'adv-cognitive-techniques') {
        setWorkshopData({
          title: 'Advanced Cognitive Techniques',
          instructor: 'Dr. Sarah Johnson',
          date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
          description: 'This workshop explores advanced cognitive techniques used in modern psychotherapy. Participants will learn practical methods to identify, challenge, and restructure negative thought patterns.',
          duration: '2 hours',
          materials: [
            { name: 'Workshop Slides', type: 'PDF', link: '#' },
            { name: 'Practice Worksheets', type: 'PDF', link: '#' },
            { name: 'Recommended Reading', type: 'DOC', link: '#' }
          ],
          agenda: [
            { time: '10:00 AM', activity: 'Introduction to Advanced Cognitive Techniques' },
            { time: '10:30 AM', activity: 'Identifying Cognitive Distortions' },
            { time: '11:15 AM', activity: 'Break' },
            { time: '11:30 AM', activity: 'Practical Applications and Case Studies' },
            { time: '12:30 PM', activity: 'Q&A and Workshop Conclusion' }
          ]
        });
      } else {
        setError('Workshop not found');
      }
      setIsLoading(false);
    }, 1000);
  }, [id, user, loading, router]);

  if (loading || isLoading) {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Content style={{ padding: '50px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Spin size="large" />
        </Content>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Content style={{ padding: '50px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            style={{ maxWidth: '500px', width: '100%' }}
            action={
              <Button size="small" onClick={() => router.push('/student/dashboard')}>
                Return to Dashboard
              </Button>
            }
          />
        </Content>
      </Layout>
    );
  }

  if (!workshopData) {
    return null;
  }

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Header style={{ 
        background: '#fff', 
        padding: '0 20px', 
        display: 'flex', 
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ maxWidth: '1000px', width: '100%', display: 'flex', alignItems: 'center' }}>
          <Button 
            icon={<ArrowLeftOutlined />} 
            type="text"
            onClick={() => router.push('/student/dashboard')}
            style={{ marginRight: '20px' }}
          >
            Back to Dashboard
          </Button>
          <Title level={4} style={{ margin: 0 }}>Workshop Details</Title>
        </div>
      </Header>
      
      <Content style={{ padding: '24px', display: 'flex', justifyContent: 'center' }}>
        <div style={{ maxWidth: '1000px', width: '100%' }}>
          <Card style={{ marginBottom: 24, textAlign: 'center' }}>
            <Title level={2} style={{ textAlign: 'center' }}>{workshopData.title}</Title>
            <Space split={<Divider type="vertical" />} style={{ marginBottom: 24, justifyContent: 'center' }}>
              <Space>
                <UserOutlined />
                <Text>{workshopData.instructor}</Text>
              </Space>
              <Space>
                <CalendarOutlined />
                <Text>{formatDate(workshopData.date)}</Text>
              </Space>
              <Space>
                <TeamOutlined />
                <Text>{workshopData.duration}</Text>
              </Space>
            </Space>
            
            <Paragraph style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
              {workshopData.description}
            </Paragraph>
            
            <div style={{ marginTop: 24, marginBottom: 24, textAlign: 'center' }}>
              <Button type="primary" size="large">
                Join Workshop
              </Button>
              <Button 
                type="default" 
                size="large" 
                style={{ marginLeft: '16px' }}
                onClick={() => router.push(`/workshop/${id}/materials`)}
              >
                View Preparatory Materials
              </Button>
            </div>
          </Card>
          
          <Tabs 
            defaultActiveKey="1" 
            centered
            type="card"
            style={{ background: 'white', padding: '16px', borderRadius: '8px' }}
          >
            <TabPane tab="Materials" key="1">
              <div style={{ textAlign: 'center' }}>
                <Title level={4} style={{ textAlign: 'center', marginBottom: '24px' }}>Workshop Materials</Title>
                {workshopData.materials.map((material, index) => (
                  <div key={index} style={{ 
                    marginBottom: 16, 
                    display: 'flex', 
                    alignItems: 'center',
                    justifyContent: 'center', 
                    padding: '12px',
                    background: index % 2 === 0 ? '#f9f9f9' : 'transparent',
                    borderRadius: '8px'
                  }}>
                    <FilePdfOutlined style={{ fontSize: 20, marginRight: 8 }} />
                    <Space>
                      <Text strong>{material.name}</Text>
                      <Text type="secondary">({material.type})</Text>
                      <Button type="link" href={material.link}>Download</Button>
                    </Space>
                  </div>
                ))}
              </div>
            </TabPane>
            
            <TabPane tab="Agenda" key="2">
              <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
                <Title level={4} style={{ textAlign: 'center', marginBottom: '24px' }}>Workshop Agenda</Title>
                <Descriptions 
                  bordered 
                  column={1}
                  labelStyle={{ textAlign: 'center', fontWeight: 'bold', background: '#f5f5f5' }}
                  contentStyle={{ textAlign: 'center' }}
                >
                  {workshopData.agenda.map((item, index) => (
                    <Descriptions.Item key={index} label={item.time}>
                      {item.activity}
                    </Descriptions.Item>
                  ))}
                </Descriptions>
              </div>
            </TabPane>
          </Tabs>
        </div>
      </Content>
    </Layout>
  );
} 