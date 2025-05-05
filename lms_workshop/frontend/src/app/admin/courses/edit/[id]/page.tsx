'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import Link from 'next/link';
import { message, Tabs, Spin, Modal } from 'antd';
import { getValidToken } from '@/api/authService';
import styles from './edit-course.module.css';

const { TabPane } = Tabs;

// Interfaces for course data
interface Lesson {
  id: number;
  title: string;
  content: string;
  order: number;
  moduleId: number;
}

interface Module {
  id: number;
  title: string;
  order: number;
  lessons: Lesson[];
}

interface Course {
  id: number;
  title: string;
  description: string;
  instructor: string;
  status: string;
  modules: Module[];
}

export default function EditCoursePage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [courseData, setCourseData] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [activeModuleId, setActiveModuleId] = useState<number | null>(null);
  const [activeLessonId, setActiveLessonId] = useState<number | null>(null);
  
  // Form state
  const [courseTitle, setCourseTitle] = useState('');
  const [courseDescription, setCourseDescription] = useState('');
  const [courseInstructor, setCourseInstructor] = useState('');
  const [courseStatus, setCourseStatus] = useState('');
  
  // Module and lesson state
  const [currentModuleTitle, setCurrentModuleTitle] = useState('');
  const [currentLessonTitle, setCurrentLessonTitle] = useState('');
  const [currentLessonContent, setCurrentLessonContent] = useState('');
  
  // Check authentication
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (!loading && user && !user.isAdmin) {
      router.push('/student/dashboard');
    }
  }, [user, loading, router]);
  
  // Fetch course data
  useEffect(() => {
    if (id && !loading && user?.isAdmin) {
      fetchCourseData();
    }
  }, [id, loading, user]);
  
  const fetchCourseData = async () => {
    try {
      setIsLoading(true);
      
      // Get auth token
      const token = getValidToken();
      if (!token) throw new Error('Authentication required');
      
      // Fetch course data from API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001'}/admin/courses/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch course: ${response.status}`);
      }
      
      const data = await response.json();
      setCourseData(data);
      
      // Set form state from course data
      setCourseTitle(data.title);
      setCourseDescription(data.description);
      setCourseInstructor(data.instructor);
      setCourseStatus(data.status);
      
      // Set active module and lesson if available
      if (data.modules && data.modules.length > 0) {
        setActiveModuleId(data.modules[0].id);
        
        if (data.modules[0].lessons && data.modules[0].lessons.length > 0) {
          setActiveLessonId(data.modules[0].lessons[0].id);
          setCurrentLessonTitle(data.modules[0].lessons[0].title);
          setCurrentLessonContent(data.modules[0].lessons[0].content);
        }
        
        setCurrentModuleTitle(data.modules[0].title);
      }
    } catch (error) {
      console.error('Error fetching course data:', error);
      message.error('Failed to load course data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSaveCourse = async () => {
    try {
      setIsSaving(true);
      
      // Get auth token
      const token = getValidToken();
      if (!token) throw new Error('Authentication required');
      
      // Update course details
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001'}/admin/courses/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: courseTitle,
          description: courseDescription,
          instructor: courseInstructor,
          status: courseStatus
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update course: ${response.status}`);
      }
      
      message.success('Course details saved successfully!');
      fetchCourseData(); // Refresh data
    } catch (error) {
      console.error('Error updating course:', error);
      message.error('Failed to save course details. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleSaveModule = async () => {
    try {
      setIsSaving(true);
      
      // Get auth token
      const token = getValidToken();
      if (!token) throw new Error('Authentication required');
      
      if (!activeModuleId) {
        throw new Error('No active module selected');
      }
      
      // Update module
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001'}/admin/modules/${activeModuleId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: currentModuleTitle
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update module: ${response.status}`);
      }
      
      message.success('Module saved successfully!');
      fetchCourseData(); // Refresh data
    } catch (error) {
      console.error('Error updating module:', error);
      message.error('Failed to save module. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleSaveLesson = async () => {
    try {
      setIsSaving(true);
      
      // Get auth token
      const token = getValidToken();
      if (!token) throw new Error('Authentication required');
      
      if (!activeLessonId) {
        throw new Error('No active lesson selected');
      }
      
      // Update lesson
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001'}/admin/lessons/${activeLessonId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: currentLessonTitle,
          content: currentLessonContent
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update lesson: ${response.status}`);
      }
      
      message.success('Lesson saved successfully!');
      fetchCourseData(); // Refresh data
    } catch (error) {
      console.error('Error updating lesson:', error);
      message.error('Failed to save lesson. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleModuleClick = (moduleId: number) => {
    setActiveModuleId(moduleId);
    
    // Set current module title
    const moduleItem = courseData?.modules.find(m => m.id === moduleId);
    if (moduleItem) {
      setCurrentModuleTitle(moduleItem.title);
      
      // Select first lesson if available
      if (moduleItem.lessons && moduleItem.lessons.length > 0) {
        setActiveLessonId(moduleItem.lessons[0].id);
        setCurrentLessonTitle(moduleItem.lessons[0].title);
        setCurrentLessonContent(moduleItem.lessons[0].content);
      } else {
        setActiveLessonId(null);
        setCurrentLessonTitle('');
        setCurrentLessonContent('');
      }
    }
  };
  
  const handleLessonClick = (lessonId: number) => {
    setActiveLessonId(lessonId);
    
    // Set current lesson title and content
    const currentModule = courseData?.modules.find(m => m.id === activeModuleId);
    const lesson = currentModule?.lessons.find(l => l.id === lessonId);
    
    if (lesson) {
      setCurrentLessonTitle(lesson.title);
      setCurrentLessonContent(lesson.content);
    }
  };
  
  const handleAddModule = async () => {
    try {
      setIsSaving(true);
      
      // Get auth token
      const token = getValidToken();
      if (!token) throw new Error('Authentication required');
      
      // Create new module
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001'}/admin/courses/${id}/modules`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: 'New Module',
          order: courseData?.modules.length ? courseData.modules.length + 1 : 1
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create module: ${response.status}`);
      }
      
      message.success('New module added successfully!');
      fetchCourseData(); // Refresh data
    } catch (error) {
      console.error('Error adding module:', error);
      message.error('Failed to add new module. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleAddLesson = async () => {
    try {
      setIsSaving(true);
      
      if (!activeModuleId) {
        throw new Error('No module selected');
      }
      
      // Get auth token
      const token = getValidToken();
      if (!token) throw new Error('Authentication required');
      
      // Create new lesson
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001'}/admin/modules/${activeModuleId}/lessons`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: 'New Lesson',
          content: '<h2>New Lesson Content</h2><p>Start editing this lesson content...</p>',
          order: courseData?.modules.find(m => m.id === activeModuleId)?.lessons.length 
            ? courseData.modules.find(m => m.id === activeModuleId)!.lessons.length + 1 
            : 1
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create lesson: ${response.status}`);
      }
      
      message.success('New lesson added successfully!');
      fetchCourseData(); // Refresh data
    } catch (error) {
      console.error('Error adding lesson:', error);
      message.error('Failed to add new lesson. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleDeleteModule = async (moduleId: number) => {
    try {
      // Get auth token
      const token = getValidToken();
      if (!token) throw new Error('Authentication required');
      
      // Show confirmation dialog
      Modal.confirm({
        title: 'Confirm Module Deletion',
        content: 'Are you sure you want to delete this module? This will also delete all lessons within this module.',
        okText: 'Delete',
        okType: 'danger',
        cancelText: 'Cancel',
        onOk: async () => {
          try {
            setIsSaving(true);
            
            // Delete module
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001'}/admin/modules/${moduleId}`, {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
            
            if (!response.ok) {
              throw new Error(`Failed to delete module: ${response.status}`);
            }
            
            message.success('Module deleted successfully!');
            fetchCourseData(); // Refresh data
            
            // Reset active module
            if (activeModuleId === moduleId) {
              setActiveModuleId(null);
              setActiveLessonId(null);
              setCurrentModuleTitle('');
              setCurrentLessonTitle('');
              setCurrentLessonContent('');
            }
          } catch (error) {
            console.error('Error deleting module:', error);
            message.error('Failed to delete module. Please try again.');
          } finally {
            setIsSaving(false);
          }
        }
      });
    } catch (error) {
      console.error('Error in delete module process:', error);
      message.error('An error occurred while attempting to delete the module.');
    }
  };
  
  const handleDeleteLesson = async (lessonId: number) => {
    try {
      // Get auth token
      const token = getValidToken();
      if (!token) throw new Error('Authentication required');
      
      // Show confirmation dialog
      Modal.confirm({
        title: 'Confirm Lesson Deletion',
        content: 'Are you sure you want to delete this lesson?',
        okText: 'Delete',
        okType: 'danger',
        cancelText: 'Cancel',
        onOk: async () => {
          try {
            setIsSaving(true);
            
            // Delete lesson
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001'}/admin/lessons/${lessonId}`, {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
            
            if (!response.ok) {
              throw new Error(`Failed to delete lesson: ${response.status}`);
            }
            
            message.success('Lesson deleted successfully!');
            fetchCourseData(); // Refresh data
            
            // Reset active lesson
            if (activeLessonId === lessonId) {
              setActiveLessonId(null);
              setCurrentLessonTitle('');
              setCurrentLessonContent('');
            }
          } catch (error) {
            console.error('Error deleting lesson:', error);
            message.error('Failed to delete lesson. Please try again.');
          } finally {
            setIsSaving(false);
          }
        }
      });
    } catch (error) {
      console.error('Error in delete lesson process:', error);
      message.error('An error occurred while attempting to delete the lesson.');
    }
  };
  
  const renderContentEditor = () => {
    if (activeTab === 'details') {
      return (
        <div className={styles.formSection}>
          <h2 className={styles.sectionTitle}>Course Details</h2>
          
          <div className={styles.formGroup}>
            <label htmlFor="courseTitle">Course Title</label>
            <input
              type="text"
              id="courseTitle"
              value={courseTitle}
              onChange={(e) => setCourseTitle(e.target.value)}
              className={styles.formInput}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="courseDescription">Description</label>
            <textarea
              id="courseDescription"
              value={courseDescription}
              onChange={(e) => setCourseDescription(e.target.value)}
              className={styles.formTextarea}
              rows={6}
            ></textarea>
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="courseInstructor">Instructor</label>
            <input
              type="text"
              id="courseInstructor"
              value={courseInstructor}
              onChange={(e) => setCourseInstructor(e.target.value)}
              className={styles.formInput}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="courseStatus">Status</label>
            <select
              id="courseStatus"
              value={courseStatus}
              onChange={(e) => setCourseStatus(e.target.value)}
              className={styles.formSelect}
            >
              <option value="ACTIVE">Active</option>
              <option value="DRAFT">Draft</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
          
          <div className={styles.formActions}>
            <button 
              className={styles.saveButton} 
              onClick={handleSaveCourse}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Course Details'}
            </button>
          </div>
        </div>
      );
    } else if (activeTab === 'modules') {
      return (
        <div className={styles.moduleContent}>
          <div className={styles.moduleEditorHeader}>
            <h2 className={styles.sectionTitle}>
              {activeModuleId 
                ? `Edit Module: ${currentModuleTitle}` 
                : 'Select a module to edit'}
            </h2>
            
            <button 
              className={styles.addButton} 
              onClick={handleAddModule}
              disabled={isSaving}
            >
              + Add New Module
            </button>
          </div>
          
          {activeModuleId && (
            <>
              <div className={styles.formGroup}>
                <label htmlFor="moduleTitle">Module Title</label>
                <input
                  type="text"
                  id="moduleTitle"
                  value={currentModuleTitle}
                  onChange={(e) => setCurrentModuleTitle(e.target.value)}
                  className={styles.formInput}
                />
              </div>
              
              <div className={styles.formActions}>
                <button 
                  className={styles.deleteButton} 
                  onClick={() => handleDeleteModule(activeModuleId)}
                  disabled={isSaving}
                >
                  Delete Module
                </button>
                <button 
                  className={styles.saveButton} 
                  onClick={handleSaveModule}
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save Module'}
                </button>
              </div>
            </>
          )}
        </div>
      );
    } else if (activeTab === 'lessons') {
      return (
        <div className={styles.lessonContent}>
          <div className={styles.lessonEditorHeader}>
            <h2 className={styles.sectionTitle}>
              {activeLessonId 
                ? `Edit Lesson: ${currentLessonTitle}` 
                : 'Select a lesson to edit'}
            </h2>
            
            {activeModuleId && (
              <button 
                className={styles.addButton} 
                onClick={handleAddLesson}
                disabled={isSaving}
              >
                + Add New Lesson
              </button>
            )}
          </div>
          
          {activeLessonId && (
            <>
              <div className={styles.formGroup}>
                <label htmlFor="lessonTitle">Lesson Title</label>
                <input
                  type="text"
                  id="lessonTitle"
                  value={currentLessonTitle}
                  onChange={(e) => setCurrentLessonTitle(e.target.value)}
                  className={styles.formInput}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="lessonContent">Content (HTML)</label>
                <textarea
                  id="lessonContent"
                  value={currentLessonContent}
                  onChange={(e) => setCurrentLessonContent(e.target.value)}
                  className={styles.formTextarea}
                  rows={15}
                ></textarea>
              </div>
              
              <div className={styles.contentPreview}>
                <h3 className={styles.previewTitle}>Content Preview</h3>
                <div 
                  className={styles.previewContent}
                  dangerouslySetInnerHTML={{ __html: currentLessonContent }}
                ></div>
              </div>
              
              <div className={styles.formActions}>
                <button 
                  className={styles.deleteButton} 
                  onClick={() => handleDeleteLesson(activeLessonId)}
                  disabled={isSaving}
                >
                  Delete Lesson
                </button>
                <button 
                  className={styles.saveButton} 
                  onClick={handleSaveLesson}
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save Lesson'}
                </button>
              </div>
            </>
          )}
        </div>
      );
    }
  };
  
  if (loading || isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Spin size="large" />
        <p className={styles.loadingText}>Loading course content...</p>
      </div>
    );
  }
  
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Edit Course: {courseData?.title}</h1>
          <div className={styles.actions}>
            <Link href="/admin/dashboard" className={styles.backButton}>
              Back to Dashboard
            </Link>
            <Link href={`/course/${id}`} className={styles.viewButton} target="_blank">
              View Course
            </Link>
          </div>
        </div>
      </header>
      
      <div className={styles.content}>
        <div className={styles.tabsContainer}>
          <Tabs 
            activeKey={activeTab} 
            onChange={setActiveTab}
            tabBarStyle={{ marginBottom: '24px' }}
          >
            <TabPane tab="Course Details" key="details" />
            <TabPane tab="Modules" key="modules" />
            <TabPane tab="Lessons" key="lessons" />
          </Tabs>
        </div>
        
        <div className={styles.editorContainer}>
          <div className={styles.sidebarNav}>
            {activeTab === 'modules' && (
              <div className={styles.moduleList}>
                <h3 className={styles.sidebarTitle}>Modules</h3>
                <ul className={styles.navList}>
                  {courseData?.modules.map((module) => (
                    <li 
                      key={module.id} 
                      className={`${styles.navItem} ${activeModuleId === module.id ? styles.active : ''}`}
                      onClick={() => handleModuleClick(module.id)}
                    >
                      {module.title}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {activeTab === 'lessons' && (
              <>
                <div className={styles.moduleSelect}>
                  <h3 className={styles.sidebarTitle}>Select Module</h3>
                  <select
                    className={styles.formSelect}
                    value={activeModuleId || ''}
                    onChange={(e) => handleModuleClick(Number(e.target.value))}
                  >
                    <option value="">-- Select a module --</option>
                    {courseData?.modules.map((module) => (
                      <option key={module.id} value={module.id}>
                        {module.title}
                      </option>
                    ))}
                  </select>
                </div>
                
                {activeModuleId && (
                  <div className={styles.lessonList}>
                    <h3 className={styles.sidebarTitle}>Lessons</h3>
                    <ul className={styles.navList}>
                      {courseData?.modules
                        .find(m => m.id === activeModuleId)
                        ?.lessons.map((lesson) => (
                          <li 
                            key={lesson.id} 
                            className={`${styles.navItem} ${activeLessonId === lesson.id ? styles.active : ''}`}
                            onClick={() => handleLessonClick(lesson.id)}
                          >
                            {lesson.title}
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
          
          <div className={styles.editorContent}>
            {renderContentEditor()}
          </div>
        </div>
      </div>
    </div>
  );
} 