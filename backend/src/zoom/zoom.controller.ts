import { Controller, Post, Get, Body, Param, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ZoomService } from './zoom.service';

interface CreateMeetingDto {
  topic: string;
  startTime: string;
  duration: number;
  agenda?: string;
  workshopId: number;
}

@Controller('zoom')
export class ZoomController {
  constructor(private readonly zoomService: ZoomService) {}

  @UseGuards(JwtAuthGuard)
  @Post('meetings')
  async createMeeting(@Body() meetingData: CreateMeetingDto) {
    try {
      // Use real Zoom API for meeting creation
      const result = await this.zoomService.createMeeting(meetingData);
      return result;
    } catch (error) {
      console.error('Error creating Zoom meeting:', error);
      throw new HttpException(
        error.message || 'Failed to create Zoom meeting',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('meetings/:meetingId')
  async getMeeting(@Param('meetingId') meetingId: string) {
    try {
      // Always use real Zoom API for meeting data
      const result = await this.zoomService.getMeeting(meetingId);
      return result;
    } catch (error) {
      console.error('Error getting Zoom meeting:', error);
      throw new HttpException(
        error.message || 'Failed to get Zoom meeting',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('meetings/:meetingId/join')
  async generateSignature(
    @Param('meetingId') meetingId: string,
    @Body() data: { role: number; userName: string }
  ) {
    try {
      console.log(`Generating signature for meeting ID: ${meetingId} and user: ${data.userName}`);
      
      // Generate signature using Zoom API credentials
      const signature = this.zoomService.generateSignature(meetingId, data.role);
      
      // Return data to client
      const result = {
        signature: signature,
        meetingNumber: meetingId,
        userName: data.userName,
      };
      
      console.log(`Signature generated successfully. Response data: ${JSON.stringify({
        meetingNumber: result.meetingNumber,
        userName: result.userName,
        signatureLength: result.signature.length
      })}`);
      
      return result;
    } catch (error) {
      console.error('Error generating signature:', error);
      throw new HttpException(
        error.message || 'Failed to generate signature for Zoom meeting',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
} 