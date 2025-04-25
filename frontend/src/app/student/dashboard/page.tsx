'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import Link from 'next/link';

export default function StudentDashboard() {
  const { user, userRole, loading, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('courses');
  
  useEffect(() => {
    // Redirect if not authenticated or not a student
    if (!loading && (!user || userRole !== 'student')) {
      router.push('/login');
    }
  }, [user, userRole, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user || userRole !== 'student') {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              Welcome, {user.displayName || user.email}
            </span>
            <button
              onClick={logout}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              className={`${
                activeTab === 'courses'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              onClick={() => setActiveTab('courses')}
            >
              My Courses
            </button>
            <button
              className={`${
                activeTab === 'achievements'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              onClick={() => setActiveTab('achievements')}
            >
              Achievements
            </button>
            <button
              className={`${
                activeTab === 'certificate'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              onClick={() => setActiveTab('certificate')}
            >
              Certificates
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'courses' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">My Enrolled Courses</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Course cards will be populated from database */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-4">
                  <h3 className="text-lg font-medium">Cognitive Behavioral Techniques</h3>
                  <div className="mt-2 h-2 bg-gray-200 rounded">
                    <div className="h-2 bg-green-500 rounded w-1/3"></div>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">Progress: 33%</p>
                  <div className="mt-4">
                    <Link 
                      href="/course/sample-course-id" 
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Continue Learning →
                    </Link>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-4">
                  <h3 className="text-lg font-medium">Neuroscience Fundamentals</h3>
                  <div className="mt-2 h-2 bg-gray-200 rounded">
                    <div className="h-2 bg-green-500 rounded w-1/2"></div>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">Progress: 50%</p>
                  <div className="mt-4">
                    <Link 
                      href="/course/sample-course-id-2" 
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Continue Learning →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-2">Upcoming Live Sessions</h3>
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Course
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Session
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Cognitive Behavioral Techniques
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        Oct 15, 2023 - 10:00 AM
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        Behavioral Activation Techniques
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button className="text-blue-600 hover:text-blue-800">
                          Join Session
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">My Achievements</h2>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-medium">Your Learning Points</h3>
                  <p className="text-3xl font-bold text-blue-600 mt-1">450</p>
                </div>
                <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm">
                  Level 3 Learner
                </div>
              </div>
              
              <h3 className="text-lg font-medium mb-3">Badges Earned</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex flex-col items-center p-3 border rounded-lg">
                  <div className="h-16 w-16 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-500 mb-2">
                    🏆
                  </div>
                  <span className="text-sm font-medium">First Quiz Completed</span>
                </div>
                <div className="flex flex-col items-center p-3 border rounded-lg">
                  <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center text-green-500 mb-2">
                    📚
                  </div>
                  <span className="text-sm font-medium">Active Learner</span>
                </div>
                <div className="flex flex-col items-center p-3 border rounded-lg opacity-40">
                  <div className="h-16 w-16 bg-purple-100 rounded-full flex items-center justify-center text-purple-500 mb-2">
                    🧠
                  </div>
                  <span className="text-sm font-medium">Neuroscience Expert</span>
                </div>
                <div className="flex flex-col items-center p-3 border rounded-lg opacity-40">
                  <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-500 mb-2">
                    💬
                  </div>
                  <span className="text-sm font-medium">Discussion Leader</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'certificate' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">My Certificates</h2>
            
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-medium mb-2">You haven&apos;t earned any certificates yet</h3>
                <p className="text-gray-600 mb-4">
                  Complete a course to earn your first certificate. Certificates are awarded when you finish
                  all modules and pass the required assessments.
                </p>
                <button 
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  onClick={() => setActiveTab('courses')}
                >
                  Go to my courses →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 