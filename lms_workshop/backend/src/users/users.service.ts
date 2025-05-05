import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  findAll(options?: FindManyOptions<User>): Promise<User[]> {
    return this.usersRepository.find(options || {});
  }

  async findOne(id: number): Promise<User | null> {
    if (isNaN(id) || id <= 0) {
      throw new BadRequestException(`Invalid user ID: ${id}`);
    }
    return this.usersRepository.findOneBy({ id });
  }

  async findByEmail(email: string, includePassword: boolean = false): Promise<User | null> {
    if (includePassword) {
      return this.usersRepository
        .createQueryBuilder('user')
        .addSelect('user.password')
        .where('user.email = :email', { email })
        .getOne();
    }
    
    return this.usersRepository.findOneBy({ email });
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.usersRepository.create(userData);
    return this.usersRepository.save(user);
  }

  async update(id: number, userData: Partial<User>): Promise<User | null> {
    if (isNaN(id) || id <= 0) {
      throw new BadRequestException(`Invalid user ID: ${id}`);
    }
    await this.usersRepository.update(id, userData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    if (isNaN(id) || id <= 0) {
      throw new BadRequestException(`Invalid user ID: ${id}`);
    }
    await this.usersRepository.delete(id);
  }

  async getStudents(): Promise<Partial<User>[]> {
    const students = await this.usersRepository.find({
      where: { isAdmin: false },
      select: ['id', 'firstName', 'lastName', 'email']
    });
    
    return students;
  }
} 