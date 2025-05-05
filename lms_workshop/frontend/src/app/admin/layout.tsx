'use client';

import React from 'react';
import { Layout } from 'antd';
import { usePathname } from 'next/navigation';
import SharedSidebar from '../components/SharedSidebar/SharedSidebar';
import './admin.global.css';

const { Content } = Layout;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Extract the active route from pathname
  const getActiveItem = () => {
    if (pathname?.includes('/admin/workshops')) return 'workshops';
    if (pathname?.includes('/admin/courses')) return 'courses';
    if (pathname?.includes('/admin/homework')) return 'homework';
    if (pathname?.includes('/admin/achievements')) return 'achievements';
    if (pathname?.includes('/admin/messages')) return 'messages';
    if (pathname?.includes('/admin/users')) return 'users';
    if (pathname?.includes('/admin/analytics')) return 'analytics';
    if (pathname?.includes('/admin/settings')) return 'settings';
    return 'dashboard';
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <SharedSidebar activeItem={getActiveItem()} />
      <Layout style={{ marginLeft: 220 }}>
        <Content style={{ 
          margin: '16px', 
          background: '#f5f7fa', 
          minHeight: 'calc(100vh - 32px)',
          borderRadius: '8px',
          overflow: 'auto'
        }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
} 