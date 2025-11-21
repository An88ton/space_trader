import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { User } from './user.entity';
import { Ship } from './ship.entity';
import { Planet } from './planet.entity';

@Entity({ name: 'user_ships' })
@Unique('uq_user_ship_pair', ['user', 'ship'])
@Index('idx_user_ships_user', ['user'])
@Index('idx_user_ships_ship', ['ship'])
@Index('idx_user_ships_planet', ['currentPlanet'])
@Index('uq_user_active_ship', ['user'], {
  unique: true,
  where: '"is_active" = true',
})
export class UserShip {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.userShips, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Ship, (ship) => ship.userShips, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'ship_id' })
  ship: Ship;

  @Column({ name: 'is_active', type: 'boolean', default: false })
  isActive: boolean;

  @Column({
    name: 'acquired_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  acquiredAt: Date;

  @ManyToOne(() => Planet, {
    onDelete: 'SET NULL',
    nullable: true,
    eager: false,
  })
  @JoinColumn({ name: 'current_planet_id' })
  currentPlanet?: Planet | null;
}


