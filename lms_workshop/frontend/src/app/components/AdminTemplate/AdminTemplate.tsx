'use client';

import React from 'react';
import { LogoutOutlined } from '@ant-design/icons';
import { Layout, Menu } from 'antd';
import Link from 'next/link';
import styles from './AdminTemplate.module.css';
import { authService } from '@/api/authService';

const { Header, Sider, Content } = Layout;

interface AdminTemplateProps {
  children: React.ReactNode;
  activeItem: string;
}

const AdminTemplate: React.FC<AdminTemplateProps> = ({ children, activeItem }) => {
  const handleLogout = () => {
    authService.logout();
  };

  return (
    <Layout className={styles.layout}>
      <Sider width={200} className={styles.sider}>
        <div className={styles.logo} />
        <Menu
          mode="inline"
          selectedKeys={[activeItem]}
          style={{ height: '100%', borderRight: 0 }}
        >
          <Menu.Item key="dashboard">
            <Link href="/admin/dashboard">Dashboard</Link>
          </Menu.Item>
          <Menu.Item key="workshops">
            <Link href="/admin/workshops">Workshops</Link>
          </Menu.Item>
          <Menu.Item key="courses">
            <Link href="/admin/courses">Courses</Link>
          </Menu.Item>
          <Menu.Item key="homework">
            <Link href="/admin/homework">Homework</Link>
          </Menu.Item>
          <Menu.Item key="users">
            <Link href="/admin/users">Users</Link>
          </Menu.Item>
          <Menu.Item key="settings">
            <Link href="/admin/settings">Settings</Link>
          </Menu.Item>
          <Menu.Item key="logout" className={styles.logoutMenuItem} onClick={handleLogout}>
            <LogoutOutlined /> Logout
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout className={styles.siteLayout}>
        <Header className={styles.header}>
          <div className={styles.headerRight}>
            <button className={styles.logoutButton} onClick={handleLogout}>
              <LogoutOutlined />
              <span>Logout</span>
            </button>
          </div>
        </Header>
        <Content className={styles.content}>{children}</Content>
      </Layout>
    </Layout>
  );
};

export default AdminTemplate; 