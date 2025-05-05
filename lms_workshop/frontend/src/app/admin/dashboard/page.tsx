'use client';

import { useAuth } from '@/app/context/AuthContext';
import { Modal, Form, Input, Select, DatePicker, TimePicker, InputNumber, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useState, Suspense, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './dashboard.module.css';
import AdminDashboard from '@/app/components/AdminDashboard/AdminDashboard';

const { Option } = Select;
const { TextArea } = Input;

function DashboardContent() {
  const { loading, user } = useAuth();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [submitLoading, setSubmitLoading] = useState(false);

  // Verify the user is authenticated and is an admin
  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Redirect to login if not authenticated
        router.push('/lms/login');
      } else if (!user.isAdmin) {
        // Redirect to student dashboard if not an admin
        router.push('/lms/student/dashboard');
        message.error('You do not have permission to access the admin area');
      }
    }
  }, [loading, user, router]);

  // Functions for the Add Workshop modal
  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitLoading(true);
      
      // Prepare the data for submission
      const formattedValues = {
        ...values,
        date: values.date?.format('YYYY-MM-DD'),
        time: values.time?.format('HH:mm'),
      };
      
      console.log('Workshop data to submit:', formattedValues);
      
      setTimeout(() => {
        message.success('Workshop added successfully!');
        setSubmitLoading(false);
        handleCancel();
      }, 1000);
      
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  if (loading) {
    return <div className={styles.loadingState}>Loading...</div>;
  }

  // Guard against rendering if user is not authenticated or not an admin
  if (!user || !user.isAdmin) {
    return <div className={styles.loadingState}>Checking permissions...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h1>Workshop Management</h1>
          <div className={styles.headerButtons}>
            <button className={styles.addButton} onClick={showModal}>
              <PlusOutlined /> Add New Workshop
            </button>
          </div>
        </div>
        
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Title</th>
                <th>Instructor</th>
                <th>Date & Time</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Participants</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={7} className={styles.emptyState}>
                  No workshop data available
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Add Workshop Modal */}
      <Modal
        title="Add New Workshop"
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        width={700}
        className={styles.workshopModal}
      >
        <Form
          form={form}
          layout="vertical"
          style={{ maxHeight: '70vh', overflowY: 'auto', padding: '0 5px' }}
        >
          <Form.Item 
            name="title" 
            label="Workshop Title"
            rules={[{ required: true, message: 'Please enter workshop title' }]}
          >
            <Input placeholder="Enter workshop title" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter workshop description' }]}
          >
            <TextArea 
              rows={4} 
              placeholder="Enter workshop description" 
              className={styles.formTextarea}
            />
          </Form.Item>
          
          <div style={{ display: 'flex', gap: '16px' }}>
            <Form.Item
              name="date"
              label="Date"
              style={{ flex: 1 }}
              rules={[{ required: true, message: 'Please select date' }]}
            >
              <DatePicker style={{ width: '100%' }} placeholder="Select date" />
            </Form.Item>
            
            <Form.Item
              name="time"
              label="Time"
              style={{ flex: 1 }}
              rules={[{ required: true, message: 'Please select time' }]}
            >
              <TimePicker format="h:mm a" style={{ width: '100%' }} placeholder="Select time" />
            </Form.Item>
          </div>
          
          <Form.Item
            name="duration"
            label="Duration (minutes)"
            rules={[{ required: true, message: 'Please set duration' }]}
          >
            <InputNumber min={15} max={240} step={15} style={{ width: '100%' }} placeholder="60" />
          </Form.Item>
          
          <Form.Item
            name="maxParticipants"
            label="Maximum Participants"
            rules={[{ required: true, message: 'Please set max participants' }]}
          >
            <InputNumber min={1} max={100} style={{ width: '100%' }} placeholder="20" />
          </Form.Item>
          
          <Form.Item
            name="access"
            label="Access"
            rules={[{ required: true, message: 'Please select access type' }]}
          >
            <Select placeholder="Select access type">
              <Option value="public">Public - All users can register</Option>
              <Option value="private">Private - Registration by invite only</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="recording"
            label="Recording Options"
            rules={[{ required: true, message: 'Please select recording option' }]}
          >
            <Select placeholder="Select recording option">
              <Option value="yes">Record session</Option>
              <Option value="no">Do not record</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="linkedCourses"
            label="Associated Courses"
          >
            <Select 
              placeholder="Select courses to link to this workshop"
              mode="multiple"
            >
              <Option value="cbt_basics">CBT Basics</Option>
              <Option value="anxiety_management">Anxiety Management</Option>
              <Option value="depression_recovery">Depression Recovery Techniques</Option>
            </Select>
          </Form.Item>
          
          <div className={styles.modalFooter}>
            <button className={styles.cancelButton} onClick={handleCancel}>
              Cancel
            </button>
            <button 
              className={styles.submitButton} 
              onClick={handleSubmit} 
              disabled={submitLoading}
            >
              {submitLoading ? 'Creating...' : 'Create Workshop'}
            </button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}

export default function AdminDashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  // Handle logout
  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Check if user is authenticated and is an admin
  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }
  
  if (!user) {
    router.push('/login');
    return null;
  }
  
  if (user && !user.isAdmin) {
    router.push('/student/dashboard');
    return null;
  }
  
  return (
    <AdminDashboard user={user} onLogout={handleLogout} />
  );
} 