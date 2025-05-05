import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Homework, HomeworkStatus } from '../entities/homework.entity';

@Injectable()
export class HomeworkService {
  constructor(
    @InjectRepository(Homework)
    private homeworkRepository: Repository<Homework>,
  ) {}

  async findAll(): Promise<Homework[]> {
    return this.homeworkRepository.find({
      relations: ['assignedTo'],
    });
  }

  async findAllForStudent(studentId: number): Promise<Homework[]> {
    // Validate studentId
    if (!studentId || isNaN(studentId) || studentId <= 0) {
      throw new BadRequestException(`Invalid student ID: ${studentId}`);
    }

    return this.homeworkRepository.find({
      where: { assignedToId: studentId.toString() },
      order: { dueDate: 'ASC' },
    });
  }

  async findPendingForStudent(studentId: number): Promise<Homework[]> {
    // Validate studentId
    if (!studentId || isNaN(studentId) || studentId <= 0) {
      throw new BadRequestException(`Invalid student ID: ${studentId}`);
    }

    return this.homeworkRepository.find({
      where: [
        { assignedToId: studentId.toString(), status: HomeworkStatus.NOT_STARTED },
        { assignedToId: studentId.toString(), status: HomeworkStatus.IN_PROGRESS },
      ],
      order: { dueDate: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Homework> {
    if (!id) {
      throw new NotFoundException(`Homework ID cannot be undefined`);
    }

    const homework = await this.homeworkRepository.findOne({
      where: { id: id.toString() },
      relations: ['assignedTo'],
    });
    
    if (!homework) {
      throw new NotFoundException(`Homework with ID ${id} not found`);
    }
    
    return homework;
  }

  async create(homeworkData: Partial<Homework>): Promise<Homework> {
    const homework = this.homeworkRepository.create(homeworkData);
    return this.homeworkRepository.save(homework);
  }

  async update(id: number, homeworkData: Partial<Homework>): Promise<Homework> {
    await this.findOne(id); // Ensure it exists
    
    await this.homeworkRepository.update(id.toString(), homeworkData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const homework = await this.findOne(id);
    await this.homeworkRepository.remove(homework);
  }

  async updateStatus(id: number, status: HomeworkStatus): Promise<Homework> {
    await this.findOne(id); // Ensure it exists
    
    await this.homeworkRepository.update(id.toString(), { status });
    return this.findOne(id);
  }

  async submitHomework(id: number, studentResponse: string): Promise<Homework> {
    const homework = await this.findOne(id);
    
    homework.studentResponse = studentResponse;
    homework.status = HomeworkStatus.COMPLETED;
    
    return this.homeworkRepository.save(homework);
  }
} 