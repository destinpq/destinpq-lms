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
  Descriptions,
  Spin,
  Alert,
  Tabs
} from 'antd';
import { ArrowLeftOutlined, UserOutlined, CalendarOutlined, TeamOutlined, FilePdfOutlined, VideoCameraOutlined } from '@ant-design/icons';
import { useAuth } from '@/app/context/AuthContext';
import { workshopService, Workshop } from '@/api/workshopService';

const { Content, Header } = Layout;
const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

interface WorkshopData extends Workshop {
  materials: {
    name: string;
    type: string;
    link: string;
  }[];
  agenda: {
    time: string;
    activity: string;
  }[];
}

export default function WorkshopPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [workshopData, setWorkshopData] = useState<WorkshopData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    // Fetch workshop data from API
    const fetchWorkshopData = async () => {
      setIsLoading(true);
      try {
        if (!id) {
          setError('Workshop ID is missing');
          return;
        }
        
        const workshopId = Array.isArray(id) ? id[0] : id;
        const data = await workshopService.getWorkshopById(workshopId);
        setWorkshopData(data as WorkshopData);
      } catch (error) {
        console.error('Error fetching workshop data:', error);
        setError('Workshop not found or could not be loaded');
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkshopData();
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

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
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
              <Space>
                <Button 
                  type="primary" 
                  size="large"
                  icon={<VideoCameraOutlined />}
                  onClick={() => window.open('https://zoom.us/j/9809175590?pwd=9wYxfibXHuM59aRoIqGbeWOx2axXfz.1', '_blank')}
                >
                  Join Zoom Meeting
                </Button>
                <Button 
                  type="default" 
                  size="large" 
                  onClick={() => router.push(`/workshop/${id}/materials`)}
                >
                  View Preparatory Materials
                </Button>
              </Space>
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
                {workshopData.materials && workshopData.materials.length > 0 ? (
                  workshopData.materials.map((material, index) => (
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
                        <Button type="link" onClick={() => window.open(material.link, '_blank')}>Download</Button>
                      </Space>
                    </div>
                  ))
                ) : (
                  <Text>No materials available for this workshop</Text>
                )}
              </div>
            </TabPane>
            
            <TabPane tab="Agenda" key="2">
              <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
                <Title level={4} style={{ textAlign: 'center', marginBottom: '24px' }}>Workshop Agenda</Title>
                {workshopData.agenda && workshopData.agenda.length > 0 ? (
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
                ) : (
                  <Text>No agenda available for this workshop</Text>
                )}
              </div>
            </TabPane>
          </Tabs>
        </div>
      </Content>
    </Layout>
  );
} 