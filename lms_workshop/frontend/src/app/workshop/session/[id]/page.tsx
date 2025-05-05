'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import BreakoutChat from '@/app/components/BreakoutChat/BreakoutChat';
import { Button, Spin, Typography, Tag, Drawer } from 'antd';
import { 
  ArrowLeftOutlined, 
  VideoCameraOutlined, 
  FileTextOutlined, 
  MessageOutlined, 
  DownloadOutlined
} from '@ant-design/icons';
import CustomJitsiMeeting from './CustomJitsiMeeting';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import './reset-layout.css';
import './workshop-session.css';
import './jitsi-overrides.css';
import './force-header.css';
import { authService } from '@/api/authService';

const { Title, Paragraph } = Typography;

interface SessionData {
  id: string;
  title: string;
  description: string;
  instructor: string;
  date: Date;
  duration: string;
  sessionType: string;
  roomId: string;
  materials: {
    title: string;
    description: string;
    link: string;
    type: string;
  }[];
}

// Basic path helper function
const getAssetPath = (path: string) => {
  return `/public${path}`;
};

export default function WorkshopSession({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap the params Promise
  const { id } = use(params);
  
  const { user } = useAuth();
  const router = useRouter();
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mobileChatOpen, setMobileChatOpen] = useState(false);
  const [materialsDrawerOpen, setMaterialsDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check for mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch session data
  useEffect(() => {
    // Only fetch if id exists
    if (!id) {
      return;
    }

    const fetchSessionData = async () => {
      setIsLoading(true);
      try {
        // In a real app, fetch from API using the session ID
        // For now, we'll create mock data for demonstration
        
        // Small delay to simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Sample session data (this would come from your backend API)
        const sampleSession: SessionData = {
          id: id,
          title: 'Cognitive Behavioral Techniques Workshop',
          description: 'This workshop will cover advanced cognitive behavioral techniques for managing anxiety and stress. Participants will learn practical strategies that can be applied in clinical settings.',
          instructor: 'Dr. Sarah Johnson',
          date: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
          duration: '90 minutes',
          sessionType: 'Interactive Workshop',
          roomId: `workshop-${id}`, // This will be used for the Jitsi room name
          materials: [
            {
              title: 'Workshop Slides',
              description: 'PDF slides covering all workshop material',
              link: getAssetPath('/materials/workshop-slides.pdf'),
              type: 'PDF'
            },
            {
              title: 'Practice Exercises',
              description: 'Exercises to complete during the workshop',
              link: getAssetPath('/materials/practice-exercises.pdf'),
              type: 'PDF'
            },
            {
              title: 'Further Reading',
              description: 'Additional resources for deeper learning',
              link: getAssetPath('/materials/further-reading.pdf'),
              type: 'PDF'
            }
          ]
        };
        
        setSessionData(sampleSession);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching session data:', error);
        setError('Failed to load workshop session data');
        setIsLoading(false);
      }
    };

    fetchSessionData();
  }, [id]);

  // Format date for display
  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const toggleMobileChat = () => {
    setMobileChatOpen(!mobileChatOpen);
  };

  const toggleMaterialsDrawer = () => {
    setMaterialsDrawerOpen(!materialsDrawerOpen);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <Title level={3} style={{ color: '#e34141' }}>Error</Title>
        <Paragraph>{error}</Paragraph>
        <Button type="primary" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  if (!sessionData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <Title level={3}>Session Not Found</Title>
        <Paragraph>The workshop session you&apos;re looking for doesn&apos;t exist or has been removed.</Paragraph>
        <Button type="primary" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  // Create a custom layout that doesn't include the sidebar from workshop/layout.tsx
  return (
    <div className="custom-page-root">
      <style jsx global>{`
        body {
          margin: 0;
          padding: 0;
          height: 100vh;
          width: 100vw;
          overflow-x: hidden;
        }
        .custom-page-root {
          width: 100vw;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background-color: #f9f9f9;
        }
        /* Force white navbar at the very top */
        body > header, 
        div > header, 
        nav, 
        [role="navigation"],
        .ant-layout-header,
        body > div > header,
        #__next > header,
        header, 
        .header, 
        .navbar, 
        .nav-header {
          background-color: white !important;
          color: #5a4fcf !important;
          border-bottom: 1px solid #eaeaea !important;
        }
        
        /* Make sure text in navbar is purple */
        body > header *, 
        div > header *, 
        nav *, 
        [role="navigation"] *,
        .ant-layout-header *,
        body > div > header *,
        #__next > header *,
        header *, 
        .header *, 
        .navbar *, 
        .nav-header * {
          color: #5a4fcf !important;
        }

        /* Additional super specific selectors */
        div[style], 
        div[class*="layout"], 
        div[class*="container"], 
        div[class*="app"], 
        div[class*="wrapper"],
        nav[style],
        div[style] > header,
        div[style] > nav,
        div[style] > div > header,
        div[style] > div > nav {
          background-color: white !important;
        }

        div[style] *,
        div[class*="layout"] *, 
        div[class*="container"] *, 
        div[class*="app"] *, 
        div[class*="wrapper"] *,
        nav[style] *,
        div[style] > header *,
        div[style] > nav *,
        div[style] > div > header *,
        div[style] > div > nav * {
          color: #5a4fcf !important;
        }
      `}</style>
      
      <div className="workshop-container">
        {/* Main Header - Blue Bar */}
        <header className="workshop-header" style={{backgroundColor: 'white', color: '#5a4fcf'}}>
          <div className="header-left">
            <Button 
              type="text"
              icon={<ArrowLeftOutlined style={{color: '#5a4fcf'}} />} 
              onClick={() => router.push('/student/dashboard')}
              className="back-button"
              style={{color: '#5a4fcf'}}
            />
            <h1 className="header-title" style={{color: '#5a4fcf'}}>{sessionData.title}</h1>
          </div>
          <div className="header-right">
            <span className="user-email" style={{color: '#666'}}>{user?.email}</span>
            <Button 
              type="text" 
              className="logout-button"
              style={{color: '#5a4fcf'}}
              onClick={() => {
                authService.logout();
                router.push('/login');
              }}
            >
              Logout
            </Button>
          </div>
        </header>

        {/* Session Controls */}
        <div className="session-controls">
          <div className="control-section">
            <h2>All Tasks</h2>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="workshop-content">
          <div className="content-grid">
            {/* Video Conference */}
            <div className="video-section" id="jitsi-container">
              <div className="section-header">
                <div className="section-title">
                  <VideoCameraOutlined className="section-icon" />
                  <span>Live Workshop</span>
                </div>
                <Tag className="section-tag">To Do</Tag>
              </div>
              
              <CustomJitsiMeeting 
                roomName={sessionData.roomId}
                displayName={user?.firstName || user?.email || "Workshop Participant"}
                subject={sessionData.title}
              />
              
              <div className="session-details">
                <div className="detail-item">
                  <span className="detail-icon">📅</span>
                  <span>Project: {sessionData.title}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-icon">⏰</span>
                  <span>Time: {formatDate(sessionData.date)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-icon">👤</span>
                  <span>Assigned to: {user?.email}</span>
                </div>
              </div>
              
              <div className="material-actions">
                <Button 
                  type="primary"
                  className="material-button"
                  icon={<FileTextOutlined />}
                  onClick={toggleMaterialsDrawer}
                >
                  Workshop Materials
                </Button>
                
                {isMobile && (
                  <Button 
                    type="default"
                    className="chat-button"
                    icon={<MessageOutlined />}
                    onClick={toggleMobileChat}
                  >
                    {mobileChatOpen ? 'Hide Chat' : 'Show Chat'}
                  </Button>
                )}
              </div>
            </div>
            
            {/* Chat Section */}
            {(!isMobile || mobileChatOpen) && (
              <div className="chat-section" style={{ height: '600px', display: 'flex', flexDirection: 'column' }}>
                <div className="section-header">
                  <div className="section-title">
                    <MessageOutlined className="section-icon" />
                    <span>Workshop Chat</span>
                  </div>
                  <Tag color="blue" className="section-tag">In Progress</Tag>
                </div>
                
                <div style={{ flex: 1, padding: '0 0.5rem', overflow: 'auto' }}>
                  <BreakoutChat 
                    sessionId={sessionData.id}
                    userId={user?.id ? String(user.id) : 'anonymous'}
                    userName={user?.firstName || user?.email || 'Workshop Participant'}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Materials Drawer */}
        <Drawer
          title="Workshop Materials"
          placement="right"
          onClose={toggleMaterialsDrawer}
          open={materialsDrawerOpen}
          width={isMobile ? '100%' : 500}
        >
          {sessionData.materials.length > 0 ? (
            <div className="materials-list">
              {sessionData.materials.map((material, index) => (
                <div key={index} className="material-card">
                  <div className="material-info">
                    <h3 className="material-title">{material.title}</h3>
                    <Tag color="blue">{material.type}</Tag>
                    <p className="material-description">{material.description}</p>
                  </div>
                  <Button 
                    type="primary" 
                    icon={<DownloadOutlined />}
                    href={material.link}
                    target="_blank"
                    size="small"
                  >
                    Open
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <Paragraph>No materials have been added for this workshop yet.</Paragraph>
          )}
        </Drawer>
      </div>
    </div>
  );
} 