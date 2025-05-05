'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';

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
  const { loading } = useAuth();
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch from backend API
        const response = await fetch(`http://localhost:23001/courses/${id}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch course data: ${response.statusText}`);
        }
        
        const data = await response.json();
        setCourseData(data);
        
        // Set the first module as selected by default if there are modules
        if (data.modules && data.modules.length > 0) {
          setSelectedModule(data.modules[0].id);
          
          // Set the first lesson as selected by default if there are lessons
          if (data.modules[0].lessons && data.modules[0].lessons.length > 0) {
            setSelectedLesson(data.modules[0].lessons[0].id);
          }
        }
      } catch (error) {
        console.error('Error fetching course data:', error);
        setError('Failed to load course data');
      } finally {
        setIsLoading(false);
      }
    };

    if (id && !loading) {
      fetchCourseData();
    }
  }, [id, loading]);

  const handleModuleSelect = (moduleId: string) => {
    setSelectedModule(moduleId);
    
    // Select the first lesson of the module by default
    const courseModule = courseData?.modules.find(m => m.id === moduleId);
    if (courseModule && courseModule.lessons.length > 0) {
      setSelectedLesson(courseModule.lessons[0].id);
    } else {
      setSelectedLesson(null);
    }
  };

  const handleLessonSelect = (lessonId: string) => {
    setSelectedLesson(lessonId);
  };

  const getCurrentLessonContent = () => {
    if (!selectedModule || !selectedLesson) return null;
    
    const courseModule = courseData?.modules.find(m => m.id === selectedModule);
    if (!courseModule) return null;
    
    const lesson = courseModule.lessons.find(l => l.id === selectedLesson);
    return lesson?.content || null;
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-100 text-red-700 p-4 rounded-md max-w-lg text-center">
          <h3 className="text-lg font-medium">Error</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!courseData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-yellow-100 text-yellow-700 p-4 rounded-md max-w-lg text-center">
          <h3 className="text-lg font-medium">Course Not Found</h3>
          <p>The requested course could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Course Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900">{courseData.title}</h1>
          <p className="mt-2 text-sm text-gray-600">Instructor: {courseData.instructor}</p>
        </div>
      </div>
      
      {/* Course Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar - Module and Lesson Navigation */}
          <div className="w-full md:w-1/4">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b">
                <h2 className="font-medium text-gray-900">Course Content</h2>
              </div>
              <div className="divide-y">
                {courseData.modules.map((courseModule) => (
                  <div key={courseModule.id} className="p-0">
                    <button
                      className={`w-full text-left p-3 font-medium ${
                        selectedModule === courseModule.id ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                      }`}
                      onClick={() => handleModuleSelect(courseModule.id)}
                    >
                      {courseModule.title}
                    </button>
                    
                    {selectedModule === courseModule.id && (
                      <div className="ml-4 border-l border-gray-200 pl-3 py-2">
                        {courseModule.lessons.map((lesson) => (
                          <button
                            key={lesson.id}
                            className={`w-full text-left py-2 px-2 text-sm ${
                              selectedLesson === lesson.id ? 'bg-blue-50 text-blue-700 rounded' : 'text-gray-600'
                            }`}
                            onClick={() => handleLessonSelect(lesson.id)}
                          >
                            {lesson.title}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Main Content - Lesson Content */}
          <div className="w-full md:w-3/4">
            <div className="bg-white rounded-lg shadow p-6">
              {getCurrentLessonContent() ? (
                <div dangerouslySetInnerHTML={{ __html: getCurrentLessonContent() || '' }} />
              ) : (
                <div className="text-center p-4 text-gray-500">
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