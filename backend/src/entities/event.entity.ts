import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { EventMarketEffect } from './event-market-effect.entity';
import { EventLog } from './event-log.entity';
import { TravelLog } from './travel-log.entity';
import { ActiveEvent } from './active-event.entity';
import { EventChoice } from './event-choice.entity';

export type EventType = 'travel' | 'market' | 'player_status';
export type EventCategory =
  | 'pirate_ambush'
  | 'engine_failure'
  | 'fuel_leak'
  | 'safe_passage'
  | 'meteor_shower'
  | 'space_patrol'
  | 'epidemic'
  | 'harvest_boom'
  | 'mining_rush'
  | 'planetary_famine'
  | 'trade_festival'
  | 'smuggling_crackdown'
  | 'black_market_offer'
  | 'investor_interest'
  | 'merchant_guild_reward'
  | 'insurance_payout';

@Entity({ name: 'events' })
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ type: 'varchar', length: 50, name: 'event_type' })
  eventType: EventType;

  @Column({ type: 'varchar', length: 50, name: 'event_category' })
  eventCategory: EventCategory;

  @Column({ type: 'double precision' })
  probability: number;

  @Column({ name: 'reputation_change', default: 0 })
  reputationChange: number;

  // For travel events: cargo loss percentage (0-1)
  @Column({ name: 'cargo_loss_percentage', type: 'double precision', nullable: true })
  cargoLossPercentage?: number | null;

  // For travel events: fuel penalty multiplier
  @Column({ name: 'fuel_penalty_multiplier', type: 'double precision', nullable: true })
  fuelPenaltyMultiplier?: number | null;

  // For travel events: credit cost (e.g., bribe)
  @Column({ name: 'credit_cost', type: 'int', nullable: true })
  creditCost?: number | null;

  // For player status events: credit reward
  @Column({ name: 'credit_reward', type: 'int', nullable: true })
  creditReward?: number | null;

  @OneToMany(() => EventMarketEffect, (effect) => effect.event)
  marketEffects?: EventMarketEffect[];

  @OneToMany(() => EventLog, (eventLog) => eventLog.event)
  eventLogs?: EventLog[];

  @OneToMany(() => TravelLog, (travelLog) => travelLog.event)
  travelLogs?: TravelLog[];

  @OneToMany(() => ActiveEvent, (activeEvent) => activeEvent.event)
  activeEvents?: ActiveEvent[];

  @OneToMany(() => EventChoice, (choice) => choice.event)
  choices?: EventChoice[];

  @Column({ name: 'requires_choice', type: 'boolean', default: false })
  requiresChoice: boolean;
}
