'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { 
  Layout, 
  Typography, 
  Menu, 
  Card, 
  Button, 
  Table, 
  Space, 
  Spin, 
  Statistic, 
  Row, 
  Col,
  Divider,
  Modal,
  Form,
  Input,
  message,
  Select,
  DatePicker
} from 'antd';
import {
  UserOutlined,
  BookOutlined,
  CalendarOutlined,
  DashboardOutlined,
  LogoutOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  VideoCameraOutlined
} from '@ant-design/icons';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

// Define interfaces for type safety
interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  isAdmin: boolean;
  createdAt: string;
}

interface Workshop {
  id: number;
  title: string;
  instructor: string;
  date: string;
  participants: number;
}

// Mock data for demonstration
const USERS: User[] = [
  { id: 1, firstName: 'Admin', lastName: 'User', email: 'admin@example.com', isAdmin: true, createdAt: '2023-01-01' },
  { id: 2, firstName: 'Test', lastName: 'User', email: 'test@example.com', isAdmin: false, createdAt: '2023-01-02' },
  { id: 3, firstName: 'John', lastName: 'Doe', email: 'john@example.com', isAdmin: false, createdAt: '2023-01-03' },
];

const WORKSHOPS: Workshop[] = [
  { id: 1, title: 'Advanced Cognitive Techniques', instructor: 'Dr. Sarah Johnson', date: '2023-06-15', participants: 25 },
  { id: 2, title: 'Behavioral Activation Workshop', instructor: 'Dr. Michael Brown', date: '2023-07-01', participants: 18 },
  { id: 3, title: 'Mindfulness Techniques', instructor: 'Dr. Emily Wilson', date: '2023-07-15', participants: 30 },
];

export default function AdminDashboard() {
  const { user, loading, signout } = useAuth();
  const router = useRouter();
  const [selectedMenu, setSelectedMenu] = useState('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUserForm] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);
  const [zoomForm] = Form.useForm();

  // Make sure user is authenticated and is an admin
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (!loading && user && !user.isAdmin) {
      message.error('You do not have admin privileges');
      router.push('/student/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!user || !user.isAdmin) {
    return null; // Will redirect via useEffect
  }

  const handleMenuClick = (key: string) => {
    setSelectedMenu(key);
  };

  const handleCreateUser = () => {
    setIsModalOpen(true);
  };

  const handleModalCancel = () => {
    setIsModalOpen(false);
    newUserForm.resetFields();
  };

  const handleModalSubmit = () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      message.success('User created successfully!');
      setIsLoading(false);
      setIsModalOpen(false);
      newUserForm.resetFields();
    }, 1000);
  };

  const handleCreateZoomMeeting = () => {
    setIsZoomModalOpen(true);
  };

  const handleZoomModalCancel = () => {
    setIsZoomModalOpen(false);
    zoomForm.resetFields();
  };

  const handleZoomModalSubmit = () => {
    setIsLoading(true);
    
    // Simulate API call to create Zoom meeting
    setTimeout(() => {
      message.success('Zoom meeting created and linked to workshop!');
      setIsLoading(false);
      setIsZoomModalOpen(false);
      zoomForm.resetFields();
    }, 1000);
  };

  const userColumns = [
    {
      title: 'Name',
      dataIndex: 'firstName',
      key: 'name',
      render: (text: string, record: User) => `${record.firstName} ${record.lastName}`,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Role',
      key: 'role',
      render: (text: string, record: User) => (
        record.isAdmin ? <Text strong>Admin</Text> : 'Student'
      ),
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: () => (
        <Space>
          <Button icon={<EditOutlined />} size="small">Edit</Button>
          <Button icon={<DeleteOutlined />} size="small" danger>Delete</Button>
        </Space>
      ),
    },
  ];

  const workshopColumns = [
    {
      title: 'Workshop',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Instructor',
      dataIndex: 'instructor',
      key: 'instructor',
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Participants',
      dataIndex: 'participants',
      key: 'participants',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: () => (
        <Space>
          <Button icon={<EditOutlined />} size="small">Edit</Button>
          <Button icon={<DeleteOutlined />} size="small" danger>Delete</Button>
        </Space>
      ),
    },
  ];

  const renderContent = () => {
    switch (selectedMenu) {
      case 'dashboard':
        return (
          <>
            <Title level={2}>Admin Dashboard</Title>
            
            <Row gutter={16} style={{ marginBottom: '24px' }}>
              <Col span={8}>
                <Card>
                  <Statistic title="Total Users" value={USERS.length} />
                </Card>
              </Col>
              <Col span={8}>
                <Card>
                  <Statistic title="Workshops" value={WORKSHOPS.length} />
                </Card>
              </Col>
              <Col span={8}>
                <Card>
                  <Statistic title="Active Students" value={USERS.filter(u => !u.isAdmin).length} />
                </Card>
              </Col>
            </Row>
            
            <Card title="Recent Workshops">
              <Table 
                dataSource={WORKSHOPS} 
                columns={workshopColumns} 
                rowKey="id" 
                pagination={false}
              />
            </Card>
          </>
        );
      
      case 'users':
        return (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <Title level={2}>User Management</Title>
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={handleCreateUser}
              >
                Add User
              </Button>
            </div>
            
            <Card>
              <Table 
                dataSource={USERS} 
                columns={userColumns} 
                rowKey="id" 
                pagination={{ pageSize: 10 }}
              />
            </Card>
          </>
        );
      
      case 'workshops':
        return (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <Title level={2}>Workshop Management</Title>
              <Space>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                >
                  Create Workshop
                </Button>
                <Button
                  onClick={handleCreateZoomMeeting}
                  icon={<VideoCameraOutlined />}
                >
                  Create Zoom Meeting
                </Button>
              </Space>
            </div>
            
            <Card>
              <Table 
                dataSource={WORKSHOPS} 
                columns={workshopColumns} 
                rowKey="id" 
                pagination={{ pageSize: 10 }}
              />
            </Card>
          </>
        );
      
      case 'courses':
        return (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <Title level={2}>Course Management</Title>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
              >
                Add Course
              </Button>
            </div>
            
            <Card>
              <Table 
                dataSource={[
                  { id: 1, title: 'Cognitive Behavioral Therapy', instructor: 'Dr. Sarah Johnson', students: 15 },
                  { id: 2, title: 'Neuroscience Fundamentals', instructor: 'Dr. Michael Brown', students: 12 },
                  { id: 3, title: 'Mental Health Fundamentals', instructor: 'Dr. Emily Wilson', students: 18 },
                ]} 
                columns={[
                  { title: 'Course', dataIndex: 'title', key: 'title' },
                  { title: 'Instructor', dataIndex: 'instructor', key: 'instructor' },
                  { title: 'Students', dataIndex: 'students', key: 'students' },
                  {
                    title: 'Actions',
                    key: 'actions',
                    render: () => (
                      <Space>
                        <Button icon={<EditOutlined />} size="small">Edit</Button>
                        <Button icon={<DeleteOutlined />} size="small" danger>Delete</Button>
                      </Space>
                    ),
                  },
                ]}
                rowKey="id"
                pagination={{ pageSize: 10 }}
              />
            </Card>
          </>
        );
      
      default:
        return (
          <div style={{ textAlign: 'center', padding: '100px 0' }}>
            <Title level={3}>Select a menu item from the sidebar</Title>
          </div>
        );
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={250} style={{ background: '#fff' }}>
        <div style={{ padding: '16px', textAlign: 'center' }}>
          <Title level={4} style={{ margin: 0 }}>Psychology LMS</Title>
          <Text>Admin Panel</Text>
        </div>
        
        <Divider style={{ margin: '0 0 8px 0' }} />
        
        <Menu
          mode="inline"
          selectedKeys={[selectedMenu]}
          style={{ height: '100%' }}
          onClick={({ key }) => handleMenuClick(key)}
          items={[
            {
              key: 'dashboard',
              icon: <DashboardOutlined />,
              label: 'Dashboard'
            },
            {
              key: 'users',
              icon: <UserOutlined />,
              label: 'User Management'
            },
            {
              key: 'workshops',
              icon: <CalendarOutlined />,
              label: 'Workshops'
            },
            {
              key: 'courses',
              icon: <BookOutlined />,
              label: 'Courses'
            },
            {
              type: 'divider'
            },
            {
              key: 'logout',
              icon: <LogoutOutlined />,
              label: 'Logout',
              danger: true,
              onClick: signout
            }
          ]}
        />
      </Sider>
      
      <Layout>
        <Header style={{ 
          background: '#fff', 
          padding: '0 16px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'flex-end',
          boxShadow: '0 1px 4px rgba(0,21,41,.08)'
        }}>
          <Text>Welcome, {user.firstName} {user.lastName}</Text>
        </Header>
        
        <Content style={{ padding: '24px', overflow: 'auto' }}>
          {renderContent()}
        </Content>
      </Layout>
      
      {/* Create User Modal */}
      <Modal
        title="Create New User"
        open={isModalOpen}
        onCancel={handleModalCancel}
        footer={[
          <Button key="cancel" onClick={handleModalCancel}>
            Cancel
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            loading={isLoading}
            onClick={() => newUserForm.submit()}
          >
            Create User
          </Button>
        ]}
      >
        <Form
          form={newUserForm}
          layout="vertical"
          onFinish={handleModalSubmit}
        >
          <Form.Item
            name="firstName"
            label="First Name"
            rules={[{ required: true, message: 'Please enter the first name' }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="lastName"
            label="Last Name"
            rules={[{ required: true, message: 'Please enter the last name' }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please enter the email' },
              { type: 'email', message: 'Please enter a valid email' }
            ]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: 'Please enter a password' }]}
          >
            <Input.Password />
          </Form.Item>
          
          <Form.Item
            name="isAdmin"
            valuePropName="checked"
          >
            <Input type="checkbox" /> Admin privileges
          </Form.Item>
        </Form>
      </Modal>

      {/* Create Zoom Meeting Modal */}
      <Modal
        title="Create Zoom Meeting for Workshop"
        open={isZoomModalOpen}
        onCancel={handleZoomModalCancel}
        footer={[
          <Button key="cancel" onClick={handleZoomModalCancel}>
            Cancel
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            loading={isLoading}
            onClick={() => zoomForm.submit()}
          >
            Create Meeting
          </Button>
        ]}
      >
        <Form
          form={zoomForm}
          layout="vertical"
          onFinish={handleZoomModalSubmit}
        >
          <Form.Item
            name="workshopId"
            label="Select Workshop"
            rules={[{ required: true, message: 'Please select a workshop' }]}
          >
            <Select placeholder="Select a workshop">
              {WORKSHOPS.map(workshop => (
                <Select.Option key={workshop.id} value={workshop.id}>
                  {workshop.title}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="meetingDate"
            label="Meeting Date"
            rules={[{ required: true, message: 'Please select a date' }]}
          >
            <DatePicker style={{ width: '100%' }} showTime />
          </Form.Item>
          
          <Form.Item
            name="duration"
            label="Duration (minutes)"
            rules={[{ required: true, message: 'Please enter duration' }]}
          >
            <Input type="number" min={15} step={15} defaultValue={60} />
          </Form.Item>
          
          <Form.Item
            name="topic"
            label="Meeting Topic"
            rules={[{ required: true, message: 'Please enter a topic' }]}
          >
            <Input placeholder="Enter meeting topic" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="Description"
          >
            <Input.TextArea rows={4} placeholder="Enter meeting description" />
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
} 