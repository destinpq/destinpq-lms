import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CoursesModule } from './courses/courses.module';
import { ZoomModule } from './zoom/zoom.module';
import { WorkshopsModule } from './workshops/workshops.module';
import { AboutPageContentModule } from './about-page-content/about-page-content.module';
import { typeOrmConfig } from './config/typeorm.config';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot(typeOrmConfig),
    // Register JWT module globally
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'secretKey',
      signOptions: { expiresIn: '24h' },
    }),
    UsersModule,
    AuthModule,
    CoursesModule,
    ZoomModule,
    WorkshopsModule,
    AboutPageContentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
