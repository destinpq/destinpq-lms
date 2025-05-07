'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Layout, 
  Typography, 
  Card, 
  Button, 
  List, 
  Spin,
  Alert
} from 'antd';
import { 
  ArrowLeftOutlined, 
  FilePdfOutlined, 
  DownloadOutlined
} from '@ant-design/icons';
import { useAuth } from '@/app/context/AuthContext';
import { workshopService, Workshop } from '@/api/workshopService';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

interface MaterialItem {
  id?: number;
  name: string;
  url: string;
}

export default function WorkshopMaterialsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [workshop, setWorkshop] = useState<Workshop | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user && id) {
      const workshopId = Array.isArray(id) ? id[0] : id;
      const fetchWorkshopDetails = async () => {
        setIsLoading(true);
        setError(null);
        try {
          console.log(`[WorkshopMaterialsPage] Fetching workshop details for ID: ${workshopId}`);
          const data = await workshopService.getWorkshopById(workshopId);
          if (data) {
            console.log('[WorkshopMaterialsPage] Workshop data fetched:', data);
            setWorkshop(data);
          } else {
            console.log(`[WorkshopMaterialsPage] Workshop with ID ${workshopId} not found.`);
            setError('Workshop not found or could not be loaded');
          }
        } catch (err) {
          console.error('[WorkshopMaterialsPage] Error fetching workshop data:', err);
          setError('Failed to load workshop materials.');
        } finally {
          setIsLoading(false);
        }
      };
      fetchWorkshopDetails();
    } else if (!id && !authLoading) {
      setError('Workshop ID is missing from URL.');
      setIsLoading(false);
    }
  }, [id, user, authLoading, router]);

  if (authLoading || isLoading) {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Content style={{ padding: '50px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Spin size="large" tip="Loading workshop materials..." />
        </Content>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Content style={{ padding: '50px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Alert
            message="Error Loading Materials"
            description={error}
            type="error"
            showIcon
            style={{ maxWidth: '500px', width: '100%' }}
            action={
              <Button size="small" onClick={() => router.push(id ? `/workshop/${Array.isArray(id) ? id[0] : id}` : '/student/dashboard')}>
                Back to Workshop Details
              </Button>
            }
          />
        </Content>
      </Layout>
    );
  }

  if (!workshop || !workshop.materials || workshop.materials.length === 0) {
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
              onClick={() => router.push(id ? `/workshop/${Array.isArray(id) ? id[0] : id}` : '/student/dashboard')}
              style={{ marginRight: '20px' }}
            >
              Back to Workshop
            </Button>
            <Title level={4} style={{ margin: 0 }}>{workshop?.title || 'Workshop'} - Preparatory Materials</Title>
          </div>
        </Header>
        
        <Content style={{ padding: '24px', display: 'flex', justifyContent: 'center' }}>
          <div style={{ maxWidth: '1000px', width: '100%' }}>
            <Card>
              <Text>No materials available for this workshop.</Text>
            </Card>
          </div>
        </Content>
      </Layout>
    );
  }

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
            onClick={() => router.push(id ? `/workshop/${Array.isArray(id) ? id[0] : id}` : '/student/dashboard')}
            style={{ marginRight: '20px' }}
          >
            Back to Workshop
          </Button>
          <Title level={4} style={{ margin: 0 }}>{workshop?.title || 'Workshop'} - Preparatory Materials</Title>
        </div>
      </Header>
      
      <Content style={{ padding: '24px', display: 'flex', justifyContent: 'center' }}>
        <div style={{ maxWidth: '1000px', width: '100%' }}>
          {isLoading ? (
            <div style={{ textAlign: 'center' }}><Spin tip="Loading materials..." /></div>
          ) : error ? (
            <Alert message="Error" description={error} type="error" showIcon />
          ) : workshop && workshop.materials && workshop.materials.length > 0 ? (
            <List
              itemLayout="horizontal"
              dataSource={workshop.materials as MaterialItem[]}
              style={{ background: 'white', padding: '16px 24px', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
              header={<div style={{ textAlign: 'center', marginBottom: '16px' }}><Title level={4} style={{ margin: 0 }}>Available Materials</Title></div>}
              renderItem={(material, index) => (
                <List.Item
                  key={material.name + index}
                  actions={[
                    <Button type="primary" icon={<DownloadOutlined />} href={material.url} target="_blank" key="download">
                      Download / View
                    </Button>
                  ]}
                >
                  <List.Item.Meta
                    avatar={<FilePdfOutlined style={{ fontSize: 24, color: '#1890ff' }} />}
                    title={material.name}
                    description={<a href={material.url} target="_blank" rel="noopener noreferrer">{material.url}</a>}
                  />
                </List.Item>
              )}
            />
          ) : (
            <Card>
              <Text>No materials available for this workshop.</Text>
            </Card>
          )}
        </div>
      </Content>
    </Layout>
  );
} 