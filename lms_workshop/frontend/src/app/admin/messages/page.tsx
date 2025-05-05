'use client';

import { useAuth } from '@/app/context/AuthContext';
import { Layout, Button, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import Link from 'next/link';

const { Content } = Layout;
const { Title } = Typography;

export default function MessagesPage() {
  const { loading } = useAuth();

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Loading...</div>;
  }

  return (
    <Content style={{ padding: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <Title level={3} style={{ margin: 0 }}>Messages</Title>
        <Link href="/admin/messages/new" passHref>
          <Button type="primary" icon={<PlusOutlined />}>
            Compose New Message
          </Button>
        </Link>
      </div>
      
      {/* Rest of the messages content */}
    </Content>
  );
} 