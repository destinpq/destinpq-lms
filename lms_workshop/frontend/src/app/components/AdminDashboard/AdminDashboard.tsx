'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './AdminDashboard.module.css';
import { Badge, message } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import { SafeUserDisplay } from '@/app/_debug/debug-render';
import { getValidToken } from '@/api/authService';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  isAdmin: boolean;
}

interface AdminDashboardProps {
  user: User;
  onLogout?: () => void;
}

interface Course {
  id: number;
  title: string;
  description: string;
  status: string;
  totalModules: number;
}

export default function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('courses');
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      // Default logout behavior
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        window.location.href = '/login';
      }
    }
  };

  // Fetch courses when the component mounts
  useEffect(() => {
    if (activeTab === 'courses') {
      fetchCourses();
    }
  }, [activeTab]);
  
  // Function to fetch courses
  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      
      // Get auth token
      const token = getValidToken();
      if (!token) throw new Error('Authentication required');
      
      // Fetch courses from API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001'}/admin/courses`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch courses: ${response.status}`);
      }
      
      const data = await response.json();
      setCourses(data);
    } catch (error) {
      console.error('Error fetching courses:', error);
      message.error('Failed to load courses. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Ensure user is valid to prevent rendering objects directly
  if (!user || typeof user !== 'object') {
    return null;
  }

  return (
    <div className={styles.adminDashboard}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.headerTitle}>Admin Dashboard</h1>
          <div className={styles.userInfo}>
            <Badge count={0} size="small">
              <BellOutlined style={{ fontSize: '18px', cursor: 'pointer' }} />
            </Badge>
            <span className={styles.welcomeText}>
              Welcome, <SafeUserDisplay user={user} fallback="Admin" />
            </span>
            <button
              onClick={handleLogout}
              className={styles.logoutButton}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Admin Navigation */}
      <div className={styles.adminNav}>
        <div className={styles.navContent}>
          <button
            className={`${styles.navButton} ${activeTab === 'courses' ? styles.activeNavButton : ''}`}
            onClick={() => setActiveTab('courses')}
          >
            Courses
          </button>
          <button
            className={`${styles.navButton} ${activeTab === 'workshops' ? styles.activeNavButton : ''}`}
            onClick={() => setActiveTab('workshops')}
          >
            Workshops
          </button>
          <button
            className={`${styles.navButton} ${activeTab === 'homework' ? styles.activeNavButton : ''}`}
            onClick={() => setActiveTab('homework')}
          >
            Homework
          </button>
          <button
            className={`${styles.navButton} ${activeTab === 'achievements' ? styles.activeNavButton : ''}`}
            onClick={() => setActiveTab('achievements')}
          >
            Achievements
          </button>
          <button
            className={`${styles.navButton} ${activeTab === 'messages' ? styles.activeNavButton : ''}`}
            onClick={() => setActiveTab('messages')}
          >
            Messages
          </button>
          <button
            className={`${styles.navButton} ${activeTab === 'users' ? styles.activeNavButton : ''}`}
            onClick={() => setActiveTab('users')}
          >
            Users
          </button>
          <button
            className={`${styles.navButton} ${activeTab === 'analytics' ? styles.activeNavButton : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            Analytics
          </button>
          <button
            className={`${styles.navButton} ${activeTab === 'settings' ? styles.activeNavButton : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            Settings
          </button>
        </div>
      </div>

      <div className={styles.adminContent}>
        {activeTab === 'courses' && (
          <div className={styles.sectionContent}>
            <div className={styles.sectionHeader}>
              <h2>Course Management</h2>
              <Link href="/admin/courses/new" className={styles.primaryButton}>
                Add New Course
              </Link>
            </div>
            
            <div className={styles.tableContainer}>
              {isLoading ? (
                <p className={styles.loadingState}>Loading courses...</p>
              ) : courses.length > 0 ? (
                <table className={styles.dataTable}>
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Status</th>
                      <th>Modules</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.map(course => (
                      <tr key={course.id}>
                        <td>{course.title}</td>
                        <td>
                          <span className={`${styles.statusBadge} ${styles[course.status.toLowerCase()]}`}>
                            {course.status}
                          </span>
                        </td>
                        <td>{course.totalModules || 0}</td>
                        <td>
                          <div className={styles.actionButtons}>
                            <Link href={`/admin/courses/edit/${course.id}`} className={styles.editButton}>
                              Edit
                            </Link>
                            <Link href={`/course/${course.id}`} className={styles.viewButton} target="_blank">
                              View
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className={styles.emptyState}>
                  No courses found. Click the "Add New Course" button to create your first course.
                </p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'workshops' && (
          <div className={styles.sectionContent}>
            <div className={styles.sectionHeader}>
              <h2>Workshop Management</h2>
              <Link href="/admin/workshops/new" className={styles.primaryButton}>
                Add New Workshop
              </Link>
            </div>
            
            <div className={styles.tableContainer}>
              <p className={styles.emptyState}>
                Connect to the API to load workshop data or click the "Add New Workshop" button to create a new workshop.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'homework' && (
          <div className={styles.sectionContent}>
            <div className={styles.sectionHeader}>
              <h2>Homework Management</h2>
              <Link href="/admin/homework/new" className={styles.primaryButton}>
                Create New Assignment
              </Link>
            </div>
            
            <div className={styles.tableContainer}>
              <p className={styles.emptyState}>
                Connect to the API to load homework assignments or click the "Create New Assignment" button to create a new one.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className={styles.sectionContent}>
            <div className={styles.sectionHeader}>
              <h2>Achievements & Certificates</h2>
              <Link href="/admin/achievements/new" className={styles.primaryButton}>
                Create New Achievement
              </Link>
            </div>
            
            <div className={styles.tableContainer}>
              <p className={styles.emptyState}>
                Connect to the API to load achievements or click the "Create New Achievement" button to create a new one.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'messages' && (
          <div className={styles.sectionContent}>
            <div className={styles.sectionHeader}>
              <h2>Message Management</h2>
              <Link href="/admin/messages/new" className={styles.primaryButton}>
                Send New Message
              </Link>
            </div>
            
            <div className={styles.tableContainer}>
              <p className={styles.emptyState}>
                Connect to the API to load messages or click the "Send New Message" button to create a new one.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className={styles.sectionContent}>
            <div className={styles.sectionHeader}>
              <h2>User Management</h2>
              <Link href="/admin/users/new" className={styles.primaryButton}>
                Add New User
              </Link>
            </div>
            
            <div className={styles.tableContainer}>
              <p className={styles.emptyState}>
                Connect to the API to load user data or click the "Add New User" button to create a new user.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className={styles.sectionContent}>
            <h2>Analytics Dashboard</h2>
            <div className={styles.analyticsGrid}>
              <div className={styles.statsCard}>
                <h3>Total Students</h3>
                <p className={styles.statValue}>0</p>
              </div>
              <div className={styles.statsCard}>
                <h3>Active Courses</h3>
                <p className={styles.statValue}>0</p>
              </div>
              <div className={styles.statsCard}>
                <h3>Upcoming Workshops</h3>
                <p className={styles.statValue}>0</p>
              </div>
              <div className={styles.statsCard}>
                <h3>Pending Assignments</h3>
                <p className={styles.statValue}>0</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className={styles.sectionContent}>
            <h2>System Settings</h2>
            
            <div className={styles.settingsForm}>
              <div className={styles.formGroup}>
                <label htmlFor="siteName">Site Name</label>
                <input 
                  type="text" 
                  id="siteName" 
                  className={styles.textInput} 
                  placeholder="Psychology Learning Platform"
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="siteDescription">Site Description</label>
                <textarea 
                  id="siteDescription" 
                  className={styles.textArea} 
                  placeholder="A learning platform for psychology students"
                  rows={3}
                ></textarea>
              </div>
              
              <div className={styles.formGroup}>
                <label>Email Notifications</label>
                <div className={styles.checkboxGroup}>
                  <label className={styles.checkbox}>
                    <input type="checkbox" defaultChecked /> 
                    <span>New user registrations</span>
                  </label>
                  <label className={styles.checkbox}>
                    <input type="checkbox" defaultChecked /> 
                    <span>Course enrollments</span>
                  </label>
                  <label className={styles.checkbox}>
                    <input type="checkbox" /> 
                    <span>Workshop notifications</span>
                  </label>
                  <label className={styles.checkbox}>
                    <input type="checkbox" /> 
                    <span>Homework assignments</span>
                  </label>
                </div>
              </div>
              
              <button className={styles.primaryButton}>
                Save Settings
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 