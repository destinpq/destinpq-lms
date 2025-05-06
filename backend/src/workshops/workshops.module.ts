import { Module } from '@nestjs/common';
import { WorkshopsController } from './workshops.controller';

@Module({
  controllers: [WorkshopsController],
})
export class WorkshopsModule {} 