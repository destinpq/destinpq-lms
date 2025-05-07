import { Module } from '@nestjs/common';
// import { ConfigModule } from '@nestjs/config'; 
// import { EmailService } from './email.service';
import { NotificationsController } from './notifications.controller';

@Module({
  imports: [
    // ConfigModule, 
  ],
  controllers: [NotificationsController],
  providers: [/* EmailService */],
  exports: [/* EmailService */],
})
export class NotificationsModule {} 