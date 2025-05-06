import { 
  Controller, 
  Get, 
  Post,
  Put,
  Delete,
  Body, 
  Param, 
  UseGuards, 
  HttpException, 
  HttpStatus 
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WorkshopsService } from './workshops.service';
import { Workshop } from '../entities/workshop.entity';

@Controller('workshops')
@UseGuards(JwtAuthGuard)
export class WorkshopsController {
  constructor(private readonly workshopsService: WorkshopsService) {}

  // Get all workshops
  @Get()
  async getAllWorkshops() {
    try {
      return await this.workshopsService.findAll();
    } catch (error: any) {
      console.error('Error fetching workshops:', error);
      throw new HttpException(
        error.message || 'Error fetching workshops', 
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Get next upcoming workshop
  @Get('next')
  async getNextWorkshop() {
    try {
      const workshop = await this.workshopsService.findNext();
      return workshop;
    } catch (error: any) {
      console.error('Error fetching next workshop:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Error fetching next workshop', 
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  
  // Get upcoming workshops
  @Get('sessions/upcoming')
  async getUpcomingSessions() {
    try {
      return await this.workshopsService.findUpcoming();
    } catch (error: any) {
      console.error('Error fetching upcoming sessions:', error);
      throw new HttpException(
        error.message || 'Error fetching upcoming sessions', 
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Get workshop by ID
  @Get(':id')
  async getWorkshopById(@Param('id') id: string) {
    try {
      const workshop = await this.workshopsService.findOne(+id);
      return workshop;
    } catch (error: any) {
      console.error(`Error fetching workshop ${id}:`, error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Error fetching workshop', 
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Create new workshop
  @Post()
  async createWorkshop(@Body() workshopData: Partial<Workshop>) {
    try {
      return await this.workshopsService.create(workshopData);
    } catch (error: any) {
      console.error('Error creating workshop:', error);
      throw new HttpException(
        error.message || 'Error creating workshop', 
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Update workshop
  @Put(':id')
  async updateWorkshop(
    @Param('id') id: string,
    @Body() workshopData: Partial<Workshop>
  ) {
    try {
      return await this.workshopsService.update(+id, workshopData);
    } catch (error: any) {
      console.error(`Error updating workshop ${id}:`, error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Error updating workshop', 
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Delete workshop
  @Delete(':id')
  async deleteWorkshop(@Param('id') id: string) {
    try {
      await this.workshopsService.remove(+id);
      return { message: 'Workshop deleted successfully' };
    } catch (error: any) {
      console.error(`Error deleting workshop ${id}:`, error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Error deleting workshop', 
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
} 