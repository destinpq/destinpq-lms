'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Input, Button, List, Avatar, Spin } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import styles from './BreakoutChat.module.css';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  isAdmin?: boolean;
  avatar?: string;
}

interface BreakoutChatProps {
  sessionId: string;
  userId: string;
  userName: string;
  isAdmin?: boolean;
}

// Mock data for chat messages
const MOCK_MESSAGES: Message[] = [
  {
    id: '1',
    senderId: 'admin-1',
    senderName: 'Dr. Sarah Johnson',
    content: 'Welcome to the workshop! Please use this chat for questions.',
    timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    isAdmin: true,
    avatar: 'https://ui-avatars.com/api/?name=Sarah+Johnson&background=0D8ABC&color=fff'
  },
  {
    id: '2',
    senderId: 'student-1',
    senderName: 'John Doe',
    content: 'Thanks for the presentation. I have a question about the techniques discussed.',
    timestamp: new Date(Date.now() - 1000 * 60 * 3), // 3 minutes ago
    avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=F44336&color=fff'
  },
  {
    id: '3',
    senderId: 'admin-1',
    senderName: 'Dr. Sarah Johnson',
    content: 'Sure John, please go ahead and ask your question.',
    timestamp: new Date(Date.now() - 1000 * 60 * 2), // 2 minutes ago
    isAdmin: true,
    avatar: 'https://ui-avatars.com/api/?name=Sarah+Johnson&background=0D8ABC&color=fff'
  }
];

const BreakoutChat: React.FC<BreakoutChatProps> = ({
  sessionId,
  userId,
  userName,
  isAdmin = false
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [mockInitialized, setMockInitialized] = useState(false);

  // Initialize with mock data instead of API call
  useEffect(() => {
    const initializeMockChat = async () => {
      try {
        // Simulate API loading delay
        await new Promise((resolve) => setTimeout(resolve, 500));
        
        // Set mock messages and mark as initialized
        setMessages(MOCK_MESSAGES);
        setMockInitialized(true);
        setLoading(false);
      } catch (error) {
        console.error('Error initializing mock chat:', error);
        setError('Failed to initialize chat');
        setLoading(false);
      }
    };
    
    if (!mockInitialized) {
      initializeMockChat();
    }
    
    // Set up polling for new messages (mock)
    const interval = setInterval(() => {
      if (mockInitialized && Math.random() > 0.7) {
        // 30% chance of getting a new message every poll
        const senderIsInstructor = Math.random() > 0.5;
        const newMockMessage: Message = {
          id: `mock-${Date.now()}`,
          senderId: senderIsInstructor ? 'admin-1' : 'student-1',
          senderName: senderIsInstructor ? 'Dr. Sarah Johnson' : 'John Doe',
          content: senderIsInstructor 
            ? 'Remember to focus on the techniques we discussed today.'
            : 'I\'m finding these concepts very helpful. Thanks!',
          timestamp: new Date(),
          isAdmin: senderIsInstructor,
          avatar: senderIsInstructor 
            ? 'https://ui-avatars.com/api/?name=Sarah+Johnson&background=0D8ABC&color=fff'
            : 'https://ui-avatars.com/api/?name=John+Doe&background=F44336&color=fff'
        };
        setMessages(prev => [...prev, newMockMessage]);
      }
    }, 15000); // Check every 15 seconds
    
    return () => clearInterval(interval);
  }, [sessionId, mockInitialized]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim()) return;
    
    // Add the new message locally
    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: userId,
      senderName: userName,
      content: messageInput,
      timestamp: new Date(),
      isAdmin
    };
    
    setMessages(prevMessages => [...prevMessages, newMessage]);
    setMessageInput('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageInput(e.target.value);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Spin />
        <p>Loading chat...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p>Error: {error}</p>
        <p>Using mock data instead.</p>
      </div>
    );
  }

  return (
    <div className={styles.chatContainer}>
      <div className={styles.chatHeader}>
        <h3 className={styles.chatTitle}>Workshop Chat</h3>
      </div>
      
      <List
        className={styles.messageList}
        itemLayout="horizontal"
        dataSource={messages}
        renderItem={(message) => {
          const isCurrentUser = message.senderId === userId;
          const isAdmin = message.isAdmin;
          
          return (
            <List.Item
              className={`${styles.messageItem} ${isCurrentUser ? styles.messageItemRight : styles.messageItemLeft}`}
            >
              <div className={styles.messageContent}>
                <div 
                  className={`${styles.messageHeader} ${isCurrentUser ? styles.messageHeaderRight : styles.messageHeaderLeft}`}
                >
                  <Avatar 
                    src={message.avatar} 
                    size="small"
                    className={`${styles.chatAvatar} ${isAdmin ? styles.avatarAdmin : styles.avatarStudent}`}
                  />
                  <span className={`${styles.senderName} ${isAdmin ? styles.adminName : styles.studentName}`}>
                    {message.senderName}
                  </span>
                  <span className={styles.timestamp}>
                    {formatTime(message.timestamp)}
                  </span>
                </div>
                
                <div
                  className={`${styles.messageBubble} ${
                    isAdmin ? styles.adminBubble : 
                    (isCurrentUser ? styles.currentUserBubble : styles.studentBubble)
                  }`}
                >
                  {message.content}
                </div>
              </div>
            </List.Item>
          );
        }}
      />
      <div ref={messagesEndRef} />
      
      <div className={styles.inputGroup}>
        <Input
          className={styles.messageInput}
          placeholder="Type your message..."
          value={messageInput}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          disabled={loading}
        />
        <Button
          type="primary"
          icon={<SendOutlined />}
          loading={loading}
          onClick={handleSendMessage}
          disabled={!messageInput.trim()}
          className={styles.sendButton}
        >
          Send
        </Button>
      </div>
    </div>
  );
};

export default BreakoutChat; 