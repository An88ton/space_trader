import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EventLog } from './event-log.entity';
import { ReputationLog } from './reputation-log.entity';
import { UserShip } from './user-ship.entity';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255, unique: true })
  email: string;

  @Column({ name: 'password_hash', length: 255 })
  passwordHash: string;

  @Column({ length: 50, unique: true })
  username: string;

  @Column({ default: 0 })
  reputation: number;

  @Column({ length: 50, default: 'Captain' })
  rank: string;

  @Column({ default: 1000 })
  credits: number;

  @Column({ name: 'session_version', type: 'int', default: 0 })
  sessionVersion: number;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @OneToMany(() => UserShip, (userShip) => userShip.user)
  userShips?: UserShip[];

  @OneToMany(() => EventLog, (eventLog) => eventLog.user)
  eventLogs?: EventLog[];

  @OneToMany(() => ReputationLog, (reputationLog) => reputationLog.user)
  reputationLogs?: ReputationLog[];
}
