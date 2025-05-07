import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Req,
  ForbiddenException,
  ParseArrayPipe,
  HttpCode,
  HttpStatus,
  Request,
} from '@nestjs/common';
import { AboutPageContentService } from './about-page-content.service';
import { CreateAboutPageImageInfoDto } from './dto/create-about-page-image-info.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // Adjust path as necessary
import { AboutPageImageInfo } from './entities/about-page-image-info.entity';

// Define a type for the user object attached to the request by JwtAuthGuard
interface AuthenticatedUser {
  id: number;
  email: string;
  isAdmin: boolean;
  // Add other properties from your User entity that JwtAuthGuard might attach
}

interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

@Controller('about-page-content')
@UseGuards(JwtAuthGuard)
export class AboutPageContentController {
  constructor(private readonly contentService: AboutPageContentService) {}

  private checkAdmin(req: AuthenticatedRequest) {
    if (!req.user || !req.user.isAdmin) {
      throw new ForbiddenException(
        'You do not have permission to perform this action.',
      );
    }
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createOrUpdate(
    @Body() createDto: CreateAboutPageImageInfoDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<AboutPageImageInfo> {
    this.checkAdmin(req);
    return this.contentService.createOrUpdate(createDto);
  }

  @Post('batch')
  @HttpCode(HttpStatus.OK)
  async batchCreateOrUpdate(
    @Body(new ParseArrayPipe({ items: CreateAboutPageImageInfoDto }))
    dtos: CreateAboutPageImageInfoDto[],
    @Req() req: AuthenticatedRequest,
  ): Promise<AboutPageImageInfo[]> {
    this.checkAdmin(req);
    const results: AboutPageImageInfo[] = []; // Explicitly type results array
    for (const dto of dtos) {
      results.push(await this.contentService.createOrUpdate(dto));
    }
    return results;
  }

  @Get()
  async findAll(): Promise<AboutPageImageInfo[]> {
    return this.contentService.findAll();
  }

  @Get(':imageSrc')
  async findOne(
    @Param('imageSrc') imageSrc: string,
  ): Promise<AboutPageImageInfo> {
    return this.contentService.findOne(decodeURIComponent(imageSrc));
  }

  @Delete(':imageSrc')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('imageSrc') imageSrc: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<void> {
    this.checkAdmin(req);
    return this.contentService.remove(decodeURIComponent(imageSrc));
  }
} 