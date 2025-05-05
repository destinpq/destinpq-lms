'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import Link from 'next/link';
import { Badge, Button, Card, List, Avatar, Tag, Empty, Spin, Progress, Statistic } from 'antd';
import { MessageOutlined, ClockCircleOutlined, BookOutlined, BellOutlined, RightOutlined, TeamOutlined, FileTextOutlined, VideoCameraOutlined, CheckCircleOutlined, TrophyOutlined, BarChartOutlined } from '@ant-design/icons';
import styles from './dashboard.module.css';
import courseStyles from './courses.module.css';
import achievementStyles from './achievements.module.css';
import certificatesStyles from './certificates.module.css';
import messagesStyles from './messages.module.css';
import Countdown from '@/app/components/Countdown/Countdown';
import { SafeUserDisplay } from '@/app/_debug/debug-render';
import { safeSenderName, safeImageUrl } from '@/app/_debug/safe-render-utils';

// Types for data
interface Workshop {
  id: number;
  title: string;
  startDate: Date;
  endDate: Date;
  durationWeeks: number;
  link: string;
  instructor: string;
  sessions?: WorkshopSession[];
}

interface WorkshopSession {
  id: number;
  title: string;
  scheduledAt: Date;
  workshopId: number;
  durationMinutes: number;
  meetingUrl?: string;
  isRecorded: boolean;
}

interface LiveSession {
  id: number;
  title: string;
  workshopTitle: string; // Parent workshop title
  scheduledAt: Date;
  instructor: string;
  link: string;
}

interface HomeworkAssignment {
  id: number;
  title: string;
  course: string;
  dueDate: Date;
  status: string;
  link: string;
}

interface Message {
  id: number;
  sender: string | {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  avatar?: string;
  message?: string;
  content?: string;
  time?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  unread: boolean;
}

interface CourseData {
  id: number;
  title: string;
  instructor: string;
  image: string;
  duration: string;
  students: number;
  modules: number;
  progress: number;
  status: string;
}

// New interface for homework history
interface HomeworkSubmission {
  id: number;
  title: string;
  course: string;
  submittedDate: Date;
  grade: number;
  maxGrade: number;
  feedback: string;
  status: 'Completed' | 'Graded' | 'Needs Revision';
}

export default function StudentDashboard() {
  const { user, loading, signout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Data states with loading indicators
  const [dataLoading, setDataLoading] = useState({
    workshops: true,
    sessions: false, // Changed to false initially
    homework: true,
    messages: true,
    courses: true
  });
  
  // Pre-populate with mock data
  const now = new Date();
  const mockSessions: LiveSession[] = [
    {
      id: 101,
      title: 'Introduction to Psychology',
      workshopTitle: 'Psychology Foundations',
      scheduledAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
      instructor: 'Dr. Akanksha Agarwal',
      link: '/workshop/session/101'
    },
    {
      id: 102, 
      title: 'Psychology Research Methods',
      workshopTitle: 'Psychology Foundations',
      scheduledAt: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
      instructor: 'Dr. Akanksha Agarwal',
      link: '/workshop/session/102'
    },
    {
      id: 103,
      title: 'Cognitive Psychology',
      workshopTitle: 'Psychology Foundations',
      scheduledAt: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000), // 3 weeks from now
      instructor: 'Dr. Akanksha Agarwal',
      link: '/workshop/session/103'
    }
  ];
  
  // Empty data states instead of mock data
  const [nextCourse, setNextCourse] = useState<Workshop | null>(null);
  const [upcomingCourseSessions, setUpcomingCourseSessions] = useState<LiveSession[]>(mockSessions); // Pre-populated with mock data
  const [pendingHomework, setPendingHomework] = useState<HomeworkAssignment[]>([]);
  const [recentMessages, setRecentMessages] = useState<Message[]>([]);
  const [courses, setCourses] = useState<CourseData[]>([]);
  
  // New state for homework submissions history
  const [homeworkSubmissions, setHomeworkSubmissions] = useState<HomeworkSubmission[]>([]);
  const [submissionStats, setSubmissionStats] = useState({
    totalSubmitted: 0,
    avgGrade: 0,
    onTimePercentage: 0,
    completionRate: 0
  });
  
  // Fetch data function - this would normally connect to your API
  const fetchData = async () => {
    try {
      // Get authentication token
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('Authentication required');
      }

      // Fetch courses data
      try {
        setDataLoading(prev => ({ ...prev, workshops: true }));
        
        const response = await fetch('http://localhost:4001/student/courses', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          cache: 'no-cache'
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Failed to fetch courses: ${response.status}`, errorText);
          throw new Error(`Failed to fetch courses: ${response.status} - ${errorText}`);
        }
        
        const coursesData = await response.json();
  
        // Create a structured organization of the data
        if (coursesData && coursesData.length > 0) {
          // Set the next course
          const upcomingCourse = coursesData[0];
          
          // Calculate start and end dates correctly
          // Always use PM (afternoon) for course times - 16:00 is 4PM
          const startDate = new Date();
          startDate.setHours(16, 0, 0, 0); 
          
          const endDate = new Date();
          endDate.setDate(endDate.getDate() + 30); // 30 days from today
          endDate.setHours(16, 0, 0, 0); // 4:00 PM
          
          setNextCourse({
            id: upcomingCourse.id,
            title: upcomingCourse.title,
            startDate: startDate,
            endDate: endDate,
            durationWeeks: upcomingCourse.totalWeeks || 4,
            link: `/course/${upcomingCourse.id}`,
            instructor: upcomingCourse.instructor
          });
        }
        
        setDataLoading(prev => ({ ...prev, workshops: false }));
      } catch (error) {
        console.error('Error fetching courses:', error);
        setDataLoading(prev => ({ ...prev, workshops: false }));
      }
      
      // Fetch course sessions
      try {
        setDataLoading(prev => ({ ...prev, sessions: true }));
        
        const sessionsResponse = await fetch('http://localhost:4001/student/course-sessions', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          cache: 'no-cache'
        });
        
        if (sessionsResponse.ok) {
          const courseSessions = await sessionsResponse.json();
          setUpcomingCourseSessions(courseSessions);
        } else {
          // Set empty array if no sessions
          setUpcomingCourseSessions([]);
        }
        
        setDataLoading(prev => ({ ...prev, sessions: false }));
      } catch (error) {
        console.error('Error fetching course sessions:', error);
        setUpcomingCourseSessions([]);
        setDataLoading(prev => ({ ...prev, sessions: false }));
      }
      
      // Fetch pending homework
      try {
        setDataLoading(prev => ({ ...prev, homework: true }));
        
        const homeworkResponse = await fetch('http://localhost:4001/homework/mine/pending', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          cache: 'no-cache'
        });
        
        if (homeworkResponse.ok) {
          const pendingHomeworkData = await homeworkResponse.json();
          setPendingHomework(pendingHomeworkData);
        }
        setDataLoading(prev => ({ ...prev, homework: false }));
      } catch (error) {
        console.error('Error fetching pending homework:', error);
        setDataLoading(prev => ({ ...prev, homework: false }));
      }
      
      // Fetch messages
      try {
        setDataLoading(prev => ({ ...prev, messages: true }));
        
        const messagesResponse = await fetch('http://localhost:4001/messages/unread', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          cache: 'no-cache'
        });
        
        if (messagesResponse.ok) {
          const messagesData = await messagesResponse.json();
          setRecentMessages(messagesData);
        }
        setDataLoading(prev => ({ ...prev, messages: false }));
      } catch (error) {
        console.error('Error fetching messages:', error);
        setDataLoading(prev => ({ ...prev, messages: false }));
      }
      
      // Fetch courses
      try {
        setDataLoading(prev => ({ ...prev, courses: true }));
        
        const coursesResponse = await fetch('http://localhost:4001/student/courses', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          cache: 'no-cache'
        });
        
        if (coursesResponse.ok) {
          const coursesData = await coursesResponse.json();
          setCourses(coursesData);
        }
        setDataLoading(prev => ({ ...prev, courses: false }));
      } catch (error) {
        console.error('Error fetching courses:', error);
        setDataLoading(prev => ({ ...prev, courses: false }));
      }
      
      // Fetch homework submissions
      try {
        const submissionsResponse = await fetch('http://localhost:4001/homework/mine', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          cache: 'no-cache'
        });
        
        if (submissionsResponse.ok) {
          const submissionsData = await submissionsResponse.json();
          
          setHomeworkSubmissions(submissionsData);
          
          // Calculate statistics from actual data
          const totalSubmitted = submissionsData.length;
          const totalGrades = submissionsData.reduce((acc, curr) => acc + (curr.grade || 0), 0);
          const avgGrade = totalSubmitted > 0 ? totalGrades / totalSubmitted : 0;
          const onTimeSubmissions = submissionsData.filter(s => s.status === 'Graded').length;
          const onTimePercentage = totalSubmitted > 0 ? (onTimeSubmissions / totalSubmitted) * 100 : 0;
          const totalAssignments = 5; // This should come from an API call ideally
          const completionRate = (totalSubmitted / totalAssignments) * 100;
          
          setSubmissionStats({
            totalSubmitted,
            avgGrade,
            onTimePercentage,
            completionRate
          });
        }
      } catch (error) {
        console.error('Error fetching homework submissions:', error);
        // Reset submission stats to empty state
        setHomeworkSubmissions([]);
        setSubmissionStats({
          totalSubmitted: 0,
          avgGrade: 0,
          onTimePercentage: 0,
          completionRate: 0
        });
      }
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Reset loading states on error
      setDataLoading({
        workshops: false,
        sessions: false,
        homework: false,
        messages: false,
        courses: false
      });
    }
  };
  
  useEffect(() => {
    if (!loading && !user) {
      console.log('No user found, redirecting to login');
      router.push('/login');
      return;
    }
    
    // Redirect admin users to admin courses page
    if (user?.isAdmin) {
      console.log('Admin user detected in student dashboard, redirecting to admin page');
      router.push('/admin/workshops/courses');
      return;
    }
    
    // Fetch data when user is loaded and is not admin
    if (!loading && user && !user.isAdmin) {
      fetchData();
    }
  }, [user, loading, router]);
  
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

  const formatDate = (date: Date | string): string => {
    try {
      // Handle string dates by converting to Date object
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      
      // Validate that the date is valid before formatting
      if (isNaN(dateObj.getTime())) {
        console.error('Invalid date:', date);
        return 'Invalid date';
      }
      
      // Format the date in a user-friendly way
      return new Intl.DateTimeFormat('en-US', {
        weekday: 'short',
        month: 'short', 
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      }).format(dateObj);
    } catch (error) {
      console.error('Error formatting date:', error, date);
      return 'Invalid date';
    }
  };

  // Component for loading state
  const LoadingState = () => (
    <div className="flex justify-center items-center p-8">
      <Spin size="large" />
    </div>
  );
  
  // Component for empty state
  const EmptyState = ({ message = "No data available" }) => (
    <Empty
      description={message}
      image={Empty.PRESENTED_IMAGE_SIMPLE}
    />
  );

  // Function to join a course session
  const joinCourseSession = (sessionId: string) => {
    router.push(`/course/session/${sessionId}`);
  };

  return (
    <div className={styles.dashboardContainer}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.headerTitle}>Student Dashboard</h1>
          <div className={styles.userInfo}>
            <Badge count={0} size="small">
              <BellOutlined style={{ fontSize: '18px', cursor: 'pointer' }} />
            </Badge>
            <span className={styles.welcomeText}>
              Welcome, <SafeUserDisplay user={user} fallback="Student" />
            </span>
            <button
              onClick={signout}
              className={styles.logoutButton}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className={styles.tabs}>
        <nav className={styles.tabList}>
          <button
            className={`${styles.tabButton} ${activeTab === 'dashboard' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === 'courses' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('courses')}
          >
            My Courses
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === 'achievements' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('achievements')}
          >
            Achievements
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === 'certificate' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('certificate')}
          >
            Certificates
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === 'messages' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('messages')}
          >
            Messages
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className={styles.content}>
        {activeTab === 'dashboard' && (
          <div className={`${styles.grid} ${styles.grid2Cols}`}>
            {/* Next Course Card with Countdown */}
            <div>
              <Card 
                title={
                  <div className={styles.cardTitle}>
                    <ClockCircleOutlined className={styles.cardIcon} />
                    <span>Next Course</span>
                  </div>
                }
                className={styles.card}
              >
                {dataLoading.workshops ? (
                  <LoadingState />
                ) : nextCourse ? (
                  <>
                    <h3 className="text-xl font-semibold mb-2">{nextCourse.title}</h3>
                    <p>
                      Instructor: {nextCourse.instructor}<br />
                      {formatDate(nextCourse.startDate)} - {formatDate(nextCourse.endDate)}
                    </p>
                    
                    <Countdown targetDate={nextCourse.startDate} />
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Button 
                        type="primary" 
                        onClick={() => joinCourseSession(nextCourse.id.toString())}
                        icon={<VideoCameraOutlined />}
                      >
                        Join Course
                      </Button>
                      <a style={{ color: 'var(--primary)' }} href={`/course/materials/${nextCourse.id}`}>
                        View course materials
                      </a>
                    </div>
                  </>
                ) : (
                  <EmptyState message="No courses found. You haven't been enrolled in any courses yet." />
                )}
              </Card>
              
              {/* Upcoming Course Sessions */}
              <div className="mt-6">
                <Card 
                  title={
                    <div className={styles.cardTitle}>
                      <ClockCircleOutlined className={styles.cardIcon} />
                      <span>Upcoming Course Sessions</span>
                    </div>
                  }
                  className={styles.card}
                >
                  {dataLoading.sessions ? (
                    <LoadingState />
                  ) : upcomingCourseSessions.length > 0 ? (
                    <List
                      itemLayout="horizontal"
                      dataSource={upcomingCourseSessions}
                      renderItem={item => (
                        <List.Item
                          key={item.id}
                          actions={[
                            <Button 
                              type="primary" 
                              size="small" 
                              key="join" 
                              onClick={() => joinCourseSession(item.id.toString())}
                              icon={<VideoCameraOutlined />}
                            >
                              Join
                            </Button>
                          ]}
                        >
                          <List.Item.Meta
                            title={
                              <a onClick={() => joinCourseSession(item.id.toString())}>
                                {item.title}
                              </a>
                            }
                            description={
                              <div>
                                <p><strong>Main Course Session</strong></p>
                                <p>
                                  Instructor: {item.instructor}<br />
                                  {formatDate(item.scheduledAt)}
                                </p>
                              </div>
                            }
                          />
                        </List.Item>
                      )}
                    />
                  ) : (
                    <EmptyState message="No upcoming course sessions" />
                  )}
                </Card>
              </div>
            </div>
            
            {/* Sidebar - Pending Homework and Messages */}
            <div className="space-y-6">
              {/* Pending Homework */}
              <Card 
                title={
                  <div className={styles.cardTitle}>
                    <BookOutlined className={styles.cardIcon} />
                    <span>Pending Homework</span>
                  </div>
                }
                className={styles.card}
              >
                {dataLoading.homework ? (
                  <LoadingState />
                ) : pendingHomework.length > 0 ? (
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
                ) : (
                  <EmptyState message="No pending homework assignments" />
                )}
              </Card>
              
              {/* Recent Messages */}
              <Card 
                title={
                  <div className={styles.cardTitle}>
                    <MessageOutlined className={styles.cardIcon} />
                    <span>Recent Messages</span>
                  </div>
                }
                className={styles.card}
              >
                {dataLoading.messages ? (
                  <LoadingState />
                ) : recentMessages.length > 0 ? (
                  <List
                    itemLayout="horizontal"
                    dataSource={recentMessages}
                    renderItem={item => (
                      <List.Item key={item.id}>
                        <List.Item.Meta
                          avatar={<Avatar src={safeImageUrl(item.avatar)} />}
                          title={
                            <div className={styles.messageTitle}>
                              <span>{safeSenderName(item.sender)}</span>
                              <span className={styles.messageTime}>{item.time}</span>
                            </div>
                          }
                          description={
                            <div className={styles.messageDescription}>
                              <p className={styles.messageText}>{item.message}</p>
                              {item.unread && <Badge color="blue" />}
                            </div>
                          }
                        />
                      </List.Item>
                    )}
                  />
                ) : (
                  <EmptyState message="No messages" />
                )}
                {recentMessages.length > 0 && (
                  <div className={styles.messageButton}>
                    <Button type="link" onClick={() => setActiveTab('messages')}>
                      View all messages
                    </Button>
                  </div>
                )}
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'courses' && (
          <div className={courseStyles.coursesContainer}>
            <h2 className={courseStyles.coursesHeading}>My Enrolled Courses</h2>
            {dataLoading.courses ? (
              <div className="flex justify-center items-center p-8">
                <Spin size="large" />
              </div>
            ) : courses.length > 0 ? (
              <div className={courseStyles.coursesGrid}>
                {courses.map(course => (
                  <div key={course.id} className={courseStyles.courseCard}>
                    <div 
                      className={`${courseStyles.courseImage} ${courseStyles.courseImageDefault}`}
                      style={{ backgroundImage: `url('${course.image}')` }}
                    >
                      <span className={courseStyles.courseTag}>{course.status}</span>
                    </div>
                    <div className={courseStyles.courseBody}>
                      <h3 className={courseStyles.courseTitle}>{course.title}</h3>
                      <p className={courseStyles.instructor}>Instructor: {course.instructor}</p>
                      
                      <div className={courseStyles.courseInfo}>
                        <span className={courseStyles.infoItem}>
                          <ClockCircleOutlined /> {course.duration}
                        </span>
                        <span className={courseStyles.infoItem}>
                          <TeamOutlined /> {course.students} students
                        </span>
                        <span className={courseStyles.infoItem}>
                          <BookOutlined /> {course.modules} modules
                        </span>
                      </div>
                      
                      <div className={courseStyles.progressContainer}>
                        <div className={courseStyles.progressBar}>
                          <div 
                            className={courseStyles.progressFill}
                            style={{ width: `${course.progress}%` }}
                          ></div>
                        </div>
                        <div className={courseStyles.progressText}>
                          <span>Progress</span>
                          <span>{course.progress}%</span>
                        </div>
                      </div>
                      
                      <div className={courseStyles.courseFooter}>
                        <Link href={`/course/${course.id}`} className={courseStyles.continueButton}>
                          {course.progress > 0 ? 'Continue Learning' : 'Start Course'} <RightOutlined className={courseStyles.icon} />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex justify-center items-center p-8 bg-white rounded-lg">
                <Empty
                  description="You are not enrolled in any courses yet"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              </div>
            )}
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className={achievementStyles.achievementsContainer}>
            <h2 className={achievementStyles.achievementsHeading}>My Achievements</h2>
            
            <div className={achievementStyles.pointsCard}>
              <div className={achievementStyles.pointsHeader}>
                <div>
                  <h3 className={achievementStyles.pointsHeading}>Your Learning Points</h3>
                  <p className={achievementStyles.pointsValue}>{submissionStats.totalSubmitted * 50}</p>
                </div>
                <div className={achievementStyles.learnerLevel}>
                  Level {Math.floor(submissionStats.totalSubmitted / 2) + 1} Learner
                </div>
              </div>
            </div>
            
            {/* Homework Analysis Section */}
            <div className={achievementStyles.homeworkSection}>
              <h3 className={achievementStyles.sectionHeading}>
                <BarChartOutlined /> Homework Performance Analysis
              </h3>
              
              {dataLoading.homework ? (
                <LoadingState />
              ) : homeworkSubmissions.length > 0 ? (
                <>
                  <div className={achievementStyles.statsGrid}>
                    <Card className={achievementStyles.statCard}>
                      <Statistic 
                        title="Assignments Completed" 
                        value={submissionStats.totalSubmitted} 
                        prefix={<CheckCircleOutlined />} 
                      />
                    </Card>
                    <Card className={achievementStyles.statCard}>
                      <Statistic 
                        title="Average Grade" 
                        value={submissionStats.avgGrade} 
                        suffix="%" 
                        precision={1}
                        valueStyle={{ color: submissionStats.avgGrade > 90 ? '#3f8600' : '#faad14' }}
                      />
                    </Card>
                    <Card className={achievementStyles.statCard}>
                      <Statistic 
                        title="On-Time Submission" 
                        value={submissionStats.onTimePercentage} 
                        suffix="%" 
                        precision={0}
                      />
                      <Progress percent={submissionStats.onTimePercentage} size="small" />
                    </Card>
                    <Card className={achievementStyles.statCard}>
                      <Statistic 
                        title="Completion Rate" 
                        value={submissionStats.completionRate} 
                        suffix="%" 
                        precision={0}
                      />
                      <Progress percent={submissionStats.completionRate} size="small" />
                    </Card>
                  </div>
                  
                  <div className={achievementStyles.submissionHistory}>
                    <h4 className={achievementStyles.subsectionHeading}>Submission History</h4>
                    <List
                      itemLayout="horizontal"
                      dataSource={homeworkSubmissions}
                      renderItem={item => (
                        <List.Item
                          key={item.id}
                          actions={[
                            <Tag 
                              key={`grade-${item.id}`}
                              color={
                                item.grade > 90 ? 'success' : 
                                item.grade > 80 ? 'processing' : 
                                item.grade > 70 ? 'warning' : 'error'
                              }
                            >
                              {item.grade}/{item.maxGrade}
                            </Tag>
                          ]}
                        >
                          <List.Item.Meta
                            avatar={<Avatar icon={<FileTextOutlined />} style={{ backgroundColor: '#1890ff' }} />}
                            title={<span>{item.title}</span>}
                            description={
                              <div>
                                <p><strong>{item.course}</strong></p>
                                <p>Submitted on: {formatDate(item.submittedDate)}</p>
                                <p style={{ fontStyle: 'italic' }}>{item.feedback}</p>
                              </div>
                            }
                          />
                        </List.Item>
                      )}
                    />
                  </div>
                </>
              ) : (
                <div className="bg-white rounded-lg p-8">
                  <Empty
                    description="No homework submissions yet"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                </div>
              )}
            </div>
            
            <div className={achievementStyles.badgesSection}>
              <h3 className={achievementStyles.badgesHeading}>
                <TrophyOutlined /> Badges Earned
              </h3>
              {homeworkSubmissions.length > 0 ? (
                <div className={achievementStyles.badgesGrid}>
                  <div className={achievementStyles.badgeCard}>
                    <div className={`${achievementStyles.badgeIcon} ${achievementStyles.badgeIconActive}`}>
                      <FileTextOutlined />
                    </div>
                    <div className={achievementStyles.badgeName}>First Submission</div>
                  </div>
                  
                  <div className={`${achievementStyles.badgeCard} ${submissionStats.avgGrade >= 90 ? '' : achievementStyles.inactiveBadge}`}>
                    <div className={`${achievementStyles.badgeIcon} ${submissionStats.avgGrade >= 90 ? achievementStyles.badgeIconGreen : achievementStyles.badgeIconInactive}`}>
                      <TrophyOutlined />
                    </div>
                    <div className={achievementStyles.badgeName}>Excellence Award</div>
                  </div>
                  
                  <div className={`${achievementStyles.badgeCard} ${submissionStats.totalSubmitted >= 3 ? '' : achievementStyles.inactiveBadge}`}>
                    <div className={`${achievementStyles.badgeIcon} ${submissionStats.totalSubmitted >= 3 ? achievementStyles.badgeIconBlue : achievementStyles.badgeIconInactive}`}>
                      <CheckCircleOutlined />
                    </div>
                    <div className={achievementStyles.badgeName}>Dedicated Learner</div>
                  </div>
                  
                  <div className={`${achievementStyles.badgeCard} ${submissionStats.onTimePercentage >= 90 ? '' : achievementStyles.inactiveBadge}`}>
                    <div className={`${achievementStyles.badgeIcon} ${submissionStats.onTimePercentage >= 90 ? achievementStyles.badgeIconPurple : achievementStyles.badgeIconInactive}`}>
                      <ClockCircleOutlined />
                    </div>
                    <div className={achievementStyles.badgeName}>Punctuality Pro</div>
                  </div>
                </div>
              ) : (
              <div className="flex justify-center items-center p-8 bg-white rounded-lg">
                <Empty
                  description="You haven't earned any badges yet"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'certificate' && (
          <div className={certificatesStyles.certificatesContainer}>
            <h2 className={certificatesStyles.certificatesHeading}>My Certificates</h2>
            
            <div className={certificatesStyles.emptyStateCard}>
              <span className={certificatesStyles.emptyStateIcon}>
                <FileTextOutlined />
              </span>
              <h3 className={certificatesStyles.emptyStateTitle}>You haven&apos;t earned any certificates yet</h3>
              <p className={certificatesStyles.emptyStateText}>
                Complete a course to earn your first certificate. Certificates are awarded when you finish
                all modules and pass the required assessments.
              </p>
              <button 
                className={certificatesStyles.actionButton}
                onClick={() => setActiveTab('courses')}
              >
                Go to my courses <RightOutlined className={certificatesStyles.arrow} />
              </button>
            </div>
          </div>
        )}
        
        {activeTab === 'messages' && (
          <div className={messagesStyles.messagesContainer}>
            <h2 className={messagesStyles.messagesHeading}>Messages</h2>
            
            {dataLoading.messages ? (
              <div className="flex justify-center items-center p-8">
                <Spin size="large" />
              </div>
            ) : recentMessages.length > 0 ? (
              <div className="bg-white rounded-lg p-6">
                <List
                  itemLayout="horizontal"
                  dataSource={recentMessages}
                  header={<h3 className="text-lg font-semibold mb-2">Your Messages</h3>}
                  renderItem={item => (
                    <List.Item 
                      key={item.id}
                      actions={[
                        <Tag 
                          key="status"
                          color={item.unread ? "blue" : "default"}
                        >
                          {item.unread ? 'Unread' : 'Read'}
                        </Tag>
                      ]}
                    >
                      <List.Item.Meta
                        avatar={<Avatar src={safeImageUrl(item.avatar)} icon={<MessageOutlined />} />}
                        title={
                          <div className={messagesStyles.messageTitle}>
                            <span>{safeSenderName(item.sender)}</span>
                            <span className={messagesStyles.messageTime}>
                              {typeof item.time === 'string' 
                                ? item.time 
                                : item.createdAt 
                                  ? formatDate(new Date(item.createdAt)) 
                                  : 'Recent'}
                            </span>
                          </div>
                        }
                        description={
                          <div className={messagesStyles.messageDescription}>
                            <p className={messagesStyles.messageText}>{item.message || item.content}</p>
                            {item.unread && <Badge color="blue" />}
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              </div>
            ) : (
              <div className="flex justify-center items-center p-8 bg-white rounded-lg">
                <Empty
                  description="You don't have any messages yet"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 