// Use environment variable for API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://polar-lowlands-49166-189f8996c2e7.herokuapp.com/lms';

// Helper to format token with Bearer prefix
function formatTokenForAPI(token: string | null): string {
  if (!token) return '';
  return token.startsWith('Bearer ') ? token : `Bearer ${token}`;
}

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

// --- INTERFACES --- //
export interface Workshop {
  id: string | number; // Allow string or number for ID, backend likely uses number
  title: string;
  instructor: string;
  date: string;
  time?: string; // Added: e.g., "14:00 - 16:00"
  description?: string;
  duration?: string;
  materials?: {
    id?: number;
    name: string;
    type: string;
    url: string;
  }[];
  agenda?: {
    time: string;
    activity: string;
  }[];
  participants: number;
  meetingId?: string; // Added
  // Add any other fields your Workshop entity might have
  createdAt?: string | Date; // From entity
  updatedAt?: string | Date; // From entity
}

export interface Session {
  id: number;
  title: string;
  course: string; // Or courseId if it's a relation
  date: string;
  instructor: string;
  link: string;
  // Add any other fields your Session entity might have
}

export interface Homework {
  id: number;
  title: string;
  course: string; // Or courseId
  dueDate: string;
  status: 'Not Started' | 'In Progress' | 'Completed';
  link: string;
  // Add any other fields
}

export interface Message {
  id: number;
  sender: string;
  avatar?: string; // Optional avatar
  message: string;
  time: string;
  unread: boolean;
  // Add any other fields
}

// --- API SERVICE --- //
export const workshopService = {
  // --- Workshop CRUD --- //
  async getAllWorkshops(): Promise<Workshop[]> {
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.warn('[workshopService.getAllWorkshops] No auth token found, cannot fetch workshops.');
      return [];
    }
    const formattedToken = formatTokenForAPI(token);
    console.log('[workshopService.getAllWorkshops] Attempting to fetch from API with token...');
    try {
      const response = await fetch(`${API_URL}/workshops`, {
        method: 'GET',
        headers: {
          'Authorization': formattedToken,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`[workshopService.getAllWorkshops] API responded with ${response.status}: ${errorText}`);
        return [];
      }
      const data = await response.json();
      console.log('[workshopService.getAllWorkshops] Fetched from API:', data);
      return data as Workshop[];
    } catch (error) {
      console.error('[workshopService.getAllWorkshops] Fetch error:', error);
      return [];
    }
  },

  async getWorkshopById(id: string | number): Promise<Workshop | null> {
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.warn(`[workshopService.getWorkshopById] No auth token for ID ${id}`);
      return null;
    }
    const formattedToken = formatTokenForAPI(token);
    console.log(`[workshopService.getWorkshopById] Attempting to fetch ID ${id} from API...`);
    try {
      const response = await fetch(`${API_URL}/workshops/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': formattedToken,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        console.warn(`[workshopService.getWorkshopById] API for ID ${id} responded with ${response.status}`);
        return null;
      }
      const data = await response.json();
      console.log(`[workshopService.getWorkshopById] Fetched ID ${id} from API:`, data);
      return data as Workshop;
    } catch (error) {
      console.error(`[workshopService.getWorkshopById] Fetch error for ID ${id}:`, error);
      return null;
    }
  },

  async createWorkshop(workshopData: Omit<Workshop, 'id' | 'participants'> & { participants?: number }): Promise<Workshop | null> {
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.warn('[workshopService.createWorkshop] No auth token found');
      return null;
    }
    const formattedToken = formatTokenForAPI(token);
    const payload = { ...workshopData, participants: workshopData.participants || 0 };
    console.log('[workshopService.createWorkshop] Attempting to POST to API with payload:', payload);
    try {
      const response = await fetch(`${API_URL}/workshops`, {
        method: 'POST',
        headers: {
          'Authorization': formattedToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`[workshopService.createWorkshop] API responded with ${response.status}: ${errorText}`);
        return null;
      }
      const data = await response.json();
      console.log('[workshopService.createWorkshop] Created via API:', data);
      return data as Workshop;
    } catch (error) {
      console.error('[workshopService.createWorkshop] Fetch error:', error);
      return null;
    }
  },

  async updateWorkshop(id: string | number, workshopData: Partial<Workshop>): Promise<Workshop | null> {
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.warn(`[workshopService.updateWorkshop] No auth token for ID ${id}`);
      return null;
    }
    const formattedToken = formatTokenForAPI(token);
    console.log(`[workshopService.updateWorkshop] Attempting to PUT to API for ID ${id} with payload:`, workshopData);
    try {
      const response = await fetch(`${API_URL}/workshops/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': formattedToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(workshopData),
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`[workshopService.updateWorkshop] API for ID ${id} responded with ${response.status}: ${errorText}`);
        return null;
      }
      const data = await response.json();
      console.log(`[workshopService.updateWorkshop] Updated ID ${id} via API:`, data);
      return data as Workshop;
    } catch (error) {
      console.error(`[workshopService.updateWorkshop] Fetch error for ID ${id}:`, error);
      return null;
    }
  },

  async deleteWorkshop(id: string | number): Promise<boolean> {
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.warn(`[workshopService.deleteWorkshop] No auth token for ID ${id}`);
      return false;
    }
    const formattedToken = formatTokenForAPI(token);
    console.log(`[workshopService.deleteWorkshop] Attempting to DELETE ID ${id} via API...`);
    try {
      const response = await fetch(`${API_URL}/workshops/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': formattedToken,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`[workshopService.deleteWorkshop] API for ID ${id} responded with ${response.status}: ${errorText}`);
        return false;
      }
      console.log(`[workshopService.deleteWorkshop] Deleted ID ${id} via API successfully.`);
      return true;
    } catch (error) {
      console.error(`[workshopService.deleteWorkshop] Fetch error for ID ${id}:`, error);
      return false;
    }
  },

  // --- Student Dashboard Specific Data --- //
  async getNextWorkshop(): Promise<Workshop | null> {
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.warn('[workshopService.getNextWorkshop] No auth token found');
      return null;
    }
    const formattedToken = formatTokenForAPI(token);
    console.log('[workshopService.getNextWorkshop] Attempting to fetch from API (/workshops/next)... ');
    try {
      const response = await fetch(`${API_URL}/workshops/next`, { // Hits the specific /next endpoint
        method: 'GET',
        headers: {
          'Authorization': formattedToken,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        console.warn(`[workshopService.getNextWorkshop] API responded with ${response.status}. No "next" workshop found or error.`);
        return null;
      }
      const data = await response.json();
      console.log('[workshopService.getNextWorkshop] Fetched from API:', data);
      // Ensure the response is not an empty object if the backend returns {} for no workshop
      if (Object.keys(data).length === 0 && data.constructor === Object) {
          return null;
      }
      return data as Workshop;
    } catch (error) {
      console.error('[workshopService.getNextWorkshop] Fetch error:', error);
      return null;
    }
  },

  async getUpcomingSessions(): Promise<Session[]> {
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.warn('[workshopService.getUpcomingSessions] No auth token found');
      return [];
    }
    const formattedToken = formatTokenForAPI(token);
    console.log('[workshopService.getUpcomingSessions] Attempting to fetch from API (/workshops/sessions/upcoming)... ');
    // TODO: Verify this is the correct endpoint on your backend for "Upcoming Live Sessions" for students
    // This currently matches the Admin Dashboard's workshop list endpoint.
    try {
      const response = await fetch(`${API_URL}/workshops/sessions/upcoming`, {
        method: 'GET',
        headers: {
          'Authorization': formattedToken,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        console.warn(`[workshopService.getUpcomingSessions] API responded with ${response.status}`);
        return [];
      }
      const data = await response.json();
      console.log('[workshopService.getUpcomingSessions] Fetched from API:', data);
      return data as Session[];
    } catch (error) {
      console.error('[workshopService.getUpcomingSessions] Fetch error:', error);
      return [];
    }
  },

  async getPendingHomework(): Promise<Homework[]> {
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.warn('[workshopService.getPendingHomework] No auth token found');
      return [];
    }
    // const formattedToken = formatTokenForAPI(token);
    console.warn('[workshopService.getPendingHomework] API call not implemented. Returning empty array.');
    // TODO: Implement actual API call to fetch pending homework.
    // Example: `${API_URL}/homework/pending` or similar.
    return Promise.resolve([]); 
  },

  async getRecentMessages(): Promise<Message[]> {
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.warn('[workshopService.getRecentMessages] No auth token found');
      return [];
    }
    // const formattedToken = formatTokenForAPI(token);
    console.warn('[workshopService.getRecentMessages] API call not implemented. Returning empty array.');
    // TODO: Implement actual API call to fetch recent messages.
    // Example: `${API_URL}/messages/recent` or similar.
    return Promise.resolve([]);
  }
}; 