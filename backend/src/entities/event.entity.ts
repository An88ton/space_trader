import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { EventMarketEffect } from './event-market-effect.entity';
import { EventLog } from './event-log.entity';
import { TravelLog } from './travel-log.entity';

@Entity({ name: 'events' })
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ type: 'double precision' })
  probability: number;

  @Column({ name: 'reputation_change', default: 0 })
  reputationChange: number;

  @OneToMany(() => EventMarketEffect, (effect) => effect.event)
  marketEffects?: EventMarketEffect[];

  @OneToMany(() => EventLog, (eventLog) => eventLog.event)
  eventLogs?: EventLog[];

  @OneToMany(() => TravelLog, (travelLog) => travelLog.event)
  travelLogs?: TravelLog[];
}
