import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CoursesModule } from './courses/courses.module';
import { AdminModule } from './admin/admin.module';
import { WorkshopsModule } from './workshops/workshops.module';
import { HomeworkModule } from './homework/homework.module';
import { MessagesModule } from './messages/messages.module';
import { AchievementsModule } from './achievements/achievements.module';
import { StudentModule } from './student/student.module';
import { typeOrmConfig } from './config/typeorm.config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot(typeOrmConfig),
    UsersModule,
    AuthModule,
    CoursesModule,
    AdminModule,
    WorkshopsModule,
    HomeworkModule,
    MessagesModule,
    AchievementsModule,
    StudentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
