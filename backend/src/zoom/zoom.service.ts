import { Injectable, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
// import * as jwt from 'jsonwebtoken'; // No longer needed for API auth
import * as crypto from 'crypto';
import { WorkshopsService } from '../workshops/workshops.service';
import { Workshop } from '../entities/workshop.entity';

interface ZoomMeetingRequest {
  topic: string;
  startTime: string;
  duration: number;
  agenda?: string;
  workshopId: number;
}

interface ZoomOAuthToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  expiresAt?: number; // Custom field to store calculated expiry time
}

@Injectable()
export class ZoomService {
  private readonly sdkKey: string; // Renamed from apiKey for clarity, used for SDK signature
  private readonly sdkSecret: string; // Renamed from apiSecret for clarity, used for SDK signature
  private readonly accountId: string;
  private readonly clientId: string;
  private readonly clientSecret: string;

  private oauthToken: ZoomOAuthToken | null = null;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @Inject(WorkshopsService) private readonly workshopsService: WorkshopsService,
  ) {
    this.sdkKey = this.configService.get<string>('ZOOM_API_KEY') || ''; // This is for SDK signature
    this.sdkSecret = this.configService.get<string>('ZOOM_API_SECRET') || ''; // This is for SDK signature
    this.accountId = this.configService.get<string>('ZOOM_ACCOUNT_ID') || '';
    this.clientId = this.configService.get<string>('ZOOM_CLIENT_ID') || '';
    this.clientSecret = this.configService.get<string>('ZOOM_CLIENT_SECRET') || '';

    if (!this.sdkKey || !this.sdkSecret) {
      console.warn('Zoom SDK Key/Secret are not properly configured! (Used for meeting join signatures)');
    }
    if (!this.accountId || !this.clientId || !this.clientSecret) {
      console.warn(
        'Zoom Server-to-Server OAuth credentials (AccountID, ClientID, ClientSecret) are not properly configured! (Used for API access)',
      );
    }
  }

  private async getOAuthAccessToken(): Promise<string> {
    if (this.oauthToken && this.oauthToken.expiresAt && Date.now() < this.oauthToken.expiresAt) {
      console.log('[ZoomService] Using cached OAuth access token.');
      return this.oauthToken.access_token;
    }

    console.log('[ZoomService] Requesting new Server-to-Server OAuth access token...');
    const credentials = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');

    const requestData = {
      grant_type: 'account_credentials',
      account_id: this.accountId,
    };

    const tokenUrl = 'https://zoom.us/oauth/token';
    const axiosConfig = {
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    };

    console.log(`[ZoomService] Attempting POST to: ${tokenUrl}`);
    console.log(`[ZoomService] With Headers: ${JSON.stringify(axiosConfig.headers)}`);
    console.log(`[ZoomService] With Body Object: ${JSON.stringify(requestData)}`);

    try {
      const response = await firstValueFrom(
        this.httpService.post<ZoomOAuthToken>(
          tokenUrl,
          requestData, 
          axiosConfig,
        ),
      );

      this.oauthToken = response.data;
      // Store expiry time in milliseconds (expires_in is in seconds)
      this.oauthToken.expiresAt = Date.now() + (this.oauthToken.expires_in - 300) * 1000; // Refresh 5 mins before expiry
      console.log('[ZoomService] New OAuth access token obtained and cached.');
      return this.oauthToken.access_token;
    } catch (error) {
      console.error(
        '[ZoomService] Error fetching Server-to-Server OAuth token:',
        error.response?.data || error.message || error,
      );
      throw new HttpException(
        `Failed to obtain Zoom OAuth token: ${error.response?.data?.reason || error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createMeeting(meetingData: ZoomMeetingRequest) {
    try {
      const token = await this.getOAuthAccessToken();
      console.log('[ZoomService] Creating Zoom meeting with OAuth token for workshop ID:', meetingData.workshopId);
      
      const zoomApiPayload = {
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
          auto_recording: 'none',
        },
      };

      const response = await firstValueFrom(
        this.httpService.post(
          'https://api.zoom.us/v2/users/me/meetings',
          zoomApiPayload,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      const createdZoomMeeting = response.data;
      console.log('[ZoomService] Zoom meeting created successfully via API:', createdZoomMeeting);

      if (createdZoomMeeting && createdZoomMeeting.id && meetingData.workshopId) {
        console.log(`[ZoomService] Associating Zoom meeting ID ${createdZoomMeeting.id} with workshop ID ${meetingData.workshopId}`);
        try {
          await this.workshopsService.update(meetingData.workshopId, { 
            meetingId: createdZoomMeeting.id.toString() // Zoom IDs are numbers but often treated as strings
          } as Partial<Workshop>); // Cast to Partial<Workshop>
          console.log(`[ZoomService] Workshop ${meetingData.workshopId} updated with Zoom meeting ID ${createdZoomMeeting.id}.`);
        } catch (dbError) {
          console.error(`[ZoomService] CRITICAL: Failed to update workshop ${meetingData.workshopId} with Zoom meeting ID. Manual update required. Error:`, dbError);
          // Decide if you want to throw an error here or just log. 
          // The Zoom meeting was created, but linking failed.
        }
      }
      return createdZoomMeeting;
    } catch (error) {
      console.error('[ZoomService] Create meeting API error:', error.response?.data || error.message);
      throw new HttpException(
        `Failed to create Zoom meeting: ${error.response?.data?.message || error.message}`,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getMeeting(meetingId: string) {
    try {
      const token = await this.getOAuthAccessToken();
      console.log(`[ZoomService] Getting meeting ${meetingId} with OAuth token...`);
      const response = await firstValueFrom(
        this.httpService.get(
          `https://api.zoom.us/v2/meetings/${meetingId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      );
      return response.data;
    } catch (error) {
      console.error('[ZoomService] Get meeting API error:', error.response?.data || error.message);
      // Check if it's a Zoom API specific error format
      const zoomErrorMessage = error.response?.data?.message || error.message;
      const zoomErrorCode = error.response?.data?.code;
      if (zoomErrorCode) {
        console.error(`[ZoomService] Zoom API Error Code: ${zoomErrorCode}`);
      }
      throw new HttpException(
        `Failed to get Zoom meeting: ${zoomErrorMessage}`,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // generateJWT IS NO LONGER USED FOR API AUTHENTICATION
  // private generateJWT(): string { ... old code ... }

  // Generate signature for joining meetings (uses SDK Key/Secret, not OAuth token)
  generateSignature(meetingNumber: string, role: number /* Typically 0 for attendee, 1 for host/admin */): string {
    console.log(`[ZoomService] Generating SDK signature for meeting: ${meetingNumber}, role: ${role}`);
    let numericMeetingNumber = meetingNumber;
    if (meetingNumber.includes('/j/')) {
      const urlMatch = meetingNumber.match(/\/j\/(\d+)/);
      if (urlMatch && urlMatch[1]) {
        numericMeetingNumber = urlMatch[1];
      }
    } else if (meetingNumber === 'next' || !/^\d+$/.test(meetingNumber)) {
      const hashNum = Array.from(meetingNumber).reduce(
        (acc, char) => (acc * 31 + char.charCodeAt(0)) % 1000000000, 0
      ) + 1000000000;
      numericMeetingNumber = hashNum.toString();
    }

    const timestamp = Date.now() - 30000;
    const msg = Buffer.from(this.sdkKey + numericMeetingNumber + timestamp + role).toString('base64');
    const hash = crypto.createHmac('sha256', this.sdkSecret).update(msg).digest('base64');
    const signature = Buffer.from(`${this.sdkKey}.${numericMeetingNumber}.${timestamp}.${role}.${hash}`).toString('base64');
    console.log(`[ZoomService] SDK Signature generated for meeting ${numericMeetingNumber}`);
    return signature;
  }
} 