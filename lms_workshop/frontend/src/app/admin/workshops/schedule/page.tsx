'use client';

import { useAuth } from '@/app/context/AuthContext';
import { Calendar, Select, Modal, Button, Form, Input, DatePicker, TimePicker, message } from 'antd';
import type { CalendarMode } from 'antd/es/calendar/generateCalendar';
import type { Dayjs } from 'dayjs';
import { PlusOutlined, VideoCameraAddOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import styles from './schedule.module.css';
import { getValidToken } from '@/api/authService';
import dayjs from 'dayjs';

// Interface for course data
interface CourseItem {
  id: number;
  title: string;
  description: string;
  instructor: string;
  maxStudents: number;
  enrolledStudents: number;
  status: 'ACTIVE' | 'DRAFT' | 'COMPLETED';
  createdAt: string;
  updatedAt: string;
}

// Interface for schedule events
interface EventItem {
  type: 'success' | 'warning' | 'error';
  content: string;
  time: string;
  id: string;
  date: string;
  courseId: number;
}

export default function CourseSchedule() {
  const { loading } = useAuth();
  const [view, setView] = useState<CalendarMode>('month');
  const [currentMonth, setCurrentMonth] = useState(dayjs().format('MMM'));
  const [currentYear, setCurrentYear] = useState(dayjs().format('YYYY'));
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [courseDetailsModalOpen, setCourseDetailsModalOpen] = useState(false);
  const [form] = Form.useForm();

  // Fetch courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
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
        setCourses(data);
        
        // Process course data into calendar events
        const extractedEvents: EventItem[] = [];
        
        data.forEach((course: CourseItem) => {
          // Extract dates from course description if it contains schedule information
          const descLines = course.description.split('\n');
          const scheduleLine = descLines.findIndex(line => line.trim().toLowerCase() === 'schedule:');
          
          if (scheduleLine >= 0) {
            // Process schedule lines
            for (let i = scheduleLine + 1; i < descLines.length; i++) {
              const line = descLines[i].trim();
              if (line.startsWith('-')) {
                const dateMatch = line.match(/- (.*?) at (.*?)$/);
                if (dateMatch && dateMatch.length >= 3) {
                  const dateStr = dateMatch[1].trim();
                  const timeStr = dateMatch[2].trim();
                  
                  const parsedDate = dayjs(dateStr, 'dddd, MMMM D, YYYY');
                  if (parsedDate.isValid()) {
                    extractedEvents.push({
                      type: getEventType(course.status),
                      content: course.title,
                      time: timeStr,
                      id: `course_${course.id}_${extractedEvents.length}`,
                      date: parsedDate.format('YYYY-MM-DD'),
                      courseId: course.id
                    });
                  }
                }
              }
            }
          }
        });
        
        setEvents(extractedEvents);
      } catch (error) {
        console.error('Failed to fetch courses:', error);
        message.error('Failed to load courses');
      }
    };
    
    if (!loading) {
      fetchCourses();
    }
  }, [loading]);

  // Determine event type based on course status
  const getEventType = (status: string): 'success' | 'warning' | 'error' => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'DRAFT':
        return 'warning';
      case 'COMPLETED':
        return 'error';
      default:
        return 'success';
    }
  };

  // Demo function to generate cell content
  const getListData = (value: Dayjs): EventItem[] => {
    const dateStr = value.format('YYYY-MM-DD');
    return events.filter(event => event.date === dateStr);
  };

  const openCourseDetails = (event: EventItem) => {
    setSelectedEvent(event);
    setCourseDetailsModalOpen(true);
  };

  const closeCourseDetails = () => {
    setCourseDetailsModalOpen(false);
    setSelectedEvent(null);
  };

  const dateCellRender = (value: Dayjs) => {
    const listData = getListData(value);
    return (
      <ul className={styles.eventList}>
        {listData.map((item, index) => {
          let eventClass = styles.event;
          if (item.type === 'success') eventClass += ` ${styles.eventGreen}`;
          if (item.type === 'warning') eventClass += ` ${styles.eventYellow}`;
          if (item.type === 'error') eventClass += ` ${styles.eventRed}`;
          
          return (
            <li key={index} className={eventClass} onClick={() => openCourseDetails(item)}>
              <span className={styles.eventTime}>{item.time}</span>
              <span>{item.content}</span>
              <VideoCameraAddOutlined className={styles.joinButton} />
            </li>
          );
        })}
      </ul>
    );
  };

  const showModal = () => {
    setIsModalOpen(true);
    form.resetFields();
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleViewChange = (value: CalendarMode) => {
    setView(value);
  };

  if (loading) {
    return <div className={styles.loadingState}>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h1>Course Schedule</h1>
          <div className={styles.headerControls}>
            <Select 
              defaultValue="month" 
              className={styles.viewSelector}
              onChange={handleViewChange}
              bordered={false}
              options={[
                { value: 'month', label: 'Month' },
                { value: 'year', label: 'Year' }
              ]}
            />
            
            <Button 
              type="primary"
              icon={<PlusOutlined />} 
              onClick={() => window.location.href = "/admin/workshops/courses"}
              className={styles.scheduleButton}
            >
              Add Course
            </Button>
          </div>
        </div>
        
        <div className={styles.calendarControls}>
          <div className={styles.viewOptions}>
            <button 
              className={`${styles.viewOption} ${view === 'month' ? styles.active : ''}`}
              onClick={() => setView('month')}
            >
              Month
            </button>
            <button 
              className={`${styles.viewOption} ${view === 'year' ? styles.active : ''}`}
              onClick={() => setView('year')}
            >
              Year
            </button>
          </div>
          
          <div>
            <select 
              className={styles.yearSelector} 
              value={currentYear} 
              onChange={(e) => setCurrentYear(e.target.value)}
            >
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
            </select>
            
            <select 
              className={styles.monthSelector} 
              value={currentMonth} 
              onChange={(e) => setCurrentMonth(e.target.value)}
            >
              <option value="Jan">January</option>
              <option value="Feb">February</option>
              <option value="Mar">March</option>
              <option value="Apr">April</option>
              <option value="May">May</option>
              <option value="Jun">June</option>
              <option value="Jul">July</option>
              <option value="Aug">August</option>
              <option value="Sep">September</option>
              <option value="Oct">October</option>
              <option value="Nov">November</option>
              <option value="Dec">December</option>
            </select>
          </div>
        </div>
        
        <div className={styles.calendarContainer}>
          <Calendar 
            dateCellRender={dateCellRender} 
            mode={view} 
            className={styles.calendar} 
          />
        </div>
      </div>

      {/* Course Details Modal */}
      <Modal
        title="Course Details"
        open={courseDetailsModalOpen}
        onCancel={closeCourseDetails}
        footer={[
          <Button key="close" onClick={closeCourseDetails}>
            Close
          </Button>,
          <Button 
            key="details" 
            type="primary" 
            onClick={() => window.location.href = `/admin/workshops/courses/${selectedEvent?.courseId}`}
          >
            View Course Details
          </Button>
        ]}
      >
        {selectedEvent && (
          <div>
            <h3>{selectedEvent.content}</h3>
            <p><strong>Time:</strong> {selectedEvent.time}</p>
            <p><strong>Date:</strong> {dayjs(selectedEvent.date).format('MMMM D, YYYY')}</p>
            <p>
              {courses.find(c => c.id === selectedEvent.courseId)?.description.split('\n').map((line, i) => (
                <span key={i}>{line}<br /></span>
              ))}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
} 