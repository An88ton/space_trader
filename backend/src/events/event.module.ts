import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { EventController } from './event.controller';
import { EventService } from './event.service';
import { Event } from '../entities/event.entity';
import { EventLog } from '../entities/event-log.entity';
import { ActiveEvent } from '../entities/active-event.entity';
import { EventChoice } from '../entities/event-choice.entity';
import { User } from '../entities/user.entity';
import { ReputationLog } from '../entities/reputation-log.entity';
import { Good } from '../entities/good.entity';
import { Ship } from '../entities/ship.entity';
import { UserShip } from '../entities/user-ship.entity';
import { PlayerInventory } from '../entities/player-inventory.entity';
import { TravelLog } from '../entities/travel-log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Event,
      EventLog,
      ActiveEvent,
      EventChoice,
      User,
      ReputationLog,
      Good,
      Ship,
      UserShip,
      PlayerInventory,
      TravelLog,
    ]),
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'space-trader-super-secret',
    }),
  ],
  controllers: [EventController],
  providers: [EventService],
  exports: [EventService],
})
export class EventModule {}
