'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import Link from 'next/link';
import { SafeUserDisplay } from '@/app/_debug/debug-render';

export default function InstructorDashboard() {
  const { user, userRole, loading, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('courses');
  
  useEffect(() => {
    // Redirect if not authenticated or not an instructor
    if (!loading && (!user || userRole !== 'instructor')) {
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

  if (!user || typeof user !== 'object') {
    return null; // Will redirect via useEffect or handle invalid user object
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Instructor Dashboard</h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <span className="mr-4 text-gray-700">
                Welcome, <SafeUserDisplay user={user} fallback="Instructor" />
              </span>
              <button 
                onClick={logout}
                className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded-md text-sm"
              >
                Logout
              </button>
            </div>
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
                activeTab === 'students'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              onClick={() => setActiveTab('students')}
            >
              Student Management
            </button>
            <button
              className={`${
                activeTab === 'announcements'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              onClick={() => setActiveTab('announcements')}
            >
              Announcements
            </button>
            <button
              className={`${
                activeTab === 'analytics'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              onClick={() => setActiveTab('analytics')}
            >
              Analytics
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'courses' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">My Courses</h2>
              <Link 
                href="/instructor/courses/create" 
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors"
              >
                Create New Course
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Course cards will be populated from database */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-medium">Cognitive Behavioral Techniques</h3>
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Published</span>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">
                    Learn about cognitive behavioral therapy techniques and applications.
                  </p>
                  <div className="mt-4 flex justify-between items-center">
                    <Link 
                      href="/instructor/courses/edit/sample-course-id" 
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Edit Course
                    </Link>
                    <span className="text-sm text-gray-600">24 Students</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-medium">Neuroscience Fundamentals</h3>
                    <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">Draft</span>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">
                    A deep dive into brain structure, functions, and their impact on behavior.
                  </p>
                  <div className="mt-4 flex justify-between items-center">
                    <Link 
                      href="/instructor/courses/edit/sample-course-id-2" 
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Edit Course
                    </Link>
                    <span className="text-sm text-gray-600">Not published</span>
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
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-800">
                            Start Session
                          </button>
                          <button className="text-gray-600 hover:text-gray-800">
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'students' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Student Management</h2>
            
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4 border-b">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Enrolled Students</h3>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Search students..."
                      className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                    />
                    <select className="border border-gray-300 rounded-md px-3 py-1 text-sm">
                      <option>All Courses</option>
                      <option>Cognitive Behavioral Techniques</option>
                      <option>Neuroscience Fundamentals</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Course
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Progress
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Activity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-sm">
                          JS
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">John Smith</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      john.smith@example.com
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      Cognitive Behavioral Techniques
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-24 bg-gray-200 rounded-full h-2.5">
                        <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '45%' }}></div>
                      </div>
                      <span className="text-xs text-gray-500">45%</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      Oct 10, 2023
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button className="text-blue-600 hover:text-blue-800">
                        View Details
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-sm">
                          MJ
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">Mary Johnson</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      mary.johnson@example.com
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      Cognitive Behavioral Techniques
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-24 bg-gray-200 rounded-full h-2.5">
                        <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '75%' }}></div>
                      </div>
                      <span className="text-xs text-gray-500">75%</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      Oct 12, 2023
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button className="text-blue-600 hover:text-blue-800">
                        View Details
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
              
              <div className="px-4 py-3 bg-gray-50 flex justify-between items-center">
                <div className="text-sm text-gray-700">
                  Showing <span className="font-medium">1</span> to <span className="font-medium">2</span> of <span className="font-medium">2</span> results
                </div>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 border border-gray-300 bg-white text-sm text-gray-500 rounded-md opacity-50 cursor-not-allowed">
                    Previous
                  </button>
                  <button className="px-3 py-1 border border-gray-300 bg-white text-sm text-gray-500 rounded-md opacity-50 cursor-not-allowed">
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'announcements' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Announcements</h2>
              <Link 
                href="/instructor/announcements/create" 
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors"
              >
                Create Announcement
              </Link>
            </div>
            
            <div className="space-y-4">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-medium">Live Session Schedule Update</h3>
                  <span className="text-sm text-gray-500">Posted: Oct 5, 2023</span>
                </div>
                <p className="mt-2 text-gray-600">
                  The next live session for Cognitive Behavioral Techniques has been rescheduled to October 15th at 10:00 AM. 
                  Please make sure to update your calendars. Looking forward to seeing everyone there!
                </p>
                <div className="mt-4 flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                      Cognitive Behavioral Techniques
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <button className="text-gray-600 hover:text-gray-800 text-sm">
                      Edit
                    </button>
                    <button className="text-red-600 hover:text-red-800 text-sm">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-medium">New Course Materials Available</h3>
                  <span className="text-sm text-gray-500">Posted: Sep 28, 2023</span>
                </div>
                <p className="mt-2 text-gray-600">
                  New supplementary materials have been added to the Neuroscience Fundamentals course. 
                  These include additional readings on brain structure and a new video on neural pathways.
                </p>
                <div className="mt-4 flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                      Neuroscience Fundamentals
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <button className="text-gray-600 hover:text-gray-800 text-sm">
                      Edit
                    </button>
                    <button className="text-red-600 hover:text-red-800 text-sm">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Analytics & Insights</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg shadow-md">
                <h3 className="text-sm font-medium text-gray-500">Total Students</h3>
                <p className="text-2xl font-bold mt-1">24</p>
                <span className="text-sm text-green-600">↑ 8% this month</span>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-md">
                <h3 className="text-sm font-medium text-gray-500">Course Completion Rate</h3>
                <p className="text-2xl font-bold mt-1">68%</p>
                <span className="text-sm text-green-600">↑ 5% vs. previous</span>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-md">
                <h3 className="text-sm font-medium text-gray-500">Quiz Average Score</h3>
                <p className="text-2xl font-bold mt-1">76%</p>
                <span className="text-sm text-gray-600">No change</span>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-md">
                <h3 className="text-sm font-medium text-gray-500">Live Session Attendance</h3>
                <p className="text-2xl font-bold mt-1">82%</p>
                <span className="text-sm text-green-600">↑ 12% vs. previous</span>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-medium mb-4">Course Engagement</h3>
              <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Course engagement chart will be displayed here</p>
              </div>
            </div>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-medium mb-4">Most Active Students</h3>
                <ul className="space-y-3">
                  <li className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-sm">
                        MJ
                      </div>
                      <span className="ml-2 text-sm font-medium">Mary Johnson</span>
                    </div>
                    <span className="text-sm text-gray-500">42 activities</span>
                  </li>
                  <li className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-sm">
                        JS
                      </div>
                      <span className="ml-2 text-sm font-medium">John Smith</span>
                    </div>
                    <span className="text-sm text-gray-500">38 activities</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-medium mb-4">Quiz Performance</h3>
                <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Quiz performance chart will be displayed here</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 