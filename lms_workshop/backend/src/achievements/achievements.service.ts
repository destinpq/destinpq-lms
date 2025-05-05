import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Achievement } from '../entities/achievement.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class AchievementsService {
  constructor(
    @InjectRepository(Achievement)
    private achievementsRepository: Repository<Achievement>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findAll(): Promise<Achievement[]> {
    return this.achievementsRepository.find({
      relations: ['users'],
    });
  }

  async findOne(id: number): Promise<Achievement> {
    const achievement = await this.achievementsRepository.findOne({
      where: { id },
      relations: ['users'],
    });
    
    if (!achievement) {
      throw new NotFoundException(`Achievement with ID ${id} not found`);
    }
    
    return achievement;
  }

  async create(achievementData: Partial<Achievement>): Promise<Achievement> {
    const achievement = this.achievementsRepository.create(achievementData);
    return this.achievementsRepository.save(achievement);
  }

  async update(id: number, achievementData: Partial<Achievement>): Promise<Achievement> {
    await this.findOne(id); // Ensure it exists
    
    await this.achievementsRepository.update(id, achievementData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const achievement = await this.findOne(id);
    await this.achievementsRepository.remove(achievement);
  }

  async assignToUser(achievementId: number, userId: number): Promise<Achievement> {
    const achievement = await this.findOne(achievementId);
    const user = await this.usersRepository.findOne({ where: { id: userId }});
    
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    
    // Check if user already has this achievement
    const hasAchievement = achievement.users.some(u => u.id === userId);
    
    if (!hasAchievement) {
      achievement.users.push(user);
      return this.achievementsRepository.save(achievement);
    }
    
    return achievement;
  }

  async unassignFromUser(achievementId: number, userId: number): Promise<Achievement> {
    const achievement = await this.findOne(achievementId);
    
    // Remove user from achievement's users
    achievement.users = achievement.users.filter(u => u.id !== userId);
    
    return this.achievementsRepository.save(achievement);
  }
} 