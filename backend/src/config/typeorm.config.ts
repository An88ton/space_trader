import 'dotenv/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import { InitialGalaxySchema1721596800000 } from '../migrations/1721596800000-InitialGalaxySchema';
import { AddSessionVersionToUsers1732147200000 } from '../migrations/1732147200000-AddSessionVersionToUsers';
import { User } from '../entities/user.entity';
import { Ship } from '../entities/ship.entity';
import { Planet } from '../entities/planet.entity';
import { Good } from '../entities/good.entity';
import { PlanetMarket } from '../entities/planet-market.entity';
import { PlayerInventory } from '../entities/player-inventory.entity';
import { Event } from '../entities/event.entity';
import { EventMarketEffect } from '../entities/event-market-effect.entity';
import { EventLog } from '../entities/event-log.entity';
import { TravelLog } from '../entities/travel-log.entity';
import { ReputationLog } from '../entities/reputation-log.entity';
import { UserShip } from '../entities/user-ship.entity';
import { Hex } from '../entities/hex.entity';
import { AddUserShipsRelation1732233600000 } from '../migrations/1732233600000-AddUserShipsRelation';
import { AddShipLevels1732240800000 } from '../migrations/1732240800000-AddShipLevels';
import { SeedCoreGoods1732329600000 } from '../migrations/1732329600000-SeedCoreGoods';
import { AddHexGridSupport1732400000000 } from '../migrations/1732400000000-AddHexGridSupport';
import { SeedInitialPlanets1732401000000 } from '../migrations/1732401000000-SeedInitialPlanets';
import { AddShipPositionTracking1732560000000 } from '../migrations/1732560000000-AddShipPositionTracking';
import { AddGoodType1763723248333 } from '../migrations/1763723248333-AddGoodType';
import { AddMarketSellingFlag1763723302921 } from '../migrations/1763723302921-AddMarketSellingFlag';

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USER ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres',
  database: process.env.DB_NAME ?? 'space_trader',
  synchronize: false,
  logging: process.env.TYPEORM_LOGGING === 'true',
  entities: [
    User,
    Ship,
    Planet,
    Good,
    PlanetMarket,
    PlayerInventory,
    Event,
    EventMarketEffect,
    EventLog,
    TravelLog,
    ReputationLog,
    UserShip,
    Hex,
  ],
  migrations: [
    InitialGalaxySchema1721596800000,
    AddSessionVersionToUsers1732147200000,
    AddUserShipsRelation1732233600000,
    AddShipLevels1732240800000,
    SeedCoreGoods1732329600000,
    AddHexGridSupport1732400000000,
    SeedInitialPlanets1732401000000,
    AddShipPositionTracking1732560000000,
    AddGoodType1763723248333,
    AddMarketSellingFlag1763723302921,
  ],
};

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
