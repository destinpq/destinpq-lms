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
import { User } from '@/api/userService';
import { Course } from '@/api/courseService';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

// Define interfaces for type safety
interface Workshop {
  id: number;
  title: string;
  instructor: string;
  date: string;
  participants: number;
}

// Workshop and course data will be replaced later
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
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [courseForm] = Form.useForm();
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  
  // State for real data
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Make sure user is authenticated and is an admin
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (!loading && user && !user.isAdmin) {
      message.error('You do not have admin privileges');
      router.push('/student/dashboard');
    }
  }, [user, loading, router]);

  // Fetch users from the API
  useEffect(() => {
    console.log('Dashboard useEffect triggered');
    console.log('User state:', user?.isAdmin ? 'Admin' : 'Not admin or not logged in');
    console.log('Loading state:', loading ? 'Loading' : 'Not loading');
    
    if (!loading && user?.isAdmin) {
      console.log('User is admin, fetching data...');
      fetchUsers();
      fetchCourses();
    }
  }, [user, loading]);

  const fetchUsers = async () => {
    try {
      console.log('ATTEMPTING TO FETCH USERS NOW!');
      setLoadingUsers(true);
      setError(null);
      
      // Force refresh - make API call regardless of cache
      const token = localStorage.getItem('access_token');
      console.log('Using token to fetch users:', token ? 'Token exists' : 'No token');
      console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store'
      });

      console.log('Users API response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Users API error:', errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText || 'Failed to fetch users' };
        }
        throw new Error(errorData.message || `Failed to fetch users with status: ${response.status}`);
      }

      const users = await response.json();
      console.log('Users fetched successfully:', users);
      setUsers(users);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch users';
      console.error('Error fetching users:', errorMessage);
      setError(errorMessage);
      message.error('Failed to load users. Please try again.');
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchCourses = async () => {
    try {
      console.log('ATTEMPTING TO FETCH COURSES NOW!');
      setLoadingCourses(true);
      setError(null);
      
      // Force direct API call
      const token = localStorage.getItem('access_token');
      console.log('Using token to fetch courses:', token ? 'Token exists' : 'No token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store'
      });

      console.log('Courses API response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Courses API error:', errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText || 'Failed to fetch courses' };
        }
        throw new Error(errorData.message || `Failed to fetch courses with status: ${response.status}`);
      }

      const courses = await response.json();
      console.log('Courses fetched successfully:', courses);
      setCourses(courses);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch courses';
      console.error('Error fetching courses:', errorMessage);
      setError(errorMessage);
      message.error('Failed to load courses. Please try again.');
    } finally {
      setLoadingCourses(false);
    }
  };

  if (loading || loadingUsers || loadingCourses) {
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

  const handleModalSubmit = async () => {
    try {
      const values = await newUserForm.validateFields();
      setIsLoading(true);
      console.log('Creating user with values:', values);
      
      // Make direct API call
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const userData = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
        isAdmin: values.isAdmin || false
      };

      console.log('Sending user data:', userData);
      console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      console.log('Create user response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Create user error:', errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText || 'Failed to create user' };
        }
        throw new Error(errorData.message || `Failed to create user with status: ${response.status}`);
      }
      
      message.success('User created successfully!');
      fetchUsers(); // Reload users
      setIsModalOpen(false);
      newUserForm.resetFields();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create user';
      console.error('Error creating user:', errorMessage);
      message.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    try {
      console.log('Deleting user with ID:', userId);
      setIsLoading(true);
      
      // Make direct API call
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Delete user response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Delete user error:', errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText || 'Failed to delete user' };
        }
        throw new Error(errorData.message || `Failed to delete user with status: ${response.status}`);
      }

      message.success('User deleted successfully!');
      fetchUsers(); // Reload users
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete user';
      console.error('Error deleting user:', errorMessage);
      message.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
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

  const handleCreateCourse = () => {
    setEditingCourse(null);
    courseForm.resetFields();
    setIsCourseModalOpen(true);
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    courseForm.setFieldsValue(course);
    setIsCourseModalOpen(true);
  };

  const handleDeleteCourse = (course: Course) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this course?',
      content: `${course.title} will be permanently removed.`,
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          console.log('Deleting course with ID:', course.id);
          setIsLoading(true);
          
          // Make direct API call
          const token = localStorage.getItem('access_token');
          if (!token) {
            throw new Error('No authentication token found');
          }

          console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);
          
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/${course.id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          console.log('Delete course response status:', response.status);
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error('Delete course error:', errorText);
            let errorData;
            try {
              errorData = JSON.parse(errorText);
            } catch {
              errorData = { message: errorText || 'Failed to delete course' };
            }
            throw new Error(errorData.message || `Failed to delete course with status: ${response.status}`);
          }

          message.success(`${course.title} has been deleted`);
          fetchCourses(); // Reload courses
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to delete course';
          console.error('Error deleting course:', errorMessage);
          message.error(errorMessage);
        } finally {
          setIsLoading(false);
        }
      },
    });
  };

  const handleCourseModalCancel = () => {
    setIsCourseModalOpen(false);
    courseForm.resetFields();
  };

  const handleCourseModalSubmit = async () => {
    try {
      const values = await courseForm.validateFields();
      setIsLoading(true);
      console.log('Creating/updating course with values:', values);
      
      // Make direct API call
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);

      if (editingCourse) {
        console.log('Updating course with ID:', editingCourse.id);
        const courseData = {
          title: values.title,
          instructor: values.instructor,
          description: values.description,
          maxStudents: values.students
        };

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/${editingCourse.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(courseData),
        });

        console.log('Update course response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Update course error:', errorText);
          let errorData;
          try {
            errorData = JSON.parse(errorText);
          } catch {
            errorData = { message: errorText || 'Failed to update course' };
          }
          throw new Error(errorData.message || `Failed to update course with status: ${response.status}`);
        }

        message.success('Course updated successfully!');
      } else {
        console.log('Creating new course');
        const courseData = {
          title: values.title,
          instructor: values.instructor,
          description: values.description || '',
          students: 0,
          maxStudents: values.students
        };

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(courseData),
        });

        console.log('Create course response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Create course error:', errorText);
          let errorData;
          try {
            errorData = JSON.parse(errorText);
          } catch {
            errorData = { message: errorText || 'Failed to create course' };
          }
          throw new Error(errorData.message || `Failed to create course with status: ${response.status}`);
        }

        message.success('Course created successfully!');
      }
      
      fetchCourses(); // Reload courses
      setIsCourseModalOpen(false);
      courseForm.resetFields();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save course';
      console.error('Error saving course:', errorMessage);
      message.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const userColumns = [
    {
      title: 'Name',
      key: 'name',
      render: (record: User) => `${record.firstName} ${record.lastName}`,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Role',
      key: 'role',
      render: (record: User) => (
        record.isAdmin ? <Text strong>Admin</Text> : 'Student'
      ),
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: User) => (
        <Space>
          <Button 
            icon={<EditOutlined />} 
            size="small"
            onClick={() => {
              message.info('Edit functionality coming soon');
            }}
          >
            Edit
          </Button>
          <Button 
            icon={<DeleteOutlined />} 
            size="small" 
            danger
            onClick={() => {
              Modal.confirm({
                title: 'Delete User',
                content: `Are you sure you want to delete ${record.firstName} ${record.lastName}?`,
                okText: 'Yes',
                okType: 'danger',
                cancelText: 'No',
                onOk() {
                  handleDeleteUser(record.id);
                }
              });
            }}
          >
            Delete
          </Button>
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

  const courseColumns = [
    { title: 'Course', dataIndex: 'title', key: 'title' },
    { title: 'Instructor', dataIndex: 'instructor', key: 'instructor' },
    { title: 'Students', dataIndex: 'students', key: 'students' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: Course) => (
        <Space>
          <Button 
            icon={<EditOutlined />} 
            size="small" 
            onClick={() => handleEditCourse(record)}
          >
            Edit
          </Button>
          <Button 
            icon={<DeleteOutlined />} 
            size="small" 
            danger 
            onClick={() => handleDeleteCourse(record)}
          >
            Delete
          </Button>
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
                  <Statistic title="Total Users" value={users.length} />
                </Card>
              </Col>
              <Col span={8}>
                <Card>
                  <Statistic title="Workshops" value={WORKSHOPS.length} />
                </Card>
              </Col>
              <Col span={8}>
                <Card>
                  <Statistic title="Active Students" value={users.filter(u => !u.isAdmin).length} />
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
              {error && (
                <div style={{ marginBottom: '16px', color: 'red' }}>
                  Error loading users: {error}
                </div>
              )}
              <Table 
                dataSource={users} 
                columns={userColumns} 
                rowKey="id" 
                pagination={{ pageSize: 10 }}
                loading={loadingUsers}
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
                onClick={handleCreateCourse}
              >
                Add Course
              </Button>
            </div>
            
            <Card>
              {error && (
                <div style={{ marginBottom: '16px', color: 'red' }}>
                  Error loading courses: {error}
                </div>
              )}
              <Table 
                dataSource={courses} 
                columns={courseColumns}
                rowKey="id"
                pagination={{ pageSize: 10 }}
                loading={loadingCourses}
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
          <Text>Welcome, {user.firstName} User</Text>
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

      {/* Course Modal */}
      <Modal
        title={editingCourse ? "Edit Course" : "Create New Course"}
        open={isCourseModalOpen}
        onCancel={handleCourseModalCancel}
        footer={[
          <Button key="cancel" onClick={handleCourseModalCancel}>
            Cancel
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            loading={isLoading}
            onClick={() => courseForm.submit()}
          >
            {editingCourse ? "Update Course" : "Create Course"}
          </Button>
        ]}
      >
        <Form
          form={courseForm}
          layout="vertical"
          onFinish={handleCourseModalSubmit}
        >
          <Form.Item
            name="title"
            label="Course Title"
            rules={[{ required: true, message: 'Please enter the course title' }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="instructor"
            label="Instructor"
            rules={[{ required: true, message: 'Please enter the instructor name' }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="Description"
          >
            <Input.TextArea rows={4} />
          </Form.Item>
          
          <Form.Item
            name="students"
            label="Maximum Students"
            rules={[{ required: true, message: 'Please enter maximum students' }]}
          >
            <Input type="number" min={1} />
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
} 