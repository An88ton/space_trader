import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { User } from '../entities/user.entity';
import { Ship } from '../entities/ship.entity';
import { Planet } from '../entities/planet.entity';
import { UserShip } from '../entities/user-ship.entity';
import { TravelLog } from '../entities/travel-log.entity';
import { PlayerInventory } from '../entities/player-inventory.entity';
import { TravelController } from './travel.controller';
import { TravelService } from './travel.service';
import { EventModule } from '../events/event.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Ship, Planet, UserShip, TravelLog, PlayerInventory]),
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'space-trader-super-secret',
    }),
    EventModule,
  ],
  controllers: [TravelController],
  providers: [TravelService],
})
export class TravelModule {}

