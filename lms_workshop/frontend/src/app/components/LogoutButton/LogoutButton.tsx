'use client';

import { LogoutOutlined } from '@ant-design/icons';
import { authService } from '@/api/authService';
import styles from './LogoutButton.module.css';

interface LogoutButtonProps {
  variant?: 'sidebar' | 'header' | 'menu';
  className?: string;
}

export default function LogoutButton({ 
  variant = 'sidebar',
  className = '' 
}: LogoutButtonProps) {
  const handleLogout = () => {
    authService.logout();
  };

  // Different styling based on placement context
  if (variant === 'header') {
    return (
      <button 
        className={`${styles.headerLogoutButton} ${className}`}
        onClick={handleLogout}
      >
        <LogoutOutlined />
        <span>Logout</span>
      </button>
    );
  }

  if (variant === 'menu') {
    return (
      <div 
        className={`${styles.menuLogoutButton} ${className}`}
        onClick={handleLogout}
      >
        <LogoutOutlined className={styles.icon} />
        <span>Logout</span>
      </div>
    );
  }

  // Default sidebar variant
  return (
    <button 
      className={`${styles.sidebarLogoutButton} ${className}`}
      onClick={handleLogout}
    >
      <LogoutOutlined className={styles.icon} />
      <span>Logout</span>
    </button>
  );
} 