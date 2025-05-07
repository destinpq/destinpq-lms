'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
// import Link from 'next/link'; // Removing Link
import { 
  Badge, 
  Button, 
  Card, 
  List, 
  Avatar, 
  // Input, // Removing Input
  Tag, 
  Layout, 
  Typography, 
  Row, 
  Col, 
  // Grid, // Removing Grid
  Space, 
  // Menu, // Removing Menu
  Tabs, 
  // Progress, // Removing Progress
  Spin,
  // Divider, // Removing Divider
  // Statistic // Removing Statistic
} from 'antd';
import { 
  MessageOutlined, 
  ClockCircleOutlined, 
  BookOutlined, 
  BellOutlined, 
  LogoutOutlined, 
  // TrophyOutlined, // Removing TrophyOutlined
  // BookFilled, // Removing BookFilled
  // RightOutlined // Removing RightOutlined
} from '@ant-design/icons';
import { workshopService, Workshop, Homework, Message } from '@/api/workshopService';
import Image from 'next/image';

const { Header, Content } = Layout;
const { Title, Text } = Typography;
const { TabPane } = Tabs;
// const { useBreakpoint } = Grid; // Removing useBreakpoint

export default function StudentDashboard() {
  const { user, loading, signout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // API data states
  const [allWorkshopsList, setAllWorkshopsList] = useState<Workshop[]>([]);
  const [pendingHomework, setPendingHomework] = useState<Homework[]>([]);
  const [recentMessages, setRecentMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch data from API
  useEffect(() => {
    if (!user) return;
    
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Fetch ALL workshops
        const workshopsData = await workshopService.getAllWorkshops();
        setAllWorkshopsList(workshopsData || []);
        
        // Fetch pending homework
        const homeworkData = await workshopService.getPendingHomework();
        setPendingHomework(homeworkData);
        
        // Fetch recent messages
        const messagesData = await workshopService.getRecentMessages();
        setRecentMessages(messagesData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Set all to empty on a general error to avoid stale data
        setAllWorkshopsList([]);
        setPendingHomework([]);
        setRecentMessages([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [user]);
  
  // Check authentication and user role
  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Only redirect if there's no user AND no token
        const token = localStorage.getItem('access_token');
        if (!token) {
          console.log('No user and no token, redirecting to login');
          router.push('/login');
        }
      } else if (user.isAdmin) {
        // For admin users, check if this is an intentional navigation or just a refresh
        const isRefresh = performance.navigation && performance.navigation.type === 1;
        const isDirectNavigation = document.referrer === '';
        
        console.log('Admin user detected in student dashboard');
        console.log('Is page refresh:', isRefresh);
        console.log('Is direct navigation:', isDirectNavigation);
        
        // Only redirect if this is not a refresh
        if (!isRefresh && !isDirectNavigation) {
          console.log('Admin user intentionally navigated here, redirecting to admin dashboard');
          router.push('/admin/dashboard');
        } else {
          console.log('Admin user refreshed student dashboard page, not redirecting');
        }
      }
    }
  }, [user, loading, router]);

  if (loading || isLoading) {
    return (
      <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  const formatWorkshopDisplayDateTime = (dateStr: string, timeStr?: string): string => {
    if (!timeStr) {
      // If no time string, just format the date
      return new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).format(new Date(dateStr));
    }
    // Attempt to parse start time from timeStr (e.g., "16:00 - 18:00" -> "16:00")
    const startTime = timeStr.split('-')[0]?.trim();
    if (!startTime || !/^[0-2]?[0-9]:[0-5][0-9]$/.test(startTime)) {
      // If time format is unexpected, return date and raw time string
      return `${new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).format(new Date(dateStr))} - ${timeStr}`;
    }

    const targetDateTimeStr = `${dateStr}T${startTime}:00`;
    const targetDate = new Date(targetDateTimeStr);

    if (isNaN(targetDate.getTime())) {
      return `${new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).format(new Date(dateStr))} - ${timeStr} (Time Parse Error)`;
    }

    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(targetDate);
  };

  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Header style={{ background: '#fff', padding: '0 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{display: 'flex', alignItems: 'center'}}>
          <Image 
            src="/logo.png" 
            alt="Psychology LMS Logo"
            width={100}
            height={50}
            priority
            onClick={() => router.push('/')}
            style={{ cursor: 'pointer', marginRight: '20px' }}
          />
          <Title level={4} style={{ margin: 0, whiteSpace: 'nowrap' }}>Student Dashboard</Title>
        </div>
        <Space>
          <Badge count={recentMessages.filter(m => m.unread).length || 0} size="small">
            <BellOutlined style={{ fontSize: 18, cursor: 'pointer' }} />
          </Badge>
          <Text style={{ margin: '0 16px' }}>
            Welcome, {user.email}
          </Text>
          <Button 
            type="text" 
            danger 
            icon={<LogoutOutlined />} 
            onClick={signout}
          >
            Logout
          </Button>
        </Space>
      </Header>

      <Content style={{ padding: '24px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        <Tabs 
          activeKey={activeTab} 
          onChange={handleTabChange}
          tabBarExtraContent={activeTab === 'messages' && <Badge count={recentMessages.filter(m => m.unread).length || 0} />}
        >
          <TabPane tab="Dashboard" key="dashboard">
            <Row gutter={[24, 24]}>
              <Col xs={24} lg={16}>
                {/* Renamed and Updated to show All Available Workshops */}
                <Card 
                  title={
                    <Space>
                      <ClockCircleOutlined style={{ color: '#1890ff' }} />
                      <span>Available Workshops</span>
                    </Space>
                  }
                >
                  {allWorkshopsList.length > 0 ? (
                    <List
                      itemLayout="horizontal"
                      dataSource={allWorkshopsList}
                      renderItem={(item: Workshop) => ( // item is now of type Workshop
                        <List.Item
                          key={item.id.toString()} // Use item.id, ensure it's a string for key
                          actions={[
                            <Button 
                              type="primary" 
                              size="small" 
                              key="join" 
                              onClick={() => router.push(`/workshop/${item.id}`)} // Link to workshop detail page
                            >
                              View Details / Join
                            </Button>
                          ]}
                        >
                          <List.Item.Meta
                            title={<div onClick={() => router.push(`/workshop/${item.id}`)} style={{ cursor: 'pointer' }}>{item.title}</div>}
                            description={
                              <>
                                {/* Display Workshop properties directly */}
                                <Text>Instructor: {item.instructor}</Text><br />
                                <Text>Date: {formatWorkshopDisplayDateTime(item.date, item.time)}</Text><br />
                                {item.description && <Text type="secondary">{item.description}</Text>}
                              </>
                            }
                          />
                        </List.Item>
                      )}
                    />
                  ) : (
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                      <Text>No workshops currently available.</Text>
                    </div>
                  )}
                </Card>
              </Col>
              
              <Col xs={24} lg={8}>
                {/* Pending Homework */}
                <Card 
                  title={
                    <Space>
                      <BookOutlined style={{ color: '#1890ff' }} />
                      <span>Pending Homework</span>
                    </Space>
                  }
                  style={{ marginBottom: 24 }}
                >
                  {pendingHomework.length > 0 ? (
                    <List
                      itemLayout="vertical"
                      dataSource={pendingHomework}
                      renderItem={item => (
                        <List.Item
                          key={item.id}
                          extra={
                            <Tag color={item.status === 'Not Started' ? 'error' : 'warning'}>
                              {item.status}
                            </Tag>
                          }
                        >
                          <List.Item.Meta
                            title={<div onClick={() => router.push(item.link)} style={{ cursor: 'pointer' }}>{item.title}</div>}
                            description={
                              <>
                                <Text>{item.course}</Text><br />
                                <Text type="danger">Due: {formatWorkshopDisplayDateTime(item.dueDate)}</Text>
                              </>
                            }
                          />
                          <Button 
                            type="default" 
                            size="small" 
                            onClick={() => router.push(item.link)} 
                            style={{ marginTop: 8 }}
                          >
                            {item.status === 'Not Started' ? 'Start Assignment' : 'Continue Assignment'}
                          </Button>
                        </List.Item>
                      )}
                    />
                  ) : (
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                      <Text>No pending homework</Text>
                    </div>
                  )}
                </Card>
                
                {/* Recent Messages */}
                <Card 
                  title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Space>
                        <MessageOutlined style={{ color: '#1890ff' }} />
                        <span>Recent Messages</span>
                      </Space>
                      <Badge count={recentMessages.filter(m => m.unread).length || 0} />
                    </div>
                  }
                >
                  {recentMessages.length > 0 ? (
                    <List
                      itemLayout="horizontal"
                      dataSource={recentMessages}
                      renderItem={item => (
                        <List.Item key={item.id}>
                          <List.Item.Meta
                            avatar={<Avatar src={item.avatar} />}
                            title={
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Text strong={item.unread}>{item.sender}</Text>
                                <Text type="secondary" style={{ fontSize: 12 }}>{item.time}</Text>
                              </div>
                            }
                            description={
                              <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                                <Text style={{ marginRight: 8 }}>{item.message}</Text>
                                {item.unread && <Badge color="blue" />}
                              </div>
                            }
                          />
                        </List.Item>
                      )}
                    />
                  ) : (
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                      <Text>No messages</Text>
                    </div>
                  )}
                  <div style={{ textAlign: 'center', marginTop: 16 }}>
                    <Button type="link" onClick={() => setActiveTab('messages')}>
                      View all messages
                    </Button>
                  </div>
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab="My Courses" key="courses">
            <Title level={4}>My Enrolled Courses</Title>
            <Card>
              <Text>Your enrolled courses will appear here. (Data to be fetched from API)</Text>
            </Card>
          </TabPane>

          <TabPane tab="Achievements" key="achievements">
            <Title level={4}>My Achievements</Title>
            <Card>
              <Text>Your achievements and badges will be displayed here. (Data to be fetched from API)</Text>
            </Card>
          </TabPane>

          <TabPane tab="Certificates" key="certificate">
            <Title level={4}>My Certificates</Title>
            <Card>
              <Text>Your earned certificates will be shown here. (Data to be fetched from API)</Text>
            </Card>
          </TabPane>
          
          <TabPane tab="Messages" key="messages">
            <Title level={4}>Messages</Title>
            <Card>
              <Text>Your messages will be displayed here. (Data to be fetched from API)</Text>
            </Card>
          </TabPane>
        </Tabs>
      </Content>
    </Layout>
  );
} 