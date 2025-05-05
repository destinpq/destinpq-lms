'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';
import styles from '../../admin.module.css';
import { Select, Button, Radio, Input, Alert } from 'antd';

const { TextArea } = Input;

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

export default function NewMessage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [students, setStudents] = useState<User[]>([]);
  const [messageType, setMessageType] = useState('individual');
  
  const [formData, setFormData] = useState({
    content: '',
    recipientId: '',
    groupName: '',
  });

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          throw new Error('Not authenticated');
        }

        // Use relative URL or environment variable to handle different environments
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001';
        console.log('Fetching students from:', `${apiUrl}/users/students`);
        
        const response = await fetch(`${apiUrl}/users/students`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          cache: 'no-cache', // Add cache-busting
        });

        if (!response.ok) {
          console.error('Failed to fetch students, status:', response.status);
          throw new Error('Failed to fetch students');
        }

        const data = await response.json();
        console.log('Fetched students:', data?.length || 0);
        setStudents(data || []);
      } catch (error) {
        console.error('Error fetching students:', error);
        
        // Try fallback approach - fetch all users
        try {
          const token = localStorage.getItem('access_token');
          if (!token) return;
          
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001';
          const response = await fetch(`${apiUrl}/users`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
            cache: 'no-cache',
          });
          
          if (!response.ok) return;
          
          const allUsers = await response.json();
          // Filter out admin users
          const studentUsers = allUsers.filter((user: any) => !user.isAdmin);
          console.log('Fetched users as fallback:', studentUsers?.length || 0);
          setStudents(studentUsers || []);
        } catch (fallbackError) {
          console.error('Fallback fetch failed:', fallbackError);
        }
      }
    };

    if (user && user.isAdmin) {
      fetchStudents();
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      if (!user?.id) {
        throw new Error('User ID is missing');
      }

      let recipientId = null;
      if (messageType === 'individual') {
        if (!formData.recipientId) {
          throw new Error('Please select a recipient');
        }
        recipientId = parseInt(formData.recipientId, 10);
        if (isNaN(recipientId)) {
          throw new Error('Invalid recipient ID');
        }
      }

      console.log('Sending message with data:', {
        content: formData.content,
        senderId: user.id,
        recipientId: messageType === 'individual' ? recipientId : null,
        groupName: messageType === 'group' ? formData.groupName : null
      });

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001';
      const response = await fetch(`${apiUrl}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: formData.content,
          senderId: user.id,
          ...(messageType === 'individual' 
            ? { recipientId } 
            : { groupName: formData.groupName, groupId: `group-${Date.now()}` }),
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.message || 'Failed to send message');
        } catch (jsonError) {
          throw new Error(`Failed to send message: ${response.status}`);
        }
      }

      router.push('/admin/dashboard?tab=messages');
    } catch (error: unknown) {
      console.error('Failed to send message:', error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to send message';
      setErrorMessage(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  if (!user || !user.isAdmin) {
    router.push('/login');
    return null;
  }

  return (
    <div className={styles.adminContainer}>
      <div className={styles.adminHeader}>
        <h1>Send New Message</h1>
        <Link href="/admin/dashboard?tab=messages" className={styles.backLink}>
          Back to Messages
        </Link>
      </div>

      <div className={styles.formContainer}>
        {errorMessage && (
          <Alert message={errorMessage} type="error" showIcon style={{ marginBottom: '20px' }} />
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label>Message Type</label>
            <Radio.Group 
              value={messageType} 
              onChange={e => setMessageType(e.target.value)} 
              style={{ marginTop: '8px' }}
            >
              <Radio value="individual">Individual Message</Radio>
              <Radio value="group">Group Message</Radio>
            </Radio.Group>
          </div>

          {messageType === 'individual' ? (
            <div className={styles.formGroup}>
              <label htmlFor="recipientId">Recipient *</label>
              <Select
                id="recipientId"
                style={{ width: '100%' }}
                placeholder="Select a recipient"
                value={formData.recipientId || undefined}
                onChange={(value) => setFormData(prev => ({ ...prev, recipientId: value }))}
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={students.map(student => ({
                  value: student.id.toString(),
                  label: `${student.firstName} ${student.lastName} (${student.email})`
                }))}
              />
            </div>
          ) : (
            <div className={styles.formGroup}>
              <label htmlFor="groupName">Group Name *</label>
              <Input
                id="groupName"
                name="groupName"
                value={formData.groupName}
                onChange={handleChange}
                placeholder="e.g., Study Group, CBT Workshop Participants"
                required
              />
            </div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="content">Message Content *</label>
            <TextArea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              rows={5}
              required
              placeholder="Type your message here..."
            />
          </div>

          <div className={styles.formActions}>
            <Button
              onClick={() => router.push('/admin/dashboard?tab=messages')}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={isSubmitting}
            >
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 