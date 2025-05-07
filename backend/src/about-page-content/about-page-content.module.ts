import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AboutPageContentService } from './about-page-content.service';
import { AboutPageContentController } from './about-page-content.controller';
import { AboutPageImageInfo } from './entities/about-page-image-info.entity';
import { AuthModule } from '../auth/auth.module'; // Import AuthModule if JwtAuthGuard or other auth services are used directly

@Module({
  imports: [
    TypeOrmModule.forFeature([AboutPageImageInfo]),
    AuthModule, // Make AuthModule available for guards if not globally provided
  ],
  controllers: [AboutPageContentController],
  providers: [AboutPageContentService],
})
export class AboutPageContentModule {} 