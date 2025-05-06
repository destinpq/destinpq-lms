// Use environment variable for API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:15001/lms';

// Format token with Bearer prefix - ensure consistency with authService.ts
function formatToken(token: string): string {
  if (!token) return '';
  return token.startsWith('Bearer ') ? token : `Bearer ${token}`;
}

export interface Course {
  id: number;
  title: string;
  description: string;
  instructor: string;
  students: number;
  maxStudents: number;
  createdAt: string;
  updatedAt: string;
}

export const courseService = {
  async getAllCourses(): Promise<Course[]> {
    console.log('Fetching all courses from API');
    
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    // Format token consistently
    const formattedToken = formatToken(token);
    console.log('Using token to fetch courses: Token exists');

    try {
      const response = await fetch(`${API_URL}/courses`, {
        method: 'GET',
        headers: {
          'Authorization': formattedToken,
          'Content-Type': 'application/json',
        },
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
      console.log('Courses fetched successfully:', courses.length);
      return courses;
    } catch (error) {
      console.error('Error fetching courses:', error);
      throw error;
    }
  },

  async createCourse(courseData: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>): Promise<Course> {
    console.log('Creating new course:', courseData.title);
    
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    // Format token consistently
    const formattedToken = formatToken(token);

    try {
      const response = await fetch(`${API_URL}/courses`, {
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

      const newCourse = await response.json();
      console.log('Course created successfully:', newCourse);
      return newCourse;
    } catch (error) {
      console.error('Error creating course:', error);
      throw error;
    }
  },

  async deleteCourse(courseId: number): Promise<void> {
    console.log('Deleting course:', courseId);
    
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    // Format token consistently
    const formattedToken = formatToken(token);

    try {
      const response = await fetch(`${API_URL}/courses/${courseId}`, {
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

      console.log('Course deleted successfully');
    } catch (error) {
      console.error('Error deleting course:', error);
      throw error;
    }
  },

  async updateCourse(courseId: number, courseData: Partial<Omit<Course, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Course> {
    console.log('Updating course:', courseId);
    
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    // Format token consistently
    const formattedToken = formatToken(token);

    try {
      const response = await fetch(`${API_URL}/courses/${courseId}`, {
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

      const updatedCourse = await response.json();
      console.log('Course updated successfully:', updatedCourse);
      return updatedCourse;
    } catch (error) {
      console.error('Error updating course:', error);
      throw error;
    }
  }
}; 