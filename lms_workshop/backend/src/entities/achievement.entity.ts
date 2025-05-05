import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { User } from './user.entity';

export enum AchievementType {
  CERTIFICATE = 'certificate',
  BADGE = 'badge',
  MILESTONE = 'milestone',
}

@Entity()
export class Achievement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: AchievementType,
    default: AchievementType.BADGE,
  })
  type: AchievementType;
  
  @Column({ nullable: true })
  imageUrl: string;

  @ManyToMany(() => User)
  @JoinTable({
    name: 'user_achievements',
    joinColumn: { name: 'achievementId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'userId', referencedColumnName: 'id' },
  })
  users: User[];

  @Column({ nullable: true })
  criteria: string;

  @Column({ nullable: true })
  courseId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 