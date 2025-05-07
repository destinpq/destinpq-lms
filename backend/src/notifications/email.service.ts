import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

interface MailOptions {
  to: string | string[]; // Receiver address(es)
  subject: string;       // Subject line
  html: string;          // HTML body content
  text?: string;         // Plain text body content (optional)
}

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    // SMTP configuration will now strictly come from environment variables
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST'),
      port: this.configService.get<number>('SMTP_PORT'), // Port will also be from env
      secure: this.configService.get<string>('SMTP_SECURE') === 'true',
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    });

    this.transporter.verify((error, success) => {
      if (error) {
        console.error('[EmailService] Transporter verification failed:', error);
      } else {
        console.log('[EmailService] Transporter is ready to send emails. Success:', success);
      }
    });
  }

  async sendMail(options: MailOptions): Promise<void> {
    const mailDefaults = {
      from: `"Psychology LMS" <${this.configService.get<string>('EMAIL_FROM_ADDRESS')}>`,
    };

    try {
      const info = await this.transporter.sendMail({
        ...mailDefaults,
        ...options,
      });
      console.log('[EmailService] Message sent: %s', info.messageId);
    } catch (error) {
      console.error('[EmailService] Error sending email:', error);
      throw error; // Re-throw to be handled by caller or global exception filter
    }
  }

  generateWorkshopReminderHtml(workshopTitle: string, workshopDate: string, workshopTime: string, zoomLink: string): string {
    return `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; color: #333;">
          <div style="max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; padding: 20px;">
            <h2 style="color: #0056b3;">Workshop Reminder: ${workshopTitle}</h2>
            <p>Hi there,</p>
            <p>This is a friendly reminder that your workshop, <strong>${workshopTitle}</strong>, is scheduled to start soon.</p>
            <p>
              <strong>Date:</strong> ${workshopDate}<br/>
              <strong>Time:</strong> ${workshopTime}
            </p>
            <p style="text-align: center; margin: 20px 0;">
              <a href="${zoomLink}" style="padding: 12px 25px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; font-size: 16px;">Join Zoom Meeting</a>
            </p>
            <p>We look forward to seeing you there!</p>
            <br/>
            <p>Best regards,</p>
            <p><em>The Psychology LMS Team</em></p>
          </div>
        </body>
      </html>
    `;
  }
} 