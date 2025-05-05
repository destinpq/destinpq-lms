import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from '../entities/course.entity';
import { Module } from '../entities/module.entity';
import { Lesson } from '../entities/lesson.entity';
import { User } from '../entities/user.entity';
import { Workshop } from '../entities/workshop.entity';
import { Homework } from '../entities/homework.entity';
import { Achievement } from '../entities/achievement.entity';
import { Message } from '../entities/message.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Course)
    private coursesRepository: Repository<Course>,
    
    @InjectRepository(Module)
    private modulesRepository: Repository<Module>,
    
    @InjectRepository(Lesson)
    private lessonsRepository: Repository<Lesson>,
    
    @InjectRepository(User)
    private usersRepository: Repository<User>,

    @InjectRepository(Workshop)
    private workshopsRepository: Repository<Workshop>,

    @InjectRepository(Homework)
    private homeworkRepository: Repository<Homework>,

    @InjectRepository(Achievement)
    private achievementsRepository: Repository<Achievement>,

    @InjectRepository(Message)
    private messagesRepository: Repository<Message>,
  ) {}

  // Course Management
  async getAllCourses(): Promise<Course[]> {
    return this.coursesRepository.find({
      relations: ['modules', 'modules.lessons'],
      order: {
        createdAt: 'DESC',
        modules: {
          order: 'ASC',
          lessons: {
            order: 'ASC',
          },
        },
      },
    });
  }

  async getCourseById(id: number): Promise<Course> {
    const course = await this.coursesRepository.findOne({
      where: { id },
      relations: ['modules', 'modules.lessons'],
      order: {
        modules: {
          order: 'ASC',
          lessons: {
            order: 'ASC',
          },
        },
      },
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    return course;
  }

  async createCourse(courseData: Partial<Course>): Promise<Course> {
    const course = this.coursesRepository.create(courseData);
    return this.coursesRepository.save(course);
  }

  async updateCourse(id: number, courseData: Partial<Course>): Promise<Course> {
    const course = await this.getCourseById(id);
    
    // Update course properties
    Object.assign(course, courseData);
    
    return this.coursesRepository.save(course);
  }

  async deleteCourse(id: number): Promise<void> {
    const result = await this.coursesRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
  }

  // Module Management
  async createModule(courseId: number, moduleData: Partial<Module>): Promise<Module> {
    const course = await this.getCourseById(courseId);
    
    // Get the highest order value to add the new module at the end
    const highestOrderModule = await this.modulesRepository.findOne({
      where: { courseId },
      order: { order: 'DESC' },
    });
    
    const order = highestOrderModule ? highestOrderModule.order + 1 : 1;
    
    const module = this.modulesRepository.create({
      ...moduleData,
      courseId,
      course,
      order,
    });
    
    await this.modulesRepository.save(module);
    
    // Update course's total modules count
    course.totalModules = (course.totalModules || 0) + 1;
    await this.coursesRepository.save(course);
    
    return module;
  }

  async updateModule(id: number, moduleData: Partial<Module>): Promise<Module> {
    const module = await this.modulesRepository.findOne({
      where: { id },
      relations: ['course'],
    });
    
    if (!module) {
      throw new NotFoundException(`Module with ID ${id} not found`);
    }
    
    // Update module properties
    Object.assign(module, moduleData);
    
    return this.modulesRepository.save(module);
  }

  async deleteModule(id: number): Promise<void> {
    const module = await this.modulesRepository.findOne({
      where: { id },
      relations: ['course'],
    });
    
    if (!module) {
      throw new NotFoundException(`Module with ID ${id} not found`);
    }
    
    // Delete the module
    await this.modulesRepository.delete(id);
    
    // Update course's total modules count
    const course = module.course;
    course.totalModules = Math.max(0, (course.totalModules || 1) - 1);
    await this.coursesRepository.save(course);
  }

  // Lesson Management
  async createLesson(moduleId: number, lessonData: Partial<Lesson>): Promise<Lesson> {
    const module = await this.modulesRepository.findOne({
      where: { id: moduleId },
      relations: ['course'],
    });
    
    if (!module) {
      throw new NotFoundException(`Module with ID ${moduleId} not found`);
    }
    
    // Get the highest order value to add the new lesson at the end
    const highestOrderLesson = await this.lessonsRepository.findOne({
      where: { moduleId },
      order: { order: 'DESC' },
    });
    
    const order = highestOrderLesson ? highestOrderLesson.order + 1 : 1;
    
    const lesson = this.lessonsRepository.create({
      ...lessonData,
      moduleId,
      module,
      order,
    });
    
    return this.lessonsRepository.save(lesson);
  }

  async updateLesson(id: number, lessonData: Partial<Lesson>): Promise<Lesson> {
    const lesson = await this.lessonsRepository.findOne({
      where: { id },
      relations: ['module'],
    });
    
    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${id} not found`);
    }
    
    // Update lesson properties
    Object.assign(lesson, lessonData);
    
    return this.lessonsRepository.save(lesson);
  }

  async deleteLesson(id: number): Promise<void> {
    const result = await this.lessonsRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`Lesson with ID ${id} not found`);
    }
  }

  // Workshop Management
  async getAllWorkshops(): Promise<Workshop[]> {
    return this.workshopsRepository.find({
      relations: ['attendees'],
      order: {
        scheduledAt: 'DESC',
      },
    });
  }

  async getWorkshopById(id: number): Promise<Workshop> {
    const workshop = await this.workshopsRepository.findOne({
      where: { id },
      relations: ['attendees'],
    });

    if (!workshop) {
      throw new NotFoundException(`Workshop with ID ${id} not found`);
    }

    return workshop;
  }

  async createWorkshop(workshopData: Partial<Workshop>): Promise<Workshop> {
    const workshop = this.workshopsRepository.create(workshopData);
    return this.workshopsRepository.save(workshop);
  }

  async updateWorkshop(id: number, workshopData: Partial<Workshop>): Promise<Workshop> {
    // Use preload to fetch and merge data - often more reliable for updates
    const workshopToUpdate = await this.workshopsRepository.preload({
      id: id,
      ...workshopData,
    });
    
    if (!workshopToUpdate) {
      throw new NotFoundException(`Workshop with ID ${id} not found`);
    }
    
    // Log the data just before saving
    console.log(`[AdminService] Saving updated workshop ID ${id}:`, workshopToUpdate);

    try {
      const savedWorkshop = await this.workshopsRepository.save(workshopToUpdate);
      console.log(`[AdminService] Successfully saved workshop ID ${id}:`, savedWorkshop);
      return savedWorkshop;
    } catch (error) {
      console.error(`[AdminService] Error saving workshop ID ${id}:`, error);
      // Re-throw the error to be caught by NestJS exception filters
      throw error;
    }
  }

  async deleteWorkshop(id: number): Promise<void> {
    const result = await this.workshopsRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`Workshop with ID ${id} not found`);
    }
  }

  // Workshop participants management
  async addWorkshopParticipant(workshopId: number, userId: number): Promise<Workshop> {
    // Validate workshopId is a valid number
    if (!workshopId || isNaN(workshopId) || workshopId <= 0) {
      throw new BadRequestException(`Invalid workshop ID: ${workshopId}. Must be a valid positive number.`);
    }
    
    // Validate userId is a valid number
    if (!userId || isNaN(userId) || userId <= 0) {
      throw new BadRequestException(`Invalid user ID: ${userId}. Must be a valid positive number.`);
    }

    try {
      // Use the query builder to ensure we get the full entity with relations
      const workshop = await this.workshopsRepository.findOne({
        where: { id: workshopId }
      });
      
      if (!workshop) {
        throw new NotFoundException(`Workshop with ID ${workshopId} not found`);
      }

      const user = await this.usersRepository.findOne({ where: { id: userId } });
      
      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }
      
      // Direct SQL for inserting into the join table
      const connection = this.workshopsRepository.manager.connection;
      
      // First check if record already exists
      const existingRecord = await connection.query(
        'SELECT * FROM workshop_attendees WHERE "workshopId" = $1 AND "userId" = $2',
        [workshopId, userId]
      );
      
      if (existingRecord && existingRecord.length > 0) {
        console.log(`User ${userId} is already a participant in workshop ${workshopId}`);
      } else {
        // Insert directly into the join table
        await connection.query(
          'INSERT INTO workshop_attendees ("workshopId", "userId") VALUES ($1, $2)',
          [workshopId, userId]
        );
        console.log(`Directly inserted user ${userId} into workshop ${workshopId} attendees`);
      }
      
      // Get the updated workshop with attendees
      const updatedWorkshop = await this.workshopsRepository.findOne({
        where: { id: workshopId },
        relations: ['attendees']
      });
      
      if (!updatedWorkshop) {
        throw new NotFoundException(`Workshop with ID ${workshopId} not found after adding participant`);
      }
      
      return updatedWorkshop;
    } catch (error) {
      console.error(`Error adding participant to workshop: ${error.message}`, error.stack);
      throw error;
    }
  }
  
  async removeWorkshopParticipant(workshopId: number, userId: number): Promise<Workshop> {
    // Validate workshopId is a valid number
    if (!workshopId || isNaN(workshopId) || workshopId <= 0) {
      throw new BadRequestException(`Invalid workshop ID: ${workshopId}. Must be a valid positive number.`);
    }
    
    // Validate userId is a valid number
    if (!userId || isNaN(userId) || userId <= 0) {
      throw new BadRequestException(`Invalid user ID: ${userId}. Must be a valid positive number.`);
    }
    
    const workshop = await this.getWorkshopById(workshopId);
    
    // Initialize attendees array if it doesn't exist
    if (!workshop.attendees) {
      workshop.attendees = [];
      return workshop;
    }
    
    // Remove user from attendees
    workshop.attendees = workshop.attendees.filter(attendee => attendee.id !== userId);
    
    return this.workshopsRepository.save(workshop);
  }
  
  async getWorkshopParticipants(workshopId: number): Promise<User[]> {
    // Validate workshopId is a valid number
    if (!workshopId || isNaN(workshopId) || workshopId <= 0) {
      throw new BadRequestException(`Invalid workshop ID: ${workshopId}. Must be a valid positive number.`);
    }
    
    const workshop = await this.getWorkshopById(workshopId);
    return workshop.attendees || [];
  }

  // Homework Management
  async getAllHomework(): Promise<Homework[]> {
    return this.homeworkRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async getHomeworkById(id: number): Promise<Homework> {
    const homework = await this.homeworkRepository.findOne({
      where: { id: String(id) },
    });

    if (!homework) {
      throw new NotFoundException(`Homework with ID ${id} not found`);
    }

    return homework;
  }

  async createHomework(homeworkData: Partial<Homework>): Promise<Homework> {
    const homework = this.homeworkRepository.create(homeworkData);
    return this.homeworkRepository.save(homework);
  }

  async updateHomework(id: number, homeworkData: Partial<Homework>): Promise<Homework> {
    const homework = await this.getHomeworkById(id);
    
    // Update homework properties
    Object.assign(homework, homeworkData);
    
    return this.homeworkRepository.save(homework);
  }

  async deleteHomework(id: number): Promise<void> {
    const result = await this.homeworkRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`Homework with ID ${id} not found`);
    }
  }

  // Achievement Management
  async getAllAchievements(): Promise<Achievement[]> {
    return this.achievementsRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async getAchievementById(id: number): Promise<Achievement> {
    const achievement = await this.achievementsRepository.findOne({
      where: { id },
    });

    if (!achievement) {
      throw new NotFoundException(`Achievement with ID ${id} not found`);
    }

    return achievement;
  }

  async createAchievement(achievementData: Partial<Achievement>): Promise<Achievement> {
    const achievement = this.achievementsRepository.create(achievementData);
    return this.achievementsRepository.save(achievement);
  }

  async updateAchievement(id: number, achievementData: Partial<Achievement>): Promise<Achievement> {
    const achievement = await this.getAchievementById(id);
    
    // Update achievement properties
    Object.assign(achievement, achievementData);
    
    return this.achievementsRepository.save(achievement);
  }

  async deleteAchievement(id: number): Promise<void> {
    const result = await this.achievementsRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`Achievement with ID ${id} not found`);
    }
  }

  // Message Management
  async getAllMessages(): Promise<Message[]> {
    return this.messagesRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async getMessageById(id: number): Promise<Message> {
    const message = await this.messagesRepository.findOne({
      where: { id },
    });

    if (!message) {
      throw new NotFoundException(`Message with ID ${id} not found`);
    }

    return message;
  }

  async createMessage(messageData: Partial<Message>): Promise<Message> {
    const message = this.messagesRepository.create(messageData);
    return this.messagesRepository.save(message);
  }

  async updateMessage(id: number, messageData: Partial<Message>): Promise<Message> {
    const message = await this.getMessageById(id);
    
    // Update message properties
    Object.assign(message, messageData);
    
    return this.messagesRepository.save(message);
  }

  async deleteMessage(id: number): Promise<void> {
    const result = await this.messagesRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`Message with ID ${id} not found`);
    }
  }

  // User Management
  async getAllUsers(): Promise<User[]> {
    return this.usersRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
    });
    
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    
    // Update user properties
    Object.assign(user, userData);
    
    return this.usersRepository.save(user);
  }

  async deleteUser(id: number): Promise<void> {
    const result = await this.usersRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }

  // Direct database method to force add a participant
  async forceAddWorkshopParticipant(workshopId: number, userId: number): Promise<any> {
    // First validate the workshop and user exist
    const workshop = await this.workshopsRepository.findOne({ where: { id: workshopId } });
    if (!workshop) {
      throw new NotFoundException(`Workshop with ID ${workshopId} not found`);
    }
    
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    
    try {
      // Direct database query to insert the record
      const connection = this.workshopsRepository.manager.connection;
      
      // First check if record already exists
      const existingRecord = await connection.query(
        'SELECT * FROM workshop_attendees WHERE "workshopId" = $1 AND "userId" = $2',
        [workshopId, userId]
      );
      
      if (existingRecord && existingRecord.length > 0) {
        return {
          message: `User ${userId} is already a participant of workshop ${workshopId}`,
          exists: true,
          record: existingRecord[0]
        };
      }
      
      // Insert the record
      const result = await connection.query(
        'INSERT INTO workshop_attendees ("workshopId", "userId") VALUES ($1, $2) RETURNING *',
        [workshopId, userId]
      );
      
      console.log('Force-added participant result:', result);
      
      return {
        message: `User ${userId} has been force-added to workshop ${workshopId}`,
        success: true,
        result
      };
    } catch (error) {
      console.error('Error force-adding participant:', error);
      throw new Error(`Failed to force-add participant: ${error.message}`);
    }
  }
} 