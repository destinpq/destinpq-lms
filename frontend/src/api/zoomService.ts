// Use environment variable for API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://polar-lowlands-49166-189f8996c2e7.herokuapp.com/lms';

// Helper to format token with Bearer prefix
function formatTokenForAPI(token: string | null): string { // Ensure this helper is defined
  if (!token) return '';
  return token.startsWith('Bearer ') ? token : `Bearer ${token}`;
}

/* // FALLBACK_MEETING is fully removed
const FALLBACK_MEETING = {
  // ...
};
*/

// --- INTERFACES --- //
export interface ZoomMeetingRequest { // For creating meetings via backend to Zoom
  topic: string;
  startTime: string;
  duration: number;
  agenda?: string;
  workshopId: number; // To link it back to our workshop
}

export interface ZoomMeetingResponse { // Expected structure from our backend for a meeting
  id: string; // Zoom's meeting ID (numeric, but often handled as string)
  topic: string;
  start_time: string;
  duration: number;
  join_url: string;
  password?: string;
  start_url?: string; // For host
  // any other relevant fields our backend might provide about a Zoom meeting
}

export interface ZoomJoinInfo { // For SDK signature
  signature: string;
  meetingNumber: string;
  userName: string;
  //role?: number; // Role is usually passed to generate signature, not necessarily returned with it
  //sdkKey?: string; // SDK key is passed to SDK init, not usually with signature
}

export interface Workshop { // This is the main Workshop interface used by the service
  id: string | number;
  title: string;
  instructor: string;
  date: string;
  description?: string;
  duration?: string;
  // CORRECTED materials structure to match backend entity and Admin Panel setup
  materials?: {
    id?: number; // id from DB, though not strictly used by material display list key
    name: string;
    url: string;
  }[];
  agenda?: {
    // Assuming agenda items also have a simple structure for now
    id?: number;
    time: string;
    activity: string;
  }[];
  participants: number;
  meetingId?: string; // From workshop entity
  // Add any other fields from your backend Workshop entity
  time?: string; // This was on the entity, ensure it's here if needed
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

// --- API SERVICE --- //
export const zoomService = {
  async getMeeting(requestedMeetingId: string | number): Promise<ZoomMeetingResponse | null> {
    console.log(`[zoomService.getMeeting] Requested Zoom details for ID (could be workshop ID): ${requestedMeetingId}`);

    // HARDCODED DETAILS FOR DR. AKANKSHA'S MEETING (associated with Workshop ID '1')
    const DR_AKANKSHA_ZOOM_MEETING_ID = "9809175590";
    const DR_AKANKSHA_WORKSHOP_ID_FOR_THIS_MEETING = "1"; // This is the ID of YOUR workshop in your DB

    if (requestedMeetingId.toString() === DR_AKANKSHA_WORKSHOP_ID_FOR_THIS_MEETING) {
      console.log(`[zoomService.getMeeting] Returning HARDCODED details for Dr. Akanksha's Personal Meeting Room (for Workshop ID ${DR_AKANKSHA_WORKSHOP_ID_FOR_THIS_MEETING})`);
      return {
        id: DR_AKANKSHA_ZOOM_MEETING_ID,
        topic: "Dr. Akanksha Agarwal's Personal Meeting Room",
        start_time: new Date().toISOString(), // Placeholder - this meeting is likely always available or pre-scheduled
        duration: 120, // Placeholder duration
        join_url: `https://zoom.us/j/${DR_AKANKSHA_ZOOM_MEETING_ID}?pwd=someactualpassword`, // Use the actual join URL if it contains a hashed password
        password: "445166",
        start_url: 'https://zoom.us/s/SOME_START_URL_IF_KNOWN', // Placeholder
      } as ZoomMeetingResponse;
    }

    // If not the specific hardcoded workshop, attempt backend call
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.warn(`[zoomService.getMeeting] No auth token for fetching details for ID ${requestedMeetingId}`);
      return null;
    }
    const formattedToken = formatTokenForAPI(token);
    console.log(`[zoomService.getMeeting] Attempting to fetch details for ID ${requestedMeetingId} from API...`);
    try {
      // This backend endpoint should return ZoomMeetingResponse structure if successful
      const response = await fetch(`${API_URL}/zoom/meetings/${requestedMeetingId}`, { 
        method: 'GET',
        headers: {
          'Authorization': formattedToken,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        console.warn(`[zoomService.getMeeting] API for ID ${requestedMeetingId} responded with ${response.status}.`);
        return null;
      }
      const data = await response.json();
      console.log(`[zoomService.getMeeting] Fetched ID ${requestedMeetingId} from API:`, data);
      return data as ZoomMeetingResponse;
    } catch (error) {
      console.error(`[zoomService.getMeeting] Fetch error for ID ${requestedMeetingId}:`, error);
      return null;
    }
  },

  async generateSignature(meetingId: string, role: number, userName: string): Promise<ZoomJoinInfo | null> {
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.warn(`[zoomService.generateSignature] No auth token for Meeting ID ${meetingId}`);
      return null;
    }
    const formattedToken = formatTokenForAPI(token);
    console.log(`[zoomService.generateSignature] Attempting to POST to API for Meeting ID ${meetingId} to get signature...`);
    try {
      // This backend endpoint should return ZoomJoinInfo structure
      const response = await fetch(`${API_URL}/zoom/meetings/${meetingId}/join`, { 
        method: 'POST',
        headers: {
          'Authorization': formattedToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role, userName }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`[zoomService.generateSignature] API for Meeting ID ${meetingId} responded with ${response.status}: ${errorText}`);
        return null;
      }
      const result = await response.json();
      console.log(`[zoomService.generateSignature] Signature received for Meeting ID ${meetingId}:`, result);
      return result as ZoomJoinInfo;
    } catch (error) {
      console.error(`[zoomService.generateSignature] Fetch error for Meeting ID ${meetingId}:`, error);
      return null;
    }
  }
  // TODO: Add back other methods like createMeeting, getNextMeeting, getAllWorkshops for Zoom if they are intended for this service
  // and ensure they ONLY use API calls and do not return mock data.
}; 