import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';

interface ZoomMeetingRequest {
  topic: string;
  startTime: string;
  duration: number;
  agenda?: string;
  workshopId: number;
}

@Injectable()
export class ZoomService {
  private readonly apiKey: string;
  private readonly apiSecret: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiKey = this.configService.get<string>('ZOOM_API_KEY') || '';
    this.apiSecret = this.configService.get<string>('ZOOM_API_SECRET') || '';
    
    if (!this.apiKey || !this.apiSecret) {
      console.warn('Zoom API credentials are not properly configured!');
    } else {
      console.log('Zoom API Key:', this.apiKey);
      console.log('Zoom API Secret: [hidden for security]');
    }
  }

  async createMeeting(meetingData: ZoomMeetingRequest) {
    try {
      const token = this.generateJWT();
      
      const response = await firstValueFrom(
        this.httpService.post(
          'https://api.zoom.us/v2/users/me/meetings',
          {
            topic: meetingData.topic,
            type: 2, // Scheduled meeting
            start_time: meetingData.startTime,
            duration: meetingData.duration,
            timezone: 'UTC',
            agenda: meetingData.agenda || '',
            settings: {
              host_video: true,
              participant_video: true,
              join_before_host: false,
              mute_upon_entry: true,
              waiting_room: true,
              approval_type: 0,
              audio: 'both',
              auto_recording: 'none'
            }
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        )
      );
      
      // Store meeting details in database if needed
      // this.storeMeetingDetails(meetingData.workshopId, response.data);
      
      return response.data;
    } catch (error) {
      console.error('Zoom API error:', error.response?.data || error.message);
      throw new Error(`Failed to create Zoom meeting: ${error.response?.data?.message || error.message}`);
    }
  }

  async getMeeting(meetingId: string) {
    try {
      const token = this.generateJWT();
      console.log('Generated Zoom JWT Token:', token.substring(0, 20) + '...');
      
      // Test token validity with a simple request
      try {
        const testResponse = await firstValueFrom(
          this.httpService.get(
            'https://api.zoom.us/v2/users/me',
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          )
        );
        console.log('Test user response:', testResponse.status);
      } catch (testError) {
        console.error('Test token validation failed:', testError.response?.data);
      }
      
      const response = await firstValueFrom(
        this.httpService.get(
          `https://api.zoom.us/v2/meetings/${meetingId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        )
      );
      
      return response.data;
    } catch (error) {
      console.error('Zoom API error:', error.response?.data || error.message);
      throw new Error(`Failed to get Zoom meeting: ${error.response?.data?.message || error.message}`);
    }
  }

  // Generate JWT for Zoom API
  private generateJWT(): string {
    // JWT Header
    const header = {
      alg: 'HS256',
      typ: 'JWT'
    };
    
    // Current timestamp in seconds (Unix timestamp)
    const now = Math.floor(Date.now() / 1000);
    
    // Zoom requires specific JWT claims format
    const payload = {
      iss: this.apiKey,
      exp: now + (60 * 60), // 1 hour from now (in seconds)
    };
    
    console.log('JWT Payload:', payload);
    console.log('JWT Expiration in local time:', new Date(payload.exp * 1000).toLocaleString());
    
    // Sign with HS256 algorithm as required by Zoom
    const token = jwt.sign(payload, this.apiSecret, { 
      algorithm: 'HS256',
      header: header 
    });
    
    return token;
  }

  // Generate signature for joining meetings
  generateSignature(meetingNumber: string, role: number): string {
    // Ensure meetingNumber is numeric - this needs to match the client-side conversion
    let numericMeetingNumber = meetingNumber;
    
    // Try to extract numeric meeting ID from URL format if provided
    if (meetingNumber.includes('/j/')) {
      const urlMatch = meetingNumber.match(/\/j\/(\d+)/);
      if (urlMatch && urlMatch[1]) {
        numericMeetingNumber = urlMatch[1];
        console.log(`Extracted numeric meeting ID from URL: ${numericMeetingNumber}`);
      }
    }
    // For non-numeric IDs like 'next' or other special cases
    else if (meetingNumber === 'next' || !/^\d+$/.test(meetingNumber)) {
      // Use the same algorithm as the frontend to ensure consistency
      const hashNum = Array.from(meetingNumber).reduce(
        (acc, char) => (acc * 31 + char.charCodeAt(0)) % 1000000000, 0
      ) + 1000000000; // Ensure it's 10 digits
      
      numericMeetingNumber = hashNum.toString();
      console.log(`Backend: Converted non-numeric meeting ID "${meetingNumber}" to numeric: ${numericMeetingNumber}`);
    }
    else {
      console.log(`Meeting ID is already numeric: ${numericMeetingNumber}`);
    }
    
    const timestamp = new Date().getTime() - 30000;
    const data = Buffer.from(this.apiKey + numericMeetingNumber + timestamp + role).toString('base64');
    const hash = crypto.createHmac('sha256', this.apiSecret).update(data).digest('base64');
    const signature = Buffer.from(`${this.apiKey}.${numericMeetingNumber}.${timestamp}.${role}.${hash}`).toString('base64');
    
    console.log('Generated signature for meeting:', numericMeetingNumber);
    return signature;
  }
} 