import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Course {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  instructor: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  duration: string;

  @Column({ type: 'int', default: 0 })
  students: number;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ type: 'json', nullable: true })
  syllabus: {
    week: number;
    topic: string;
    description: string;
  }[];

  @Column({ type: 'json', nullable: true })
  materials: {
    id: number;
    name: string;
    type: string;
    url: string;
  }[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 