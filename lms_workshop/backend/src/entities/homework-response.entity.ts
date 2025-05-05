import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Homework } from './homework.entity';
import { User } from './user.entity';
import { HomeworkQuestion } from './homework-question.entity';

@Entity('homework_responses')
export class HomeworkResponse {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  homeworkId: string;

  @ManyToOne(() => Homework, (homework) => homework.responses, { 
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'homeworkId' })
  homework: Homework;

  @Column('uuid')
  questionId: string;

  @ManyToOne(() => HomeworkQuestion, (question) => question.responses, { 
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'questionId' })
  question: HomeworkQuestion;

  @Column('uuid')
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column('jsonb', { nullable: true })
  response: any;

  @Column('text', { nullable: true })
  fileUpload: string;

  @Column('int', { nullable: true })
  grade: number;

  @Column('text', { nullable: true })
  feedback: string;

  @Column('timestamp', { nullable: true })
  submittedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 