'use client';

import { useAuth } from '@/app/context/AuthContext';
import { Layout, Button, Table, Typography, Space, Tag, Avatar } from 'antd';
import {
  TrophyOutlined,
  PlusOutlined
} from '@ant-design/icons';

const { Content } = Layout;
const { Title } = Typography;

export default function AchievementsPage() {
  const { loading } = useAuth();

  // Placeholder columns for achievements table
  const columns = [
    {
      title: 'Achievement',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Avatar 
            icon={<TrophyOutlined />} 
            style={{ backgroundColor: '#ffc53d', marginRight: '12px' }} 
          />
          <span>{text}</span>
        </div>
      )
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => <Tag color="blue">{category}</Tag>
    },
    {
      title: 'Points',
      dataIndex: 'points',
      key: 'points',
    },
    {
      title: 'Students Earned',
      dataIndex: 'earned',
      key: 'earned',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: () => (
        <Space size="small">
          <Button type="primary" size="small">Edit</Button>
          <Button danger size="small">Delete</Button>
        </Space>
      )
    }
  ];

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Loading...</div>;
  }

  return (
    <Content style={{ padding: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <Title level={3} style={{ margin: 0 }}>Achievements</Title>
        <Button type="primary" icon={<PlusOutlined />}>
          Create Achievement
        </Button>
      </div>
      
      <Table 
        columns={columns} 
        dataSource={[]} 
        pagination={false} 
        style={{ border: '1px solid #f0f0f0', borderRadius: '8px' }}
        locale={{ emptyText: 'No achievements data available' }}
      />
    </Content>
  );
} 