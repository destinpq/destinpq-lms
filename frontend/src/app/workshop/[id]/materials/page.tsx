'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Layout, 
  Typography, 
  Card, 
  Button, 
  List, 
  Space, 
  Divider,
  Spin,
  Alert
} from 'antd';
import { 
  ArrowLeftOutlined, 
  FilePdfOutlined, 
  FileWordOutlined, 
  FileExcelOutlined,
  VideoCameraOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import { useAuth } from '@/app/context/AuthContext';

const { Header, Content } = Layout;
const { Title, Text, Paragraph } = Typography;

interface MaterialItem {
  id: number;
  title: string;
  description: string;
  type: string;
  size?: string;
  duration?: string;
  date: string;
}

export default function WorkshopMaterialsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [workshopTitle, setWorkshopTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    // In a real app, fetch materials from your API
    // For demo purposes, we'll simulate with mock data
    setTimeout(() => {
      if (id === 'adv-cognitive-techniques') {
        setWorkshopTitle('Advanced Cognitive Techniques');
        setMaterials([
          { 
            id: 1, 
            title: 'Workshop Slides', 
            description: 'Complete presentation slides for the Advanced Cognitive Techniques workshop.',
            type: 'pdf', 
            size: '2.4 MB', 
            date: '2025-05-01'
          },
          { 
            id: 2, 
            title: 'Required Reading: Cognitive Restructuring Techniques', 
            description: 'A comprehensive overview of cognitive restructuring techniques from leading psychology journals.',
            type: 'pdf', 
            size: '1.8 MB', 
            date: '2025-05-01'
          },
          { 
            id: 3, 
            title: 'Worksheet: Cognitive Distortion Identification', 
            description: 'Practice worksheet for identifying common cognitive distortions.',
            type: 'docx', 
            size: '540 KB', 
            date: '2025-05-01'
          },
          { 
            id: 4, 
            title: 'Pre-workshop Video: Introduction to Cognitive Techniques', 
            description: 'A 15-minute introduction video to prepare you for the workshop.',
            type: 'video', 
            duration: '15:24', 
            date: '2025-05-01'
          }
        ]);
      } else {
        setError('Workshop materials not found');
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

  const getIconByType = (type: string) => {
    switch(type) {
      case 'pdf':
        return <FilePdfOutlined style={{ fontSize: 24, color: '#ff4d4f' }} />;
      case 'docx':
        return <FileWordOutlined style={{ fontSize: 24, color: '#1890ff' }} />;
      case 'xlsx':
        return <FileExcelOutlined style={{ fontSize: 24, color: '#52c41a' }} />;
      case 'video':
        return <VideoCameraOutlined style={{ fontSize: 24, color: '#722ed1' }} />;
      default:
        return <FilePdfOutlined style={{ fontSize: 24 }} />;
    }
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
            onClick={() => router.push(`/workshop/${id}`)}
            style={{ marginRight: '20px' }}
          >
            Back to Workshop
          </Button>
          <Title level={4} style={{ margin: 0 }}>Preparatory Materials</Title>
        </div>
      </Header>
      
      <Content style={{ padding: '24px', display: 'flex', justifyContent: 'center' }}>
        <div style={{ maxWidth: '1000px', width: '100%' }}>
          <Card style={{ marginBottom: 24, textAlign: 'center' }}>
            <Title level={2} style={{ textAlign: 'center' }}>{workshopTitle}</Title>
            <Paragraph style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
              Please review these materials before attending the workshop. These resources will help you prepare 
              and get the most out of the session.
            </Paragraph>
          </Card>
          
          <List
            itemLayout="vertical"
            dataSource={materials}
            style={{ 
              background: 'white', 
              padding: '16px 24px', 
              borderRadius: '8px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}
            header={
              <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                <Title level={4} style={{ margin: 0 }}>Available Materials</Title>
              </div>
            }
            renderItem={item => (
              <List.Item
                key={item.id}
                style={{
                  background: materials.indexOf(item) % 2 === 0 ? '#f9f9f9' : 'white',
                  padding: '16px',
                  borderRadius: '8px',
                  marginBottom: '8px',
                  textAlign: 'center'
                }}
                actions={[
                  <div key="download" style={{ display: 'flex', justifyContent: 'center', width: '100%', marginTop: '8px' }}>
                    <Button type="primary" icon={<DownloadOutlined />}>
                      Download
                    </Button>
                  </div>
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      {getIconByType(item.type)}
                    </div>
                  }
                  title={<div style={{ textAlign: 'center', fontSize: '18px', fontWeight: 'bold' }}>{item.title}</div>}
                  description={
                    <Space style={{ display: 'flex', justifyContent: 'center' }} split={<Divider type="vertical" />}>
                      <Text type="secondary">
                        {item.type.toUpperCase()}
                      </Text>
                      <Text type="secondary">
                        {item.size || item.duration}
                      </Text>
                      <Text type="secondary">
                        Added: {item.date}
                      </Text>
                    </Space>
                  }
                />
                <Paragraph style={{ textAlign: 'center', maxWidth: '800px', margin: '12px auto 0' }}>
                  {item.description}
                </Paragraph>
              </List.Item>
            )}
          />
        </div>
      </Content>
    </Layout>
  );
} 