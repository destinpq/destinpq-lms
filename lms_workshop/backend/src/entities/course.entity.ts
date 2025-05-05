import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Module } from './module.entity';
import { User } from './user.entity';

export enum CourseStatus {
  ACTIVE = 'ACTIVE',
  DRAFT = 'DRAFT',
  COMPLETED = 'COMPLETED',
}

@Entity()
export class Course {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  instructor: string;

  @Column({ nullable: true })
  associatedWorkshop: string;

  @Column({ nullable: true })
  coverImage: string;

  @Column({ type: 'int', default: 20 })
  maxStudents: number;

  @Column({ type: 'int', default: 0 })
  enrolledStudents: number;

  @Column({ type: 'int', default: 0 })
  totalWeeks: number;

  @Column({ type: 'int', default: 0 })
  totalModules: number;

  @OneToMany(() => Module, (module) => module.course, { cascade: true })
  modules: Module[];

  @ManyToMany(() => User)
  @JoinTable({
    name: 'course_students',
    joinColumn: { name: 'courseId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'userId', referencedColumnName: 'id' },
  })
  students: User[];

  @Column({
    type: 'enum',
    enum: CourseStatus,
    default: CourseStatus.ACTIVE,
    enumName: 'course_status_enum',
  })
  status: CourseStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 