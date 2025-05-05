'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import Link from 'next/link';
import { Badge, Button, Card, List, Avatar, Input, Tag } from 'antd';
import { MessageOutlined, ClockCircleOutlined, BookOutlined, BellOutlined } from '@ant-design/icons';

export default function StudentDashboard() {
  const { user, loading, signout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  
  // Mock data for demo purposes
  const nextWorkshop = {
    title: "Advanced Cognitive Techniques",
    date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
    link: "/workshop/adv-cognitive-techniques",
    instructor: "Dr. Sarah Johnson"
  };
  
  const upcomingSessions = [
    {
      id: 1,
      title: "Behavioral Activation Techniques",
      course: "Cognitive Behavioral Therapy",
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      instructor: "Dr. Michael Brown",
      link: "/session/beh-activation-techniques"
    },
    {
      id: 2,
      title: "Mindfulness and Stress Reduction",
      course: "Mental Health Fundamentals",
      date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      instructor: "Dr. Emily Wilson",
      link: "/session/mindfulness-stress-reduction"
    }
  ];
  
  const pendingHomework = [
    {
      id: 1,
      title: "CBT Case Study Analysis",
      course: "Cognitive Behavioral Therapy",
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      status: "Not Started",
      link: "/homework/cbt-case-study"
    },
    {
      id: 2,
      title: "Reflective Journal Entry",
      course: "Mental Health Fundamentals",
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      status: "In Progress",
      link: "/homework/reflective-journal"
    }
  ];
  
  const recentMessages = [
    {
      id: 1,
      sender: "Dr. Sarah Johnson",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      message: "Don't forget to complete your CBT case study by Friday!",
      time: "2 hours ago",
      unread: true
    },
    {
      id: 2,
      sender: "Study Group",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      message: "Let's meet online tomorrow to discuss the journal entries.",
      time: "Yesterday",
      unread: false
    }
  ];
  
  useEffect(() => {
    // Check authentication
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);
  
  // Countdown timer for next workshop
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = nextWorkshop.date.getTime() - now;
      
      if (distance < 0) {
        clearInterval(timer);
        return;
      }
      
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      
      setTimeLeft({ days, hours, minutes, seconds });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [nextWorkshop.date]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
          <div className="flex items-center space-x-4">
            <Badge count={3} size="small">
              <BellOutlined style={{ fontSize: '18px', cursor: 'pointer' }} />
            </Badge>
            <span className="text-sm text-gray-600">
              Welcome, {user.displayName || user.email}
            </span>
            <button
              onClick={signout}
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
                activeTab === 'dashboard'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              onClick={() => setActiveTab('dashboard')}
            >
              Dashboard
            </button>
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
            <button
              className={`${
                activeTab === 'messages'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
              onClick={() => setActiveTab('messages')}
            >
              Messages
              <Badge count={2} size="small" className="ml-2" />
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Next Workshop Card with Countdown */}
            <div className="lg:col-span-2">
              <Card 
                title={
                  <div className="flex items-center">
                    <ClockCircleOutlined className="mr-2 text-blue-500" />
                    <span>Next Workshop</span>
                  </div>
                }
                className="shadow-md hover:shadow-lg transition-shadow"
              >
                <h3 className="text-xl font-semibold mb-2">{nextWorkshop.title}</h3>
                <p className="text-gray-600 mb-4">
                  Instructor: {nextWorkshop.instructor} <br />
                  {formatDate(nextWorkshop.date)}
                </p>
                
                <div className="grid grid-cols-4 gap-2 mb-4">
                  <div className="text-center p-2 bg-blue-50 rounded">
                    <div className="text-2xl font-bold text-blue-600">{timeLeft.days}</div>
                    <div className="text-xs text-gray-500">Days</div>
                  </div>
                  <div className="text-center p-2 bg-blue-50 rounded">
                    <div className="text-2xl font-bold text-blue-600">{timeLeft.hours}</div>
                    <div className="text-xs text-gray-500">Hours</div>
                  </div>
                  <div className="text-center p-2 bg-blue-50 rounded">
                    <div className="text-2xl font-bold text-blue-600">{timeLeft.minutes}</div>
                    <div className="text-xs text-gray-500">Minutes</div>
                  </div>
                  <div className="text-center p-2 bg-blue-50 rounded">
                    <div className="text-2xl font-bold text-blue-600">{timeLeft.seconds}</div>
                    <div className="text-xs text-gray-500">Seconds</div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <Button type="primary" href={nextWorkshop.link}>
                    Join Workshop
                  </Button>
                  <a className="text-blue-600 hover:underline" href={`${nextWorkshop.link}/materials`}>
                    View preparatory materials
                  </a>
                </div>
              </Card>
              
              {/* Upcoming Sessions */}
              <div className="mt-6">
                <Card 
                  title={
                    <div className="flex items-center">
                      <ClockCircleOutlined className="mr-2 text-blue-500" />
                      <span>Upcoming Live Sessions</span>
                    </div>
                  }
                  className="shadow-md"
                >
                  <List
                    itemLayout="horizontal"
                    dataSource={upcomingSessions}
                    renderItem={item => (
                      <List.Item
                        key={item.id}
                        actions={[
                          <Button type="primary" size="small" key="join" href={item.link}>
                            Join
                          </Button>
                        ]}
                      >
                        <List.Item.Meta
                          title={<a href={item.link}>{item.title}</a>}
                          description={
                            <div>
                              <p><strong>{item.course}</strong></p>
                              <p>
                                Instructor: {item.instructor}<br />
                                {formatDate(item.date)}
                              </p>
                            </div>
                          }
                        />
                      </List.Item>
                    )}
                  />
                </Card>
              </div>
            </div>
            
            {/* Sidebar - Pending Homework and Messages */}
            <div className="space-y-6">
              {/* Pending Homework */}
              <Card 
                title={
                  <div className="flex items-center">
                    <BookOutlined className="mr-2 text-blue-500" />
                    <span>Pending Homework</span>
                  </div>
                }
                className="shadow-md"
              >
                <List
                  itemLayout="vertical"
                  dataSource={pendingHomework}
                  renderItem={item => (
                    <List.Item
                      key={item.id}
                      extra={
                        <Tag 
                          color={item.status === 'Not Started' ? 'red' : 'orange'}
                        >
                          {item.status}
                        </Tag>
                      }
                    >
                      <List.Item.Meta
                        title={<a href={item.link}>{item.title}</a>}
                        description={
                          <div>
                            <p>{item.course}</p>
                            <p className="text-red-600">Due: {formatDate(item.dueDate)}</p>
                          </div>
                        }
                      />
                      <Button type="default" size="small" href={item.link}>
                        {item.status === 'Not Started' ? 'Start Assignment' : 'Continue Assignment'}
                      </Button>
                    </List.Item>
                  )}
                />
              </Card>
              
              {/* Recent Messages */}
              <Card 
                title={
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <MessageOutlined className="mr-2 text-blue-500" />
                      <span>Recent Messages</span>
                    </div>
                    <Badge count={2} />
                  </div>
                }
                className="shadow-md"
              >
                <List
                  itemLayout="horizontal"
                  dataSource={recentMessages}
                  renderItem={item => (
                    <List.Item key={item.id}>
                      <List.Item.Meta
                        avatar={<Avatar src={item.avatar} />}
                        title={
                          <div className="flex justify-between">
                            <span>{item.sender}</span>
                            <span className="text-xs text-gray-500">{item.time}</span>
                          </div>
                        }
                        description={
                          <div className="flex items-start">
                            <p className="mr-2">{item.message}</p>
                            {item.unread && <Badge color="blue" />}
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
                <div className="mt-4 text-center">
                  <Button type="link" onClick={() => setActiveTab('messages')}>
                    View all messages
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        )}

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
        
        {activeTab === 'messages' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Messages</h2>
            
            <div className="bg-white rounded-lg shadow-md p-0 overflow-hidden">
              <div className="flex h-[600px]">
                {/* Chat List Sidebar */}
                <div className="w-1/3 border-r overflow-y-auto">
                  <div className="p-4 border-b">
                    <Input.Search placeholder="Search messages..." />
                  </div>
                  <List
                    dataSource={[
                      {
                        id: 1,
                        name: 'Dr. Sarah Johnson',
                        avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
                        lastMessage: 'Don&apos;t forget to complete your CBT case study by Friday!',
                        time: '2h',
                        unread: true
                      },
                      {
                        id: 2,
                        name: 'Study Group',
                        avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
                        lastMessage: 'Let&apos;s meet online tomorrow to discuss the journal entries.',
                        time: '1d',
                        unread: false
                      },
                      {
                        id: 3,
                        name: 'Tech Support',
                        avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
                        lastMessage: 'Your issue has been resolved. Let me know if you need anything else.',
                        time: '2d',
                        unread: false
                      },
                    ]}
                    renderItem={item => (
                      <List.Item
                        key={item.id}
                        className={`cursor-pointer hover:bg-gray-50 ${item.unread ? 'bg-blue-50' : ''}`}
                        style={{ padding: '12px 16px' }}
                      >
                        <List.Item.Meta
                          avatar={<Avatar src={item.avatar} />}
                          title={
                            <div className="flex justify-between">
                              <span className={item.unread ? 'font-bold' : ''}>{item.name}</span>
                              <span className="text-xs text-gray-500">{item.time}</span>
                            </div>
                          }
                          description={
                            <div className="flex justify-between">
                              <p className={`truncate ${item.unread ? 'font-semibold text-gray-900' : 'text-gray-500'}`} style={{ maxWidth: '180px' }}>
                                {item.lastMessage}
                              </p>
                              {item.unread && <Badge color="blue" />}
                            </div>
                          }
                        />
                      </List.Item>
                    )}
                  />
                </div>
                
                {/* Chat Window */}
                <div className="w-2/3 flex flex-col">
                  <div className="p-4 border-b flex items-center">
                    <Avatar src="https://randomuser.me/api/portraits/women/44.jpg" size="large" />
                    <div className="ml-3">
                      <h3 className="font-medium">Dr. Sarah Johnson</h3>
                      <p className="text-xs text-green-500">Online</p>
                    </div>
                  </div>
                  
                  <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                    <div className="space-y-4">
                      <div className="flex justify-start">
                        <div className="bg-white p-3 rounded-lg shadow-sm max-w-xs">
                          <p className="text-sm">Hi there! How&apos;s your progress on the CBT case study?</p>
                          <p className="text-xs text-gray-500 mt-1">10:30 AM</p>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <div className="bg-blue-500 p-3 rounded-lg shadow-sm text-white max-w-xs">
                          <p className="text-sm">I&apos;m about halfway through. Had some questions about the analysis section.</p>
                          <p className="text-xs text-blue-100 mt-1">10:35 AM</p>
                        </div>
                      </div>
                      <div className="flex justify-start">
                        <div className="bg-white p-3 rounded-lg shadow-sm max-w-xs">
                          <p className="text-sm">Let me know what questions you have. Don&apos;t forget it&apos;s due this Friday!</p>
                          <p className="text-xs text-gray-500 mt-1">10:42 AM</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 border-t">
                    <div className="flex">
                      <Input placeholder="Type a message..." className="mr-2" />
                      <Button type="primary">Send</Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 