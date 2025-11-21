import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UniverseService } from './universe.service';
import { UniverseController } from './universe.controller';
import { Hex } from '../entities/hex.entity';
import { Planet } from '../entities/planet.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Hex, Planet])],
  controllers: [UniverseController],
  providers: [UniverseService],
  exports: [UniverseService],
})
export class UniverseModule {}

