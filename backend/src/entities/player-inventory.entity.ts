import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Ship } from './ship.entity';
import { Good } from './good.entity';

@Entity({ name: 'player_inventory' })
@Index('idx_player_inventory_ship', ['ship'])
@Index('idx_player_inventory_good', ['good'])
export class PlayerInventory {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Ship, (ship) => ship.inventories, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'ship_id' })
  ship: Ship;

  @ManyToOne(() => Good, (good) => good.inventories, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'good_id' })
  good: Good;

  @Column({ default: 0 })
  quantity: number;
}
