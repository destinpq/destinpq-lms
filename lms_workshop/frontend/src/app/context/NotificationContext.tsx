'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { safeSenderName } from '@/app/_debug/safe-render-utils';

// Define notification types
export interface Notification {
  id: string;
  type: 'message' | 'system' | 'alert';
  title: string;
  content: string;
  read: boolean;
  timestamp: Date;
  actionUrl?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const unreadCount = notifications.filter(n => !n.read).length;

  // Load notifications from localStorage on mount
  useEffect(() => {
    const savedNotifications = localStorage.getItem('notifications');
    if (savedNotifications) {
      try {
        const parsed = JSON.parse(savedNotifications);
        // Convert string timestamps back to Date objects
        const notificationsWithDates = parsed.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        }));
        setNotifications(notificationsWithDates);
      } catch (e) {
        console.error('Failed to parse saved notifications:', e);
      }
    }
  }, []);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    try {
      // Limit the number of notifications to prevent exceeding localStorage quota
      const notificationsToStore = notifications.slice(0, 20); // Only keep the 20 most recent
      
      // Trim content if needed to further reduce size
      const trimmedNotifications = notificationsToStore.map(notification => ({
        ...notification,
        content: notification.content?.length > 100 
          ? notification.content.substring(0, 100) + '...' 
          : notification.content,
        // Convert date objects to strings to avoid circular reference
        timestamp: notification.timestamp instanceof Date 
          ? notification.timestamp.toISOString() 
          : notification.timestamp
      }));
      
      localStorage.setItem('notifications', JSON.stringify(trimmedNotifications));
    } catch (error) {
      console.error('Error saving notifications to localStorage:', error);
      // If it still fails, clear all notifications from storage
      try {
        localStorage.removeItem('notifications');
      } catch (e) {
        // Last resort - if even removal fails, clear all of localStorage
        localStorage.clear();
      }
    }
  }, [notifications]);

  // Fetch new message notifications periodically
  useEffect(() => {
    // Function to fetch unread messages
    const fetchUnreadMessages = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) return;

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001';
        const response = await fetch(`${apiUrl}/messages/unread`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          cache: 'no-cache',
        });

        if (!response.ok) return;

        const messages = await response.json();
        
        // Convert messages to notifications if not already in the list
        messages.forEach((message: any) => {
          const existingNotification = notifications.find(n => 
            n.type === 'message' && n.content.includes(message.id.toString())
          );
          
          if (!existingNotification) {
            // Use the safeSenderName utility to safely process the sender
            const senderName = safeSenderName(message.sender);
            
            addNotification({
              type: 'message',
              title: `New message from ${senderName}`,
              content: `${message.content.substring(0, 50)}${message.content.length > 50 ? '...' : ''}`,
              read: false,
              actionUrl: `/admin/messages?id=${message.id}`
            });
          }
        });
      } catch (error) {
        console.error('Error fetching unread messages:', error);
      }
    };

    // Fetch on mount and then every 30 seconds
    fetchUnreadMessages();
    const interval = setInterval(fetchUnreadMessages, 30000);
    
    return () => clearInterval(interval);
  }, [notifications]);

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date()
    };
    
    setNotifications(prev => [newNotification, ...prev]);
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider value={{ 
      notifications, 
      unreadCount, 
      markAsRead, 
      markAllAsRead, 
      addNotification,
      clearNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
} 