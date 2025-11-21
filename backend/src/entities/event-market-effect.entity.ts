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
import { Good } from './good.entity';

@Entity({ name: 'event_market_effects' })
@Index('idx_event_effect_event', ['event'])
export class EventMarketEffect {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Event, (event) => event.marketEffects, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @ManyToOne(() => Planet, (planet) => planet.marketEffects, {
    nullable: true,
  })
  @JoinColumn({ name: 'planet_id' })
  planet?: Planet | null;

  @ManyToOne(() => Good, (good) => good.eventEffects, {
    nullable: true,
  })
  @JoinColumn({ name: 'good_id' })
  good?: Good | null;

  @Column({ name: 'price_modifier', type: 'double precision' })
  priceModifier: number;

  @Column({ name: 'duration_turns', default: 3 })
  durationTurns: number;
}
