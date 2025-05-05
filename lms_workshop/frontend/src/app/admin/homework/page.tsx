'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { 
  Layout, Button, Table, Typography, Space, Tag, message, Modal, Form, 
  Input, Select, DatePicker, Tabs, Collapse, List, Avatar, Tooltip, Badge, 
  Radio, Empty, Switch, Divider
} from 'antd';
import {
  PlusOutlined,
  UsergroupAddOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  SortAscendingOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import moment from 'moment';

// Define homework interface here since we no longer have the API import
interface HomeworkItem {
  id: number;
  title: string;
  description: string;
  category: string;
  dueDate: string;
  status: 'not_started' | 'in_progress' | 'completed';
  assignedToId: number;
  studentResponse?: string;
  grade?: number;
  instructorFeedback?: string;
}

const { Content, Sider } = Layout;
const { Title, Text } = Typography;
const { TextArea } = Input;
const { Panel } = Collapse;
const { TabPane } = Tabs;

// Direct API functions to replace the deleted API service
const homeworkAPI = {
  getAll: async (): Promise<HomeworkItem[]> => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/homework`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch homework: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to load homework data:', error);
      message.error('Failed to load homework data');
      return [];
    }
  },
  
  add: async (homework: Omit<HomeworkItem, 'id'>): Promise<HomeworkItem> => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/homework`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(homework),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add homework');
      }

      message.success('Homework added successfully');
      return await response.json();
    } catch (error) {
      console.error('Error adding homework:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to add homework';
      message.error(errorMessage);
      throw new Error(errorMessage);
    }
  },
  
  delete: async (id: number): Promise<void> => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/homework/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete homework');
      }

      message.success('Homework deleted successfully');
    } catch (error) {
      console.error('Error deleting homework:', error);
      message.error(error instanceof Error ? error.message : 'Failed to delete homework');
      throw error;
    }
  },
  
  update: async (id: number, homework: Partial<HomeworkItem>): Promise<HomeworkItem> => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/homework/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(homework),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update homework');
      }

      message.success('Homework updated successfully');
      return await response.json();
    } catch (error) {
      console.error('Error updating homework:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update homework';
      message.error(errorMessage);
      throw new Error(errorMessage);
    }
  }
};

interface Student {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

// Group homework by students
interface HomeworkByStudent {
  student: Student;
  assignments: HomeworkItem[];
  completedCount: number;
  pendingCount: number;
}

export default function HomeworkPage() {
  const { loading: authLoading } = useAuth();
  const [homeworkData, setHomeworkData] = useState<HomeworkItem[]>([]);
  const [homeworkByStudent, setHomeworkByStudent] = useState<HomeworkByStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [assignmentMode, setAssignmentMode] = useState<'single' | 'all'>('single');
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [sortBy, setSortBy] = useState<'name' | 'completionRate'>('name');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('all');
  const [isEditing, setIsEditing] = useState({ isEditing: false, id: 0 });

  useEffect(() => {
    const fetchHomework = async () => {
      try {
        setLoading(true);
        const data = await homeworkAPI.getAll();
        setHomeworkData(data);
      } catch (error) {
        console.error('Failed to fetch homework:', error);
        message.error('Failed to load homework data');
      } finally {
        setLoading(false);
      }
    };

    const fetchStudents = async () => {
      try {
        console.log('Fetching students from API...');
        const token = localStorage.getItem('access_token');
        if (!token) {
          throw new Error('Not authenticated');
        }

        // First, try the dedicated endpoint
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/students`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch students from endpoint');
        }

        const data = await response.json();
        console.log('Fetched students successfully:', data.length);
        setStudents(data);
      } catch (studentEndpointError) {
        console.error('Error fetching students from endpoint:', studentEndpointError);
        
        // Fallback: Try to get all users and filter for non-admins
        try {
          console.log('Trying fallback: fetching all users...');
          const token = localStorage.getItem('access_token');
          if (!token) {
            throw new Error('Not authenticated');
          }

          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            throw new Error('Failed to fetch users');
          }

          const allUsers = await response.json();
          // Filter for non-admin users
          const studentUsers = allUsers.filter(user => !user.isAdmin).map(user => ({
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email
          }));
          
          console.log('Filtered non-admin users:', studentUsers.length);
          setStudents(studentUsers);
        } catch (fallbackError) {
          console.error('Fallback error fetching users:', fallbackError);
          
          // Last resort: Get students from the database directly using SQL
          try {
            console.log('Trying direct DB query...');
            const token = localStorage.getItem('access_token');
            if (!token) {
              throw new Error('Not authenticated');
            }

            // Using the database endpoint to get users where isAdmin is false
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/db/execute`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
              body: JSON.stringify({
                query: 'SELECT id, "firstName", "lastName", email FROM "user" WHERE "isAdmin" = false'
              }),
            });

            if (!response.ok) {
              throw new Error('Failed to execute direct query');
            }

            const result = await response.json();
            if (result.rows && result.rows.length > 0) {
              console.log('Direct query successful:', result.rows.length);
              setStudents(result.rows);
            } else {
              throw new Error('No students found in direct query');
            }
          } catch (directQueryError) {
            console.error('Direct query error:', directQueryError);
            
            // If we really can't get the student data, add a few mock entries to demonstrate functionality
            message.error('Failed to load students. Using sample data for demonstration.');
            const sampleStudents = [
              { id: 101, firstName: 'John', lastName: 'Smith', email: 'john@example.com' },
              { id: 102, firstName: 'Jane', lastName: 'Doe', email: 'jane@example.com' },
              { id: 103, firstName: 'Pratik', lastName: 'K', email: 'pratik@example.com' }
            ];
            setStudents(sampleStudents);
          }
        }
      }
    };

    if (!authLoading) {
      fetchHomework();
      fetchStudents();
    }
  }, [authLoading]);

  // Process homework data by student when either students or homework changes
  useEffect(() => {
    if (students.length > 0 && homeworkData.length > 0) {
      const homeworkByStudentMap = students.map(student => {
        const studentAssignments = homeworkData.filter(hw => hw.assignedToId === student.id);
        const completedCount = studentAssignments.filter(hw => hw.status === 'completed').length;
        
        return {
          student,
          assignments: studentAssignments,
          completedCount,
          pendingCount: studentAssignments.length - completedCount
        };
      });

      // Sort by selected sort criteria
      const sortedData = [...homeworkByStudentMap].sort((a, b) => {
        if (sortBy === 'name') {
          return a.student.firstName.localeCompare(b.student.firstName);
        } else {
          // Sort by completion rate
          const aRate = a.assignments.length ? a.completedCount / a.assignments.length : 0;
          const bRate = b.assignments.length ? b.completedCount / b.assignments.length : 0;
          return bRate - aRate; // Higher rate first
        }
      });

      setHomeworkByStudent(sortedData);
    }
  }, [students, homeworkData, sortBy]);

  // Columns for homework table
  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Course',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'Due Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Assigned To',
      key: 'assignedTo',
      render: (_: unknown, record: HomeworkItem) => {
        const student = students.find(s => s.id === record.assignedToId);
        return student ? `${student.firstName} ${student.lastName}` : 'Unknown';
      }
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = 'default';
        if (status === 'not_started') color = 'blue';
        if (status === 'in_progress') color = 'orange';
        if (status === 'completed') color = 'green';
        
        return <Tag color={color}>{status.replace('_', ' ').toUpperCase()}</Tag>;
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: HomeworkItem) => (
        <Space size="small">
          <Button 
            type="primary" 
            size="small"
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Button 
            size="small"
            danger
            onClick={() => handleDelete(record.id)}
          >
            Delete
          </Button>
        </Space>
      )
    }
  ];

  const handleEdit = (homework: HomeworkItem) => {
    // Find the homework item to edit
    if (!homework) {
      message.error('Homework not found');
      return;
    }
    
    // Set up the form with current values
    form.setFieldsValue({
      title: homework.title,
      description: homework.description,
      category: homework.category,
      dueDate: homework.dueDate ? moment(homework.dueDate) : null,
      assignedToId: homework.assignedToId?.toString(),
    });
    
    // Show the modal for editing
    setModalVisible(true);
    
    // Set a flag in state to indicate we're editing rather than creating new
    setIsEditing({ isEditing: true, id: homework.id });
  };

  const handleDelete = async (id: number) => {
    try {
      await homeworkAPI.delete(id);
      setHomeworkData(prev => prev.filter(item => item.id !== id));
      message.success('Assignment deleted successfully');
    } catch (error) {
      console.error('Failed to delete homework:', error);
    }
  };

  const showModal = () => {
    form.resetFields();
    setModalVisible(true);
    setAssignmentMode('single');
    setSelectedStudents([]);
  };

  const hideModal = () => {
    setModalVisible(false);
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const values = await form.validateFields();
      
      // Format the due date correctly
      const formattedValues = {
        ...values,
        dueDate: values.dueDate.format('YYYY-MM-DDTHH:mm:ss'),
        status: 'not_started'
      };

      if (isEditing.isEditing) {
        // Update existing homework using our API method
        const result = await homeworkAPI.update(isEditing.id, formattedValues);
        
        // Update the homework in state
        setHomeworkData(prev => prev.map(item => 
          item.id === isEditing.id ? result : item
        ));
      } else {
        // Create new homework
        if (assignmentMode === 'single') {
          // Handle single student assignment
          const assignedToId = parseInt(values.assignedToId, 10);
          if (isNaN(assignedToId) || assignedToId <= 0) {
            throw new Error('Invalid student ID. Please select a valid student.');
          }
          
          const singleAssignmentValues = {
            ...formattedValues,
            assignedToId: assignedToId,
          };

          const result = await homeworkAPI.add(singleAssignmentValues);
          setHomeworkData(prev => [...prev, result]);
          message.success('Assignment added successfully');
        } else {
          // Handle assignment to all or multiple students
          const targetStudents = selectedStudents.length > 0 
            ? selectedStudents 
            : students.map(s => s.id);
          
          // Validate student IDs
          if (!targetStudents.length) {
            throw new Error('No valid students selected for assignment');
          }
          
          // Create multiple homework assignments in parallel
          const promises = targetStudents.map(studentId => {
            if (isNaN(studentId) || studentId <= 0) {
              console.warn(`Skipping invalid student ID: ${studentId}`);
              return null;
            }
            
            const studentAssignmentValues = {
              ...formattedValues,
              assignedToId: studentId,
            };
            
            return homeworkAPI.add(studentAssignmentValues);
          }).filter(Boolean); // Filter out null promises
          
          if (promises.length === 0) {
            throw new Error('No valid student IDs found');
          }
          
          const results = await Promise.all(promises);
          setHomeworkData(prev => [...prev, ...results]);
          message.success(`Assignment added for ${promises.length} students`);
        }
      }
      
      // Reset form and state
      hideModal();
      setIsEditing({ isEditing: false, id: 0 });
    } catch (error) {
      console.error('Failed to process assignment:', error);
      message.error(error instanceof Error ? error.message : 'Failed to process assignment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  const getStatusColor = (status: string) => {
    if (status === 'completed') return 'green';
    if (status === 'in_progress') return 'orange';
    return 'blue';
  };

  const getStatusIcon = (status: string) => {
    if (status === 'completed') return <CheckCircleOutlined />;
    if (status === 'in_progress') return <ClockCircleOutlined style={{ color: 'orange' }} />;
    return <ClockCircleOutlined style={{ color: 'blue' }} />;
  };

  const getFilteredHomeworkByStudent = () => {
    if (filterStatus === 'all') return homeworkByStudent;
    
    return homeworkByStudent.map(item => ({
      ...item,
      assignments: item.assignments.filter(a => 
        filterStatus === 'completed' 
          ? a.status === 'completed' 
          : a.status !== 'completed'
      )
    })).filter(item => item.assignments.length > 0);
  };

  if (authLoading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Loading...</div>;
  }

  return (
    <Content style={{ padding: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <Title level={3} style={{ margin: 0 }}>Homework Management</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={showModal}
        >
          Add Assignment
        </Button>
      </div>
      
      <Tabs activeKey={activeTab} onChange={handleTabChange}>
        <TabPane tab="All Assignments" key="all">
          <Table 
            columns={columns} 
            dataSource={homeworkData} 
            rowKey="id"
            pagination={false}
            loading={loading}
            style={{ border: '1px solid #f0f0f0', borderRadius: '8px' }}
            locale={{ emptyText: 'No assignment data available' }}
          />
        </TabPane>
        <TabPane tab="By Student" key="byStudent">
          <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between' }}>
            <Space>
              <Text strong>Sort by:</Text>
              <Radio.Group value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <Radio.Button value="name">Name</Radio.Button>
                <Radio.Button value="completionRate">Completion Rate</Radio.Button>
              </Radio.Group>
            </Space>
            
            <Space>
              <Text strong>Filter:</Text>
              <Radio.Group value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                <Radio.Button value="all">All</Radio.Button>
                <Radio.Button value="pending">Pending</Radio.Button>
                <Radio.Button value="completed">Completed</Radio.Button>
              </Radio.Group>
            </Space>
          </div>
          
          <Collapse>
            {getFilteredHomeworkByStudent().map(({ student, assignments, completedCount, pendingCount }) => (
              <Panel 
                key={student.id} 
                header={
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                    <Space>
                      <Avatar style={{ backgroundColor: '#1890ff' }}>
                        {student.firstName.charAt(0)}
                      </Avatar>
                      <span>{student.firstName} {student.lastName}</span>
                      <Text type="secondary" style={{ fontSize: '0.85rem' }}>({student.email})</Text>
                    </Space>
                    <Space>
                      <Badge count={assignments.length} overflowCount={99} color="#1890ff" />
                      <Tooltip title="Completed">
                        <Badge count={completedCount} overflowCount={99} color="green" style={{ marginLeft: 8 }} />
                      </Tooltip>
                      <Tooltip title="Pending">
                        <Badge count={pendingCount} overflowCount={99} color="orange" style={{ marginLeft: 8 }} />
                      </Tooltip>
                    </Space>
                  </div>
                }
              >
                <List
                  itemLayout="horizontal"
                  dataSource={assignments}
                  renderItem={item => (
                    <List.Item
                      key={item.id}
                      actions={[
                        <Button 
                          key="edit" 
                          type="link" 
                          onClick={() => handleEdit(item)}
                        >
                          Edit
                        </Button>,
                        <Button 
                          key="delete" 
                          type="link" 
                          danger 
                          onClick={() => handleDelete(item.id)}
                        >
                          Delete
                        </Button>
                      ]}
                    >
                      <List.Item.Meta
                        avatar={
                          <Avatar 
                            icon={<FileTextOutlined />} 
                            style={{ backgroundColor: getStatusColor(item.status) }}
                          />
                        }
                        title={
                          <Space>
                            {item.title}
                            <Tag color={getStatusColor(item.status)}>
                              {getStatusIcon(item.status)}
                              <span style={{ marginLeft: 4 }}>
                                {item.status === 'not_started' ? 'NOT STARTED' : 
                                  item.status === 'in_progress' ? 'IN PROGRESS' : 'COMPLETED'}
                              </span>
                            </Tag>
                          </Space>
                        }
                        description={
                          <div>
                            <div>{item.category}</div>
                            <div>Due: {new Date(item.dueDate).toLocaleDateString()}</div>
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              </Panel>
            ))}
          </Collapse>
          
          {getFilteredHomeworkByStudent().length === 0 && (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <Empty description="No assignments match the filter criteria" />
            </div>
          )}
        </TabPane>
      </Tabs>

      <Modal
        title={isEditing.isEditing ? "Edit Assignment" : "Create New Assignment"}
        open={modalVisible}
        onCancel={hideModal}
        footer={[
          <Button key="back" onClick={hideModal}>
            Cancel
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            loading={submitting} 
            onClick={handleSubmit}
          >
            {isEditing.isEditing ? "Update Assignment" : "Create Assignment"}
          </Button>,
        ]}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          style={{ marginTop: '20px' }}
        >
          <Form.Item
            name="title"
            label="Assignment Title"
            rules={[{ required: true, message: 'Please enter the assignment title' }]}
          >
            <Input placeholder="Enter title" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter the description' }]}
          >
            <TextArea rows={5} placeholder="Enter description" />
          </Form.Item>

          <Form.Item
            name="category"
            label="Category"
            rules={[{ required: true, message: 'Please select a category' }]}
          >
            <Select placeholder="Select a category">
              <Select.Option value="Cognitive Behavioral Therapy">Cognitive Behavioral Therapy</Select.Option>
              <Select.Option value="Mental Health Fundamentals">Mental Health Fundamentals</Select.Option>
              <Select.Option value="Clinical Psychology">Clinical Psychology</Select.Option>
              <Select.Option value="Mindfulness">Mindfulness</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="dueDate"
            label="Due Date"
            rules={[{ required: true, message: 'Please select a due date' }]}
          >
            <DatePicker 
              showTime 
              format="YYYY-MM-DD HH:mm:ss" 
              style={{ width: '100%' }} 
            />
          </Form.Item>

          <Divider>Assignment Options</Divider>

          <Form.Item
            name="assignToAll"
            valuePropName="checked"
          >
            <div style={{ display: 'flex', marginBottom: '20px', padding: '16px', border: '1px dashed #d9d9d9', borderRadius: '8px', backgroundColor: '#f8f8f8' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <Space>
                  <UsergroupAddOutlined style={{ fontSize: '24px', color: '#1890ff', marginRight: '8px' }} />
                  <span style={{ fontSize: '16px', fontWeight: 'bold' }}>Assign to ALL students</span>
                </Space>
                <div style={{ marginLeft: '32px', marginTop: '8px', color: '#666' }}>
                  This will create the same assignment for all students in the system.
                </div>
              </div>
              <div style={{ marginLeft: 'auto' }}>
                <Switch 
                  checked={assignmentMode === 'all'} 
                  onChange={(checked) => setAssignmentMode(checked ? 'all' : 'single')}
                />
              </div>
            </div>
          </Form.Item>

          {assignmentMode === 'single' ? (
            <Form.Item
              name="assignedToId"
              label="Assign To"
              rules={[{ required: true, message: 'Please select a student' }]}
            >
              <Select placeholder="Select a student" showSearch optionFilterProp="children">
                {students.map(student => (
                  <Select.Option key={student.id} value={student.id.toString()}>
                    {student.firstName} {student.lastName} ({student.email})
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          ) : (
            <Form.Item
              label="Select Students (Optional)"
              help="Leave empty to assign to ALL students"
            >
              <Select
                mode="multiple"
                allowClear
                style={{ width: '100%' }}
                placeholder="Select specific students (leave empty to assign to all)"
                onChange={values => setSelectedStudents(values.map(v => parseInt(v.toString(), 10)))}
                optionFilterProp="children"
              >
                {students.map(student => (
                  <Select.Option key={student.id} value={student.id.toString()}>
                    {student.firstName} {student.lastName} ({student.email})
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          )}
        </Form>
      </Modal>
    </Content>
  );
} 