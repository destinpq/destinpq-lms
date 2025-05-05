'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import styles from './course.module.css';

interface CourseData {
  id?: string;
  title: string;
  description: string;
  instructor: string;
  modules: Array<{
    id: string;
    title: string;
    lessons: Array<{
      id: string;
      title: string;
      content: string;
    }>;
  }>;
}

export default function CoursePage() {
  const { id } = useParams();
  const { loading, user } = useAuth();
  const router = useRouter();
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);

  // Debug log to check what's happening
  useEffect(() => {
    console.log('Current state:', { 
      courseId: id, 
      selectedModule, 
      selectedLesson,
      modulesCount: courseData?.modules?.length || 0,
      selectedModuleLessons: courseData?.modules?.find(m => m.id === selectedModule)?.lessons?.length || 0
    });
  }, [id, selectedModule, selectedLesson, courseData]);

  useEffect(() => {
    // Check authentication
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Try to fetch from backend API first
        let data;
        try {
          console.log('Fetching course data from API:', id);
          const response = await fetch(`http://localhost:4001/courses/${id}`);
          
          if (response.ok) {
            data = await response.json();
            console.log('Fetched course data from API:', data);
          } else {
            console.warn('API returned error status:', await response.text());
          }
        } catch (error) {
          console.warn('Backend API fetch failed:', error);
        }
        
        // If API fetch failed, use generic mock data
        if (!data) {
          console.log('Using mock data for course:', id);
          
          // Generic mock data for any course
          data = {
            id: id as string,
            title: 'Course Content',
            description: 'This course content will be loaded from a database in the future.',
            instructor: 'Course Instructor',
            modules: [
              {
                id: 'module1',
                title: 'Module 1: Introduction',
                lessons: [
                  {
                    id: 'lesson1-1',
                    title: 'Welcome to the Course',
                    content: `
                      <h2>Welcome to the Course</h2>
                      <p>This content would normally be loaded from a database. The system is currently using mock data.</p>
                      <p>Please select a module from the sidebar to continue.</p>
                    `
                  }
                ]
              }
            ]
          };
        }
        
        setCourseData(data);
        
        // Set first module and lesson as selected by default
        if (data.modules && data.modules.length > 0) {
          const firstModule = data.modules[0];
          console.log('Setting first module:', firstModule.id);
          setSelectedModule(firstModule.id);
          
          if (firstModule.lessons && firstModule.lessons.length > 0) {
            const firstLesson = firstModule.lessons[0];
            console.log('Setting first lesson:', firstLesson.id);
            setSelectedLesson(firstLesson.id);
          } else {
            console.log('No lessons found in first module');
          }
        } else {
          console.log('No modules found in course data');
        }
      } catch (error) {
        console.error('Error preparing course data:', error);
        setError('Failed to load course data');
      } finally {
        setIsLoading(false);
      }
    };

    if (id && !loading && user) {
      fetchCourseData();
    }
  }, [id, loading, user, router]);

  // Don't auto-select module/lesson on course data changes to prevent overriding user selections
  // The initial selection is handled in the fetchCourseData function

  const handleModuleSelect = (moduleId: string) => {
    console.log('Module selected:', moduleId);
    setSelectedModule(moduleId);
    
    // Select the first lesson of the module by default
    const courseModule = courseData?.modules.find(m => m.id === moduleId);
    if (courseModule && courseModule.lessons && courseModule.lessons.length > 0) {
      const firstLesson = courseModule.lessons[0];
      console.log('Auto-selecting first lesson:', firstLesson.id);
      setSelectedLesson(firstLesson.id);
    } else {
      console.log('No lessons found in selected module');
      setSelectedLesson(null);
    }
  };

  const handleLessonSelect = (lessonId: string) => {
    console.log('Lesson selected:', lessonId);
    setSelectedLesson(lessonId);
  };

  const getCurrentLessonContent = () => {
    if (!selectedModule || !selectedLesson) {
      console.log('No module or lesson selected');
      return null;
    }
    
    const courseModule = courseData?.modules.find(m => m.id === selectedModule);
    if (!courseModule) {
      console.log('Selected module not found:', selectedModule);
      return null;
    }
    
    const lesson = courseModule.lessons.find(l => l.id === selectedLesson);
    if (!lesson) {
      console.log('Selected lesson not found:', selectedLesson);
      return null;
    }
    
    return lesson.content;
  };

  if (loading || isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorMessage}>
          <h3 className={styles.errorTitle}>Error</h3>
          <p>{error}</p>
          <button 
            onClick={() => router.push('/student/dashboard')}
            className={styles.button}
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!courseData) {
    return (
      <div className={styles.notFoundContainer}>
        <div className={styles.notFoundMessage}>
          <h3 className={styles.notFoundTitle}>Course Not Found</h3>
          <p>The requested course could not be found.</p>
          <button 
            onClick={() => router.push('/student/dashboard')}
            className={styles.button}
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Debug: Display course structure in the console
  console.log('Course structure:', {
    modules: courseData?.modules?.map(m => ({
      id: m.id,
      title: m.title,
      lessons: m.lessons?.map(l => ({ id: l.id, title: l.title })) || []
    })) || []
  });

  return (
    <div className={styles.container}>
      {/* Course Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>{courseData.title}</h1>
          <p className={styles.instructor}>Instructor: {courseData.instructor}</p>
        </div>
      </div>
      
      {/* Course Content */}
      <div className={styles.content}>
        <div className={styles.contentGrid}>
          {/* Sidebar - Module and Lesson Navigation */}
          <div className={styles.sidebar}>
            <div className={styles.moduleNavigation}>
              <div className={styles.navigationHeader}>
                <h2 className={styles.navigationTitle}>Course Content</h2>
              </div>
              <div className={styles.moduleList}>
                {courseData.modules && courseData.modules.map((courseModule) => (
                  <div key={courseModule.id} className={styles.moduleItem}>
                    <button
                      className={`${styles.moduleButton} ${
                        selectedModule === courseModule.id ? styles.moduleButtonActive : ''
                      }`}
                      onClick={() => handleModuleSelect(courseModule.id)}
                    >
                      {courseModule.title}
                    </button>
                    
                    {selectedModule === courseModule.id && courseModule.lessons && courseModule.lessons.length > 0 ? (
                      <div className={styles.lessonList}>
                        {courseModule.lessons.map((lesson) => (
                          <button
                            key={lesson.id}
                            className={`${styles.lessonButton} ${
                              selectedLesson === lesson.id ? styles.lessonButtonActive : ''
                            }`}
                            onClick={() => handleLessonSelect(lesson.id)}
                          >
                            {lesson.title}
                          </button>
                        ))}
                      </div>
                    ) : (
                      selectedModule === courseModule.id && (
                        <div className={styles.lessonList}>
                          <div className={styles.placeholderMessage}>
                            No lessons available for this module
                          </div>
                        </div>
                      )
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Main Content - Lesson Content */}
          <div className={styles.mainContent}>
            <div className={styles.lessonContent}>
              {getCurrentLessonContent() ? (
                <div dangerouslySetInnerHTML={{ __html: getCurrentLessonContent() || '' }} />
              ) : (
                <div className={styles.placeholderMessage}>
                  Please select a lesson to view content
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 