'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import Link from 'next/link';
import { 
  Badge, 
  Button, 
  Card, 
  List, 
  Avatar, 
  Input, 
  Tag, 
  Layout, 
  Typography, 
  Row, 
  Col, 
  Grid, 
  Space, 
  Menu, 
  Tabs, 
  Progress, 
  Spin,
  Divider,
  Statistic 
} from 'antd';
import { 
  MessageOutlined, 
  ClockCircleOutlined, 
  BookOutlined, 
  BellOutlined, 
  LogoutOutlined, 
  TrophyOutlined,
  BookFilled,
  RightOutlined
} from '@ant-design/icons';

const { Header, Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { useBreakpoint } = Grid;

export default function StudentDashboard() {
  const { user, loading, signout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  
  const screens = useBreakpoint();
  
  // Mock data for demo purposes
  const nextWorkshop = {
    title: "Advanced Cognitive Techniques",
    date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
    link: "/workshop/adv-cognitive-techniques",
    instructor: "Dr. Sarah Johnson"
  };
  
  const upcomingSessions = [
    {
      id: 1,
      title: "Behavioral Activation Techniques",
      course: "Cognitive Behavioral Therapy",
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      instructor: "Dr. Michael Brown",
      link: "/session/beh-activation-techniques"
    },
    {
      id: 2,
      title: "Mindfulness and Stress Reduction",
      course: "Mental Health Fundamentals",
      date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      instructor: "Dr. Emily Wilson",
      link: "/session/mindfulness-stress-reduction"
    }
  ];
  
  const pendingHomework = [
    {
      id: 1,
      title: "CBT Case Study Analysis",
      course: "Cognitive Behavioral Therapy",
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      status: "Not Started",
      link: "/homework/cbt-case-study"
    },
    {
      id: 2,
      title: "Reflective Journal Entry",
      course: "Mental Health Fundamentals",
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      status: "In Progress",
      link: "/homework/reflective-journal"
    }
  ];
  
  const recentMessages = [
    {
      id: 1,
      sender: "Dr. Sarah Johnson",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      message: "Don't forget to complete your CBT case study by Friday!",
      time: "2 hours ago",
      unread: true
    },
    {
      id: 2,
      sender: "Study Group",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      message: "Let's meet online tomorrow to discuss the journal entries.",
      time: "Yesterday",
      unread: false
    }
  ];
  
  useEffect(() => {
    // Check authentication
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);
  
  // Countdown timer for next workshop
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = nextWorkshop.date.getTime() - now;
      
      if (distance < 0) {
        clearInterval(timer);
        return;
      }
      
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      
      setTimeLeft({ days, hours, minutes, seconds });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [nextWorkshop.date]);

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Header style={{ background: '#fff', padding: '0 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Title level={4} style={{ margin: 0 }}>Student Dashboard</Title>
        <Space>
          <Badge count={3} size="small">
            <BellOutlined style={{ fontSize: 18, cursor: 'pointer' }} />
          </Badge>
          <Text style={{ margin: '0 16px' }}>
            Welcome, {user.displayName || user.email}
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
          tabBarExtraContent={activeTab === 'messages' && <Badge count={2} />}
        >
          <TabPane tab="Dashboard" key="dashboard">
            <Row gutter={[24, 24]}>
              <Col xs={24} lg={16}>
                {/* Next Workshop Card */}
                <Card 
                  title={
                    <Space>
                      <ClockCircleOutlined style={{ color: '#1890ff' }} />
                      <span>Next Workshop</span>
                    </Space>
                  }
                  style={{ marginBottom: 24 }}
                >
                  <Title level={4} style={{ marginTop: 0 }}>{nextWorkshop.title}</Title>
                  <Paragraph>
                    <strong>Instructor:</strong> {nextWorkshop.instructor} <br />
                    <strong>Date:</strong> {formatDate(nextWorkshop.date)}
                  </Paragraph>
                  
                  <Row gutter={16} style={{ textAlign: 'center', marginBottom: 24 }}>
                    <Col span={6}>
                      <Card style={{ background: '#f0f7ff' }}>
                        <Statistic 
                          title="Days" 
                          value={timeLeft.days} 
                          valueStyle={{ color: '#1890ff', fontWeight: 'bold' }}
                        />
                      </Card>
                    </Col>
                    <Col span={6}>
                      <Card style={{ background: '#f0f7ff' }}>
                        <Statistic 
                          title="Hours" 
                          value={timeLeft.hours} 
                          valueStyle={{ color: '#1890ff', fontWeight: 'bold' }}
                        />
                      </Card>
                    </Col>
                    <Col span={6}>
                      <Card style={{ background: '#f0f7ff' }}>
                        <Statistic 
                          title="Minutes" 
                          value={timeLeft.minutes} 
                          valueStyle={{ color: '#1890ff', fontWeight: 'bold' }}
                        />
                      </Card>
                    </Col>
                    <Col span={6}>
                      <Card style={{ background: '#f0f7ff' }}>
                        <Statistic 
                          title="Seconds" 
                          value={timeLeft.seconds} 
                          valueStyle={{ color: '#1890ff', fontWeight: 'bold' }}
                        />
                      </Card>
                    </Col>
                  </Row>
                  
                  <Row justify="space-between" align="middle">
                    <Button type="primary" href={nextWorkshop.link}>
                      Join Workshop
                    </Button>
                    <Button type="link" href={`${nextWorkshop.link}/materials`}>
                      View preparatory materials
                    </Button>
                  </Row>
                </Card>
                
                {/* Upcoming Sessions */}
                <Card 
                  title={
                    <Space>
                      <ClockCircleOutlined style={{ color: '#1890ff' }} />
                      <span>Upcoming Live Sessions</span>
                    </Space>
                  }
                >
                  <List
                    itemLayout="horizontal"
                    dataSource={upcomingSessions}
                    renderItem={item => (
                      <List.Item
                        key={item.id}
                        actions={[
                          <Button type="primary" size="small" key="join" href={item.link}>
                            Join
                          </Button>
                        ]}
                      >
                        <List.Item.Meta
                          title={<a href={item.link}>{item.title}</a>}
                          description={
                            <>
                              <Text strong>{item.course}</Text><br />
                              <Text>Instructor: {item.instructor}</Text><br />
                              <Text>{formatDate(item.date)}</Text>
                            </>
                          }
                        />
                      </List.Item>
                    )}
                  />
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
                          title={<a href={item.link}>{item.title}</a>}
                          description={
                            <>
                              <Text>{item.course}</Text><br />
                              <Text type="danger">Due: {formatDate(item.dueDate)}</Text>
                            </>
                          }
                        />
                        <Button type="default" size="small" href={item.link} style={{ marginTop: 8 }}>
                          {item.status === 'Not Started' ? 'Start Assignment' : 'Continue Assignment'}
                        </Button>
                      </List.Item>
                    )}
                  />
                </Card>
                
                {/* Recent Messages */}
                <Card 
                  title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Space>
                        <MessageOutlined style={{ color: '#1890ff' }} />
                        <span>Recent Messages</span>
                      </Space>
                      <Badge count={2} />
                    </div>
                  }
                >
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
            <Row gutter={[24, 24]}>
              <Col xs={24} sm={12} lg={8}>
                <Card 
                  cover={<div style={{ height: 160, background: '#f5f5f5' }}></div>}
                  hoverable
                >
                  <Card.Meta 
                    title="Cognitive Behavioral Techniques" 
                    description={
                      <>
                        <div style={{ marginTop: 16, marginBottom: 8 }}>
                          <Progress percent={33} size="small" />
                        </div>
                        <Text type="secondary">Progress: 33%</Text>
                        <div style={{ marginTop: 16 }}>
                          <Button 
                            type="link" 
                            href="/course/sample-course-id"
                            style={{ padding: 0 }}
                          >
                            Continue Learning <RightOutlined />
                          </Button>
                        </div>
                      </>
                    }
                  />
                </Card>
              </Col>
              
              <Col xs={24} sm={12} lg={8}>
                <Card 
                  cover={<div style={{ height: 160, background: '#f5f5f5' }}></div>}
                  hoverable
                >
                  <Card.Meta 
                    title="Neuroscience Fundamentals" 
                    description={
                      <>
                        <div style={{ marginTop: 16, marginBottom: 8 }}>
                          <Progress percent={50} size="small" />
                        </div>
                        <Text type="secondary">Progress: 50%</Text>
                        <div style={{ marginTop: 16 }}>
                          <Button 
                            type="link" 
                            href="/course/sample-course-id-2"
                            style={{ padding: 0 }}
                          >
                            Continue Learning <RightOutlined />
                          </Button>
                        </div>
                      </>
                    }
                  />
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab="Achievements" key="achievements">
            <Title level={4}>My Achievements</Title>
            <Card>
              <Row align="middle" justify="space-between" style={{ marginBottom: 24 }}>
                <Col>
                  <Title level={4} style={{ margin: 0 }}>Your Learning Points</Title>
                  <Title level={2} style={{ margin: '8px 0 0', color: '#1890ff' }}>450</Title>
                </Col>
                <Col>
                  <Tag color="blue" style={{ fontSize: 14, padding: '4px 12px' }}>
                    Level 3 Learner
                  </Tag>
                </Col>
              </Row>
              
              <Divider />
              
              <Title level={4}>Badges Earned</Title>
              <Row gutter={[16, 16]}>
                <Col xs={12} sm={6}>
                  <Card>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ 
                        width: 64, 
                        height: 64, 
                        borderRadius: '50%', 
                        background: '#fffbe6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px',
                        fontSize: 32
                      }}>
                        🏆
                      </div>
                      <Text strong>First Quiz Completed</Text>
                    </div>
                  </Card>
                </Col>
                <Col xs={12} sm={6}>
                  <Card>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ 
                        width: 64, 
                        height: 64, 
                        borderRadius: '50%', 
                        background: '#f6ffed',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px',
                        fontSize: 32
                      }}>
                        📚
                      </div>
                      <Text strong>Active Learner</Text>
                    </div>
                  </Card>
                </Col>
                <Col xs={12} sm={6}>
                  <Card style={{ opacity: 0.4 }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ 
                        width: 64, 
                        height: 64, 
                        borderRadius: '50%', 
                        background: '#f9f0ff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px',
                        fontSize: 32
                      }}>
                        🧠
                      </div>
                      <Text strong>Neuroscience Expert</Text>
                    </div>
                  </Card>
                </Col>
                <Col xs={12} sm={6}>
                  <Card style={{ opacity: 0.4 }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ 
                        width: 64, 
                        height: 64, 
                        borderRadius: '50%', 
                        background: '#e6f7ff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px',
                        fontSize: 32
                      }}>
                        💬
                      </div>
                      <Text strong>Discussion Leader</Text>
                    </div>
                  </Card>
                </Col>
              </Row>
            </Card>
          </TabPane>

          <TabPane tab="Certificates" key="certificate">
            <Title level={4}>My Certificates</Title>
            <Card>
              <Title level={4}>You haven&apos;t earned any certificates yet</Title>
              <Paragraph>
                Complete a course to earn your first certificate. Certificates are awarded when you finish
                all modules and pass the required assessments.
              </Paragraph>
              <Button 
                type="link" 
                onClick={() => setActiveTab('courses')}
                style={{ paddingLeft: 0 }}
              >
                Go to my courses <RightOutlined />
              </Button>
            </Card>
          </TabPane>
          
          <TabPane tab="Messages" key="messages">
            <Title level={4}>Messages</Title>
            <Card bodyStyle={{ padding: 0 }}>
              <Row>
                {/* Chat List Sidebar */}
                <Col xs={24} lg={8} style={{ borderRight: '1px solid #f0f0f0' }}>
                  <div style={{ padding: 16, borderBottom: '1px solid #f0f0f0' }}>
                    <Input.Search placeholder="Search messages..." />
                  </div>
                  <List
                    dataSource={[
                      {
                        id: 1,
                        name: 'Dr. Sarah Johnson',
                        avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
                        lastMessage: 'Don&apos;t forget to complete your CBT case study by Friday!',
                        time: '2h',
                        unread: true
                      },
                      {
                        id: 2,
                        name: 'Study Group',
                        avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
                        lastMessage: 'Let&apos;s meet online tomorrow to discuss the journal entries.',
                        time: '1d',
                        unread: false
                      },
                      {
                        id: 3,
                        name: 'Tech Support',
                        avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
                        lastMessage: 'Your issue has been resolved. Let me know if you need anything else.',
                        time: '2d',
                        unread: false
                      },
                    ]}
                    renderItem={item => (
                      <List.Item
                        key={item.id}
                        style={{ 
                          padding: '12px 16px', 
                          cursor: 'pointer', 
                          background: item.unread ? '#f0f7ff' : 'transparent'
                        }}
                        onClick={() => {}}
                      >
                        <List.Item.Meta
                          avatar={<Avatar src={item.avatar} />}
                          title={
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Text strong={item.unread}>{item.name}</Text>
                              <Text type="secondary" style={{ fontSize: 12 }}>{item.time}</Text>
                            </div>
                          }
                          description={
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Text
                                style={{ 
                                  maxWidth: 180,
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  fontWeight: item.unread ? 600 : 400,
                                  color: item.unread ? 'rgba(0, 0, 0, 0.85)' : 'rgba(0, 0, 0, 0.45)'
                                }}
                              >
                                {item.lastMessage}
                              </Text>
                              {item.unread && <Badge color="blue" />}
                            </div>
                          }
                        />
                      </List.Item>
                    )}
                  />
                </Col>
                
                {/* Chat Window */}
                <Col xs={24} lg={16} style={{ display: 'flex', flexDirection: 'column', height: 600 }}>
                  <div style={{ padding: 16, borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center' }}>
                    <Avatar src="https://randomuser.me/api/portraits/women/44.jpg" size="large" />
                    <div style={{ marginLeft: 12 }}>
                      <Text strong>Dr. Sarah Johnson</Text>
                      <div><Text type="success" style={{ fontSize: 12 }}>Online</Text></div>
                    </div>
                  </div>
                  
                  <div style={{ flex: 1, padding: 16, background: '#f5f7f9', overflowY: 'auto' }}>
                    <Space direction="vertical" style={{ width: '100%' }} size="middle">
                      <div style={{ display: 'flex' }}>
                        <Card size="small" style={{ maxWidth: 300 }}>
                          <Text>Hi there! How&apos;s your progress on the CBT case study?</Text>
                          <div><Text type="secondary" style={{ fontSize: 12 }}>10:30 AM</Text></div>
                        </Card>
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Card size="small" style={{ maxWidth: 300, background: '#1890ff' }}>
                          <Text style={{ color: 'white' }}>
                            I&apos;m about halfway through. Had some questions about the analysis section.
                          </Text>
                          <div><Text style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.75)' }}>10:35 AM</Text></div>
                        </Card>
                      </div>
                      
                      <div style={{ display: 'flex' }}>
                        <Card size="small" style={{ maxWidth: 300 }}>
                          <Text>
                            Let me know what questions you have. Don&apos;t forget it&apos;s due this Friday!
                          </Text>
                          <div><Text type="secondary" style={{ fontSize: 12 }}>10:42 AM</Text></div>
                        </Card>
                      </div>
                    </Space>
                  </div>
                  
                  <div style={{ padding: 16, borderTop: '1px solid #f0f0f0', display: 'flex' }}>
                    <Input placeholder="Type a message..." style={{ marginRight: 8 }} />
                    <Button type="primary">Send</Button>
                  </div>
                </Col>
              </Row>
            </Card>
          </TabPane>
        </Tabs>
      </Content>
    </Layout>
  );
} 