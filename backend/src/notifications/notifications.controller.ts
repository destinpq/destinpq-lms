import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  ForbiddenException,
  HttpCode,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { EmailService } from './email.service';
import { SendEmailDto } from './dto/send-email.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // Assuming path is correct

// Define AuthenticatedRequest if not already globally available or in a shared types file
interface AuthenticatedUser {
  id: number;
  email: string;
  isAdmin: boolean;
}
interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly emailService: EmailService) {}

  private checkAdmin(req: AuthenticatedRequest) {
    if (!req.user || !req.user.isAdmin) {
      throw new ForbiddenException('You do not have permission to perform this action.');
    }
  }

  @Post('send-custom-email')
  @HttpCode(HttpStatus.OK)
  async sendCustomEmail(
    @Body() sendEmailDto: SendEmailDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<{ message: string }> {
    this.checkAdmin(req);
    try {
      await this.emailService.sendMail({
        to: sendEmailDto.toEmails,
        subject: sendEmailDto.subject,
        html: sendEmailDto.htmlBody,
      });
      return { message: 'Email(s) sent successfully.' };
    } catch (error: any) {
      console.error(
        '[NotificationsController] Error sending custom email(s):',
        error,
      );
      const message = error?.message || 'Failed to send email(s)';
      const status = error?.status || HttpStatus.INTERNAL_SERVER_ERROR;
      throw new HttpException(message, status);
    }
  }
} 