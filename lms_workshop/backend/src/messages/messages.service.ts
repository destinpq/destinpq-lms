import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message, MessageStatus } from '../entities/message.entity';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private messagesRepository: Repository<Message>,
  ) {}

  async findAll(): Promise<Message[]> {
    return this.messagesRepository.find({
      relations: ['sender', 'recipient'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Message> {
    const message = await this.messagesRepository.findOne({
      where: { id },
      relations: ['sender', 'recipient'],
    });
    
    if (!message) {
      throw new NotFoundException(`Message with ID ${id} not found`);
    }
    
    return message;
  }

  async findByRecipient(userId: number): Promise<Message[]> {
    return this.messagesRepository.find({
      where: { recipientId: userId },
      relations: ['sender'],
      order: { createdAt: 'DESC' },
    });
  }

  async findUnreadByRecipient(userId: number): Promise<Message[]> {
    const realMessages = await this.messagesRepository.find({
      where: { 
        recipientId: userId,
        status: MessageStatus.UNREAD
      },
      relations: ['sender'],
      order: { createdAt: 'DESC' },
    });
    
    // Add mock messages for testing
    if (realMessages.length === 0) {
      // Create 2 mock messages
      const mockMessages: any = [
        {
          id: 9999,
          content: 'Welcome to the Learning Management System! This is a test message.',
          sender: {
            id: 1,
            firstName: 'System',
            lastName: 'Admin',
            email: 'admin@example.com'
          },
          recipientId: userId,
          status: MessageStatus.UNREAD,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 9998,
          content: 'If you need help with anything, feel free to ask!',
          sender: {
            id: 2,
            firstName: 'Support',
            lastName: 'Team',
            email: 'support@example.com'
          },
          recipientId: userId,
          status: MessageStatus.UNREAD,
          createdAt: new Date(Date.now() - 3600000), // 1 hour ago
          updatedAt: new Date(Date.now() - 3600000)
        }
      ];
      
      return [...realMessages, ...mockMessages];
    }
    
    return realMessages;
  }

  async findBySender(userId: number): Promise<Message[]> {
    return this.messagesRepository.find({
      where: { senderId: userId },
      relations: ['recipient'],
      order: { createdAt: 'DESC' },
    });
  }

  async create(messageData: Partial<Message>): Promise<Message> {
    const message = this.messagesRepository.create({
      ...messageData,
      status: MessageStatus.UNREAD,
    });
    return this.messagesRepository.save(message);
  }

  async update(id: number, messageData: Partial<Message>): Promise<Message> {
    await this.findOne(id); // Ensure it exists
    
    await this.messagesRepository.update(id, messageData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const message = await this.findOne(id);
    await this.messagesRepository.remove(message);
  }

  async markAsRead(id: number, userId: number): Promise<Message> {
    const message = await this.findOne(id);
    
    // Ensure the user is the recipient of the message
    if (message.recipientId !== userId) {
      throw new ForbiddenException('You can only mark messages sent to you as read');
    }
    
    message.status = MessageStatus.READ;
    return this.messagesRepository.save(message);
  }
} 