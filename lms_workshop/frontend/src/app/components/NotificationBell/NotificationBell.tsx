'use client';

import React from 'react';
import { BellOutlined } from '@ant-design/icons';
import { Badge } from 'antd';
import './NotificationBell.module.css';

interface NotificationBellProps {
  className?: string;
}

/**
 * A simple notification bell component (placeholder for the deleted component)
 */
export default function NotificationBell({ className = '' }: NotificationBellProps) {
  return (
    <div className={`notification-bell ${className}`}>
      <Badge count={0} size="small">
        <BellOutlined style={{ fontSize: '20px', color: '#555' }} />
      </Badge>
    </div>
  );
} 