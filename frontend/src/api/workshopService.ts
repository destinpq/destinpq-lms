// Use environment variable for API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:15001/lms';

// Calculate future dates for workshops
const getFutureDate = (daysFromNow: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
};

// Fallback workshop data with future dates
const DEFAULT_WORKSHOPS = [
  { 
    id: '1', 
    title: 'Advanced Cognitive Techniques', 
    instructor: 'Dr. Sarah Johnson', 
    date: getFutureDate(3), // 3 days from now
    description: 'Learn advanced cognitive behavioral techniques for therapy practice.',
    duration: '2 hours',
    participants: 25 
  },
  { 
    id: '2', 
    title: 'Behavioral Activation Workshop', 
    instructor: 'Dr. Michael Brown', 
    date: getFutureDate(7), // 7 days from now
    description: 'Hands-on workshop focused on behavioral activation strategies.',
    duration: '1.5 hours',
    participants: 18 
  },
  { 
    id: '3', 
    title: 'Mindfulness Techniques', 
    instructor: 'Dr. Emily Wilson', 
    date: getFutureDate(14), // 14 days from now
    description: 'Introduction to mindfulness-based cognitive therapy approaches.',
    duration: '2 hours',
    participants: 30 
  },
];

// Initialize LocalStorage with fallback data if needed
const initializeLocalStorage = () => {
  if (!localStorage.getItem('workshops')) {
    localStorage.setItem('workshops', JSON.stringify(DEFAULT_WORKSHOPS));
  }
};

// Function to get all workshops from localStorage 
const getWorkshopsFromLocalStorage = (): Workshop[] => {
  initializeLocalStorage();
  try {
    const workshops = JSON.parse(localStorage.getItem('workshops') || '[]');
    
    // Fix dates only once when fetched - don't recalculate every time
    // Use a flag in localStorage to track if dates have been updated
    const datesUpdated = localStorage.getItem('workshop_dates_updated');
    
    if (!datesUpdated) {
      console.log('First-time workshop date adjustment to ensure future dates');
      
      // Update all workshop dates to be in the future if needed
      const currentYear = new Date().getFullYear();
      let hasUpdates = false;
      
      workshops.forEach(workshop => {
        const workshopDate = new Date(workshop.date);
        
        // If date is in the past, update it to be next year
        if (workshopDate < new Date()) {
          const dateParts = workshop.date.split('-');
          // Update the year to next year
          workshop.date = `${currentYear + 1}-${dateParts[1]}-${dateParts[2]}`;
          hasUpdates = true;
        }
      });
      
      // Only save if we made updates
      if (hasUpdates) {
        console.log('Saving updated workshop dates to localStorage');
        localStorage.setItem('workshops', JSON.stringify(workshops));
      }
      
      // Set flag to prevent recurring updates
      localStorage.setItem('workshop_dates_updated', 'true');
    }
    
    return workshops;
  } catch (error) {
    console.error('Error parsing workshops from localStorage:', error);
    return DEFAULT_WORKSHOPS;
  }
};

// Function to save workshops to localStorage
const saveWorkshopsToLocalStorage = (workshops: Workshop[]) => {
  localStorage.setItem('workshops', JSON.stringify(workshops));
};

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
  participants: number;
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
      // Try to fetch from backend first
      const response = await fetch(`${API_URL}/workshops/next`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const workshopData = await response.json();
        return workshopData;
      }
      
      console.log('Backend API not available, using localStorage data');
      
      // Fallback to localStorage if API doesn't work
      const workshops = getWorkshopsFromLocalStorage();
      
      // Get the nearest future workshop based on date
      // Ensure dates are in future - add 2025 to year for demo purposes
      const futureWorkshops = workshops.map(workshop => {
        const workshopDate = new Date(workshop.date);
        const currentYear = new Date().getFullYear();
        
        // If date is in the past, use current year + 1
        if (workshopDate < new Date()) {
          const dateParts = workshop.date.split('-');
          // Update the year to next year
          workshop.date = `${currentYear + 1}-${dateParts[1]}-${dateParts[2]}`;
        }
        
        return workshop;
      });
      
      // Sort by date (ascending)
      futureWorkshops.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      // Return the first (nearest) workshop
      return futureWorkshops[0] || DEFAULT_WORKSHOPS[0];
    } catch (error) {
      console.error('Next workshop fetch error:', error);
      
      // Last resort fallback 
      const workshops = getWorkshopsFromLocalStorage();
      return workshops[0] || DEFAULT_WORKSHOPS[0];
    }
  },

  async getWorkshopById(id: string): Promise<Workshop> {
    const token = localStorage.getItem('access_token');
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    try {
      // Try API first
      const response = await fetch(`${API_URL}/workshops/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const workshopData = await response.json();
        return workshopData;
      }
      
      console.log('Backend API not available, using localStorage data');
      
      // Fallback to localStorage
      const workshops = getWorkshopsFromLocalStorage();
      const workshop = workshops.find(w => w.id === id);
      
      if (!workshop) {
        throw new Error(`Workshop with ID ${id} not found`);
      }
      
      return workshop;
    } catch (error) {
      console.error(`Workshop ${id} fetch error:`, error);
      
      // Last resort fallback
      const workshops = getWorkshopsFromLocalStorage();
      const workshop = workshops.find(w => w.id === id);
      
      if (!workshop) {
        throw new Error(`Workshop with ID ${id} not found`);
      }
      
      return workshop;
    }
  },

  async getAllWorkshops(): Promise<Workshop[]> {
    const token = localStorage.getItem('access_token');
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    try {
      // Try API first
      const response = await fetch(`${API_URL}/workshops`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const workshopsData = await response.json();
        return workshopsData;
      }
      
      console.log('Backend API not available, using localStorage data');
      
      // Fallback to localStorage
      return getWorkshopsFromLocalStorage();
    } catch (error) {
      console.error('Workshops fetch error:', error);
      
      // Last resort fallback
      return getWorkshopsFromLocalStorage();
    }
  },

  async createWorkshop(workshopData: Omit<Workshop, 'id'>): Promise<Workshop> {
    const token = localStorage.getItem('access_token');
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    try {
      // Try API first
      const response = await fetch(`${API_URL}/workshops`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(workshopData),
      });
      
      if (response.ok) {
        const createdWorkshop = await response.json();
        return createdWorkshop;
      }
      
      console.log('Backend API not available, using localStorage data');
      
      // Fallback to localStorage
      const workshops = getWorkshopsFromLocalStorage();
      
      // Create a new workshop with a unique ID
      const newWorkshop: Workshop = {
        ...workshopData,
        id: Date.now().toString() // Use timestamp as ID
      };
      
      // Add to localStorage
      workshops.push(newWorkshop);
      saveWorkshopsToLocalStorage(workshops);
      
      return newWorkshop;
    } catch (error) {
      console.error('Create workshop error:', error);
      
      // Last resort fallback
      const workshops = getWorkshopsFromLocalStorage();
      
      // Create a new workshop with a unique ID
      const newWorkshop: Workshop = {
        ...workshopData,
        id: Date.now().toString() // Use timestamp as ID
      };
      
      // Add to localStorage
      workshops.push(newWorkshop);
      saveWorkshopsToLocalStorage(workshops);
      
      return newWorkshop;
    }
  },

  async updateWorkshop(id: string, workshopData: Partial<Workshop>): Promise<Workshop> {
    const token = localStorage.getItem('access_token');
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    try {
      // Try API first
      const response = await fetch(`${API_URL}/workshops/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(workshopData),
      });
      
      if (response.ok) {
        const updatedWorkshop = await response.json();
        return updatedWorkshop;
      }
      
      console.log('Backend API not available, using localStorage data');
      
      // Fallback to localStorage
      const workshops = getWorkshopsFromLocalStorage();
      const workshopIndex = workshops.findIndex(w => w.id === id);
      
      if (workshopIndex === -1) {
        throw new Error(`Workshop with ID ${id} not found`);
      }
      
      // Update workshop
      workshops[workshopIndex] = {
        ...workshops[workshopIndex],
        ...workshopData
      };
      
      saveWorkshopsToLocalStorage(workshops);
      
      return workshops[workshopIndex];
    } catch (error) {
      console.error(`Update workshop ${id} error:`, error);
      
      // Last resort fallback
      const workshops = getWorkshopsFromLocalStorage();
      const workshopIndex = workshops.findIndex(w => w.id === id);
      
      if (workshopIndex === -1) {
        throw new Error(`Workshop with ID ${id} not found`);
      }
      
      // Update workshop
      workshops[workshopIndex] = {
        ...workshops[workshopIndex],
        ...workshopData
      };
      
      saveWorkshopsToLocalStorage(workshops);
      
      return workshops[workshopIndex];
    }
  },

  async deleteWorkshop(id: string): Promise<void> {
    const token = localStorage.getItem('access_token');
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    try {
      // Try API first
      const response = await fetch(`${API_URL}/workshops/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        return;
      }
      
      console.log('Backend API not available, using localStorage data');
      
      // Fallback to localStorage
      const workshops = getWorkshopsFromLocalStorage();
      const filteredWorkshops = workshops.filter(w => w.id !== id);
      
      if (filteredWorkshops.length === workshops.length) {
        throw new Error(`Workshop with ID ${id} not found`);
      }
      
      saveWorkshopsToLocalStorage(filteredWorkshops);
    } catch (error) {
      console.error(`Delete workshop ${id} error:`, error);
      
      // Last resort fallback
      const workshops = getWorkshopsFromLocalStorage();
      const filteredWorkshops = workshops.filter(w => w.id !== id);
      
      if (filteredWorkshops.length === workshops.length) {
        throw new Error(`Workshop with ID ${id} not found`);
      }
      
      saveWorkshopsToLocalStorage(filteredWorkshops);
    }
  },

  async getUpcomingSessions(): Promise<Session[]> {
    // Use mock data when API isn't available
    return [
      { id: 1, title: 'Behavioral Therapy Fundamentals', course: 'Clinical Psychology 101', date: '2023-07-01T05:30:00', instructor: 'Dr. Michael Brown', link: '/workshop/1' },
      { id: 2, title: 'Advanced Cognitive Techniques', course: 'Cognitive Psychology 201', date: '2023-07-15T05:30:00', instructor: 'Dr. Sarah Johnson', link: '/workshop/2' },
    ];
  },

  async getPendingHomework(): Promise<Homework[]> {
    // Use mock data when API isn't available
    return [
      { id: 1, title: 'CBT Case Analysis', course: 'Cognitive Psychology 201', dueDate: '2023-07-10T23:59:59', status: 'In Progress', link: '/homework/1' },
      { id: 2, title: 'Research Methods Quiz', course: 'Research Fundamentals', dueDate: '2023-07-15T23:59:59', status: 'Not Started', link: '/homework/2' },
    ];
  },

  async getRecentMessages(): Promise<Message[]> {
    // Use mock data when API isn't available
    return [
      { id: 1, sender: 'Dr. Sarah Johnson', avatar: 'https://randomuser.me/api/portraits/women/44.jpg', message: 'Don\'t forget to complete your CBT case study by Friday!', time: '2h', unread: true },
      { id: 2, sender: 'Study Group', avatar: 'https://randomuser.me/api/portraits/men/32.jpg', message: 'Let\'s meet online tomorrow to discuss the journal entries.', time: '1d', unread: false },
    ];
  }
}; 