import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { PlanetMarket } from './planet-market.entity';
import { PlayerInventory } from './player-inventory.entity';
import { EventMarketEffect } from './event-market-effect.entity';

@Entity({ name: 'goods' })
export class Good {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ name: 'base_price' })
  basePrice: number;

  @OneToMany(() => PlanetMarket, (market) => market.good)
  marketEntries?: PlanetMarket[];

  @OneToMany(() => PlayerInventory, (inventory) => inventory.good)
  inventories?: PlayerInventory[];

  @OneToMany(() => EventMarketEffect, (effect) => effect.good)
  eventEffects?: EventMarketEffect[];
}
