// Use environment variable for API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:15001/lms';

// Fallback meeting data to use when API is unavailable
const FALLBACK_MEETING = {
  id: '98091755590',
  topic: 'Psychology Workshop - Introduction',
  start_time: new Date(Date.now() + 86400000).toISOString(), // tomorrow
  duration: 60,
  join_url: 'https://zoom.us/j/98091755590',
  password: '123456',
  status: 'waiting'
};

export interface ZoomMeetingRequest {
  topic: string;
  startTime: string;
  duration: number;
  agenda?: string;
  workshopId: number;
}

export interface ZoomMeetingResponse {
  id: string;
  join_url: string;
  password: string;
  start_url: string;
  topic: string;
  duration: number;
  start_time: string;
  agenda?: string;
}

export interface ZoomJoinInfo {
  signature: string;
  meetingNumber: string;
  userName: string;
}

export const zoomService = {
  // Get the next upcoming meeting
  async getNextMeeting() {
    const token = localStorage.getItem('access_token');
    
    if (!token) {
      console.warn('No authentication token found for Zoom API');
      return FALLBACK_MEETING;
    }

    try {
      console.log('Fetching next Zoom meeting from API');
      const response = await fetch(`${API_URL}/zoom/meetings/next`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        console.warn('Zoom API next meeting failed with status:', response.status);
        return FALLBACK_MEETING;
      }
      
      const meetingData = await response.json();
      console.log('Next Zoom meeting data:', meetingData);
      return meetingData;
    } catch (error) {
      console.error('Error getting next Zoom meeting:', error);
      return FALLBACK_MEETING;
    }
  },
  
  // Get meeting details by ID
  async getMeeting(meetingId) {
    const token = localStorage.getItem('access_token');
    
    if (!token) {
      console.warn('No authentication token found for Zoom API');
      return {...FALLBACK_MEETING, id: meetingId};
    }

    try {
      console.log(`Fetching Zoom meeting ${meetingId} from API`);
      const response = await fetch(`${API_URL}/zoom/meetings/${meetingId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        console.warn(`Zoom API meeting ${meetingId} failed with status:`, response.status);
        return {...FALLBACK_MEETING, id: meetingId};
      }
      
      const meetingData = await response.json();
      console.log('Zoom meeting data:', meetingData);
      return meetingData;
    } catch (error) {
      console.error('Error getting Zoom meeting:', error);
      return {...FALLBACK_MEETING, id: meetingId};
    }
  },
  
  // Create a new Zoom meeting
  async createMeeting(meetingData) {
    const token = localStorage.getItem('access_token');
    
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    try {
      const response = await fetch(`${API_URL}/zoom/meetings`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(meetingData),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (error) {
          errorData = { message: errorText || 'Failed to create meeting' };
        }
        throw new Error(errorData.message || `Failed to create meeting with status: ${response.status}`);
      }
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Meeting creation error:', error);
      throw error;
    }
  },
  
  // Generate signature for joining a meeting
  async generateSignature(meetingId, role, userName) {
    const token = localStorage.getItem('access_token');
    
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    try {
      const response = await fetch(`${API_URL}/zoom/meetings/${meetingId}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role, userName }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (error) {
          errorData = { message: errorText || 'Failed to generate signature' };
        }
        throw new Error(errorData.message || `Failed to generate signature with status: ${response.status}`);
      }
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Signature generation error:', error);
      throw error;
    }
  },
}; 