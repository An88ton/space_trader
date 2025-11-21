import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PlayerInventory } from './player-inventory.entity';
import { TravelLog } from './travel-log.entity';
import { UserShip } from './user-ship.entity';

@Entity({ name: 'ship' })
export class Ship {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  name: string;

  @Column({ type: 'int', default: 1 })
  level: number;

  @Column({ type: 'int', default: 0 })
  price: number;

  @Column({ name: 'cargo_capacity' })
  cargoCapacity: number;

  @Column({ name: 'fuel_capacity' })
  fuelCapacity: number;

  @Column({ name: 'fuel_current' })
  fuelCurrent: number;

  @Column()
  speed: number;

  @Column({
    name: 'acquired_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  acquiredAt: Date;

  @OneToMany(() => PlayerInventory, (inventory) => inventory.ship)
  inventories?: PlayerInventory[];

  @OneToMany(() => TravelLog, (travelLog) => travelLog.ship)
  travelLogs?: TravelLog[];

  @OneToMany(() => UserShip, (userShip) => userShip.ship)
  userShips?: UserShip[];
}
