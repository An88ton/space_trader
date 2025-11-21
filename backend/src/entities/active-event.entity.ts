import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Event } from './event.entity';
import { Planet } from './planet.entity';

@Entity({ name: 'active_events' })
@Index('idx_active_event_event', ['event'])
@Index('idx_active_event_planet', ['planet'])
@Index('idx_active_event_active', ['isActive', 'expiresAtTurn'])
export class ActiveEvent {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Event, (event) => event.activeEvents, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @ManyToOne(() => Planet, {
    nullable: true,
  })
  @JoinColumn({ name: 'planet_id' })
  planet?: Planet | null;

  @Column({ name: 'started_at_turn', type: 'int' })
  startedAtTurn: number;

  @Column({ name: 'expires_at_turn', type: 'int' })
  expiresAtTurn: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
}
