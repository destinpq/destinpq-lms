// Use environment variable for API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:15001/lms';

export interface Workshop {
  id: string;
  title: string;
  instructor: string;
  date: string;
  description: string;
  duration: string;
  materials?: {
    name: string;
    type: string;
    link: string;
  }[];
  agenda?: {
    time: string;
    activity: string;
  }[];
}

export interface Session {
  id: number;
  title: string;
  course: string;
  date: string;
  instructor: string;
  link: string;
}

export interface Homework {
  id: number;
  title: string;
  course: string;
  dueDate: string;
  status: 'Not Started' | 'In Progress' | 'Completed';
  link: string;
}

export interface Message {
  id: number;
  sender: string;
  avatar: string;
  message: string;
  time: string;
  unread: boolean;
}

export const workshopService = {
  async getNextWorkshop(): Promise<Workshop> {
    const token = localStorage.getItem('access_token');
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    try {
      const response = await fetch(`${API_URL}/workshops/next`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (error) {
          errorData = { message: errorText || 'Failed to get next workshop' };
        }
        throw new Error(errorData.message || `Failed to get next workshop with status: ${response.status}`);
      }

      const workshopData = await response.json();
      return workshopData;
    } catch (error) {
      console.error('Next workshop fetch error:', error);
      throw error;
    }
  },

  async getWorkshopById(id: string): Promise<Workshop> {
    const token = localStorage.getItem('access_token');
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    try {
      const response = await fetch(`${API_URL}/workshops/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (error) {
          errorData = { message: errorText || 'Failed to get workshop details' };
        }
        throw new Error(errorData.message || `Failed to get workshop details with status: ${response.status}`);
      }

      const workshopData = await response.json();
      return workshopData;
    } catch (error) {
      console.error(`Workshop ${id} fetch error:`, error);
      throw error;
    }
  },

  async getUpcomingSessions(): Promise<Session[]> {
    const token = localStorage.getItem('access_token');
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    try {
      const response = await fetch(`${API_URL}/sessions/upcoming`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (error) {
          errorData = { message: errorText || 'Failed to get upcoming sessions' };
        }
        throw new Error(errorData.message || `Failed to get upcoming sessions with status: ${response.status}`);
      }

      const sessionsData = await response.json();
      return sessionsData;
    } catch (error) {
      console.error('Upcoming sessions fetch error:', error);
      throw error;
    }
  },

  async getPendingHomework(): Promise<Homework[]> {
    const token = localStorage.getItem('access_token');
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    try {
      const response = await fetch(`${API_URL}/homework/pending`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (error) {
          errorData = { message: errorText || 'Failed to get pending homework' };
        }
        throw new Error(errorData.message || `Failed to get pending homework with status: ${response.status}`);
      }

      const homeworkData = await response.json();
      return homeworkData;
    } catch (error) {
      console.error('Pending homework fetch error:', error);
      throw error;
    }
  },

  async getRecentMessages(): Promise<Message[]> {
    const token = localStorage.getItem('access_token');
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    try {
      const response = await fetch(`${API_URL}/messages/recent`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (error) {
          errorData = { message: errorText || 'Failed to get recent messages' };
        }
        throw new Error(errorData.message || `Failed to get recent messages with status: ${response.status}`);
      }

      const messagesData = await response.json();
      return messagesData;
    } catch (error) {
      console.error('Recent messages fetch error:', error);
      throw error;
    }
  }
}; 