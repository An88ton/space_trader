import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { User } from '../entities/user.entity';
import { Ship } from '../entities/ship.entity';
import { Planet } from '../entities/planet.entity';
import { UserShip } from '../entities/user-ship.entity';
import { PlayerInventory } from '../entities/player-inventory.entity';
import { ShipyardController } from './shipyard.controller';
import { ShipyardService } from './shipyard.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Ship,
      Planet,
      UserShip,
      PlayerInventory,
    ]),
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'space-trader-super-secret',
    }),
  ],
  controllers: [ShipyardController],
  providers: [ShipyardService],
  exports: [ShipyardService],
})
export class ShipyardModule {}

