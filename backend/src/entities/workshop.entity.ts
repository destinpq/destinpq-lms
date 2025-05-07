import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class Workshop {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  instructor: string;

  @Column({ type: 'date', default: () => 'CURRENT_DATE' })
  date: string;

  @Column({ nullable: true })
  time: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  duration: string;

  @Column({ nullable: true })
  meetingId: string;

  @Column({ type: 'int', default: 0 })
  participants: number;

  @Column({ type: 'json', nullable: true })
  materials: {
    id?: number;
    name: string;
    type: string;
    url: string;
  }[];

  @Column({ type: 'json', nullable: true })
  agenda: {
    time: string;
    activity: string;
  }[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 