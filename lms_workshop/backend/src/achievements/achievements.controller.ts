import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AchievementsService } from './achievements.service';
import { Achievement } from '../entities/achievement.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('achievements')
export class AchievementsController {
  constructor(private readonly achievementsService: AchievementsService) {}

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post()
  create(@Body() createAchievementDto: Partial<Achievement>): Promise<Achievement> {
    return this.achievementsService.create(createAchievementDto);
  }

  @Get()
  findAll(): Promise<Achievement[]> {
    return this.achievementsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Achievement> {
    return this.achievementsService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateAchievementDto: Partial<Achievement>,
  ): Promise<Achievement> {
    return this.achievementsService.update(+id, updateAchievementDto);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.achievementsService.remove(+id);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post(':achievementId/assign/:userId')
  assignToUser(
    @Param('achievementId') achievementId: string,
    @Param('userId') userId: string,
  ): Promise<Achievement> {
    return this.achievementsService.assignToUser(+achievementId, +userId);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Delete(':achievementId/unassign/:userId')
  unassignFromUser(
    @Param('achievementId') achievementId: string,
    @Param('userId') userId: string,
  ): Promise<Achievement> {
    return this.achievementsService.unassignFromUser(+achievementId, +userId);
  }
} 