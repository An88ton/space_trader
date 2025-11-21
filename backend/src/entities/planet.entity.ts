import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PlanetMarket } from './planet-market.entity';
import { EventMarketEffect } from './event-market-effect.entity';
import { TravelLog } from './travel-log.entity';
import { Hex } from './hex.entity';
import { UserShip } from './user-ship.entity';

@Entity({ name: 'planets' })
export class Planet {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  // Legacy coordinates (deprecated, kept for backward compatibility)
  @Column({ type: 'int', name: 'coordinate_x', nullable: true })
  coordinateX: number | null;

  @Column({ type: 'int', name: 'coordinate_y', nullable: true })
  coordinateY: number | null;

  // Hex grid coordinates (nullable for backward compatibility during migration)
  @Column({ type: 'int', name: 'hex_q', nullable: true })
  hexQ: number | null;

  @Column({ type: 'int', name: 'hex_r', nullable: true })
  hexR: number | null;

  @ManyToOne(() => Hex, (hex) => hex.planets, { nullable: true, eager: false })
  @JoinColumn({ name: 'hex_id' })
  hex?: Hex | null;

  @Column({ type: 'int', name: 'docking_fee', default: 100 })
  dockingFee: number;

  // Planet attributes
  @Column({ type: 'varchar', length: 50, name: 'planet_type', default: 'terrestrial' })
  planetType: string; // e.g., 'terrestrial', 'gas_giant', 'ice', 'desert', 'ocean', etc.

  @Column({ type: 'jsonb', name: 'market_modifiers', nullable: true })
  marketModifiers: Record<string, number> | null; // Price modifiers per good type

  @Column({ type: 'jsonb', name: 'resources', nullable: true })
  resources: string[] | null; // Available resources on this planet

  @Column({ type: 'varchar', length: 50, name: 'faction', nullable: true })
  faction: string | null; // Faction controlling this planet

  @Column({ type: 'varchar', length: 50, name: 'security_level', default: 'medium' })
  securityLevel: string; // 'low', 'medium', 'high', 'none'

  @Column({ type: 'jsonb', name: 'event_weights', nullable: true })
  eventWeights: Record<string, number> | null; // Weighting for different event types

  @OneToMany(() => PlanetMarket, (market) => market.planet)
  marketEntries?: PlanetMarket[];

  @OneToMany(() => EventMarketEffect, (effect) => effect.planet)
  marketEffects?: EventMarketEffect[];

  @OneToMany(() => TravelLog, (travel) => travel.originPlanet)
  originTravelLogs?: TravelLog[];

  @OneToMany(() => TravelLog, (travel) => travel.destinationPlanet)
  destinationTravelLogs?: TravelLog[];

  @OneToMany(() => UserShip, (assignment) => assignment.currentPlanet)
  dockedShips?: UserShip[];
}
