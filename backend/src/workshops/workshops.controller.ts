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
export class WorkshopsController {
  constructor(private readonly workshopsService: WorkshopsService) {}

  // Get all workshops
  @UseGuards(JwtAuthGuard)
  @Get()
  async getAllWorkshops() {
    try {
      return await this.workshopsService.findAll();
    } catch (error) {
      throw new HttpException('Error fetching workshops', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Get next upcoming workshop
  @UseGuards(JwtAuthGuard)
  @Get('next')
  async getNextWorkshop() {
    try {
      const workshop = await this.workshopsService.findNext();
      if (!workshop) {
        throw new HttpException('No upcoming workshops found', HttpStatus.NOT_FOUND);
      }
      return workshop;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Error fetching next workshop', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  
  // Get upcoming workshops
  @UseGuards(JwtAuthGuard)
  @Get('sessions/upcoming')
  async getUpcomingSessions() {
    try {
      return await this.workshopsService.findUpcoming();
    } catch (error) {
      throw new HttpException('Error fetching upcoming sessions', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Get workshop by ID
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getWorkshopById(@Param('id') id: string) {
    try {
      const workshop = await this.workshopsService.findOne(+id);
      if (!workshop) {
        throw new HttpException('Workshop not found', HttpStatus.NOT_FOUND);
      }
      return workshop;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Error fetching workshop', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Create new workshop
  @UseGuards(JwtAuthGuard)
  @Post()
  async createWorkshop(@Body() workshopData: Partial<Workshop>) {
    try {
      return await this.workshopsService.create(workshopData);
    } catch (error) {
      throw new HttpException('Error creating workshop', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Update workshop
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updateWorkshop(
    @Param('id') id: string,
    @Body() workshopData: Partial<Workshop>
  ) {
    try {
      // Check if workshop exists
      const workshop = await this.workshopsService.findOne(+id);
      if (!workshop) {
        throw new HttpException('Workshop not found', HttpStatus.NOT_FOUND);
      }
      
      return await this.workshopsService.update(+id, workshopData);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Error updating workshop', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Delete workshop
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteWorkshop(@Param('id') id: string) {
    try {
      // Check if workshop exists
      const workshop = await this.workshopsService.findOne(+id);
      if (!workshop) {
        throw new HttpException('Workshop not found', HttpStatus.NOT_FOUND);
      }
      
      await this.workshopsService.remove(+id);
      return { message: 'Workshop deleted successfully' };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Error deleting workshop', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
} 