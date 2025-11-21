import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Ship } from './ship.entity';
import { Planet } from './planet.entity';
import { Event } from './event.entity';

@Entity({ name: 'travel_log' })
@Index('idx_travel_log_ship', ['ship'])
@Index('idx_travel_log_event', ['event'])
export class TravelLog {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Ship, (ship) => ship.travelLogs, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'ship_id' })
  ship: Ship;

  @ManyToOne(() => Planet, (planet) => planet.originTravelLogs, {
    nullable: true,
  })
  @JoinColumn({ name: 'origin_planet_id' })
  originPlanet?: Planet | null;

  @ManyToOne(() => Planet, (planet) => planet.destinationTravelLogs, {
    nullable: true,
  })
  @JoinColumn({ name: 'destination_planet_id' })
  destinationPlanet?: Planet | null;

  @Column()
  distance: number;

  @Column({ name: 'fuel_used' })
  fuelUsed: number;

  @Column({ name: 'travel_turn' })
  travelTurn: number;

  @ManyToOne(() => Event, (event) => event.travelLogs, {
    nullable: true,
  })
  @JoinColumn({ name: 'event_id' })
  event?: Event | null;

  @Column({
    name: 'completed_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  completedAt: Date;
}
