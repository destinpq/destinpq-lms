'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import JitsiMeeting from '@/app/components/JitsiMeeting/JitsiMeeting';
import BreakoutChat from '@/app/components/BreakoutChat/BreakoutChat';
import { Button, Card, Spin, Typography, Space, Table, Tag, Divider, Input, Form, Switch, Alert, Row, Col, Layout, Drawer, Tooltip, Badge, Statistic, Tabs, Select } from 'antd';
import { ArrowLeftOutlined, ClockCircleOutlined, TeamOutlined, VideoCameraOutlined, SettingOutlined, CopyOutlined, FullscreenOutlined, DeleteOutlined, LockOutlined, UnlockOutlined, AudioMutedOutlined, SendOutlined, LaptopOutlined, CrownOutlined, DashboardOutlined, MessageOutlined } from '@ant-design/icons';
import { use } from 'react';

const { Title, Text, Paragraph } = Typography;
const { Header, Content } = Layout;
const { TabPane } = Tabs;
const { Option } = Select;

interface SessionData {
  id: string;
  title: string;
  description: string;
  instructor: string;
  date: Date;
  duration: string;
  sessionType: string;
  roomId: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  password?: string;
  isRecording: boolean;
  isPrivate: boolean;
  participantCount: number;
  participants: {
    id: number;
    name: string;
    email: string;
    joinTime?: Date;
    role: string;
    status: string;
  }[];
}

export default function AdminWorkshopSession({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap the params Promise
  const { id } = use(params);
  
  const { user, loading } = useAuth();
  const router = useRouter();
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('video');
  const [sessionSettings, setSessionSettings] = useState({
    isPrivate: false,
    password: '',
    allowRecording: true,
    muteParticipantsOnEntry: true,
    allowChat: true,
    allowScreenSharing: true
  });
  const [copySuccess, setCopySuccess] = useState('');
  const [settingsDrawerOpen, setSettingsDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [participantsDrawerOpen, setParticipantsDrawerOpen] = useState(false);
  const [sessionTimer, setSessionTimer] = useState(0);
  const [isRecording, setIsRecording] = useState(false);

  // Check for mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Check if user is admin
  useEffect(() => {
    if (!loading && (!user || !user.isAdmin)) {
      router.push('/login');
      return;
    }
  }, [user, loading, router]);

  // Session timer
  useEffect(() => {
    let timerId: NodeJS.Timeout;
    
    if (sessionData?.status === 'in-progress') {
      timerId = setInterval(() => {
        setSessionTimer(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [sessionData?.status]);

  // Format time for display
  const formatSessionTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Fetch session data
  useEffect(() => {
    const fetchSessionData = async () => {
      setIsLoading(true);
      try {
        // In a real app, fetch from API using the session ID
        // For now, we'll create mock data for demonstration
        
        // Small delay to simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Sample session data (this would come from your backend API)
        const sampleSession: SessionData = {
          id,
          title: 'Cognitive Behavioral Techniques Workshop',
          description: 'This workshop will cover advanced cognitive behavioral techniques for managing anxiety and stress. Participants will learn practical strategies that can be applied in clinical settings.',
          instructor: 'Dr. Sarah Johnson',
          date: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
          duration: '90 minutes',
          sessionType: 'Interactive Workshop',
          roomId: `workshop-${id}`,
          status: 'scheduled',
          password: 'workshop123',
          isRecording: false,
          isPrivate: true,
          participantCount: 0,
          participants: []
        };
        
        setSessionData(sampleSession);
        setSessionSettings({
          isPrivate: sampleSession.isPrivate,
          password: sampleSession.password || '',
          allowRecording: sampleSession.isRecording,
          muteParticipantsOnEntry: true,
          allowChat: true,
          allowScreenSharing: true
        });
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching session data:', error);
        setError('Failed to load workshop session data');
        setIsLoading(false);
      }
    };

    // Only fetch if user is admin
    if (!loading && user && user.isAdmin) {
      fetchSessionData();
    }
  }, [id, router, user, loading]);

  // Format date for display
  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // Save session settings
  const saveSettings = () => {
    // In a real app, save to API
    console.log('Saving session settings:', sessionSettings);
    // Update sessionData
    if (sessionData) {
      setSessionData({
        ...sessionData,
        isPrivate: sessionSettings.isPrivate,
        password: sessionSettings.isPrivate ? sessionSettings.password : undefined,
        isRecording: sessionSettings.allowRecording
      });
    }

    // Show success message
    setError('Settings saved successfully');
    setTimeout(() => setError(null), 3000);
    
    // Close drawer on mobile
    if (isMobile) {
      setSettingsDrawerOpen(false);
    }
  };

  // Copy session link to clipboard
  const copySessionLink = () => {
    const sessionLink = `${window.location.origin}/workshop/session/${id}`;
    navigator.clipboard.writeText(sessionLink)
      .then(() => {
        setCopySuccess('Link copied to clipboard!');
        setTimeout(() => setCopySuccess(''), 3000);
      })
      .catch(err => {
        console.error('Failed to copy:', err);
        setCopySuccess('Failed to copy link');
      });
  };

  // Toggle recording
  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  // Start session
  const startSession = () => {
    if (sessionData) {
      setSessionData({
        ...sessionData,
        status: 'in-progress'
      });
    }
  };

  // End session
  const endSession = () => {
    if (sessionData) {
      setSessionData({
        ...sessionData,
        status: 'completed'
      });
    }
  };

  // Toggle drawers
  const toggleSettingsDrawer = () => {
    setSettingsDrawerOpen(!settingsDrawerOpen);
  };

  const toggleParticipantsDrawer = () => {
    setParticipantsDrawerOpen(!participantsDrawerOpen);
  };

  // Send announcement to all participants
  const sendAnnouncement = () => {
    // This would integrate with the chat API in a real implementation
    alert('Announcement feature would be implemented here');
  };

  if (loading || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!user?.isAdmin) {
    return (
      <div className="flex h-screen flex-col items-center justify-center p-4 text-center">
        <Title level={3} style={{ color: '#e34141' }}>Admin Access Required</Title>
        <Paragraph>You need administrator privileges to access this page.</Paragraph>
        <Button type="primary" onClick={() => router.push('/login')}>
          Go to Login
        </Button>
      </div>
    );
  }

  if (error && error !== 'Settings saved successfully') {
    return (
      <div className="flex h-screen flex-col items-center justify-center p-4 text-center">
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
      <div className="flex h-screen flex-col items-center justify-center p-4 text-center">
        <Title level={3}>Session Not Found</Title>
        <Paragraph>The workshop session you're looking for doesn't exist or has been removed.</Paragraph>
        <Button type="primary" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  // Session status tag color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'blue';
      case 'in-progress': return 'green';
      case 'completed': return 'gray';
      case 'cancelled': return 'red';
      default: return 'default';
    }
  };

  // Session participant columns
  const participantColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (text: string) => <Tag color={text === 'Instructor' ? 'green' : 'blue'}>{text}</Tag>
    },
    {
      title: 'Join Time',
      dataIndex: 'joinTime',
      key: 'joinTime',
      render: (date: Date) => date ? formatDate(date) : '-'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (text: string) => <Tag color={text === 'Active' ? 'green' : 'gray'}>{text}</Tag>
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: unknown, record: unknown) => (
        <Space size="small">
          <Button size="small" type="text" danger icon={<DeleteOutlined />}>
            Remove
          </Button>
          <Button size="small" type="text" icon={<AudioMutedOutlined />}>
            {(record as any).status === 'Active' ? 'Mute' : 'Unmute'}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Layout className="min-h-screen bg-gray-50">
      {/* Admin Header with Admin Badge */}
      <Header className="flex items-center justify-between bg-gradient-to-r from-blue-700 to-blue-900 px-4 shadow-md">
        <div className="flex items-center">
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => router.push('/admin/workshops')}
            style={{ marginRight: '1rem' }}
            type="text"
            ghost
          />
          <div>
            <div className="flex items-center">
              <Title level={4} style={{ margin: 0, color: 'white' }}>
                {sessionData.title}
              </Title>
              <Badge 
                count="ADMIN" 
                style={{ 
                  backgroundColor: '#f50', 
                  marginLeft: '1rem',
                  fontSize: '10px'
                }} 
              />
            </div>
            <Text style={{ color: 'rgba(255,255,255,0.85)' }}>
              <ClockCircleOutlined style={{ marginRight: '0.5rem' }} />
              {formatDate(sessionData.date)}
              <Tag 
                color={getStatusColor(sessionData.status)} 
                style={{ marginLeft: '1rem', fontSize: '0.7rem' }}
              >
                {sessionData.status.replace('-', ' ').toUpperCase()}
              </Tag>
            </Text>
          </div>
        </div>
        <div className="flex items-center">
          {sessionData.status === 'in-progress' && (
            <div className="mr-4 bg-black bg-opacity-20 px-3 py-1 rounded">
              <Text strong style={{ color: 'white', fontSize: '0.85rem' }}>
                Session time: {formatSessionTime(sessionTimer)}
              </Text>
            </div>
          )}
          <Tooltip title="View Participants">
            <Badge count={sessionData.participantCount} size="small" offset={[5, 0]}>
              <Button 
                icon={<TeamOutlined />} 
                onClick={toggleParticipantsDrawer}
                type="primary"
                ghost
                style={{ marginRight: '0.5rem' }}
              />
            </Badge>
          </Tooltip>
          <Tooltip title="Workshop Settings">
            <Button 
              icon={<SettingOutlined />} 
              onClick={toggleSettingsDrawer}
              type="primary"
              ghost
              style={{ marginRight: '0.5rem' }}
            />
          </Tooltip>
          <Tooltip title="Copy Invite Link">
            <Button 
              icon={<CopyOutlined />} 
              onClick={copySessionLink}
              type="primary"
              ghost
            />
          </Tooltip>
          {copySuccess && (
            <Tag color="success" style={{ marginLeft: '0.5rem' }}>
              {copySuccess}
            </Tag>
          )}
        </div>
      </Header>

      {/* Workshop Content */}
      <Content className="p-4">
        {error === 'Settings saved successfully' && (
          <Alert
            message="Success"
            description="Settings have been saved successfully."
            type="success"
            showIcon
            closable
            style={{ marginBottom: '1rem' }}
            onClose={() => setError(null)}
          />
        )}
        
        {/* Admin Control Panel */}
        <Card 
          className="mb-4 shadow-sm" 
          title={
            <div className="flex items-center">
              <CrownOutlined style={{ marginRight: '0.5rem', color: '#faad14' }} />
              <span>Admin Control Panel</span>
            </div>
          }
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <div className="flex flex-col items-center p-3 bg-blue-50 rounded-lg border border-blue-100">
                <Statistic 
                  title="Session Status" 
                  value={sessionData.status} 
                  valueStyle={{ color: getStatusColor(sessionData.status) === 'green' ? '#52c41a' : '#1890ff' }}
                />
                <div className="mt-2">
                  {sessionData.status === 'scheduled' && (
                    <Button 
                      type="primary" 
                      icon={<VideoCameraOutlined />} 
                      onClick={startSession}
                      size="large"
                      block
                    >
                      Start Session
                    </Button>
                  )}
                  
                  {sessionData.status === 'in-progress' && (
                    <Button 
                      danger 
                      type="primary" 
                      onClick={endSession}
                      size="large"
                      block
                    >
                      End Session
                    </Button>
                  )}
                </div>
              </div>
            </Col>
            
            <Col xs={24} md={8}>
              <div className="flex flex-col items-center p-3 bg-blue-50 rounded-lg border border-blue-100">
                <Statistic 
                  title="Security Status" 
                  value={sessionSettings.isPrivate ? "Password Protected" : "Open Access"} 
                  valueStyle={{ color: sessionSettings.isPrivate ? '#52c41a' : '#faad14' }}
                  prefix={sessionSettings.isPrivate ? <LockOutlined /> : <UnlockOutlined />}
                />
                <div className="mt-2">
                  <Button 
                    type={sessionSettings.isPrivate ? "default" : "primary"}
                    icon={sessionSettings.isPrivate ? <UnlockOutlined /> : <LockOutlined />}
                    onClick={() => {
                      setSessionSettings({
                        ...sessionSettings,
                        isPrivate: !sessionSettings.isPrivate
                      });
                    }}
                    block
                  >
                    {sessionSettings.isPrivate ? "Remove Password" : "Add Password"}
                  </Button>
                </div>
              </div>
            </Col>
            
            <Col xs={24} md={8}>
              <div className="flex flex-col items-center p-3 bg-blue-50 rounded-lg border border-blue-100">
                <Statistic 
                  title="Recording" 
                  value={isRecording ? "Recording Active" : "Not Recording"} 
                  valueStyle={{ color: isRecording ? '#ff4d4f' : '#8c8c8c' }}
                />
                <div className="mt-2">
                  <Button 
                    type={isRecording ? "primary" : "default"}
                    danger={isRecording}
                    onClick={toggleRecording}
                    block
                  >
                    {isRecording ? "Stop Recording" : "Start Recording"}
                  </Button>
                </div>
              </div>
            </Col>
          </Row>
          
          <Divider />
          
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <div className="flex items-center justify-between">
                <div>
                  <Text strong>Quick Actions:</Text>
                </div>
                <div>
                  <Space>
                    <Button icon={<AudioMutedOutlined />} onClick={() => alert('All participants would be muted')}>
                      Mute All
                    </Button>
                    <Button icon={<SendOutlined />} onClick={sendAnnouncement}>
                      Send Announcement
                    </Button>
                    <Tooltip title="Toggle screen sharing permissions">
                      <Button icon={<LaptopOutlined />} onClick={() => {
                        setSessionSettings({
                          ...sessionSettings,
                          allowScreenSharing: !sessionSettings.allowScreenSharing
                        });
                      }}>
                        {sessionSettings.allowScreenSharing ? "Disable Sharing" : "Allow Sharing"}
                      </Button>
                    </Tooltip>
                  </Space>
                </div>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div className="flex items-center justify-between">
                <Text strong>View Mode:</Text>
                <div>
                  <Tabs 
                    activeKey={activeSection} 
                    onChange={setActiveSection}
                    size="small" 
                    type="card"
                    style={{ marginBottom: 0 }}
                  >
                    <TabPane 
                      tab={<span><VideoCameraOutlined /> Video Focus</span>} 
                      key="video" 
                    />
                    <TabPane 
                      tab={<span><MessageOutlined /> Split View</span>} 
                      key="split" 
                    />
                    <TabPane 
                      tab={<span><DashboardOutlined /> Dashboard</span>} 
                      key="dashboard" 
                    />
                  </Tabs>
                </div>
              </div>
            </Col>
          </Row>
        </Card>
        
        <Row gutter={[16, 16]}>
          {/* Video Conference */}
          <Col xs={24} md={activeSection === 'video' ? 24 : (activeSection === 'split' ? 16 : 12)}>
            <Card bordered={false} className="shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <Title level={5} style={{ margin: 0 }}>
                  <VideoCameraOutlined style={{ marginRight: '0.5rem' }} /> 
                  Host Workshop Session
                </Title>
                <Space>
                  <Tooltip title="Enter fullscreen">
                    <Button type="text" icon={<FullscreenOutlined />} size="small" />
                  </Tooltip>
                  <Select 
                    defaultValue="presenter" 
                    style={{ width: 120 }}
                    size="small"
                  >
                    <Option value="presenter">Presenter Mode</Option>
                    <Option value="gallery">Gallery View</Option>
                    <Option value="shared">Screen Share</Option>
                  </Select>
                </Space>
              </div>
              
              <JitsiMeeting
                roomName={sessionData.roomId}
                displayName={`${user?.firstName || 'Admin'} (Host)`}
                subject={sessionData.title}
                password={sessionData.password}
                containerStyle={{ 
                  width: '100%', 
                  height: activeSection === 'dashboard' ? '300px' : '500px', 
                  borderRadius: '8px',
                  overflow: 'hidden' 
                }}
                domain="meet.jit.si"
                configOverwrite={{
                  startWithAudioMuted: true,
                  hiddenPremeetingButtons: ['microphone'],
                  prejoinConfig: {
                    enabled: false
                  },
                  disableDeepLinking: true,
                  disableInviteFunctions: true,
                  enableClosePage: false,
                  enableWelcomePage: false
                }}
                interfaceConfigOverwrite={{
                  DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
                  MOBILE_APP_PROMO: false,
                  HIDE_INVITE_MORE_HEADER: true,
                  DISABLE_VIDEO_BACKGROUND: true
                }}
              />
            </Card>
          </Col>
          
          {/* Admin Chat - only shown in split or dashboard view */}
          {activeSection !== 'video' && (
            <Col xs={24} md={activeSection === 'split' ? 8 : 12}>
              <BreakoutChat 
                sessionId={sessionData.id}
                userId={user?.id || 'admin'}
                userName={`${user?.firstName || 'Admin'} (Host)`}
                isAdmin={true}
              />
            </Col>
          )}
          
          {/* Additional dashboard components */}
          {activeSection === 'dashboard' && (
            <>
              <Col xs={24} md={12}>
                <Card 
                  title={
                    <div className="flex items-center">
                      <TeamOutlined style={{ marginRight: '0.5rem' }} />
                      <span>Active Participants</span>
                    </div>
                  } 
                  className="shadow-sm"
                  extra={<Button size="small" onClick={toggleParticipantsDrawer}>View All</Button>}
                >
                  <Table 
                    dataSource={sessionData.participants.slice(0, 5)} 
                    columns={participantColumns.filter(col => col.key !== 'email')}
                    rowKey="id"
                    pagination={false}
                    size="small"
                    locale={{ emptyText: 'No participants have joined this session yet' }}
                  />
                </Card>
              </Col>
              
              <Col xs={24}>
                <Card 
                  title={
                    <div className="flex items-center">
                      <SettingOutlined style={{ marginRight: '0.5rem' }} />
                      <span>Quick Settings</span>
                    </div>
                  } 
                  className="shadow-sm"
                >
                  <Row gutter={[16, 16]}>
                    <Col xs={24} md={8}>
                      <div className="flex items-center justify-between">
                        <Text>Password Protection:</Text>
                        <Switch 
                          checked={sessionSettings.isPrivate} 
                          onChange={(checked) => setSessionSettings({...sessionSettings, isPrivate: checked})}
                        />
                      </div>
                    </Col>
                    <Col xs={24} md={8}>
                      <div className="flex items-center justify-between">
                        <Text>Allow Recording:</Text>
                        <Switch 
                          checked={sessionSettings.allowRecording} 
                          onChange={(checked) => setSessionSettings({...sessionSettings, allowRecording: checked})}
                        />
                      </div>
                    </Col>
                    <Col xs={24} md={8}>
                      <div className="flex items-center justify-between">
                        <Text>Allow Screen Sharing:</Text>
                        <Switch 
                          checked={sessionSettings.allowScreenSharing} 
                          onChange={(checked) => setSessionSettings({...sessionSettings, allowScreenSharing: checked})}
                        />
                      </div>
                    </Col>
                  </Row>
                </Card>
              </Col>
            </>
          )}
        </Row>
      </Content>

      {/* Participants Drawer */}
      <Drawer
        title={
          <div className="flex items-center">
            <TeamOutlined style={{ marginRight: '0.5rem' }} />
            <span>Workshop Participants</span>
            <Tag color="blue" style={{ marginLeft: '0.5rem' }}>
              {sessionData.participantCount} total
            </Tag>
          </div>
        }
        placement="right"
        onClose={toggleParticipantsDrawer}
        open={participantsDrawerOpen}
        width={isMobile ? '100%' : 700}
      >
        <div className="mb-4">
          <Input.Search placeholder="Search participants" style={{ width: '100%' }} />
        </div>
        
        <div className="mb-4 flex justify-between">
          <Button icon={<AudioMutedOutlined />} onClick={() => alert('All participants would be muted')}>
            Mute All
          </Button>
          <Button icon={<SendOutlined />} onClick={sendAnnouncement}>
            Send Announcement
          </Button>
          <Button danger icon={<DeleteOutlined />} onClick={() => alert('This would remove all participants')}>
            Remove All
          </Button>
        </div>
        
        <Table 
          dataSource={sessionData.participants} 
          columns={participantColumns}
          rowKey="id"
          pagination={false}
          locale={{ emptyText: 'No participants have joined this session yet' }}
          size="small"
          className="shadow-sm"
        />
      </Drawer>

      {/* Settings Drawer */}
      <Drawer
        title={
          <div className="flex items-center">
            <SettingOutlined style={{ marginRight: '0.5rem' }} />
            <span>Workshop Settings</span>
          </div>
        }
        placement="right"
        onClose={toggleSettingsDrawer}
        open={settingsDrawerOpen}
        width={isMobile ? '100%' : 500}
      >
        <Form layout="vertical">
          <Form.Item label="Session Link">
            <Input 
              value={`${typeof window !== 'undefined' ? window.location.origin : ''}/workshop/session/${id}`}
              readOnly
              addonAfter={
                <Button 
                  type="text" 
                  icon={<CopyOutlined />} 
                  onClick={copySessionLink}
                  style={{ border: 'none', padding: 0 }}
                />
              }
            />
            {copySuccess && <div style={{ color: 'green', marginTop: '0.5rem' }}>{copySuccess}</div>}
          </Form.Item>
          
          <Divider />
          
          <Form.Item label="Private Session">
            <Switch 
              checked={sessionSettings.isPrivate} 
              onChange={(checked) => setSessionSettings({...sessionSettings, isPrivate: checked})}
            />
            <Text style={{ marginLeft: '1rem' }}>
              Enable this to require a password for participants to join
            </Text>
          </Form.Item>
          
          {sessionSettings.isPrivate && (
            <Form.Item label="Session Password">
              <Input.Password 
                value={sessionSettings.password} 
                onChange={(e) => setSessionSettings({...sessionSettings, password: e.target.value})}
                placeholder="Enter password for the session"
              />
            </Form.Item>
          )}
          
          <Form.Item label="Allow Recording">
            <Switch 
              checked={sessionSettings.allowRecording} 
              onChange={(checked) => setSessionSettings({...sessionSettings, allowRecording: checked})}
            />
            <Text style={{ marginLeft: '1rem' }}>
              Enable session recording capability
            </Text>
          </Form.Item>
          
          <Form.Item label="Mute Participants on Entry">
            <Switch 
              checked={sessionSettings.muteParticipantsOnEntry} 
              onChange={(checked) => setSessionSettings({...sessionSettings, muteParticipantsOnEntry: checked})}
            />
            <Text style={{ marginLeft: '1rem' }}>
              Automatically mute participants when they join
            </Text>
          </Form.Item>
          
          <Form.Item label="Allow Screen Sharing">
            <Switch 
              checked={sessionSettings.allowScreenSharing} 
              onChange={(checked) => setSessionSettings({...sessionSettings, allowScreenSharing: checked})}
            />
            <Text style={{ marginLeft: '1rem' }}>
              Allow participants to share their screens
            </Text>
          </Form.Item>
          
          <Form.Item label="Backend Chat Only">
            <Switch 
              checked={true}
              disabled={true}
            />
            <Text style={{ marginLeft: '1rem' }}>
              Using secure backend chat instead of Jitsi built-in chat (enabled by default)
            </Text>
          </Form.Item>
          
          <Form.Item>
            <Button type="primary" onClick={saveSettings}>
              Save Settings
            </Button>
          </Form.Item>
        </Form>
      </Drawer>
    </Layout>
  );
} 