import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Event } from './event.entity';

export type ChoiceOutcome = {
  cargoLoss?: number;
  cargoLossPercentage?: number;
  fuelLoss?: number;
  fuelModifier?: number;
  creditsCost?: number;
  creditsReward?: number;
  reputationChange?: number;
  description: string;
};

@Entity({ name: 'event_choices' })
export class EventChoice {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Event, (event) => event.choices, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @Column({ length: 100 })
  label: string;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ type: 'jsonb', name: 'outcome' })
  outcome: ChoiceOutcome;

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number;
}
