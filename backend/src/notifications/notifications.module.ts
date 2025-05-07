import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; // Import ConfigModule if not globally available
import { EmailService } from './email.service';

@Module({
  imports: [
    ConfigModule, // EmailService depends on ConfigService
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class NotificationsModule {} 