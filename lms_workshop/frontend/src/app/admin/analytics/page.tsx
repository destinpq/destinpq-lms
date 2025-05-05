'use client';

import { useAuth } from '@/app/context/AuthContext';
import { Layout, Typography, Card, Row, Col, Statistic, Tabs, Spin, Empty, Progress } from 'antd';
import {
  VideoCameraOutlined,
  TeamOutlined,
  BookOutlined,
  RiseOutlined,
} from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { getValidToken } from '@/api/authService';

const { Content } = Layout;
const { Title } = Typography;
const { TabPane } = Tabs;

// Interface for workshop data
interface Workshop {
  id: number;
  title: string;
  status: string;
  participants?: { id: number }[];
  scheduledAt: string;
  maxParticipants: number;
}

// Interface for course data
interface Course {
  id: number;
  title: string;
  maxStudents: number;
  enrolledStudents: number;
}

// Interface for user data
interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
}

// Type definitions
interface AnalyticsData {
  totalUsers: number;
  activeWorkshops: number;
  courseCompletionRate: number;
  averageEngagement: number;
  userGrowth: {week: string, count: number}[];
  workshopAttendance: { name: string, attendance: number, maxAttendance: number }[];
  courseCompletions: { course: string, completed: number, total: number }[];
  activityTimeline: { date: string, count: number }[];
}

export default function AnalyticsPage() {
  const { loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalUsers: 0,
    activeWorkshops: 0,
    courseCompletionRate: 0,
    averageEngagement: 0,
    userGrowth: [],
    workshopAttendance: [],
    courseCompletions: [],
    activityTimeline: []
  });

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        
        // Fetch users
        const token = getValidToken();
        if (!token) {
          throw new Error('Not authenticated');
        }
        
        // Get users count
        const usersResponse = await fetch(`${process.env.API_URL}/users`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!usersResponse.ok) {
          throw new Error('Failed to fetch users');
        }
        
        const users: User[] = await usersResponse.json();
        
        // Get workshops
        const workshopsResponse = await fetch(`${process.env.API_URL}/workshops`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!workshopsResponse.ok) {
          throw new Error('Failed to fetch workshops');
        }
        
        const workshops: Workshop[] = await workshopsResponse.json();
        
        // Get courses
        const coursesResponse = await fetch(`${process.env.API_URL}/courses`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!coursesResponse.ok) {
          throw new Error('Failed to fetch courses');
        }
        
        const courses: Course[] = await coursesResponse.json();
        
        // Calculate metrics from actual data
        const totalUsers = users.length;
        const activeWorkshops = workshops.filter((w: Workshop) => w.status === 'ACTIVE').length;
        
        // Calculate course completion rate based on enrolled vs. max students
        let totalEnrolled = 0;
        let totalCapacity = 0;
        courses.forEach(course => {
          totalEnrolled += course.enrolledStudents || 0;
          totalCapacity += course.maxStudents || 0;
        });
        const courseCompletionRate = totalCapacity > 0 ? (totalEnrolled / totalCapacity) * 100 : 0;
        
        // Calculate average engagement based on user creation dates
        // Get the oldest and newest users to calculate average platform tenure
        const userCreationDates = users
          .map(user => new Date(user.createdAt).getTime())
          .sort((a, b) => a - b);
        
        const averageTenureMs = userCreationDates.reduce((sum, date) => sum + (Date.now() - date), 0) / userCreationDates.length;
        const averageEngagement = Math.round(averageTenureMs / (1000 * 60)); // Convert ms to minutes
        
        // Create user growth data - group users by week since registration
        const usersByWeek = users.reduce((acc, user) => {
          const creationDate = new Date(user.createdAt);
          const weeksSinceCreation = Math.floor((Date.now() - creationDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
          const weekKey = `Week ${Math.min(8, weeksSinceCreation + 1)}`;
          
          if (!acc[weekKey]) {
            acc[weekKey] = 0;
          }
          acc[weekKey]++;
          
          return acc;
        }, {} as Record<string, number>);
        
        // Convert to array and ensure we have 8 weeks of data
        const userGrowth = Array.from({ length: 8 }, (_, i) => {
          const weekKey = `Week ${i + 1}`;
          return {
            week: weekKey,
            count: usersByWeek[weekKey] || 0
          };
        });
        
        // Workshop attendance data - use actual participant count vs max
        const workshopAttendance = workshops
          .filter(w => w.maxParticipants > 0)
          .slice(0, 5)
          .map((workshop: Workshop) => ({
            name: workshop.title,
            attendance: workshop.participants?.length || 0,
            maxAttendance: workshop.maxParticipants
          }));
        
        // Course completions data - use actual enrolled vs max
        const courseCompletions = courses
          .filter(c => c.maxStudents > 0)
          .slice(0, 5)
          .map((course: Course) => ({
            course: course.title,
            completed: course.enrolledStudents || 0,
            total: course.maxStudents
          }));
        
        // Activity timeline - create data for last 7 days based on user creation
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - i);
          date.setHours(0, 0, 0, 0);
          return date.getTime();
        }).reverse();
        
        const activityTimeline = last7Days.map(timestamp => {
          const date = new Date(timestamp);
          const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          
          // Count users created on this date
          const count = users.filter(user => {
            const userDate = new Date(user.createdAt);
            userDate.setHours(0, 0, 0, 0);
            return userDate.getTime() === timestamp;
          }).length;
          
          return {
            date: dateStr,
            count: count
          };
        });
        
        setAnalyticsData({
          totalUsers,
          activeWorkshops,
          courseCompletionRate,
          averageEngagement,
          userGrowth,
          workshopAttendance,
          courseCompletions,
          activityTimeline
        });
      } catch (error) {
        console.error('Failed to fetch analytics data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (!authLoading) {
      fetchAnalyticsData();
    }
  }, [authLoading]);

  if (authLoading || loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Content style={{ padding: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <Title level={3} style={{ margin: 0 }}>Analytics Dashboard</Title>
      </div>
      
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic 
              title="Total Users" 
              value={analyticsData.totalUsers} 
              prefix={<TeamOutlined style={{ color: '#3f8600' }} />} 
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic 
              title="Active Workshops" 
              value={analyticsData.activeWorkshops} 
              prefix={<VideoCameraOutlined style={{ color: '#1890ff' }} />} 
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic 
              title="Course Completion Rate" 
              value={analyticsData.courseCompletionRate} 
              suffix="%" 
              prefix={<BookOutlined style={{ color: '#cf1322' }} />} 
              precision={1}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic 
              title="Average Engagement" 
              value={analyticsData.averageEngagement} 
              prefix={<RiseOutlined style={{ color: '#722ed1' }} />} 
              suffix="min"
              precision={1}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>
      
      <div style={{ marginTop: '24px' }}>
        <Tabs defaultActiveKey="1">
          <TabPane tab="User Engagement" key="1">
            <Card title="User Growth Over Time">
              <div style={{ height: '300px', padding: '20px 0' }}>
                <div style={{ display: 'flex', height: '100%', alignItems: 'flex-end' }}>
                  {analyticsData.userGrowth.map((data, index) => (
                    <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div 
                        style={{ 
                          width: '40px', 
                          background: 'linear-gradient(to top, #1890ff, #69c0ff)', 
                          borderRadius: '4px 4px 0 0',
                          height: `${(data.count / Math.max(...analyticsData.userGrowth.map(g => g.count) || [1])) * 250}px`
                        }}
                      />
                      <div style={{ marginTop: '8px', fontSize: '12px' }}>{data.week}</div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </TabPane>
          <TabPane tab="Workshop Attendance" key="2">
            <Card title="Workshop Attendance">
              {analyticsData.workshopAttendance.length > 0 ? (
                <div style={{ padding: '20px 0' }}>
                  {analyticsData.workshopAttendance.map((workshop, index) => (
                    <div key={index} style={{ marginBottom: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                        <span>{workshop.name}</span>
                        <span>{workshop.attendance} / {workshop.maxAttendance} attendees</span>
                      </div>
                      <Progress 
                        percent={Math.min(100, (workshop.attendance / workshop.maxAttendance) * 100)} 
                        strokeColor={index % 2 === 0 ? '#1890ff' : '#52c41a'} 
                        showInfo={false}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <Empty description="No workshop attendance data available" />
              )}
            </Card>
          </TabPane>
          <TabPane tab="Course Completions" key="3">
            <Card title="Course Completion Rates">
              {analyticsData.courseCompletions.length > 0 ? (
                <div style={{ padding: '20px 0' }}>
                  {analyticsData.courseCompletions.map((course, index) => (
                    <div key={index} style={{ marginBottom: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                        <span>{course.course}</span>
                        <span>{course.completed} / {course.total} completed</span>
                      </div>
                      <Progress 
                        percent={Math.round((course.completed / course.total) * 100)} 
                        strokeColor={['#f5222d', '#fa8c16', '#faad14', '#a0d911', '#52c41a'][index % 5]}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <Empty description="No course completion data available" />
              )}
            </Card>
          </TabPane>
          <TabPane tab="Activity Timeline" key="4">
            <Card title="Daily Activity">
              <div style={{ height: '300px', padding: '20px 0' }}>
                <div style={{ display: 'flex', height: '100%', alignItems: 'flex-end' }}>
                  {analyticsData.activityTimeline.map((day, index) => (
                    <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div 
                        style={{ 
                          width: '50px', 
                          background: 'linear-gradient(to top, #722ed1, #b37feb)', 
                          borderRadius: '4px 4px 0 0',
                          height: `${(day.count / Math.max(...analyticsData.activityTimeline.map(d => d.count) || [1])) * 250}px`
                        }}
                      />
                      <div style={{ marginTop: '8px', fontSize: '12px', textAlign: 'center' }}>
                        {day.date}
                        <div style={{ color: '#722ed1', fontWeight: 'bold' }}>{day.count}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </TabPane>
        </Tabs>
      </div>
    </Content>
  );
} 