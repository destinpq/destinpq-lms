'use client';

import { useAuth } from '@/app/context/AuthContext';
import { Modal, Form, Input, Select, message } from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  VideoCameraOutlined
} from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './courses.module.css';
import { getValidToken } from '@/api/authService';

// Define the CourseItem interface locally instead of importing from deleted api.ts
interface CourseItem {
  id: number;
  title: string;
  description: string;
  associatedWorkshop: string;
  instructor: string;
  maxStudents: number;
  status: 'ACTIVE' | 'DRAFT' | 'COMPLETED';
}

const { Option } = Select;

export default function WorkshopCourses() {
  const { loading } = useAuth();
  const [searchText, setSearchText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentCourse, setCurrentCourse] = useState<CourseItem | null>(null);
  const [form] = Form.useForm();
  const [submitLoading, setSubmitLoading] = useState(false);
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [tableLoading, setTableLoading] = useState(true);
  const router = useRouter();
  
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setTableLoading(true);
        
        const token = getValidToken();
        if (!token) {
          throw new Error('Not authenticated');
        }
        
        const response = await fetch(`${process.env.API_URL}/courses`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch courses');
        }
        
        const data = await response.json();
        console.log('Fetched courses:', data);
        setCourses(data);
      } catch (error) {
        console.error('Failed to fetch courses:', error);
        message.error('Failed to load courses');
      } finally {
        setTableLoading(false);
      }
    };
    
    if (!loading) {
      fetchCourses();
    }
  }, [loading]);
  
  // Functions for the Add Course modal
  const showModal = () => {
    setIsEditMode(false);
    setCurrentCourse(null);
    form.resetFields();
    setIsModalOpen(true);
  };
  
  // Function to open edit modal with course data
  const handleEdit = (course: CourseItem) => {
    setIsEditMode(true);
    setCurrentCourse(course);
    
    // Populate form with course data
    form.setFieldsValue({
      title: course.title,
      description: course.description,
      associatedWorkshop: course.associatedWorkshop,
      instructor: course.instructor,
      maxStudents: course.maxStudents,
      status: course.status
    });
    
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  // Function to start a video session for a course
  const startCourseSession = (courseId: number, courseTitle: string) => {
    // Create a URL-friendly room name from the course title
    const roomName = courseTitle.replace(/\s+/g, '-').toLowerCase();
    
    // Navigate to a session page with the course ID
    router.push(`/admin/workshops/session/${courseId}?room=${roomName}&title=${encodeURIComponent(courseTitle)}`);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitLoading(true);
      
      // Validate numeric values
      const maxStudents = parseInt(values.maxStudents, 10);
      if (isNaN(maxStudents)) {
        throw new Error('Invalid maximum students value');
      }
      
      // Prepare the data for submission with proper types
      const courseData = {
        title: values.title,
        description: values.description,
        associatedWorkshop: values.associatedWorkshop,
        instructor: 'Akanksha', // Hardcoded as Akanksha
        maxStudents: maxStudents,
        status: values.status
      };
      
      console.log('Course data to submit:', courseData);
      
      try {
        // Direct API call with authentication
        const token = getValidToken();
        if (!token) {
          throw new Error('Authentication required. Please sign in again.');
        }
        
        let response;
        if (isEditMode && currentCourse) {
          // Update existing course
          response = await fetch(`${process.env.API_URL}/courses/${currentCourse.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(courseData),
          });
        } else {
          // Create new course
          response = await fetch(`${process.env.API_URL}/courses`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(courseData),
          });
        }
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Failed response:', response.status, errorText);
          
          if (response.status === 401) {
            message.error('Authentication failed. Please log in again.');
            return;
          }
          
          throw new Error(`Server error: ${response.status} ${errorText}`);
        }
        
        const resultCourse = await response.json();
        console.log(isEditMode ? 'Course updated successfully:' : 'Course created successfully:', resultCourse);
        
        // Update the courses list
        if (isEditMode && currentCourse) {
          setCourses(prev => prev.map(course => 
            course.id === currentCourse.id ? resultCourse : course
          ));
          message.success('Course updated successfully');
        } else {
          // Add new course to the list
          setCourses(prev => [...prev, resultCourse]);
          message.success('Course created successfully');
        }
        
        setIsModalOpen(false);
        form.resetFields();
      } catch (error) {
        console.error('API Error:', error);
        message.error(`API Error: ${error instanceof Error ? error.message : String(error)}`);
      }
    } catch (error) {
      console.error('Form validation failed:', error);
      message.error(error instanceof Error ? error.message : 'Failed to create course');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Function to handle course deletion
  const handleDelete = async (courseId: number, courseTitle: string) => {
    try {
      if (confirm(`Are you sure you want to delete the course "${courseTitle}"?`)) {
        const token = getValidToken();
        if (!token) {
          throw new Error('Authentication required. Please sign in again.');
        }
        
        const response = await fetch(`${process.env.API_URL}/courses/${courseId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (!response.ok) {
          throw new Error(`Failed to delete course: ${response.status}`);
        }
        
        // Remove the course from the list
        setCourses(prev => prev.filter(course => course.id !== courseId));
        message.success(`Course "${courseTitle}" deleted successfully`);
      }
    } catch (error) {
      console.error('Error deleting course:', error);
      message.error('Failed to delete course');
    }
  };

  if (loading) {
    return <div className={styles.loadingState}>Loading...</div>;
  }

  return (
    <>
        <div className={styles.header}>
          <h1>Workshop Courses</h1>
          <div className={styles.headerControls}>
            <div className={styles.searchField}>
              <Input 
                placeholder="Search courses..." 
                prefix={<SearchOutlined />} 
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
              />
            </div>
            <button className={styles.addButton} onClick={showModal}>
              <PlusOutlined /> Add Course
            </button>
          </div>
        </div>
        
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Course Title</th>
                <th>Associated Workshop</th>
                <th>Instructor</th>
                <th>Students</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tableLoading ? (
                <tr>
                  <td colSpan={6} className={styles.loadingState}>Loading courses...</td>
                </tr>
              ) : courses.length > 0 ? (
                courses.map(course => (
                  <tr key={course.id}>
                    <td>{course.title}</td>
                    <td>{course.associatedWorkshop}</td>
                    <td>{course.instructor}</td>
                    <td>{course.maxStudents}</td>
                    <td>
                      <span className={`${styles.status} ${styles[course.status.toLowerCase()]}`}>
                        {course.status}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button 
                          className={styles.videoButton}
                          onClick={() => startCourseSession(course.id, course.title)}
                        >
                          <VideoCameraOutlined /> Start Session
                        </button>
                        <button 
                          className={styles.editButton}
                          onClick={() => handleEdit(course)}
                        >
                          Edit
                        </button>
                        <button className={styles.deleteButton} onClick={() => handleDelete(course.id, course.title)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className={styles.emptyState}>
                    No course data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
      </div>
      
      {/* Add/Edit Course Modal */}
      <Modal
        title={isEditMode ? "Edit Course" : "Add New Course"}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        width={700}
        className={styles.courseModal}
      >
        <Form
          form={form}
          layout="vertical"
          style={{ maxHeight: '70vh', overflowY: 'auto', padding: '0 5px' }}
        >
          <Form.Item 
            name="title" 
            label="Course Title"
            rules={[{ required: true, message: 'Please enter course title' }]}
          >
            <Input placeholder="Enter course title" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter course description' }]}
          >
            <Input.TextArea 
              rows={4} 
              placeholder="Enter course description" 
              className={styles.formTextarea}
            />
          </Form.Item>
          
          <Form.Item
            name="associatedWorkshop"
            label="Associated Workshop"
            rules={[{ required: true, message: 'Please select associated workshop' }]}
          >
            <Select placeholder="Select workshop to associate with this course">
              <Option value="cbt_basics">CBT Basics Workshop</Option>
              <Option value="anxiety_management">Anxiety Management Workshop</Option>
              <Option value="depression_recovery">Depression Recovery Workshop</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="instructor"
            label="Instructor"
            initialValue="akanksha"
            rules={[{ required: true, message: 'Please select an instructor' }]}
          >
            <Select disabled defaultValue="akanksha">
              <Option value="akanksha">Akanksha</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="maxStudents"
            label="Maximum Students"
            rules={[{ required: true, message: 'Please set maximum students' }]}
          >
            <Input type="number" placeholder="Enter maximum number of students" />
          </Form.Item>
          
          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: 'Please select course status' }]}
          >
            <Select placeholder="Select course status">
              <Option value="ACTIVE">Active</Option>
              <Option value="DRAFT">Draft</Option>
              <Option value="COMPLETED">Completed</Option>
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
              {submitLoading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Course' : 'Create Course')}
            </button>
          </div>
        </Form>
      </Modal>
    </>
  );
} 