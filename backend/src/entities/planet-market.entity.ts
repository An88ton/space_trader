import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Planet } from './planet.entity';
import { Good } from './good.entity';

@Entity({ name: 'planet_market' })
@Index('idx_planet_market_planet', ['planet'])
@Index('idx_planet_market_good', ['good'])
export class PlanetMarket {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Planet, (planet) => planet.marketEntries, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'planet_id' })
  planet: Planet;

  @ManyToOne(() => Good, (good) => good.marketEntries, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'good_id' })
  good: Good;

  @Column()
  price: number;

  @Column({
    name: 'demand_modifier',
    type: 'double precision',
    default: 1.0,
  })
  demandModifier: number;

  @Column({
    name: 'updated_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
