import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
  Request,
  Patch,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { Message } from '../entities/message.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createMessageDto: Partial<Message>, @Request() req): Promise<Message> {
    // Ensure sender is the authenticated user unless admin
    const senderId = createMessageDto.senderId || req.user.id;
    
    // Validate senderId is a number
    if (isNaN(Number(senderId))) {
      throw new Error('Invalid sender ID');
    }
    
    // Validate recipientId if provided
    if (createMessageDto.recipientId && isNaN(Number(createMessageDto.recipientId))) {
      throw new Error('Invalid recipient ID');
    }
    
    return this.messagesService.create({
      ...createMessageDto,
      senderId: Number(senderId),
      ...(createMessageDto.recipientId ? { recipientId: Number(createMessageDto.recipientId) } : {}),
    });
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get()
  findAll(): Promise<Message[]> {
    return this.messagesService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('received')
  findReceived(@Request() req): Promise<Message[]> {
    const userId = req.user.id;
    if (!userId || isNaN(Number(userId))) {
      throw new Error('Invalid user ID');
    }
    return this.messagesService.findByRecipient(Number(userId));
  }

  @UseGuards(JwtAuthGuard)
  @Get('sent')
  findSent(@Request() req): Promise<Message[]> {
    const userId = req.user.id;
    if (!userId || isNaN(Number(userId))) {
      throw new Error('Invalid user ID');
    }
    return this.messagesService.findBySender(Number(userId));
  }

  @UseGuards(JwtAuthGuard)
  @Get('unread')
  findUnread(@Request() req): Promise<Message[]> {
    const userId = req.user.id;
    if (!userId || isNaN(Number(userId))) {
      throw new Error('Invalid user ID');
    }
    return this.messagesService.findUnreadByRecipient(Number(userId));
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string, @Request() req): Promise<Message> {
    const messageId = Number(id);
    if (isNaN(messageId)) {
      throw new Error('Invalid message ID');
    }
    return this.messagesService.findOne(messageId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/read')
  markAsRead(@Param('id') id: string, @Request() req): Promise<Message> {
    const userId = req.user.id;
    const messageId = Number(id);
    
    if (isNaN(messageId) || isNaN(Number(userId))) {
      throw new Error('Invalid ID format');
    }
    
    return this.messagesService.markAsRead(messageId, Number(userId));
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateMessageDto: Partial<Message>,
  ): Promise<Message> {
    return this.messagesService.update(+id, updateMessageDto);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.messagesService.remove(+id);
  }
} 