import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany
} from 'typeorm';
import { User } from './user.entity';
import { Course } from './course.entity';
import { HomeworkQuestion } from './homework-question.entity';
import { HomeworkResponse } from './homework-response.entity';

export enum HomeworkStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  GRADED = 'graded'
}

export enum HomeworkType {
  QUIZ = 'quiz',
  ASSIGNMENT = 'assignment',
  DOCUMENT_UPLOAD = 'document_upload',
  DESCRIPTIVE = 'descriptive'
}

@Entity()
export class Homework {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ nullable: true })
  category: string;

  @Column({ type: 'timestamp' })
  dueDate: Date;

  @Column({
    type: 'enum',
    enum: HomeworkStatus,
    default: HomeworkStatus.NOT_STARTED,
  })
  status: HomeworkStatus;

  @Column({
    type: 'enum',
    enum: HomeworkType,
    default: HomeworkType.ASSIGNMENT,
    name: 'homeworkType'
  })
  homeworkType: HomeworkType;

  @Column({ type: 'text', nullable: true })
  fileAttachment: string;

  @Column({ type: 'text', nullable: true })
  submissionFileUrl: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assignedToId' })
  assignedTo: User;

  @Column({ nullable: true, type: 'uuid' })
  assignedToId: string;
  
  @ManyToOne(() => Course, { nullable: true })
  @JoinColumn({ name: 'courseId' })
  course: Course;

  @Column({ nullable: true, type: 'uuid' })
  courseId: string;
  
  @Column({ type: 'text', nullable: true })
  studentResponse: string;

  @Column({ nullable: true })
  grade: number;

  @Column({ type: 'text', nullable: true })
  instructorFeedback: string;

  @OneToMany(() => HomeworkQuestion, (question) => question.homework)
  questions: HomeworkQuestion[];

  @OneToMany(() => HomeworkResponse, (response) => response.homework)
  responses: HomeworkResponse[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 