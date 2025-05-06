import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { ZoomController } from './zoom.controller';
import { ZoomService } from './zoom.service';

@Module({
  imports: [
    HttpModule,
    ConfigModule
  ],
  controllers: [ZoomController],
  providers: [ZoomService],
  exports: [ZoomService],
})
export class ZoomModule {} 