'use client';

import Link from 'next/link';
import {
  VideoCameraOutlined,
  FormOutlined,
  TrophyOutlined,
  MessageOutlined,
  UserOutlined,
  AreaChartOutlined,
  SettingOutlined,
  LogoutOutlined
} from '@ant-design/icons';
import styles from './SharedSidebar.module.css';
import { authService } from '@/api/authService';
import NotificationBell from '../NotificationBell/NotificationBell';

interface SharedSidebarProps {
  activeItem: string;
}

export default function SharedSidebar({ activeItem }: SharedSidebarProps) {
  const handleLogout = () => {
    // Use the authService to handle logout properly
    authService.logout();
  };

  return (
    <div className={styles.sidebar}>
      <div className={styles.headerArea}>
        <div className={styles.logo}></div>
        <div className={styles.notificationArea}>
          <NotificationBell />
        </div>
      </div>
      <nav className={styles.nav}>
        <div className={styles.navGroup}>
          <div className={styles.navGroupTitle}>
            <VideoCameraOutlined className={styles.icon} />
            <span>Workshops</span>
          </div>
          <Link 
            href="/admin/dashboard" 
            className={`${styles.navItem} ${activeItem === 'dashboard' ? styles.active : ''}`}
          >
            Dashboard
          </Link>
          <Link 
            href="/admin/workshops" 
            className={`${styles.navItem} ${activeItem === 'workshops' ? styles.active : ''}`}
          >
            Workshops
          </Link>
          <Link 
            href="/admin/workshops/courses" 
            className={`${styles.navItem} ${activeItem === 'courses' ? styles.active : ''}`}
          >
            Courses
          </Link>
        </div>
        
        <Link 
          href="/admin/homework" 
          className={`${styles.navItem} ${activeItem === 'homework' ? styles.active : ''}`}
        >
          <FormOutlined className={styles.icon} />
          <span>Homework</span>
        </Link>
        
        <Link 
          href="/admin/achievements" 
          className={`${styles.navItem} ${activeItem === 'achievements' ? styles.active : ''}`}
        >
          <TrophyOutlined className={styles.icon} />
          <span>Achievements</span>
        </Link>
        
        <Link 
          href="/admin/messages" 
          className={`${styles.navItem} ${activeItem === 'messages' ? styles.active : ''}`}
        >
          <MessageOutlined className={styles.icon} />
          <span>Messages</span>
        </Link>
        
        <Link 
          href="/admin/users" 
          className={`${styles.navItem} ${activeItem === 'users' ? styles.active : ''}`}
        >
          <UserOutlined className={styles.icon} />
          <span>Users</span>
        </Link>
        
        <Link 
          href="/admin/analytics" 
          className={`${styles.navItem} ${activeItem === 'analytics' ? styles.active : ''}`}
        >
          <AreaChartOutlined className={styles.icon} />
          <span>Analytics</span>
        </Link>
        
        <Link 
          href="/admin/settings" 
          className={`${styles.navItem} ${activeItem === 'settings' ? styles.active : ''}`}
        >
          <SettingOutlined className={styles.icon} />
          <span>Settings</span>
        </Link>
        
        <div className={styles.spacer}></div>
        
        <button 
          className={styles.bigLogoutButton}
          onClick={handleLogout}
        >
          <LogoutOutlined className={styles.icon} />
          <span>LOGOUT</span>
        </button>
      </nav>
    </div>
  );
} 