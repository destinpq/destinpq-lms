import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { Workshop } from '../entities/workshop.entity';

@Injectable()
export class WorkshopsService {
  constructor(
    @InjectRepository(Workshop)
    private workshopsRepository: Repository<Workshop>,
  ) {}

  // Initialize with seed data if no workshops exist
  async onModuleInit() {
    const count = await this.workshopsRepository.count();
    if (count === 0) {
      console.log('No workshops found. Seeding initial workshops...');
      await this.seedInitialWorkshops();
    }
  }

  // Seed initial workshops
  private async seedInitialWorkshops() {
    const workshops = [
      {
        title: 'Behavioral Therapy Fundamentals',
        instructor: 'Dr. Michael Brown',
        date: '2023-07-01',
        time: '14:00 - 16:00',
        description: 'Learn the fundamentals of behavioral therapy techniques for practitioners.',
        duration: '2 hours',
        participants: 0,
        materials: [
          { id: 1, name: 'Introduction to Behavioral Therapy', url: '/materials/intro-bt.pdf' },
          { id: 2, name: 'Case Studies', url: '/materials/bt-cases.pdf' }
        ],
        agenda: [
          { time: '14:00', activity: 'Introduction and Overview' },
          { time: '14:30', activity: 'Key Concepts in Behavioral Therapy' },
          { time: '15:15', activity: 'Break' },
          { time: '15:30', activity: 'Practical Applications' },
          { time: '16:00', activity: 'Q&A and Conclusion' }
        ]
      },
      {
        title: 'Advanced Cognitive Techniques',
        instructor: 'Dr. Sarah Johnson',
        date: '2023-07-15',
        time: '15:00 - 17:00',
        description: 'Explore advanced cognitive techniques for psychology practitioners.',
        duration: '2 hours',
        participants: 0,
        materials: [
          { id: 1, name: 'Advanced Cognitive Therapy Slides', url: '/materials/act-slides.pdf' },
          { id: 2, name: 'Practice Worksheets', url: '/materials/act-worksheets.pdf' }
        ],
        agenda: [
          { time: '15:00', activity: 'Introduction to Advanced Techniques' },
          { time: '15:30', activity: 'Cognitive Restructuring' },
          { time: '16:15', activity: 'Break' },
          { time: '16:30', activity: 'Implementation Strategies' },
          { time: '17:00', activity: 'Wrap-up and Discussion' }
        ]
      }
    ];

    for (const workshop of workshops) {
      await this.workshopsRepository.save(workshop);
    }
    
    console.log('Initial workshops seeded successfully');
  }

  // Find all workshops
  async findAll(): Promise<Workshop[]> {
    return this.workshopsRepository.find({
      order: { date: 'ASC' }
    });
  }

  // Find upcoming workshops (with date >= today)
  async findUpcoming(): Promise<Workshop[]> {
    const today = new Date().toISOString().split('T')[0]; // Format as YYYY-MM-DD
    
    return this.workshopsRepository.find({
      where: {
        date: MoreThanOrEqual(today)
      },
      order: { date: 'ASC' }
    });
  }

  // Find a single workshop by id
  async findOne(id: number): Promise<Workshop> {
    const workshop = await this.workshopsRepository.findOneBy({ id });
    
    if (!workshop) {
      throw new NotFoundException(`Workshop with ID "${id}" not found`);
    }
    
    return workshop;
  }

  // Get next upcoming workshop
  async findNext(): Promise<Workshop> {
    const today = new Date().toISOString().split('T')[0]; // Format as YYYY-MM-DD
    
    const workshop = await this.workshopsRepository.findOne({
      where: {
        date: MoreThanOrEqual(today)
      },
      order: { date: 'ASC' }
    });
    
    if (!workshop) {
      throw new NotFoundException('No upcoming workshops found');
    }
    
    return workshop;
  }

  // Create a new workshop
  async create(workshopData: Partial<Workshop>): Promise<Workshop> {
    const workshop = this.workshopsRepository.create(workshopData);
    return this.workshopsRepository.save(workshop);
  }

  // Update an existing workshop
  async update(id: number, workshopData: Partial<Workshop>): Promise<Workshop> {
    await this.findOne(id); // Will throw NotFoundException if not found
    await this.workshopsRepository.update(id, workshopData);
    
    const updatedWorkshop = await this.workshopsRepository.findOneBy({ id });
    if (!updatedWorkshop) {
      throw new NotFoundException(`Workshop with ID "${id}" not found after update`);
    }
    
    return updatedWorkshop;
  }

  // Delete a workshop
  async remove(id: number): Promise<void> {
    await this.findOne(id); // Will throw NotFoundException if not found
    await this.workshopsRepository.delete(id);
  }
} 