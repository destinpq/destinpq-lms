import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';

@Controller('notifications')
export class NotificationsController {
  constructor() {}

  @Get('test-route')
  @HttpCode(HttpStatus.OK)
  async testRoute() {
    console.log('[NotificationsController] Test route hit!');
    return { message: 'Notifications controller test route is working!' };
  }
} 