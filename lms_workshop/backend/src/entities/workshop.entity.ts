import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
} from 'typeorm';
import { IsString, IsNotEmpty, IsDate, IsOptional, IsBoolean, IsNumber, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { User } from './user.entity';
import { WorkshopSession } from './workshop-session.entity';

@Entity()
export class Workshop {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsString()
  @IsNotEmpty()
  title: string;

  @Column({ type: 'text' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @Column()
  @IsString()
  @IsNotEmpty()
  instructor: string;

  // Start date of the workshop program
  @Column({ type: 'timestamp' })
  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  startDate: Date;
  
  // End date of the workshop program
  @Column({ type: 'timestamp', nullable: true })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  endDate: Date;
  
  // Duration in weeks
  @Column({ default: 1 })
  @IsNumber()
  @IsOptional()
  durationWeeks: number;

  // For backwards compatibility - represents the first session date
  @Column({ type: 'timestamp' })
  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  scheduledAt: Date;

  @Column({ type: 'text', nullable: true })
  @IsString()
  @IsOptional()
  preparatoryMaterials: string;

  @Column({ nullable: true })
  @IsString()
  @IsOptional()
  category: string;

  @Column({ nullable: true, default: 0 })
  @IsNumber()
  @IsOptional()
  maxParticipants: number;

  // Relations to workshop sessions - individual class meetings
  @OneToMany(() => WorkshopSession, session => session.workshop)
  @IsOptional()
  @IsArray()
  sessions: WorkshopSession[];

  @ManyToMany(() => User)
  @JoinTable({
    name: 'workshop_attendees',
    joinColumn: { name: 'workshopId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'userId', referencedColumnName: 'id' },
  })
  @IsOptional()
  attendees: User[];

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