import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { dataSourceOptions } from './config/typeorm.config';
import { AuthModule } from './auth/auth.module';
import { UniverseModule } from './universe/universe.module';
import { TravelModule } from './travel/travel.module';
import { MarketModule } from './market/market.module';
import { EventModule } from './events/event.module';
import { ShipyardModule } from './shipyard/shipyard.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      ...dataSourceOptions,
      autoLoadEntities: true,
    }),
    AuthModule,
    UniverseModule,
    TravelModule,
    MarketModule,
    EventModule,
    ShipyardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
