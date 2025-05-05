import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Workshop } from '../entities/workshop.entity';

@Injectable()
export class WorkshopsService {
  constructor(
    @InjectRepository(Workshop)
    private workshopsRepository: Repository<Workshop>,
  ) {}

  async findAll(): Promise<Workshop[]> {
    return this.workshopsRepository.find({
      relations: ['attendees'],
    });
  }

  async findOne(id: number): Promise<Workshop> {
    const workshop = await this.workshopsRepository.findOne({
      where: { id },
      relations: ['attendees'],
    });
    
    if (!workshop) {
      throw new NotFoundException(`Workshop with ID ${id} not found`);
    }
    
    return workshop;
  }

  async create(workshopData: Partial<Workshop>): Promise<Workshop> {
    const workshop = this.workshopsRepository.create(workshopData);
    return this.workshopsRepository.save(workshop);
  }

  async update(id: number, workshopData: Partial<Workshop>): Promise<Workshop> {
    await this.findOne(id); // Ensure it exists
    
    await this.workshopsRepository.update(id, workshopData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const workshop = await this.findOne(id);
    await this.workshopsRepository.remove(workshop);
  }

  async findUpcoming(): Promise<Workshop[]> {
    const now = new Date();
    
    return this.workshopsRepository
      .createQueryBuilder('workshop')
      .where('workshop.scheduledAt > :now', { now })
      .orderBy('workshop.scheduledAt', 'ASC')
      .getMany();
  }

  async addAttendee(workshopId: number, userId: number): Promise<Workshop> {
    const workshop = await this.findOne(workshopId);
    
    // Check if user is already attending
    const isAttending = workshop.attendees.some(attendee => attendee.id === userId);
    
    if (!isAttending) {
      // Add user to attendees
      workshop.attendees.push({ id: userId } as any);
      return this.workshopsRepository.save(workshop);
    }
    
    return workshop;
  }

  async removeAttendee(workshopId: number, userId: number): Promise<Workshop> {
    const workshop = await this.findOne(workshopId);
    
    // Filter out the user
    workshop.attendees = workshop.attendees.filter(attendee => attendee.id !== userId);
    
    return this.workshopsRepository.save(workshop);
  }
} 