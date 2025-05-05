'use client';

import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';
import { 
  HomeOutlined,
  BookOutlined,
  VideoCameraOutlined,
  MessageOutlined,
  LogoutOutlined
} from '@ant-design/icons';
import { authService } from '@/api/authService';
import NotificationBell from '../components/NotificationBell/NotificationBell';
import styles from './workshop.layout.module.css';
import { AppLink, useAppRouter } from '@/components/AppLink';

export default function WorkshopLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth();
  const router = useAppRouter();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleLogout = () => {
    authService.logout();
  };

  if (loading) {
    return <div className={styles.loadingContainer}><div className={styles.spinner}></div></div>;
  }

  if (!user) {
    return null; // Will redirect in the useEffect
  }

  return (
    <div className={styles.layoutContainer}>
      {/* Workshop Sidebar */}
      <div className={styles.sidebar}>
        <div className={styles.headerArea}>
          <div className={styles.logo}></div>
          <div className={styles.notificationArea}>
            <NotificationBell />
          </div>
        </div>
        <nav className={styles.nav}>
          <AppLink href="/student/dashboard" className={styles.navItem}>
            <HomeOutlined className={styles.icon} />
            <span>Dashboard</span>
          </AppLink>
          
          <AppLink href="/workshop" className={styles.navItem}>
            <VideoCameraOutlined className={styles.icon} />
            <span>Workshops</span>
          </AppLink>
          
          <AppLink href="/materials" className={styles.navItem}>
            <BookOutlined className={styles.icon} />
            <span>Materials</span>
          </AppLink>
          
          <AppLink href="/messages" className={styles.navItem}>
            <MessageOutlined className={styles.icon} />
            <span>Messages</span>
          </AppLink>
          
          <div className={styles.spacer}></div>
          
          <button 
            className={styles.logoutButton}
            onClick={handleLogout}
          >
            <LogoutOutlined className={styles.icon} />
            <span>LOGOUT</span>
          </button>
        </nav>
      </div>
      
      {/* Main Content */}
      <div className={styles.mainContent}>
        {children}
      </div>
    </div>
  );
} 