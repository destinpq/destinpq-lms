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
} from '@nestjs/common';
import { WorkshopsService } from './workshops.service';
import { Workshop } from '../entities/workshop.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('workshops')
export class WorkshopsController {
  constructor(private readonly workshopsService: WorkshopsService) {}

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post()
  create(@Body() createWorkshopDto: Partial<Workshop>): Promise<Workshop> {
    return this.workshopsService.create(createWorkshopDto);
  }

  @Get()
  findAll(): Promise<Workshop[]> {
    return this.workshopsService.findAll();
  }

  @Get('upcoming')
  findUpcoming(): Promise<Workshop[]> {
    return this.workshopsService.findUpcoming();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Workshop> {
    return this.workshopsService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateWorkshopDto: Partial<Workshop>,
  ): Promise<Workshop> {
    return this.workshopsService.update(+id, updateWorkshopDto);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.workshopsService.remove(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/attend')
  async joinWorkshop(
    @Param('id') workshopId: string,
    @Request() req,
  ): Promise<Workshop> {
    const userId = req.user.userId;
    return this.workshopsService.addAttendee(+workshopId, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/attend')
  async leaveWorkshop(
    @Param('id') workshopId: string,
    @Request() req,
  ): Promise<Workshop> {
    const userId = req.user.userId;
    return this.workshopsService.removeAttendee(+workshopId, userId);
  }
} 