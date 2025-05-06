// Use environment variable for API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:15001/lms';

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
  async createMeeting(meetingData: ZoomMeetingRequest): Promise<ZoomMeetingResponse> {
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
        } catch {
          errorData = { message: errorText || 'Failed to create Zoom meeting' };
        }
        throw new Error(errorData.message || `Failed to create Zoom meeting with status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating Zoom meeting:', error);
      throw error;
    }
  },

  async getMeeting(meetingId: string): Promise<ZoomMeetingResponse> {
    const token = localStorage.getItem('access_token');
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    try {
      const response = await fetch(`${API_URL}/zoom/meetings/${meetingId}`, {
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
        } catch {
          errorData = { message: errorText || 'Failed to get Zoom meeting' };
        }
        throw new Error(errorData.message || `Failed to get Zoom meeting with status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting Zoom meeting:', error);
      throw error;
    }
  },

  // We're no longer using this but keeping it for future reference
  async getJoinSignature(meetingId: string, userName: string): Promise<ZoomJoinInfo> {
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
        body: JSON.stringify({
          role: 0, // 0 for attendee, 1 for host
          userName: userName,
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText || 'Failed to get Zoom join signature' };
        }
        throw new Error(errorData.message || `Failed to get Zoom join signature with status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting Zoom join signature:', error);
      throw error;
    }
  },
}; 