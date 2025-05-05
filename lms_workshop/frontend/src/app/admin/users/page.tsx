'use client';

import { useAuth } from '@/app/context/AuthContext';
import { Layout, Button, Table, Tag, Space, Typography, Avatar, Dropdown, Input, Select, Tabs, message, Modal, Form } from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  SearchOutlined,
  EllipsisOutlined,
  MailOutlined,
  LockOutlined,
  UserOutlined
} from '@ant-design/icons';
import { useState, useEffect } from 'react';

const { Content } = Layout;
const { Title } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

// Interface definition - for use with API data
interface UserData {
  key: string;
  name: string;
  email: string;
  role: string;
  status: string;
  lastActive: string;
  enrolledCourses: number;
  completedCourses: number;
  // Adding original data for edit
  firstName?: string;
  lastName?: string;
  isAdmin?: boolean;
}

// Raw User interface matching database schema
interface RawUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
}

// Interface definition for student data from API
interface Student {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

export default function AdminUsers() {
  const { loading } = useAuth();
  const [searchText, setSearchText] = useState('');
  const [userData, setUserData] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [addUserModalVisible, setAddUserModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [addUserForm] = Form.useForm();
  const [activeTab, setActiveTab] = useState('all');

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      
      // Fetch all users from the database
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('Authentication token is missing');
      }
      
      // Direct fetch from DB (this gets all users)
      const response = await fetch(`${process.env.API_URL}/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.status}`);
      }
      
      const rawUsers: RawUser[] = await response.json();
      
      // Transform raw user data to the format expected by the table
      const formattedUsers: UserData[] = rawUsers.map(user => ({
        key: user.id.toString(),
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        role: user.isAdmin ? 'ADMIN' : 'STUDENT',
        status: 'ACTIVE', // Default status
        lastActive: user.updatedAt ? new Date(user.updatedAt).toLocaleString() : 'Never',
        enrolledCourses: 0, // Placeholder
        completedCourses: 0, // Placeholder
        // Store original data for editing
        firstName: user.firstName,
        lastName: user.lastName,
        isAdmin: user.isAdmin,
      }));
      
      setUserData(formattedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      message.error('Failed to load users');
      
      // If we failed to load users, we can try our fallback - loading just students
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          throw new Error('Authentication token is missing');
        }
        
        const response = await fetch(`${process.env.API_URL}/users/students`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch students: ${response.status}`);
        }
        
        const students = await response.json();
        
        // Transform student data
        const formattedStudents: UserData[] = students.map((student: Student) => ({
          key: student.id.toString(),
          name: `${student.firstName} ${student.lastName}`,
          email: student.email,
          role: 'STUDENT',
          status: 'ACTIVE',
          lastActive: 'Unknown', 
          enrolledCourses: 0,
          completedCourses: 0,
          firstName: student.firstName,
          lastName: student.lastName,
          isAdmin: false,
        }));
        
        setUserData(formattedStudents);
        message.info('Loaded student data only');
      } catch (fallbackError) {
        console.error('Fallback loading failed:', fallbackError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!loading) {
      fetchUsers();
    }
  }, [loading]);

  // Handle editing user
  const handleEdit = (user: UserData) => {
    setEditingUser(user);
    form.setFieldsValue({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.isAdmin ? 'ADMIN' : 'STUDENT'
    });
    setEditModalVisible(true);
  };

  // Submit edit form
  const handleEditSubmit = async () => {
    try {
      const values = await form.validateFields();
      const userId = editingUser?.key;
      
      if (!userId) {
        throw new Error('User ID is missing');
      }
      
      // Validate that userId is a valid number
      const numericUserId = parseInt(userId, 10);
      if (isNaN(numericUserId)) {
        throw new Error('Invalid user ID');
      }
      
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('Authentication token is missing');
      }
      
      // Create update payload
      const updateData = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        isAdmin: values.role === 'ADMIN'
      };
      
      // Send update request to API
      const response = await fetch(`${process.env.API_URL}/users/${numericUserId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update user: ${response.status}`);
      }
      
      // Get updated user from response
      const updatedUser = await response.json();
      
      // Update local state
      setUserData(prevUsers => 
        prevUsers.map(user => 
          user.key === userId 
            ? {
                ...user,
                name: `${updatedUser.firstName} ${updatedUser.lastName}`,
                email: updatedUser.email,
                role: updatedUser.isAdmin ? 'ADMIN' : 'STUDENT',
                firstName: updatedUser.firstName,
                lastName: updatedUser.lastName,
                isAdmin: updatedUser.isAdmin,
              } 
            : user
        )
      );
      
      message.success('User updated successfully');
      setEditModalVisible(false);
      setEditingUser(null);
    } catch (error) {
      console.error('Failed to update user:', error);
      message.error('Failed to update user');
    }
  };

  // Add new user
  const showAddUserModal = () => {
    addUserForm.resetFields();
    setAddUserModalVisible(true);
  };

  // Submit new user form
  const handleAddUserSubmit = async () => {
    try {
      const values = await addUserForm.validateFields();
      
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('Authentication token is missing');
      }
      
      // Create new user payload
      const newUserData = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
        isAdmin: values.role === 'ADMIN'
      };
      
      // Send create request to API
      const response = await fetch(`${process.env.API_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newUserData)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create user: ${response.status}`);
      }
      
      // Refresh the user list
      await fetchUsers();
      
      message.success('User created successfully');
      setAddUserModalVisible(false);
    } catch (error) {
      console.error('Failed to create user:', error);
      message.error('Failed to create user');
    }
  };

  // Handle deleting user
  const handleDelete = async (userId: string) => {
    try {
      // Validate userId is a valid number
      const numericUserId = parseInt(userId, 10);
      if (isNaN(numericUserId)) {
        throw new Error('Invalid user ID');
      }
      
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('Authentication token is missing');
      }
      
      // Confirm deletion with user
      Modal.confirm({
        title: 'Delete User',
        content: 'Are you sure you want to delete this user? This action cannot be undone.',
        okText: 'Delete',
        okType: 'danger',
        cancelText: 'Cancel',
        onOk: async () => {
          // Send delete request to API
          const response = await fetch(`${process.env.API_URL}/users/${numericUserId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (!response.ok) {
            throw new Error(`Failed to delete user: ${response.status}`);
          }
          
          // Update local state
          setUserData(prevUsers => prevUsers.filter(user => user.key !== userId));
          message.success('User deleted successfully');
        }
      });
    } catch (error) {
      console.error('Failed to delete user:', error);
      message.error('Failed to delete user');
    }
  };

  // Filter users based on search text and active tab
  const filteredUsers = userData.filter(user => {
    // First apply text search filter
    const matchesSearch = user.name.toLowerCase().includes(searchText.toLowerCase()) || 
                          user.email.toLowerCase().includes(searchText.toLowerCase());
    
    // Then apply tab filter
    let matchesTab = true;
    if (activeTab === 'students') {
      matchesTab = user.role === 'STUDENT';
    } else if (activeTab === 'instructors') {
      matchesTab = user.role === 'INSTRUCTOR';
    } else if (activeTab === 'admins') {
      matchesTab = user.role === 'ADMIN';
    }
    
    return matchesSearch && matchesTab;
  });

  // Table columns definition - data will come from API
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: UserData) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Avatar
            style={{ 
              backgroundColor: 
                record.role === 'ADMIN' ? '#ff4d4f' : 
                record.role === 'INSTRUCTOR' ? '#52c41a' : 
                '#1890ff',
              marginRight: '12px'
            }}
          >
            {text.charAt(0)}
          </Avatar>
          <div>
            <div>{text}</div>
            <div style={{ fontSize: '12px', color: '#8c8c8c' }}>{record.email}</div>
          </div>
        </div>
      )
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => {
        let color = '';
        if (role === 'ADMIN') color = 'red';
        if (role === 'INSTRUCTOR') color = 'green';
        if (role === 'STUDENT') color = 'blue';
        
        return <Tag color={color}>{role}</Tag>;
      }
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = '';
        if (status === 'ACTIVE') color = 'green';
        if (status === 'INACTIVE') color = 'default';
        if (status === 'PENDING') color = 'orange';
        
        return <Tag color={color}>{status}</Tag>;
      }
    },
    {
      title: 'Last Active',
      dataIndex: 'lastActive',
      key: 'lastActive',
    },
    {
      title: 'Courses',
      key: 'courses',
      render: (_: unknown, record: UserData) => (
        <Space>
          <Tag color="blue">{record.enrolledCourses} Enrolled</Tag>
          <Tag color="green">{record.completedCourses} Completed</Tag>
        </Space>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: UserData) => (
        <Space size="small">
          <Button 
            type="text" 
            icon={<EditOutlined />}
            title="Edit User"
            onClick={() => handleEdit(record)}
          />
          <Dropdown 
            menu={{ 
              items: [
                {
                  key: '1',
                  icon: <UserOutlined />,
                  label: 'View Profile'
                },
                {
                  key: '2',
                  icon: <LockOutlined />,
                  label: 'Reset Password'
                },
                {
                  key: '3',
                  icon: <MailOutlined />,
                  label: 'Send Email'
                },
                {
                  key: '4',
                  icon: <DeleteOutlined />,
                  label: 'Delete User',
                  danger: true
                }
              ],
              onClick: ({ key }) => {
                if (key === '4') {
                  handleDelete(record.key);
                }
              }
            }} 
            trigger={['click']}
          >
            <Button 
              type="text" 
              icon={<EllipsisOutlined />} 
              title="More Actions"
            />
          </Dropdown>
        </Space>
      )
    },
  ];

  if (loading || isLoading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Loading...</div>;
  }

  return (
    <Content style={{ padding: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <Title level={3} style={{ margin: 0 }}>User Management</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={showAddUserModal}>
          Add New User
        </Button>
      </div>
      
      <Tabs defaultActiveKey="all" className="mb-4" onChange={setActiveTab} activeKey={activeTab}>
        <TabPane tab="All Users" key="all" />
        <TabPane tab="Students" key="students" />
        <TabPane tab="Instructors" key="instructors" />
        <TabPane tab="Admins" key="admins" />
      </Tabs>
      
      <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
        <Input 
          placeholder="Search users..." 
          prefix={<SearchOutlined />} 
          style={{ width: 250 }}
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
        />
        <Select
          placeholder="Filter by role"
          style={{ width: 150 }}
          allowClear
        >
          <Option value="STUDENT">Students</Option>
          <Option value="INSTRUCTOR">Instructors</Option>
          <Option value="ADMIN">Admins</Option>
        </Select>
        <Select
          placeholder="Filter by status"
          style={{ width: 150 }}
          allowClear
        >
          <Option value="ACTIVE">Active</Option>
          <Option value="INACTIVE">Inactive</Option>
          <Option value="PENDING">Pending</Option>
        </Select>
      </div>
      
      <Table 
        columns={columns} 
        dataSource={filteredUsers}
        pagination={false}
        style={{ border: '1px solid #f0f0f0', borderRadius: '8px' }}
        locale={{ emptyText: 'No user data available' }}
      />

      {/* Edit User Modal */}
      <Modal
        title="Edit User"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={
          <>
            <Button key="cancel" onClick={() => setEditModalVisible(false)}>
              Cancel
            </Button>
            <Button key="submit" type="primary" onClick={handleEditSubmit}>
              Save Changes
            </Button>
          </>
        }
      >
        {editingUser && (
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              firstName: editingUser.firstName,
              lastName: editingUser.lastName,
              email: editingUser.email,
              role: editingUser.isAdmin ? 'ADMIN' : 'STUDENT'
            }}
          >
            <Form.Item
              name="firstName"
              label="First Name"
              rules={[{ required: true, message: 'Please enter first name' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="lastName"
              label="Last Name"
              rules={[{ required: true, message: 'Please enter last name' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Please enter email' },
                { type: 'email', message: 'Please enter a valid email' }
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="role"
              label="Role"
              rules={[{ required: true, message: 'Please select a role' }]}
            >
              <Select>
                <Option value="ADMIN">Admin</Option>
                <Option value="STUDENT">Student</Option>
              </Select>
            </Form.Item>
          </Form>
        )}
      </Modal>

      {/* Add User Modal */}
      <Modal
        title="Add New User"
        open={addUserModalVisible}
        onCancel={() => setAddUserModalVisible(false)}
        footer={
          <>
            <Button key="cancel" onClick={() => setAddUserModalVisible(false)}>
              Cancel
            </Button>
            <Button key="submit" type="primary" onClick={handleAddUserSubmit}>
              Create User
            </Button>
          </>
        }
      >
        <Form
          form={addUserForm}
          layout="vertical"
        >
          <Form.Item
            name="firstName"
            label="First Name"
            rules={[{ required: true, message: 'Please enter first name' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="lastName"
            label="Last Name"
            rules={[{ required: true, message: 'Please enter last name' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please enter email' },
              { type: 'email', message: 'Please enter a valid email' }
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: 'Please enter password' }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: 'Please select a role' }]}
            initialValue="STUDENT"
          >
            <Select>
              <Option value="ADMIN">Admin</Option>
              <Option value="STUDENT">Student</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </Content>
  );
} 