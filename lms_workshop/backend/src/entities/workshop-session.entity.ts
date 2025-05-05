import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { IsString, IsNotEmpty, IsDate, IsOptional, IsBoolean, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { Workshop } from './workshop.entity';

@Entity()
export class WorkshopSession {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsString()
  @IsNotEmpty()
  title: string;

  @Column({ type: 'text', nullable: true })
  @IsString()
  @IsOptional()
  description: string;

  // Date and time when this particular session occurs
  @Column({ type: 'timestamp' })
  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  scheduledAt: Date;

  // Duration in minutes
  @Column({ default: 60 })
  @IsNumber()
  @IsOptional()
  durationMinutes: number;

  // URL for the video conference/session
  @Column({ nullable: true })
  @IsString()
  @IsOptional()
  meetingUrl: string;

  // Materials specific to this session
  @Column({ type: 'text', nullable: true })
  @IsString()
  @IsOptional()
  sessionMaterials: string;

  // Is this a recorded session?
  @Column({ default: false })
  @IsBoolean()
  @IsOptional()
  isRecorded: boolean;

  // Recording URL if available
  @Column({ nullable: true })
  @IsString()
  @IsOptional()
  recordingUrl: string;

  // Relationship to the parent workshop
  @ManyToOne(() => Workshop, workshop => workshop.sessions)
  @JoinColumn({ name: 'workshopId' })
  workshop: Workshop;

  @Column()
  workshopId: number;

  @Column({ default: true })
  @IsBoolean()
  @IsOptional()
  isActive: boolean;

  @CreateDateColumn()
  @IsDate()
  @IsOptional()
  createdAt: Date;

  @UpdateDateColumn()
  @IsDate()
  @IsOptional()
  updatedAt: Date;
} 