import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Event } from './event.entity';

@Entity({ name: 'event_log' })
@Index('idx_event_log_user', ['user'])
@Index('idx_event_log_event', ['event'])
export class EventLog {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.eventLogs, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Event, (event) => event.eventLogs, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'event_id' })
  event?: Event | null;

  @Column({
    name: 'occurred_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  occurredAt: Date;

  @Column({ name: 'reputation_delta', type: 'int', nullable: true })
  reputationDelta?: number | null;

  @Column({ name: 'credit_delta', type: 'int', nullable: true })
  creditDelta?: number | null;

  @Column({ name: 'fuel_delta', type: 'int', nullable: true })
  fuelDelta?: number | null;

  @Column({ name: 'cargo_lost', type: 'int', nullable: true })
  cargoLost?: number | null;

  @Column({ type: 'jsonb', name: 'event_data', nullable: true })
  eventData?: Record<string, any> | null;

  @Column({ type: 'text', nullable: true })
  notes?: string | null;
}
