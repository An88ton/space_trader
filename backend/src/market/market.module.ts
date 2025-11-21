import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { User } from '../entities/user.entity';
import { Ship } from '../entities/ship.entity';
import { Planet } from '../entities/planet.entity';
import { Good } from '../entities/good.entity';
import { UserShip } from '../entities/user-ship.entity';
import { PlayerInventory } from '../entities/player-inventory.entity';
import { PlanetMarket } from '../entities/planet-market.entity';
import { ReputationLog } from '../entities/reputation-log.entity';
import { MarketController } from './market.controller';
import { MarketService } from './market.service';
import { EventModule } from '../events/event.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Ship,
      Planet,
      Good,
      UserShip,
      PlayerInventory,
      PlanetMarket,
      ReputationLog,
    ]),
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'space-trader-super-secret',
    }),
    EventModule,
  ],
  controllers: [MarketController],
  providers: [MarketService],
  exports: [MarketService],
})
export class MarketModule {}

