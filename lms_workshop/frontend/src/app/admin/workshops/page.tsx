'use client';

import { useAuth } from '@/app/context/AuthContext';
import { Modal, Form, Input, Select, DatePicker, TimePicker, InputNumber, message } from 'antd';
import { PlusOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import styles from './workshops.module.css';
import dayjs from 'dayjs';
import { getValidToken } from '@/api/authService';

const { Option } = Select;
const { TextArea } = Input;

// Define a minimal User interface locally
interface User {
  id: number;
  // Add other user fields if needed for display or logic
  firstName?: string;
  lastName?: string;
  email?: string;
}

// Interface for workshop data fetched from API
interface ApiWorkshop {
  id: number;
  title: string;
  description: string;
  instructor: string;
  scheduledAt: string; // Assuming ISO string from backend
  preparatoryMaterials?: string;
  category?: string;
  attendees?: User[]; // Use the local User type
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  maxParticipants?: number; // Add this field to match backend entity
  // duration is NOT part of the backend entity based on workshop.entity.ts
}

// Interface for workshop data formatted for the table
interface TableWorkshop extends ApiWorkshop {
  dateTime: string; // Formatted date and time
  duration: number; // Assuming duration is added/calculated
  status: string; // Derived from isActive
  participants: number; // Derived from attendees.length
  participantsList?: User[]; // Store actual participant data when needed
}

export default function WorkshopManagement() {
  const { loading } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [submitLoading, setSubmitLoading] = useState(false);
  const [workshops, setWorkshops] = useState<TableWorkshop[]>([]);
  const [tableLoading, setTableLoading] = useState(true);
  const [editingWorkshop, setEditingWorkshop] = useState<TableWorkshop | null>(null);
  const [isParticipantsModalOpen, setIsParticipantsModalOpen] = useState(false);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  
  const fetchWorkshops = async () => {
    try {
      setTableLoading(true);
      
      // Get token for authentication using the centralized method
      const token = getValidToken();
      
      if (!token) {
        console.warn('Not authenticated, cannot fetch workshops.');
        setWorkshops([]);
        setTableLoading(false);
        return;
      }

      const headers: HeadersInit = {
        'Authorization': `Bearer ${token}`
      };

      // Add cache-busting timestamp
      const cacheBuster = new Date().getTime();
      
      // Fetch workshops from the API
      const response = await fetch(`http://localhost:4001/admin/workshops?_t=${cacheBuster}`, {
        headers: headers,
        cache: 'no-cache',
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Failed to fetch workshops: ${response.status} ${errorText}`);
        setWorkshops([]);
        return;
      }

      const data: ApiWorkshop[] = await response.json();
      console.log('Fetched updated workshops:', data);
      console.log('Workshop maxParticipants values:', data.map(ws => ({ id: ws.id, title: ws.title, maxParticipants: ws.maxParticipants })));
      
      // Format data for the table
      const formattedData: TableWorkshop[] = data.map((ws) => ({
        ...ws,
        dateTime: new Date(ws.scheduledAt).toLocaleString(),
        duration: 60, // Use placeholder
        status: ws.isActive ? 'Active' : 'Inactive',
        participants: ws.maxParticipants || 0, // Use maxParticipants instead of attendees.length
      }));
      
      setWorkshops(formattedData);

    } catch (error) {
      console.error('Failed to fetch workshops:', error);
      // Silently set empty workshops array instead of showing error message
      setWorkshops([]);
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    if (!loading) {
      fetchWorkshops();
      fetchAllUsers();
    }
  }, [loading]);

  // Function to fetch all users for participant selection
  const fetchAllUsers = async () => {
    try {
      console.log('Fetching users for participant selection...');
      
      const token = getValidToken();

      if (!token) {
        console.warn('Not authenticated, cannot fetch users.');
        return;
      }

      const headers: HeadersInit = {
        'Authorization': `Bearer ${token}`
      };

      // Add cache-busting timestamp to prevent caching issues
      const cacheBuster = new Date().getTime();
      
      // Fetch users from the API
      const response = await fetch(`http://localhost:4001/admin/users?_t=${cacheBuster}`, {
        headers: headers,
        cache: 'no-cache',
      });

      if (!response.ok) {
        console.error(`Failed to fetch users: ${response.status}`);
        setAllUsers([]);
        return;
      }

      const userData: User[] = await response.json();
      console.log(`Successfully loaded ${userData.length} users for selection`);
      setAllUsers(userData);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      // Silent fallback without showing error messages
      try {
        const token = getValidToken();
        if (!token) {
          setAllUsers([]);
          return;
        }

        const response = await fetch('http://localhost:4001/users', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          setAllUsers([]);
          return;
        }

        const allUsers = await response.json();
        console.log(`Successfully loaded ${allUsers.length} users from fallback endpoint`);
        setAllUsers(allUsers);
      } catch (fallbackError) {
        console.error('Failed to fetch users from fallback endpoint:', fallbackError);
        setAllUsers([]);
      }
    }
  };

  // Functions for the Add/Edit Workshop modal
  const showModal = (workshopToEdit: TableWorkshop | null = null) => {
    setEditingWorkshop(workshopToEdit);
    if (workshopToEdit) {
      // Pre-fill form for editing
      form.setFieldsValue({
        title: workshopToEdit.title,
        description: workshopToEdit.description,
        // Need to parse date and time from dateTime string
        // Assuming dateTime format is locale-specific, might need adjustment
        // date: dayjs(workshopToEdit.dateTime.split(',')[0], 'M/D/YYYY'), // Example parsing
        // time: dayjs(workshopToEdit.dateTime.split(',')[1], ' h:mm:ss A'), // Example parsing
        date: dayjs(workshopToEdit.scheduledAt), // Use original scheduledAt for pre-filling
        time: dayjs(workshopToEdit.scheduledAt), // Use original scheduledAt for pre-filling
        duration: workshopToEdit.duration,
        maxParticipants: workshopToEdit.maxParticipants || 0, // Use actual maxParticipants instead of current participants
        category: workshopToEdit.category,
      });
    } else {
      form.resetFields();
    }
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingWorkshop(null);
    form.resetFields();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitLoading(true);
      
      const scheduledAt = values.date && values.time 
        ? `${values.date.format('YYYY-MM-DD')}T${values.time.format('HH:mm:ss')}`
        : null;

      if (!scheduledAt) {
        throw new Error('Invalid date or time provided.');
      }
      
      console.log('Workshop scheduled date (raw):', scheduledAt);
      console.log('Workshop scheduled date (parsed):', new Date(scheduledAt).toISOString());
      console.log('Current date for comparison:', new Date().toISOString());

      // Prepare the data for submission
      const formattedValues = {
        ...values,
        date: values.date?.format('YYYY-MM-DD'),
        time: values.time?.format('HH:mm'),
        durationWeeks: values.durationWeeks || 1,
        sessionsPerWeek: values.sessionsPerWeek || 1,
      };
      
      const workshopData = {
        title: formattedValues.title,
        description: formattedValues.description,
        instructor: 'Akanksha', // Keep instructor hardcoded
        scheduledAt: new Date(scheduledAt).toISOString(),
        category: formattedValues.category,
        maxParticipants: Number(formattedValues.maxParticipants), // Convert to number without default value
      };
      
      console.log('Workshop data submitting to API:', workshopData);
      
      const token = getValidToken();

      if (!token) {
        throw new Error('Authentication required.');
      }

      const headers: HeadersInit = { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      let response;
      let successMessage = '';

      if (editingWorkshop) {
        // Update existing workshop (PUT)
        response = await fetch(`http://localhost:4001/admin/workshops/${editingWorkshop.id}`, {
          method: 'PUT',
          headers: headers,
          body: JSON.stringify(workshopData),
          // Prevent caching
          cache: 'no-cache',
        });
        successMessage = 'Workshop updated successfully!';
      } else {
        // Create new workshop (POST)
        response = await fetch('http://localhost:4001/admin/workshops', {
          method: 'POST',
          headers: headers,
          body: JSON.stringify(workshopData),
        });
        successMessage = 'Workshop added successfully!';
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} ${errorText}`);
      }

      // Parse the response
      const resultData = await response.json();
      console.log('API Response Data:', resultData);
      console.log('MaxParticipants value received from API:', resultData.maxParticipants);
      
      message.success(successMessage);
      handleCancel(); // Close modal and reset form
      
      // Always force a re-fetch of workshops to ensure UI is synchronized with backend
      fetchWorkshops();
      
    } catch (error) {
      console.error('Failed to submit workshop:', error);
      message.error(error instanceof Error ? error.message : 'Failed to save workshop.');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Function to handle workshop deletion
  const handleDelete = async (workshopId: number) => {
    try {
      const token = getValidToken();

      if (!token) {
        throw new Error('Authentication required.');
      }

      const headers: HeadersInit = {
        'Authorization': `Bearer ${token}`
      };

      // Call DELETE endpoint
      const response = await fetch(`http://localhost:4001/admin/workshops/${workshopId}`, {
        method: 'DELETE',
        headers: headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} ${errorText}`);
      }

      // Remove workshop from local state
      setWorkshops(prev => prev.filter(ws => ws.id !== workshopId));
      message.success('Workshop deleted successfully!');

    } catch (error) {
      console.error('Failed to delete workshop:', error);
      message.error(error instanceof Error ? error.message : 'Failed to delete workshop.');
    }
  };

  // Function to show delete confirmation modal
  const showDeleteConfirm = (workshopId: number, workshopTitle: string) => {
    Modal.confirm({
      title: `Are you sure you want to delete "${workshopTitle}"?`,
      icon: <ExclamationCircleOutlined />,
      content: 'This action cannot be undone.',
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'No, Cancel',
      onOk() {
        handleDelete(workshopId);
      },
      onCancel() {
        console.log('Delete cancelled');
      },
    });
  };

  // Function to open participant management modal
  const showParticipantsModal = async (workshop: TableWorkshop) => {
    // Validate workshop has a valid ID
    if (!workshop || !workshop.id || isNaN(Number(workshop.id)) || Number(workshop.id) <= 0) {
      console.error('Invalid workshop selected');
      return;
    }
    
    setEditingWorkshop(workshop);
    
    try {
      // First, reload the list of all users to ensure we have the most current data
      await fetchAllUsers();
      
      const token = getValidToken();

      if (!token) {
        console.error('Not authenticated');
        // Open modal with empty participants list
        setIsParticipantsModalOpen(true);
        return;
      }

      const headers: HeadersInit = {
        'Authorization': `Bearer ${token}`
      };

      // Fetch participants for this workshop
      const response = await fetch(`http://localhost:4001/admin/workshops/${workshop.id}/participants`, {
        headers: headers,
        cache: 'no-cache',
      });

      if (!response.ok) {
        console.error(`Failed to fetch participants: ${response.status}`);
        // Continue with empty participants list
        const updatedWorkshop = {...workshop, participantsList: []};
        setEditingWorkshop(updatedWorkshop);
        setIsParticipantsModalOpen(true);
        return;
      }

      const participants: User[] = await response.json();
      console.log(`Loaded ${participants.length} participants for workshop ${workshop.id}`);
      
      // Update workshop with participants
      const updatedWorkshop = {...workshop, participantsList: participants};
      setEditingWorkshop(updatedWorkshop);
      
      // Open the modal
      setIsParticipantsModalOpen(true);
    } catch (error) {
      console.error('Failed to fetch participants:', error);
      // Open modal with empty participants list anyway
      const updatedWorkshop = {...workshop, participantsList: []};
      setEditingWorkshop(updatedWorkshop);
      setIsParticipantsModalOpen(true);
    }
  };
  
  // Function to add multiple participants
  const addMultipleParticipants = async () => {
    if (!editingWorkshop || selectedUsers.length === 0) return;
    
    try {
      const token = getValidToken();

      if (!token) {
        console.error('Not authenticated');
        return;
      }

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      // Loop through selected users and add them
      let successCount = 0;
      for (const userId of selectedUsers) {
        try {
          const response = await fetch(`http://localhost:4001/admin/workshops/${editingWorkshop.id}/participants`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({ userId }),
          });

          if (response.ok) {
            successCount++;
          }
        } catch (error) {
          console.error(`Failed to add participant ${userId}:`, error);
        }
      }
      
      // Clear selection regardless of result
      setSelectedUsers([]);
      
      // Refresh participants list
      if (successCount > 0) {
        showParticipantsModal(editingWorkshop);
        // Also refresh workshop list to show updated count
        fetchWorkshops();
      }
    } catch (error) {
      console.error('Failed to add participants:', error);
      // Clear selection anyway
      setSelectedUsers([]);
    }
  };
  
  // Function to remove a participant
  const removeParticipant = async (userId: number | string) => {
    if (!editingWorkshop) return;
    
    try {
      // Validate userId
      const userIdNum = Number(userId);
      if (isNaN(userIdNum) || userIdNum <= 0) {
        console.error('Invalid user ID. Cannot remove user.');
        return;
      }
      
      const token = getValidToken();

      if (!token) {
        console.error('Not authenticated');
        return;
      }

      const headers: HeadersInit = {
        'Authorization': `Bearer ${token}`
      };

      // Remove participant
      const response = await fetch(`http://localhost:4001/admin/workshops/${editingWorkshop.id}/participants/${userIdNum}`, {
        method: 'DELETE',
        headers: headers,
      });

      if (!response.ok) {
        console.error(`Failed to remove participant: ${response.status}`);
        return;
      }

      // Refresh participants list if successful
      showParticipantsModal(editingWorkshop);
      
      // Also refresh workshop list to show updated count
      fetchWorkshops();
    } catch (error) {
      console.error('Failed to remove participant:', error);
    }
  };

  return (
    <>
      <div className={styles.header}>
        <h1>Workshop Management</h1>
        <button className={styles.addButton} onClick={() => showModal()}>
          <PlusOutlined /> Add Workshop
        </button>
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
              <th>Max Participants</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tableLoading ? (
              <tr>
                <td colSpan={7} className={styles.loadingState}>Loading workshops...</td>
              </tr>
            ) : workshops.length > 0 ? (
              workshops.map((workshop: TableWorkshop) => (
                <tr key={workshop.id}>
                  <td>{workshop.title}</td>
                  <td>{workshop.instructor}</td>
                  <td>{workshop.dateTime}</td>
                  <td>{`${workshop.duration} min`}</td>
                  <td>{workshop.status}</td>
                  <td>{workshop.participants}</td>
                  <td>
                    <div className={styles.actions}>
                      <button className={styles.editButton} onClick={() => showModal(workshop)}>Edit</button>
                      <button className={styles.deleteButton} onClick={() => showDeleteConfirm(workshop.id, workshop.title)}>Delete</button>
                      <button className={styles.participantsButton} onClick={() => showParticipantsModal(workshop)}>Manage Participants</button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className={styles.emptyState}>
                  No workshop data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Add/Edit Workshop Modal */}
      <Modal
        title={editingWorkshop ? "Edit Workshop" : "Add New Workshop"}
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
          
          <div style={{ display: 'flex', gap: '16px' }}>
            <Form.Item
              name="durationWeeks"
              label="Duration (weeks)"
              style={{ flex: 1 }}
              rules={[{ required: true, message: 'Please select workshop duration' }]}
            >
              <Select placeholder="Select duration">
                <Option value={1}>1 week</Option>
                <Option value={2}>2 weeks</Option>
                <Option value={4}>4 weeks</Option>
                <Option value={8}>8 weeks</Option>
                <Option value={12}>12 weeks</Option>
              </Select>
            </Form.Item>
            
            <Form.Item
              name="sessionsPerWeek"
              label="Sessions per week"
              style={{ flex: 1 }}
              rules={[{ required: true, message: 'Please select number of sessions' }]}
            >
              <Select placeholder="Select number of sessions">
                <Option value={1}>1 session/week</Option>
                <Option value={2}>2 sessions/week</Option>
                <Option value={3}>3 sessions/week</Option>
              </Select>
            </Form.Item>
          </div>
          
          <Form.Item
            name="maxParticipants"
            label="Maximum Participants"
            rules={[{ required: true, message: 'Please set max participants' }]}
          >
            <InputNumber min={1} max={100} style={{ width: '100%' }} placeholder="20" />
          </Form.Item>
          
          <Form.Item
            name="category"
            label="Category"
            rules={[{ required: true, message: 'Please select a category' }]}
          >
            <Select placeholder="Select workshop category">
              <Option value="cbt">Cognitive Behavioral Therapy</Option>
              <Option value="anxiety">Anxiety Management</Option>
              <Option value="depression">Depression Management</Option>
              <Option value="ptsd">PTSD Treatment</Option>
              <Option value="other">Other</Option>
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
              {submitLoading ? (editingWorkshop ? 'Saving...' : 'Creating...') : (editingWorkshop ? 'Save Changes' : 'Create Workshop')}
            </button>
          </div>
        </Form>
      </Modal>
      
      {/* Participants Management Modal */}
      <Modal
        title={`Manage Participants - ${editingWorkshop?.title || 'Workshop'}`}
        open={isParticipantsModalOpen}
        onCancel={() => {
          setIsParticipantsModalOpen(false);
          setSelectedUsers([]);
        }}
        footer={null}
        width={700}
        className={styles.workshopModal}
      >
        <div className={styles.participantsSection}>
          <h3>Current Participants ({editingWorkshop?.participantsList?.length || 0})</h3>
          {editingWorkshop?.participantsList && editingWorkshop.participantsList.length > 0 ? (
            <ul className={styles.participantsList}>
              {editingWorkshop.participantsList.map(user => (
                <li key={user.id} className={styles.participantItem}>
                  <div className={styles.participantInfo}>
                    <span className={styles.participantName}>{user.firstName} {user.lastName}</span>
                    <span className={styles.participantEmail}>{user.email}</span>
                  </div>
                  <button 
                    className={styles.removeParticipantButton}
                    onClick={() => removeParticipant(user.id)}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.noParticipants}>No participants added yet.</p>
          )}
          
          <div className={styles.addParticipantSection}>
            <h3>Add Participants</h3>
            {allUsers.length === 0 ? (
              <div className={styles.noParticipants}>
                <p>No users available to add.</p>
              </div>
            ) : (
              <>
                <Select
                  mode="multiple"
                  showSearch
                  style={{ width: '100%' }}
                  placeholder="Select users to add"
                  optionFilterProp="children"
                  value={selectedUsers}
                  onChange={(values) => setSelectedUsers(values as number[])}
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={allUsers
                    // Filter out users who are already participants
                    .filter(user => !editingWorkshop?.participantsList?.some(participant => participant.id === user.id))
                    .map(user => ({
                      value: user.id,
                      label: `${user.firstName} ${user.lastName} (${user.email})`,
                    }))
                  }
                />
                <div className={styles.selectionHint}>
                  Type to search by name or email. You can select multiple users.
                </div>
                <button 
                  className={styles.addParticipantsButton}
                  disabled={selectedUsers.length === 0}
                  onClick={addMultipleParticipants}
                >
                  Add Selected Participants ({selectedUsers.length})
                </button>
              </>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
} 