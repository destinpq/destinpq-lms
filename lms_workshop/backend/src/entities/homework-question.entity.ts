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
import { Homework } from './homework.entity';
import { HomeworkResponse } from './homework-response.entity';

export enum QuestionType {
  SINGLE_CHOICE = 'single_choice',
  MULTIPLE_CHOICE = 'multiple_choice',
  MATCHING = 'matching',
  DESCRIPTIVE = 'descriptive'
}

@Entity('homework_questions')
export class HomeworkQuestion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  homeworkId: string;

  @ManyToOne(() => Homework, (homework) => homework.questions, { 
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'homeworkId' })
  homework: Homework;

  @Column('text')
  question: string;

  @Column({
    type: 'enum',
    enum: QuestionType,
    name: 'questionType'
  })
  questionType: QuestionType;

  @Column('jsonb', { nullable: true })
  options: any;

  @Column('jsonb', { nullable: true })
  correctAnswer: any;

  @Column('int', { default: 10 })
  points: number;

  @OneToMany(() => HomeworkResponse, (response) => response.question)
  responses: HomeworkResponse[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 