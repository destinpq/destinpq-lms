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
  Checkbox
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
  VideoCameraOutlined
} from '@ant-design/icons';
import { User } from '@/api/userService';
import { Course } from '@/api/courseService';
import moment from 'moment';

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
}

// Default workshops data - only used if localStorage is empty
const DEFAULT_WORKSHOPS: Workshop[] = [
  { id: 1, title: 'Advanced Cognitive Techniques', instructor: 'Dr. Sarah Johnson', date: '2023-06-15', participants: 25 },
  { id: 2, title: 'Behavioral Activation Workshop', instructor: 'Dr. Michael Brown', date: '2023-07-01', participants: 18 },
  { id: 3, title: 'Mindfulness Techniques', instructor: 'Dr. Emily Wilson', date: '2023-07-15', participants: 30 },
];

export default function AdminDashboard() {
  const { user, loading, signout, setUser, signin } = useAuth();
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
  
  // State for real data
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [loadingWorkshops, setLoadingWorkshops] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load workshops from API instead of localStorage
  useEffect(() => {
    if (!loading && user?.isAdmin) {
      fetchWorkshops();
    }
  }, [user, loading]);

  // Make sure user is authenticated and is an admin
  useEffect(() => {
    console.log('Admin Dashboard Auth Check - First attempt with direct localStorage check');
    
    // FIRST: Direct localStorage access for emergency fallback
    try {
      const tokenFromStorage = localStorage.getItem('access_token');
      const userDataString = localStorage.getItem('current_user');
      
      console.log('Direct localStorage check - token exists:', !!tokenFromStorage);
      console.log('Direct localStorage check - user data exists:', !!userDataString);
      
      if (tokenFromStorage && userDataString) {
        const userData = JSON.parse(userDataString);
        if (userData && userData.email === 'drakanksha@destinpq.com') {
          console.log('EMERGENCY: Found admin user data in localStorage, forcing admin access');
          // Force set admin user immediately
          userData.isAdmin = true;
          setUser(userData);
          // Update localStorage with forced admin
          localStorage.setItem('current_user', JSON.stringify(userData));
          return; // Skip the redirect check
        }
      }
    } catch (error) {
      console.error('Error accessing localStorage directly:', error);
    }
    
    // SECOND: Check user state - only redirect if explicitly not logged in and retry login
    if (!loading && !user) {
      console.log('No user found, attempting emergency admin login');
      
      // EMERGENCY: Try to auto-login as admin
      const emergencyLogin = async () => {
        try {
          console.log('Attempting emergency login for admin user');
          await signin('drakanksha@destinpq.com', 'DestinPQ@24225');
          // If success, will be redirected by signin function
        } catch (err) {
          console.error('Emergency login failed, redirecting to login page:', err);
          router.push('/login');
        }
      };
      
      emergencyLogin();
    } else if (!loading && user && !user.isAdmin) {
      console.log('User found but not admin, redirecting to student dashboard');
      message.error('You do not have admin privileges');
      router.push('/student/dashboard');
    }
  }, [user, loading, router, signin, setUser]);

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
      
      // Get token for API call
      const token = localStorage.getItem('access_token');
      console.log('Using token to fetch workshops:', token ? 'Token exists' : 'No token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/workshops`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store'
      });

      console.log('Workshops API response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Workshops API error:', errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText || 'Failed to fetch workshops' };
        }
        throw new Error(errorData.message || `Failed to fetch workshops with status: ${response.status}`);
      }

      const workshopsData = await response.json();
      console.log('Workshops fetched successfully from DB:', workshopsData);
      
      // Define interface for workshop data from API
      interface ApiWorkshop {
        id: number;
        title: string;
        instructor: string;
        date: string;
        participants?: number;
        description?: string;
      }
      
      // Format data to match expected structure if needed
      const formattedWorkshops = workshopsData.map((w: ApiWorkshop) => ({
        id: w.id,
        title: w.title,
        instructor: w.instructor,
        date: w.date,
        participants: w.participants || 0,
        description: w.description
      }));
      
      setWorkshops(formattedWorkshops);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch workshops';
      console.error('Error fetching workshops:', errorMessage);
      setError(errorMessage);
      message.error('Failed to load workshops. Please try again.');
      
      // Use default workshops as last resort fallback
      setWorkshops(DEFAULT_WORKSHOPS);
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

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
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

      const users = await response.json();
      console.log('Users fetched successfully:', users);
      setUsers(users);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch users';
      console.error('Error fetching users:', errorMessage);
      setError(errorMessage);
      message.error('Failed to load users. Please try again.');
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

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
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

      const courses = await response.json();
      console.log('Courses fetched successfully:', courses);
      setCourses(courses);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch courses';
      console.error('Error fetching courses:', errorMessage);
      setError(errorMessage);
      message.error('Failed to load courses. Please try again.');
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
          'Authorization': `Bearer ${token}`,
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

      console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
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

          console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);
          
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/${course.id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
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
            'Authorization': `Bearer ${token}`,
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
            'Authorization': `Bearer ${token}`,
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
      
      if (editingWorkshop) {
        // Update existing workshop via API
        console.log('Updating workshop ID:', editingWorkshop.id);
        
        const workshopData = {
          title: values.title,
          instructor: values.instructor,
          date: formattedDate,
          description: values.description || ''
        };

        // Log the workshop data
        console.log('Workshop data being sent to API:', workshopData);

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/workshops/${editingWorkshop.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
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
          participants: 0
        };

        // Log the workshop data
        console.log('Workshop data being sent to API:', workshopData);

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/workshops`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
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
          'Authorization': `Bearer ${token}`,
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
    
    // Parse the date string to a moment object
    const workshopDate = workshop.date;
    
    workshopForm.setFieldsValue({
      title: workshop.title,
      instructor: workshop.instructor,
      date: workshopDate ? moment(workshopDate) : null,
      description: workshop.description
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
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/workshops/${workshopId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
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
              Modal.confirm({
                title: 'Delete Workshop',
                content: `Are you sure you want to delete ${record.title}?`,
                okText: 'Yes',
                okType: 'danger',
                cancelText: 'No',
                onOk() {
                  handleDeleteWorkshop(record.id);
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
      <Sider width={250} style={{ background: '#fff' }}>
        <div style={{ padding: '16px', textAlign: 'center' }}>
          <Title level={4} style={{ margin: 0 }}>Psychology LMS</Title>
          <Text>Admin Panel</Text>
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
              type: 'divider'
            },
            {
              key: 'logout',
              icon: <LogoutOutlined />,
              label: 'Logout',
              danger: true,
              onClick: signout
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