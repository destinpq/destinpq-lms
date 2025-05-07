'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { 
  Layout, 
  Typography, 
  Menu, 
  Card, 
  Button, 
  Table, 
  Space, 
  Spin, 
  Statistic, 
  Row, 
  Col,
  Divider,
  Modal,
  Form,
  Input,
  message,
  Select,
  DatePicker,
  Checkbox,
  App
} from 'antd';
import {
  UserOutlined,
  BookOutlined,
  CalendarOutlined,
  DashboardOutlined,
  LogoutOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  VideoCameraOutlined,
  MinusCircleOutlined,
  MailOutlined
} from '@ant-design/icons';
import { User } from '@/api/userService';
import { Course } from '@/api/courseService';
import moment from 'moment';
import Image from 'next/image';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

// Define interfaces for type safety
interface Workshop {
  id: number;
  title: string;
  instructor: string;
  date: string;
  participants: number;
  description?: string;
  materials?: { 
    id?: number;
    name: string;
    url: string;
    type: string;
  }[];
  meetingId?: string;
  time?: string;
}

export default function AdminDashboard() {
  const { user, loading, signout } = useAuth();
  const { modal, message: messageApi } = App.useApp();
  const router = useRouter();
  const [selectedMenu, setSelectedMenu] = useState('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUserForm] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);
  const [zoomForm] = Form.useForm();
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [courseForm] = Form.useForm();
  const [isWorkshopModalOpen, setIsWorkshopModalOpen] = useState(false);
  const [workshopForm] = Form.useForm();
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [userForm] = Form.useForm();
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editingWorkshop, setEditingWorkshop] = useState<Workshop | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  // State for real data - initialized to empty arrays
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [loadingWorkshops, setLoadingWorkshops] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailForm] = Form.useForm();
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  // Load workshops from API instead of localStorage
  useEffect(() => {
    if (!loading && user?.isAdmin) {
      fetchWorkshops();
    }
  }, [user, loading]);

  // Remove emergency admin login handling in useEffect
  useEffect(() => {
    console.log('Admin Dashboard Auth Check');
    
    // If not logged in or not admin, redirect to login
    if (!loading && !user) {
      console.log('No user found, redirecting to login page');
      router.push('/login');
    } else if (!loading && user && !user.isAdmin) {
      console.log('User found but not admin, redirecting to student dashboard');
      message.error('You do not have admin privileges');
      router.push('/student/dashboard');
    }
  }, [user, loading, router]);

  // Fetch users from the API
  useEffect(() => {
    console.log('Dashboard useEffect triggered');
    console.log('User state:', user?.isAdmin ? 'Admin' : 'Not admin or not logged in');
    console.log('Loading state:', loading ? 'Loading' : 'Not loading');
    
    if (!loading && user?.isAdmin) {
      console.log('User is admin, fetching data...');
      fetchUsers();
      fetchCourses();
    }
  }, [user, loading]);

  // Fetch workshops from the database API
  const fetchWorkshops = async () => {
    try {
      console.log('ATTEMPTING TO FETCH WORKSHOPS FROM DB!');
      setLoadingWorkshops(true);
      setError(null);
      
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('No authentication token found');
      const formattedToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/workshops`, {
        method: 'GET',
        headers: {
          'Authorization': formattedToken,
          'Content-Type': 'application/json',
        },
        cache: 'no-store'
      });

      if (!response.ok) throw new Error(`Failed to fetch workshops with status: ${response.status}`);
      
      // Assuming API returns the full workshop objects including materials with type
      const workshopsDataFromApi: Workshop[] = await response.json(); // Use the updated local Workshop interface
      console.log('Workshops fetched successfully from API:', workshopsDataFromApi);
      
      // No complex re-mapping needed if API returns data matching the updated Workshop interface
      setWorkshops(workshopsDataFromApi);
      
    } catch (err: any) { // Explicitly type err or handle specific error types
      const errorMessage = err.message || 'Failed to fetch workshops';
      console.error('Error fetching workshops:', errorMessage);
      setError(errorMessage);
      setWorkshops([]);
    } finally {
      setLoadingWorkshops(false);
    }
  };

  const fetchUsers = async () => {
    try {
      console.log('ATTEMPTING TO FETCH USERS NOW!');
      setLoadingUsers(true);
      setError(null);
      
      // Force refresh - make API call regardless of cache
      const token = localStorage.getItem('access_token');
      console.log('Using token to fetch users:', token ? 'Token exists' : 'No token');
      console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Ensure token has proper Bearer format
      const formattedToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
        method: 'GET',
        headers: {
          'Authorization': formattedToken,
          'Content-Type': 'application/json',
        },
        cache: 'no-store'
      });

      console.log('Users API response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Users API error:', errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText || 'Failed to fetch users' };
        }
        throw new Error(errorData.message || `Failed to fetch users with status: ${response.status}`);
      }

      const usersData = await response.json(); // Renamed from users to usersData to avoid conflict
      console.log('Users fetched successfully:', usersData);
      setUsers(usersData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch users';
      console.error('Error fetching users:', errorMessage);
      setError(errorMessage);
      message.error('Failed to load users. Please try again.');
      setUsers([]); // Set to empty array on error
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchCourses = async () => {
    try {
      console.log('ATTEMPTING TO FETCH COURSES NOW!');
      setLoadingCourses(true);
      setError(null);
      
      // Force direct API call
      const token = localStorage.getItem('access_token');
      console.log('Using token to fetch courses:', token ? 'Token exists' : 'No token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Ensure token has proper Bearer format
      const formattedToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses`, {
        method: 'GET',
        headers: {
          'Authorization': formattedToken,
          'Content-Type': 'application/json',
        },
        cache: 'no-store'
      });

      console.log('Courses API response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Courses API error:', errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText || 'Failed to fetch courses' };
        }
        throw new Error(errorData.message || `Failed to fetch courses with status: ${response.status}`);
      }

      const coursesData = await response.json(); // Renamed from courses to coursesData
      console.log('Courses fetched successfully:', coursesData);
      setCourses(coursesData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch courses';
      console.error('Error fetching courses:', errorMessage);
      setError(errorMessage);
      message.error('Failed to load courses. Please try again.');
      setCourses([]); // Set to empty array on error
    } finally {
      setLoadingCourses(false);
    }
  };

  if (loading || loadingUsers || loadingCourses || loadingWorkshops) {
    return (
      <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!user || !user.isAdmin) {
    return null; // Will redirect via useEffect
  }

  const handleMenuClick = (key: string) => {
    setSelectedMenu(key);
  };

  const handleCreateUser = () => {
    setIsModalOpen(true);
  };

  const handleModalCancel = () => {
    setIsModalOpen(false);
    newUserForm.resetFields();
  };

  const handleModalSubmit = async () => {
    try {
      const values = await newUserForm.validateFields();
      setIsLoading(true);
      console.log('Creating user with values:', values);
      
      // Make direct API call
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Ensure token has proper Bearer format
      const formattedToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;

      const userData = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
        isAdmin: values.isAdmin || false
      };

      console.log('Sending user data:', userData);
      console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
        method: 'POST',
        headers: {
          'Authorization': formattedToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      console.log('Create user response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Create user error:', errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText || 'Failed to create user' };
        }
        throw new Error(errorData.message || `Failed to create user with status: ${response.status}`);
      }
      
      message.success('User created successfully!');
      fetchUsers(); // Reload users
      setIsModalOpen(false);
      newUserForm.resetFields();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create user';
      console.error('Error creating user:', errorMessage);
      message.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    try {
      console.log('Deleting user with ID:', userId);
      setIsLoading(true);
      
      // Make direct API call
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Ensure token has proper Bearer format
      const formattedToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;

      console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': formattedToken,
          'Content-Type': 'application/json',
        },
      });

      console.log('Delete user response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Delete user error:', errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText || 'Failed to delete user' };
        }
        throw new Error(errorData.message || `Failed to delete user with status: ${response.status}`);
      }

      message.success('User deleted successfully!');
      fetchUsers(); // Reload users
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete user';
      console.error('Error deleting user:', errorMessage);
      message.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateZoomMeeting = () => {
    setIsZoomModalOpen(true);
  };

  const handleZoomModalCancel = () => {
    setIsZoomModalOpen(false);
    zoomForm.resetFields();
  };

  const handleZoomModalSubmit = () => {
    setIsLoading(true);
    
    // Simulate API call to create Zoom meeting
    setTimeout(() => {
      message.success('Zoom meeting created and linked to workshop!');
      setIsLoading(false);
      setIsZoomModalOpen(false);
      zoomForm.resetFields();
    }, 1000);
  };

  const handleCreateCourse = () => {
    setEditingCourse(null);
    courseForm.resetFields();
    setIsCourseModalOpen(true);
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    courseForm.setFieldsValue(course);
    setIsCourseModalOpen(true);
  };

  const handleDeleteCourse = (course: Course) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this course?',
      content: `${course.title} will be permanently removed.`,
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          console.log('Deleting course with ID:', course.id);
          setIsLoading(true);
          
          // Make direct API call
          const token = localStorage.getItem('access_token');
          if (!token) {
            throw new Error('No authentication token found');
          }

          // Ensure token has proper Bearer format
          const formattedToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;

          console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);
          
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/${course.id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': formattedToken,
              'Content-Type': 'application/json',
            },
          });

          console.log('Delete course response status:', response.status);
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error('Delete course error:', errorText);
            let errorData;
            try {
              errorData = JSON.parse(errorText);
            } catch {
              errorData = { message: errorText || 'Failed to delete course' };
            }
            throw new Error(errorData.message || `Failed to delete course with status: ${response.status}`);
          }

          message.success(`${course.title} has been deleted`);
          fetchCourses(); // Reload courses
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to delete course';
          console.error('Error deleting course:', errorMessage);
          message.error(errorMessage);
        } finally {
          setIsLoading(false);
        }
      },
    });
  };

  const handleCourseModalCancel = () => {
    setIsCourseModalOpen(false);
    courseForm.resetFields();
  };

  const handleCourseModalSubmit = async () => {
    try {
      const values = await courseForm.validateFields();
      setIsLoading(true);
      console.log('Creating/updating course with values:', values);
      
      // Make direct API call
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Ensure token has proper Bearer format
      const formattedToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;

      console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);

      if (editingCourse) {
        console.log('Updating course with ID:', editingCourse.id);
        const courseData = {
          title: values.title,
          instructor: values.instructor,
          description: values.description,
          maxStudents: values.students
        };

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/${editingCourse.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': formattedToken,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(courseData),
        });

        console.log('Update course response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Update course error:', errorText);
          let errorData;
          try {
            errorData = JSON.parse(errorText);
          } catch {
            errorData = { message: errorText || 'Failed to update course' };
          }
          throw new Error(errorData.message || `Failed to update course with status: ${response.status}`);
        }

        message.success('Course updated successfully!');
      } else {
        console.log('Creating new course');
        const courseData = {
          title: values.title,
          instructor: values.instructor,
          description: values.description || '',
          students: 0,
          maxStudents: values.students
        };

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses`, {
          method: 'POST',
          headers: {
            'Authorization': formattedToken,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(courseData),
        });

        console.log('Create course response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Create course error:', errorText);
          let errorData;
          try {
            errorData = JSON.parse(errorText);
          } catch {
            errorData = { message: errorText || 'Failed to create course' };
          }
          throw new Error(errorData.message || `Failed to create course with status: ${response.status}`);
        }

        message.success('Course created successfully!');
      }
      
      fetchCourses(); // Reload courses
      setIsCourseModalOpen(false);
      courseForm.resetFields();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save course';
      console.error('Error saving course:', errorMessage);
      message.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Create workshop functions
  const handleCreateWorkshop = () => {
    console.log('Create Workshop button clicked');
    setEditingWorkshop(null);
    
    // Set default date to 2 months in the future
    const twoMonthsFromNow = moment().add(2, 'months');
    workshopForm.setFieldsValue({
      date: twoMonthsFromNow
    });
    
    setIsWorkshopModalOpen(true);
  };

  const handleWorkshopModalCancel = () => {
    console.log('Workshop modal cancelled');
    setIsWorkshopModalOpen(false);
    workshopForm.resetFields();
    setEditingWorkshop(null);
  };

  const handleWorkshopModalSubmit = async () => {
    try {
      console.log('Workshop modal submit button clicked');
      const values = await workshopForm.validateFields();
      console.log('Workshop form values:', values);
      setIsLoading(true);

      // Check if date is valid
      if (!values.date) {
        throw new Error('Please select a valid date');
      }

      // Format the date
      const formattedDate = values.date.format ? values.date.format('YYYY-MM-DD') : values.date;
      
      // Get token for API call
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Ensure token has proper Bearer format
      const formattedToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      
      if (editingWorkshop) {
        // Update existing workshop via API
        console.log('Updating workshop ID:', editingWorkshop.id);
        
        const workshopData = {
          title: values.title,
          instructor: values.instructor,
          date: formattedDate,
          description: values.description || '',
          meetingId: values.meetingId || null,
          materials: values.materials || [],
          // agenda: values.agenda || [] // TODO: Initialize agenda when its Form.List is added
        };

        // Log the workshop data
        console.log('Workshop data being sent to API:', workshopData);

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/workshops/${editingWorkshop.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': formattedToken,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(workshopData),
        });
        
        console.log('Workshop update API response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Workshop update API error:', errorText);
          let errorData;
          try {
            errorData = JSON.parse(errorText);
          } catch {
            errorData = { message: errorText || 'Failed to update workshop' };
          }
          throw new Error(errorData.message || `Failed to update workshop with status: ${response.status}`);
        }
        
        message.success('Workshop updated successfully in database!');
        console.log('Workshop updated successfully in database!');
      } else {
        // Create new workshop via API
        const workshopData = {
          title: values.title,
          instructor: values.instructor,
          date: formattedDate,
          description: values.description || '',
          meetingId: values.meetingId || null,
          participants: 0,
          materials: values.materials || [],
          // agenda: values.agenda || [] // TODO: Initialize agenda when its Form.List is added
        };

        // Log the workshop data
        console.log('Workshop data being sent to API:', workshopData);

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/workshops`, {
          method: 'POST',
          headers: {
            'Authorization': formattedToken,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(workshopData),
        });
        
        console.log('Workshop create API response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Workshop create API error:', errorText);
          let errorData;
          try {
            errorData = JSON.parse(errorText);
          } catch {
            errorData = { message: errorText || 'Failed to create workshop' };
          }
          throw new Error(errorData.message || `Failed to create workshop with status: ${response.status}`);
        }
        
        message.success('Workshop created successfully in database!');
        console.log('Workshop created successfully in database!');
      }
      
      // Refresh the workshops from the database
      fetchWorkshops();
      
      setIsWorkshopModalOpen(false);
      workshopForm.resetFields();
      setEditingWorkshop(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save workshop';
      console.error('Error handling workshop:', errorMessage);
      message.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Edit user functions
  const handleEditUser = (user: User) => {
    console.log('Edit User button clicked for user:', user);
    setEditingUser(user);
    userForm.setFieldsValue({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      isAdmin: user.isAdmin
    });
    console.log('Setting form values:', {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      isAdmin: user.isAdmin
    });
    setIsUserModalOpen(true);
  };

  const handleUserModalCancel = () => {
    console.log('User modal cancelled');
    setIsUserModalOpen(false);
    userForm.resetFields();
    setEditingUser(null);
  };

  const handleUserModalSubmit = async () => {
    try {
      console.log('User form submitted');
      const values = await userForm.validateFields();
      console.log('User form values:', values);
      setIsLoading(true);
      console.log('Updating user with values:', values);
      
      if (!editingUser) {
        throw new Error('No user selected for editing');
      }
      
      // Make direct API call
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Ensure token has proper Bearer format
      const formattedToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;

      const userData = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        isAdmin: !!values.isAdmin // Ensure boolean
      };

      console.log('Sending user data:', userData);
      console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': formattedToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      console.log('Update user response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Update user error:', errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText || 'Failed to update user' };
        }
        throw new Error(errorData.message || `Failed to update user with status: ${response.status}`);
      }
      
      message.success('User updated successfully!');
      fetchUsers(); // Reload users
      setIsUserModalOpen(false);
      userForm.resetFields();
      setEditingUser(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update user';
      console.error('Error updating user:', errorMessage);
      message.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Edit workshop functions
  const handleEditWorkshop = (workshop: Workshop) => {
    setEditingWorkshop(workshop);
    
    const workshopDate = workshop.date;
    
    workshopForm.setFieldsValue({
      title: workshop.title,
      instructor: workshop.instructor,
      date: workshopDate ? moment(workshopDate) : null,
      description: workshop.description,
      meetingId: workshop.meetingId || '',
      materials: workshop.materials || [],
      // agenda: workshop.agenda || [] // TODO: Initialize agenda when its Form.List is added
    });
    
    setIsWorkshopModalOpen(true);
  };

  // Delete workshop function - now using API
  const handleDeleteWorkshop = async (workshopId: number) => {
    try {
      console.log('Deleting workshop with ID:', workshopId);
      setIsLoading(true);
      
      // Get token for API call
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      // Ensure token has proper Bearer format
      const formattedToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/workshops/${workshopId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': formattedToken,
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Workshop delete API response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Workshop delete API error:', errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText || 'Failed to delete workshop' };
        }
        throw new Error(errorData.message || `Failed to delete workshop with status: ${response.status}`);
      }
      
      message.success('Workshop deleted successfully from database!');
      
      // Refresh the workshops from the database
      fetchWorkshops();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete workshop';
      console.error('Error deleting workshop:', errorMessage);
      message.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    console.log('Logging out...');
    signout();
  }

  const handleSendCustomEmail = async (values: { toEmails: string[]; subject: string; htmlBody: string }) => {
    setIsSendingEmail(true);
    message.loading({ content: 'Sending email(s)...', key: 'sendEmail' });
    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('Authentication token not found.');
      const formattedToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;

      // Backend will be updated to accept toEmails as an array
      const payload = {
        toEmails: Array.isArray(values.toEmails) ? values.toEmails : [values.toEmails], // Ensure it's an array
        subject: values.subject,
        htmlBody: values.htmlBody,
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/send-custom-email`, {
        method: 'POST',
        headers: {
          'Authorization': formattedToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to send email(s)');
      }
      message.success({ content: 'Email(s) sent successfully!', key: 'sendEmail', duration: 2 });
      emailForm.resetFields();
    } catch (error: any) {
      console.error('Error sending custom email:', error);
      message.error({ content: error.message || 'Failed to send email(s).', key: 'sendEmail', duration: 2 });
    } finally {
      setIsSendingEmail(false);
    }
  };

  const userColumns = [
    {
      title: 'Name',
      key: 'name',
      render: (record: User) => `${record.firstName} ${record.lastName}`,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Role',
      key: 'role',
      render: (record: User) => (
        record.isAdmin ? <Text strong>Admin</Text> : 'Student'
      ),
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: User) => (
        <Space>
          <Button 
            icon={<EditOutlined />} 
            size="small"
            onClick={() => handleEditUser(record)}
          >
            Edit
          </Button>
          <Button 
            icon={<DeleteOutlined />} 
            size="small" 
            danger
            onClick={() => {
              Modal.confirm({
                title: 'Delete User',
                content: `Are you sure you want to delete ${record.firstName} ${record.lastName}?`,
                okText: 'Yes',
                okType: 'danger',
                cancelText: 'No',
                onOk() {
                  handleDeleteUser(record.id);
                }
              });
            }}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  const workshopColumns = [
    {
      title: 'Workshop',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Instructor',
      dataIndex: 'instructor',
      key: 'instructor',
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Participants',
      dataIndex: 'participants',
      key: 'participants',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: Workshop) => (
        <Space>
          <Button 
            icon={<EditOutlined />} 
            size="small" 
            onClick={() => handleEditWorkshop(record)}
          >
            Edit
          </Button>
          <Button 
            icon={<DeleteOutlined />} 
            size="small" 
            danger
            onClick={() => {
              console.log('[AdminDashboard] Delete button clicked for workshop ID:', record.id);
              try {
                console.log('[AdminDashboard] Attempting to show messageApi.info');
                messageApi.info('Test message from antd messageApi instance.', 5);
                console.log('[AdminDashboard] messageApi.info call completed.');

                console.log('[AdminDashboard] Attempting to show modal.info');
                modal.info({
                  title: 'Test Info Modal (from instance)',
                  content: 'This is a test of modal.info from App.useApp().',
                  onOk() {
                    console.log('[AdminDashboard] modal.info (instance) OK button clicked.');
                  }
                });
                console.log('[AdminDashboard] modal.info (instance) call completed.');
              } catch (e) {
                console.error('[AdminDashboard] Error calling modal.info or messageApi.info:', e);
              }
            }}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  const courseColumns = [
    { title: 'Course', dataIndex: 'title', key: 'title' },
    { title: 'Instructor', dataIndex: 'instructor', key: 'instructor' },
    { title: 'Students', dataIndex: 'students', key: 'students' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: Course) => (
        <Space>
          <Button 
            icon={<EditOutlined />} 
            size="small" 
            onClick={() => handleEditCourse(record)}
          >
            Edit
          </Button>
          <Button 
            icon={<DeleteOutlined />} 
            size="small" 
            danger 
            onClick={() => handleDeleteCourse(record)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  const renderContent = () => {
    switch (selectedMenu) {
      case 'dashboard':
        return (
          <>
            <Title level={2}>Admin Dashboard</Title>
            
            <Row gutter={16} style={{ marginBottom: '24px' }}>
              <Col span={8}>
                <Card>
                  <Statistic title="Total Users" value={users.length} />
                </Card>
              </Col>
              <Col span={8}>
                <Card>
                  <Statistic title="Workshops" value={workshops.length} />
                </Card>
              </Col>
              <Col span={8}>
                <Card>
                  <Statistic title="Active Students" value={users.filter(u => !u.isAdmin).length} />
                </Card>
              </Col>
            </Row>
            
            <Card title="Recent Workshops">
              <Table 
                dataSource={workshops} 
                columns={workshopColumns} 
                rowKey="id" 
                pagination={false}
              />
            </Card>
          </>
        );
      
      case 'users':
        return (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <Title level={2}>User Management</Title>
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={handleCreateUser}
              >
                Add User
              </Button>
            </div>
            
            <Card>
              {error && (
                <div style={{ marginBottom: '16px', color: 'red' }}>
                  Error loading users: {error}
                </div>
              )}
              <Table 
                dataSource={users} 
                columns={userColumns} 
                rowKey="id" 
                pagination={{ pageSize: 10 }}
                loading={loadingUsers}
              />
            </Card>
          </>
        );
      
      case 'workshops':
        return (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <Title level={2}>Workshop Management</Title>
              <Space>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={handleCreateWorkshop}
                >
                  Create Workshop
                </Button>
                <Button
                  onClick={handleCreateZoomMeeting}
                  icon={<VideoCameraOutlined />}
                >
                  Create Zoom Meeting
                </Button>
              </Space>
            </div>
            
            <Card>
              <Table 
                dataSource={workshops} 
                columns={workshopColumns} 
                rowKey="id" 
                pagination={{ pageSize: 10 }}
              />
            </Card>
          </>
        );
      
      case 'courses':
        return (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <Title level={2}>Course Management</Title>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={handleCreateCourse}
              >
                Add Course
              </Button>
            </div>
            
            <Card>
              {error && (
                <div style={{ marginBottom: '16px', color: 'red' }}>
                  Error loading courses: {error}
                </div>
              )}
              <Table 
                dataSource={courses} 
                columns={courseColumns}
                rowKey="id"
                pagination={{ pageSize: 10 }}
                loading={loadingCourses}
              />
            </Card>
          </>
        );
      
      case 'emailTool':
        return (
          <>
            <Title level={2} style={{ marginBottom: '24px' }}>Send Custom Email</Title>
            <Card>
              <Form
                form={emailForm}
                layout="vertical"
                onFinish={handleSendCustomEmail}
              >
                <Form.Item
                  name="toEmails"
                  label="To User(s)"
                  rules={[
                    { required: true, message: 'Please select at least one recipient' },
                  ]}
                >
                  <Select
                    mode="multiple"
                    allowClear
                    style={{ width: '100%' }}
                    placeholder="Select user(s)"
                    loading={loadingUsers}
                  >
                    {users.map(u => (
                      <Select.Option key={u.id} value={u.email}>
                        {u.firstName} {u.lastName} ({u.email})
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item
                  name="subject"
                  label="Subject"
                  rules={[{ required: true, message: 'Please enter the email subject' }]}
                >
                  <Input placeholder="Email Subject" />
                </Form.Item>
                <Form.Item
                  name="htmlBody"
                  label="Email Body (HTML allowed)"
                  rules={[{ required: true, message: 'Please enter the email body' }]}
                >
                  <Input.TextArea rows={10} placeholder="<p>Hello,</p><p>This is your email content.</p>" />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit" loading={isSendingEmail}>
                    Send Email
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </>
        );
      
      default:
        return (
          <div style={{ textAlign: 'center', padding: '100px 0' }}>
            <Title level={3}>Select a menu item from the sidebar</Title>
          </div>
        );
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={250} style={{ background: '#fff', borderRight: '1px solid #f0f0f0' }}>
        <div style={{ padding: '16px', textAlign: 'center', cursor: 'pointer' }} onClick={() => router.push('/')}>
          <Image 
            src="/logo.png" 
            alt="Psychology LMS Logo"
            width={150}
            height={75}
            priority
          />
        </div>
        
        <Divider style={{ margin: '0 0 8px 0' }} />
        
        <Menu
          mode="inline"
          selectedKeys={[selectedMenu]}
          style={{ height: '100%' }}
          onClick={({ key }) => handleMenuClick(key)}
          items={[
            {
              key: 'dashboard',
              icon: <DashboardOutlined />,
              label: 'Dashboard'
            },
            {
              key: 'users',
              icon: <UserOutlined />,
              label: 'User Management'
            },
            {
              key: 'workshops',
              icon: <CalendarOutlined />,
              label: 'Workshops'
            },
            {
              key: 'courses',
              icon: <BookOutlined />,
              label: 'Courses'
            },
            {
              key: 'emailTool',
              icon: <MailOutlined />,
              label: 'Email Tool'
            },
            {
              type: 'divider'
            },
            {
              key: 'logout',
              icon: <LogoutOutlined />,
              label: 'Logout',
              danger: true,
              onClick: handleLogout
            }
          ]}
        />
      </Sider>
      
      <Layout>
        <Header style={{ 
          background: '#fff', 
          padding: '0 16px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'flex-end',
          boxShadow: '0 1px 4px rgba(0,21,41,.08)'
        }}>
          <Text>Welcome, {user.firstName} User</Text>
        </Header>
        
        <Content style={{ padding: '24px', overflow: 'auto' }}>
          {renderContent()}
        </Content>
      </Layout>
      
      {/* Create User Modal */}
      <Modal
        title="Create New User"
        open={isModalOpen}
        onCancel={handleModalCancel}
        footer={[
          <Button key="cancel" onClick={handleModalCancel}>
            Cancel
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            loading={isLoading}
            onClick={() => newUserForm.submit()}
          >
            Create User
          </Button>
        ]}
      >
        <Form
          form={newUserForm}
          layout="vertical"
          onFinish={handleModalSubmit}
        >
          <Form.Item
            name="firstName"
            label="First Name"
            rules={[{ required: true, message: 'Please enter the first name' }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="lastName"
            label="Last Name"
            rules={[{ required: true, message: 'Please enter the last name' }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please enter the email' },
              { type: 'email', message: 'Please enter a valid email' }
            ]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: 'Please enter a password' }]}
          >
            <Input.Password />
          </Form.Item>
          
          <Form.Item
            name="isAdmin"
            valuePropName="checked"
          >
            <Input type="checkbox" /> Admin privileges
          </Form.Item>
        </Form>
      </Modal>

      {/* Create Zoom Meeting Modal */}
      <Modal
        title="Create Zoom Meeting for Workshop"
        open={isZoomModalOpen}
        onCancel={handleZoomModalCancel}
        footer={[
          <Button key="cancel" onClick={handleZoomModalCancel}>
            Cancel
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            loading={isLoading}
            onClick={() => zoomForm.submit()}
          >
            Create Meeting
          </Button>
        ]}
      >
        <Form
          form={zoomForm}
          layout="vertical"
          onFinish={handleZoomModalSubmit}
        >
          <Form.Item
            name="workshopId"
            label="Select Workshop"
            rules={[{ required: true, message: 'Please select a workshop' }]}
          >
            <Select placeholder="Select a workshop">
              {workshops.map(workshop => (
                <Select.Option key={workshop.id} value={workshop.id}>
                  {workshop.title}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="meetingDate"
            label="Meeting Date"
            rules={[{ required: true, message: 'Please select a date' }]}
          >
            <DatePicker style={{ width: '100%' }} showTime />
          </Form.Item>
          
          <Form.Item
            name="duration"
            label="Duration (minutes)"
            rules={[{ required: true, message: 'Please enter duration' }]}
          >
            <Input type="number" min={15} step={15} defaultValue={60} />
          </Form.Item>
          
          <Form.Item
            name="topic"
            label="Meeting Topic"
            rules={[{ required: true, message: 'Please enter a topic' }]}
          >
            <Input placeholder="Enter meeting topic" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="Description"
          >
            <Input.TextArea rows={4} placeholder="Enter meeting description" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Course Modal */}
      <Modal
        title={editingCourse ? "Edit Course" : "Create New Course"}
        open={isCourseModalOpen}
        onCancel={handleCourseModalCancel}
        footer={[
          <Button key="cancel" onClick={handleCourseModalCancel}>
            Cancel
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            loading={isLoading}
            onClick={() => courseForm.submit()}
          >
            {editingCourse ? "Update Course" : "Create Course"}
          </Button>
        ]}
      >
        <Form
          form={courseForm}
          layout="vertical"
          onFinish={handleCourseModalSubmit}
        >
          <Form.Item
            name="title"
            label="Course Title"
            rules={[{ required: true, message: 'Please enter the course title' }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="instructor"
            label="Instructor"
            rules={[{ required: true, message: 'Please enter the instructor name' }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="Description"
          >
            <Input.TextArea rows={4} />
          </Form.Item>
          
          <Form.Item
            name="students"
            label="Maximum Students"
            rules={[{ required: true, message: 'Please enter maximum students' }]}
          >
            <Input type="number" min={1} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Workshop Modal */}
      <Modal
        title={editingWorkshop ? "Edit Workshop" : "Create New Workshop"}
        open={isWorkshopModalOpen}
        onCancel={handleWorkshopModalCancel}
        width={800}
        footer={[
          <Button key="cancel" onClick={handleWorkshopModalCancel}>
            Cancel
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            loading={isLoading}
            onClick={() => {
              console.log('Workshop modal submit button clicked');
              workshopForm.submit();
            }}
          >
            {editingWorkshop ? "Update Workshop" : "Create Workshop"}
          </Button>
        ]}
      >
        <Form
          form={workshopForm}
          layout="vertical"
          onFinish={handleWorkshopModalSubmit}
        >
          <Form.Item
            name="title"
            label="Workshop Title"
            rules={[{ required: true, message: 'Please enter the workshop title' }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="instructor"
            label="Instructor"
            rules={[{ required: true, message: 'Please enter the instructor name' }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="date"
            label="Workshop Date"
            rules={[{ required: true, message: 'Please select a date' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="Description"
          >
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item
            name="meetingId"
            label="Zoom Meeting ID (Optional)"
            tooltip="Enter the 9-11 digit Zoom Meeting ID to associate with this workshop. Leave blank if no specific Zoom meeting is set up yet."
          >
            <Input placeholder="E.g., 9809175590" />
          </Form.Item>

          <Divider>Materials</Divider>
          <Form.List name="materials">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Row key={key} gutter={16} align="bottom" style={{ marginBottom: 0 }}>
                    <Col span={7}>
                      <Form.Item
                        {...restField}
                        name={[name, 'name']}
                        label="Material Name"
                        rules={[{ required: true, message: 'Missing material name' }]}
                      >
                        <Input placeholder="E.g., Slides PDF" />
                      </Form.Item>
                    </Col>
                    <Col span={10}>
                      <Form.Item
                        {...restField}
                        name={[name, 'url']}
                        label="Material URL"
                        rules={[{ required: true, message: 'Missing material URL' }, { type: 'url', message: 'Must be a valid URL' }]}
                      >
                        <Input placeholder="https://example.com/material.pdf" />
                      </Form.Item>
                    </Col>
                    <Col span={5}>
                      <Form.Item
                        {...restField}
                        name={[name, 'type']} 
                        label="Type"
                        rules={[{ required: true, message: 'Missing material type' }]}
                      >
                        <Input placeholder="E.g., PDF, DOCX, Link" />
                      </Form.Item>
                    </Col>
                    <Col span={2} style={{ display: 'flex', alignItems: 'center', paddingBottom: '24px' }}>
                      <MinusCircleOutlined onClick={() => remove(name)} />
                    </Col>
                  </Row>
                ))}
                <Form.Item style={{ marginTop: '16px' }}>
                  <Button type="dashed" onClick={() => add({ name: '', url: '', type: '' })} block icon={<PlusOutlined />}>
                    Add Material
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>

        </Form>
      </Modal>

      {/* User Edit Modal */}
      <Modal
        title="Edit User"
        open={isUserModalOpen}
        onCancel={handleUserModalCancel}
        footer={[
          <Button key="cancel" onClick={handleUserModalCancel}>
            Cancel
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            loading={isLoading}
            onClick={() => {
              console.log('User modal submit button clicked');
              userForm.submit();
            }}
          >
            Update User
          </Button>
        ]}
      >
        <Form
          form={userForm}
          layout="vertical"
          onFinish={handleUserModalSubmit}
          initialValues={{ isAdmin: false }}
        >
          <Form.Item
            name="firstName"
            label="First Name"
            rules={[{ required: true, message: 'Please enter the first name' }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="lastName"
            label="Last Name"
            rules={[{ required: true, message: 'Please enter the last name' }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please enter the email' },
              { type: 'email', message: 'Please enter a valid email' }
            ]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="isAdmin"
            valuePropName="checked"
          >
            <Checkbox>Admin privileges</Checkbox>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
} 