'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, Button, Alert, Space, Layout, Typography, Row, Col, Spin } from 'antd';
import { ArrowLeftOutlined, VideoCameraOutlined } from '@ant-design/icons';
import { useAuth } from '@/app/context/AuthContext';
import ZoomMeeting from '@/components/ZoomMeeting';
import { zoomService } from '@/api/zoomService';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

export default function WorkshopMeetingPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [workshopTitle, setWorkshopTitle] = useState<string>('');
  const [meetingId, setMeetingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    const fetchWorkshopAndMeeting = async () => {
      if (!id) return;

      setLoading(true);
      setError(null);

      try {
        // In a real app, fetch meeting ID from the workshop ID
        // For now, we'll assume workshop ID = meeting ID for demo purposes
        const workshopId = Array.isArray(id) ? id[0] : id;
        
        // You would fetch workshop details and meeting details here
        // const workshopDetails = await workshopService.getWorkshopById(workshopId);
        // setWorkshopTitle(workshopDetails.title);
        
        // For demo, we'll use a static title
        setWorkshopTitle('Advanced Cognitive Techniques');
        setMeetingId(workshopId);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load workshop meeting details';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkshopAndMeeting();
  }, [id, router, user, authLoading]);

  const handleBackClick = () => {
    router.push(`/workshop/${id}`);
  };

  if (authLoading || loading) {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Content style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Spin size="large" tip="Loading workshop meeting..." />
        </Content>
      </Layout>
    );
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Header style={{ 
        background: '#fff', 
        padding: '0 20px', 
        display: 'flex', 
        alignItems: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
      }}>
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={handleBackClick}
          style={{ marginRight: 16 }}
        >
          Back to Workshop
        </Button>
        <Title level={4} style={{ margin: 0 }}>
          {workshopTitle} - Live Meeting
        </Title>
      </Header>

      <Content style={{ padding: '24px' }}>
        <Row justify="center">
          <Col xs={24} lg={20}>
            {error ? (
              <Card>
                <Alert
                  message="Error Loading Zoom Meeting"
                  description={error}
                  type="error"
                  showIcon
                  action={
                    <Space direction="vertical">
                      <Button size="small" type="primary" onClick={() => window.location.reload()}>
                        Try Again
                      </Button>
                      <Button size="small" onClick={handleBackClick}>
                        Back to Workshop
                      </Button>
                    </Space>
                  }
                />
              </Card>
            ) : (
              <Card
                title={
                  <Space>
                    <VideoCameraOutlined />
                    <span>Zoom Meeting: {workshopTitle}</span>
                  </Space>
                }
                style={{ minHeight: '700px' }}
              >
                {meetingId ? (
                  <ZoomMeeting
                    meetingId={meetingId}
                    style={{ height: '650px' }}
                  />
                ) : (
                  <div style={{ textAlign: 'center', padding: '100px 0' }}>
                    <Text>No meeting ID found for this workshop.</Text>
                    <div style={{ marginTop: 16 }}>
                      <Button type="primary" onClick={handleBackClick}>
                        Back to Workshop
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            )}
          </Col>
        </Row>
      </Content>
    </Layout>
  );
} 